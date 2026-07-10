import os

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

load_dotenv()

static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
app = Flask(__name__, static_folder=static_folder, static_url_path="")


def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


@app.get("/api/health")
def health():
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")

        return jsonify({"status": "ok", "database": "connected"})
    except Exception:
        return jsonify({"status": "error", "database": "unavailable"}), 503


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Informe e-mail e senha para entrar."}), 400

    try:
        with get_connection() as connection:
            with connection.cursor(
                cursor_factory=psycopg2.extras.RealDictCursor
            ) as cursor:
                cursor.execute(
                    """
                    SELECT id, name, email
                    FROM users
                    WHERE email = %s
                      AND password_hash = crypt(%s, password_hash)
                    LIMIT 1
                    """,
                    (email, password),
                )
                user = cursor.fetchone()

        if not user:
            return jsonify({"message": "Credenciais invalidas."}), 401

        return jsonify({"user": dict(user)})
    except Exception:
        return jsonify({"message": "Erro ao validar login. Tente novamente."}), 500


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/<path:path>")
def serve_react(path):
    file_path = os.path.join(app.static_folder, path)

    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
