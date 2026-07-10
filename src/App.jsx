import { useState } from "react";
import "./App.css";

const initialForm = {
  email: "",
  password: "",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [user, setUser] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Validando acesso..." });

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel entrar.");
      }

      setUser(data.user);
      setForm(initialForm);
      setStatus({ type: "success", message: "Login realizado com sucesso." });
    } catch (error) {
      setUser(null);
      setStatus({ type: "error", message: error.message });
    }
  }

  return (
    <main className="login-page">
      <section className="brand-panel" aria-label="AuroraApp">
        <div className="brand-mark">A</div>
        <div>
          <span className="eyebrow">AuroraApp</span>
          <h1>Entrar no painel</h1>
          <p>
            Acesse sua area segura para acompanhar dados, atividades e
            configuracoes do projeto.
          </p>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-header">
          <span className="eyebrow">Acesso restrito</span>
          <h2 id="login-title">Login</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              autoComplete="email"
              name="email"
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Senha
            <input
              autoComplete="current-password"
              minLength="6"
              name="password"
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
              type="password"
              value={form.password}
            />
          </label>

          <button disabled={status.type === "loading"} type="submit">
            {status.type === "loading" ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {status.message && (
          <p className={`form-status ${status.type}`} role="status">
            {status.message}
          </p>
        )}

        {user && (
          <div className="user-summary">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
