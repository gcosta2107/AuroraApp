# Deploy AWS em uma EC2 publica

Este modo sobe tudo na mesma EC2 publica:

- Aplicacao React + Flask.
- PostgreSQL em Docker.
- GitHub Actions runner para deploy automatico.

## 1. Security Group

Na EC2 publica, libere:

```text
80/tcp de 0.0.0.0/0
22/tcp somente do seu IP
```

Nao libere `5432/tcp` para a internet. O Postgres fica acessivel apenas para a
aplicacao dentro da rede Docker.

## 2. Instalar Docker na EC2 Ubuntu

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

Se o runner ja estiver rodando como servico, reinicie o servico depois de
adicionar o usuario ao grupo `docker`.

## 3. GitHub Actions runner

Configure o runner self-hosted nesta EC2 publica.

Ao configurar, adicione a label:

```text
auroraapp-prod
```

O workflow usa:

```yaml
runs-on: [self-hosted, Linux, X64, auroraapp-prod]
```

Para testar manualmente:

```bash
./run.sh
```

Para instalar como servico:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

## 4. Credenciais do banco

Para simplificar o primeiro deploy, as credenciais estao fixas em
`docker-compose.yml`:

```text
Database: auroraapp
Usuario: postgres
Senha: postgres
```

## 5. Deploy automatico

Ao fazer push na branch `main`, o workflow executa na EC2 publica:

```bash
docker compose -f docker-compose.yml up -d --build --remove-orphans
```

O Compose sobe:

```text
db  -> PostgreSQL
app -> React + Flask na porta 80
```

A aplicacao ficara em:

```text
http://IP_PUBLICO_DA_EC2
```

## 6. Comandos uteis na EC2

```bash
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs -f
docker compose -f docker-compose.yml down
```

Para apagar tambem os dados do banco:

```bash
docker compose -f docker-compose.yml down -v
```
