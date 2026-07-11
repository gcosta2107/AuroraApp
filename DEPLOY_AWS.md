# Deploy AWS com app publica e banco privado

Este projeto fica separado em duas EC2:

- EC2 publica: aplicacao React + Flask em Docker, com GitHub Actions runner.
- EC2 privada: PostgreSQL em Docker, subido manualmente.

## 1. Rede e seguranca

Use as duas EC2 na mesma VPC.

EC2 publica:

```text
Subnet publica
Security Group: sg-app
Inbound:
  80/tcp de 0.0.0.0/0
  22/tcp somente do seu IP
```

EC2 privada:

```text
Subnet privada
Sem IP publico
Security Group: sg-db
Inbound:
  5432/tcp vindo somente do sg-app
  22/tcp vindo somente do sg-app, se for acessar por bastion
```

## 2. EC2 privada: banco manual

Instale Docker na EC2 privada Ubuntu:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Libere o usuario `ubuntu` para executar Docker:

```bash
sudo usermod -aG docker ubuntu
newgrp docker
docker ps
```

Clone o projeto:

```bash
git clone https://github.com/gcosta2107/AuroraApp.git
cd AuroraApp
```

Crie o arquivo `.env.db`:

```bash
cp .env.db.example .env.db
nano .env.db
```

Exemplo:

```env
POSTGRES_DB=auroraapp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha_forte
```

Suba o banco:

```bash
docker compose --env-file .env.db -f docker-compose.db.yml up -d
```

Verifique:

```bash
docker compose --env-file .env.db -f docker-compose.db.yml ps
```

O script `server/schema.sql` roda automaticamente na primeira criacao do volume
`postgres_data`.

## 3. EC2 publica: aplicacao automatica

Instale Docker na EC2 publica Ubuntu usando os mesmos comandos da EC2 privada.

Configure o GitHub Actions runner nesta EC2 publica.

Ao configurar o runner, adicione a label:

```text
auroraapp-prod
```

O workflow usa:

```yaml
runs-on: [self-hosted, Linux, X64, auroraapp-prod]
```

Para testar manualmente o runner:

```bash
./run.sh
```

Para deixar como servico:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

## 4. Secret do GitHub

No GitHub, va em:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Crie apenas este secret:

```text
Name: DATABASE_URL
Value: postgres://postgres:sua_senha_forte@IP_PRIVADO_DA_EC2_PRIVADA:5432/auroraapp
```

Exemplo:

```text
postgres://postgres:sua_senha_forte@10.0.2.45:5432/auroraapp
```

## 5. Deploy automatico da aplicacao

Ao fazer push na branch `main`, o GitHub Actions executa na EC2 publica:

```bash
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
```

A aplicacao ficara disponivel em:

```text
http://IP_PUBLICO_DA_EC2
```

## 6. Comandos uteis

Banco na EC2 privada:

```bash
docker compose --env-file .env.db -f docker-compose.db.yml logs -f
docker compose --env-file .env.db -f docker-compose.db.yml down
```

Aplicacao na EC2 publica:

```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```
