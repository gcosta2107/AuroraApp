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
  crypt('aurora123', gen_salt('bf'))
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash;

-- Usuario de teste:
-- email: admin@aurora.local
-- senha: aurora123
