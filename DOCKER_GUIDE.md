# 🐳 Guia Completo do Docker - Connect Gamers

## 📋 Índice
- [Instalação do Docker](#instalação-do-docker)
- [Comandos Básicos](#comandos-básicos)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## 🚀 Instalação do Docker

### Windows
1. Baixe o [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop)
2. Execute o instalador
3. Reinicie o computador se solicitado
4. Abra o Docker Desktop e aguarde ele inicializar
5. Verifique a instalação:
```bash
docker --version
docker-compose --version
```

### Mac
1. Baixe o [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop)
2. Arraste o Docker para a pasta Applications
3. Abra o Docker Desktop
4. Verifique a instalação:
```bash
docker --version
docker-compose --version
```

### Linux (Ubuntu/Debian)
```bash
# Atualizar pacotes
sudo apt update

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar seu usuário ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose

# Reiniciar a sessão ou executar:
newgrp docker

# Verificar instalação
docker --version
docker-compose --version
```

---

## 📦 Comandos Básicos

### Iniciar o projeto
```bash
# Iniciar todos os serviços (backend + PostgreSQL)
docker-compose up

# Iniciar em background (modo daemon)
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Ver logs apenas do PostgreSQL
docker-compose logs -f postgres
```

### Parar o projeto
```bash
# Parar os containers (mantém os dados)
docker-compose down

# Parar e remover volumes (APAGA TODOS OS DADOS!)
docker-compose down -v
```

### Reconstruir após mudanças no código
```bash
# Reconstruir as imagens
docker-compose build

# Reconstruir e iniciar
docker-compose up --build

# Forçar reconstrução sem cache
docker-compose build --no-cache
```

### Verificar status
```bash
# Listar containers rodando
docker ps

# Listar todos os containers (incluindo parados)
docker ps -a

# Ver uso de recursos
docker stats
```

### Acessar o container
```bash
# Abrir terminal no container do backend
docker exec -it connect_gamers_backend sh

# Abrir PostgreSQL no container do banco
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers
```

### Limpar o ambiente
```bash
# Remover containers parados
docker container prune

# Remover imagens não utilizadas
docker image prune

# Remover volumes não utilizados
docker volume prune

# Limpar TUDO (cuidado!)
docker system prune -a --volumes
```

---

## 🔧 Troubleshooting

### ❌ Problema: "Cannot connect to the Docker daemon"

**Solução:**
1. Certifique-se que o Docker Desktop está rodando
2. No Windows, verifique se o WSL 2 está ativo
3. Reinicie o Docker Desktop

---

### ❌ Problema: "Port 5432 is already allocated"

**Causa:** Você tem PostgreSQL instalado localmente na porta 5432

**Solução 1:** Parar o PostgreSQL local
```bash
# Windows
net stop postgresql-x64-15

# Linux
sudo systemctl stop postgresql

# Mac
brew services stop postgresql
```

**Solução 2:** Mudar a porta no `docker-compose.yml`
```yaml
postgres:
  ports:
    - "5433:a5432"  # Muda a porta externa para 5433
```

E atualizar o `.env`:
```env
DB_PORT=5433
```

---

### ❌ Problema: "Port 5000 is already allocated"

**Causa:** Outra aplicação está usando a porta 5000

**Solução:** Mudar a porta no `docker-compose.yml`
```yaml
backend:
  ports:
    - "5001:5000"  # Muda a porta externa para 5001
```

---

### ❌ Problema: "no configuration file provided: not found"

**Causa:** Você não está na pasta raiz do projeto

**Solução:**
```bash
cd Connect_Gamers_React
docker-compose up
```

---

### ❌ Problema: Backend não conecta ao banco

**Verificações:**
1. Confirme que o PostgreSQL está saudável:
```bash
docker-compose ps
# Deve mostrar "healthy" para o postgres
```

2. Verifique os logs do banco:
```bash
docker-compose logs postgres
```

3. Verifique as variáveis de ambiente no `backend/.env`:
```env
DB_HOST=postgres  # Deve ser "postgres" (nome do serviço)
DB_PORT=5432
DB_NAME=connect_gamers
DB_USER=postgres
DB_PASSWORD=connectgamers
```

4. Reconstrua os containers:
```bash
docker-compose down
docker-compose up --build
```

---

### ❌ Problema: "Error: getaddrinfo ENOTFOUND postgres"

**Causa:** O backend está tentando conectar antes do PostgreSQL estar pronto

**Solução:** O `docker-compose.yml` já tem `depends_on` e `healthcheck`. Se o problema persistir:

```bash
# Parar tudo
docker-compose down

# Limpar volumes
docker volume prune

# Iniciar novamente
docker-compose up
```

---

### ❌ Problema: "ENOSPC: System limit for number of file watchers reached"

**Causa:** Linux tem limite de file watchers (comum em desenvolvimento)

**Solução (Linux):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### ❌ Problema: Mudanças no código não aparecem

**Causa:** Cache do Docker ou volumes não sincronizados

**Solução:**
```bash
# Reconstruir sem cache
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

### ❌ Problema: "permission denied" no Linux

**Causa:** Seu usuário não está no grupo docker

**Solução:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## ❓ FAQ

### **Q: Preciso ter PostgreSQL instalado na minha máquina?**
**A:** Não! O Docker cuida disso. Você só precisa do Docker instalado.

---

### **Q: Os dados são perdidos quando paro os containers?**
**A:** Não, os dados ficam salvos em um **volume Docker**. Apenas `docker-compose down -v` apaga os dados.

---

### **Q: Posso usar outro editor de banco (pgAdmin, DBeaver)?**
**A:** Sim! Conecte usando:
- Host: `localhost`
- Porta: `5432`
- Database: `connect_gamers`
- User: `postgres`
- Password: `connectgamers`

---

### **Q: Como adicionar dados de teste no banco?**
**A:** Execute comandos SQL dentro do container:
```bash
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers

# Dentro do PostgreSQL:
SELECT * FROM usuarios;
INSERT INTO ...;
\q  # para sair
```

---

### **Q: Posso rodar o frontend também no Docker?**
**A:** Sim! Podemos adicionar um serviço para o React no `docker-compose.yml`. Por enquanto, mantivemos só o backend para facilitar o desenvolvimento.

---

### **Q: Como resetar o banco de dados?**
**A:**
```bash
# Opção 1: Remover os volumes
docker-compose down -v
docker-compose up

# Opção 2: Executar o script de inicialização novamente
docker exec -it connect_gamers_backend node scripts/initDatabase.js
```

---

### **Q: Docker consome muitos recursos?**
**A:** Docker é leve, mas no Windows usa WSL 2. Você pode limitar recursos no Docker Desktop:
- Settings → Resources → ajustar CPU e Memory

---

### **Q: Posso usar Docker em produção?**
**A:** Sim! Docker é amplamente usado em produção. Para deploy, considere:
- Docker Swarm
- Kubernetes
- Plataformas como Heroku, AWS, Azure, Google Cloud

---

## 📚 Recursos Úteis

- [Documentação Oficial do Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## 💡 Dicas Finais

1. **Sempre use `docker-compose up -d`** para rodar em background
2. **Monitore os logs** com `docker-compose logs -f`
3. **Não use `docker-compose down -v`** a menos que queira apagar tudo
4. **Commit frequente** para não perder trabalho
5. **Documente** qualquer mudança no `docker-compose.yml`

---

## 🆘 Precisa de ajuda?

Se você encontrou um problema não listado aqui:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique o status: `docker ps`
3. Google o erro específico
4. Abra uma issue no repositório

---

**Criado por:** Equipe Connect Gamers 🎮
**Última atualização:** Outubro 2025

