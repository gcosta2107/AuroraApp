# AuroraApp

Aplicacao React com uma pagina de login integrada a uma API simples em Python,
que valida os dados em um banco PostgreSQL.

## Banco de dados

Crie o banco `auroraapp` no PostgreSQL e execute o script:

```bash
psql -U postgres -d auroraapp -f server/schema.sql
```

Usuario de teste criado pelo script:

```text
email: admin@aurora.local
senha: aurora123
```

No DBeaver, usando o ambiente local ou Docker:

```text
Host: localhost
Porta: 5432
Database: auroraapp
Usuario: postgres
Senha: postgres
```

## Rodando com Docker

Suba a aplicacao completa, incluindo PostgreSQL, API Python e frontend React:

```bash
docker compose up --build
```

Acesse:

```text
http://localhost:5000
```

O Postgres sera inicializado com `server/schema.sql` na primeira criacao do
volume `postgres_data`.

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto usando o `.env.example` como base:

```text
DATABASE_URL=postgres://postgres:postgres@localhost:5432/auroraapp
PORT=5000
```

## API Python

Instale as dependencias Python:

```bash
pip install -r requirements.txt
```

Suba a API:

```bash
npm run api
```

## Frontend React

Em outro terminal, suba o Vite:

```bash
npm run dev
```

O React chama `/api/login`, e o Vite encaminha essa rota para
`http://localhost:5000`.
