CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO users (name, email, password_hash)
VALUES (
  'Usuario Aurora',
  'admin@aurora.local',
  '$2a$10$gQOgMlEc53oZ7POvPq36mOBUZUkXyUwbO7WGXRjZDGxUJFN1MVAZK'
)
ON CONFLICT (email) DO NOTHING;

-- Usuario de teste:
-- email: admin@aurora.local
-- senha: aurora123
