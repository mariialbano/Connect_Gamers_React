
# 🎮 Connect Gamers

Projeto React criado com **Create React App**, voltado para gamers que desejam criar squads, participar de eventos e se conectar com outros jogadores.

---

## 🚀 Como rodar o projeto localmente

### 🐳 **OPÇÃO 1: Setup Automático com Script (MAIS FÁCIL)** ⭐⭐⭐

**Esta é a forma mais rápida e fácil!** Use o script `setup.sh` que faz tudo automaticamente.

#### **Pré-requisitos:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado
- [Node.js](https://nodejs.org/) (apenas para o frontend React)

#### **Passo a passo:**

**1. Clone o repositório**
```bash
git clone https://github.com/mariialbano/Connect_Gamers_React.git
cd Connect_Gamers_React
```

**2. Execute o script de setup**
```bash
# Linux/Mac
chmod +x setup.sh
./setup.sh

# Windows (Git Bash no terminal)
bash setup.sh
```

O script vai:
- ✅ Verificar se Docker está instalado
- ✅ Criar arquivo `.env` automaticamente
- ✅ Iniciar containers Docker (backend + PostgreSQL)
- ✅ Instalar dependências do frontend
- ✅ Mostrar status e comandos úteis

- ❗ No arquivo .env criado, NÃO esqueça de inserir sua OPENAI_API_KEY 

**3. Inicie o frontend**
```bash
npm start
```

**4. Acesse a aplicação**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

### 🐳 **OPÇÃO 2: Setup Manual com Docker** ⭐⭐

Se preferir fazer manualmente:

#### **Pré-requisitos:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado
- [Node.js](https://nodejs.org/) (apenas para o frontend React)

#### **Passo a passo:**

**1. Clone o repositório**
```bash
git clone https://github.com/mariialbano/Connect_Gamers_React.git
cd Connect_Gamers_React
```

**2. Configure as variáveis de ambiente**
```bash
# Windows (PowerShell)
Copy-Item backend\.env.example backend\.env

# Linux/Mac
cp backend/.env.example backend/.env
```

**3. Edite o arquivo `backend/.env` e adicione sua chave OpenAI** (opcional)
```env
OPENAI_API_KEY=sua_chave_aqui
```

**4. Inicie o backend e banco de dados com Docker**
```bash
docker-compose up -d
```
✅ O Docker vai:
- Baixar e configurar o PostgreSQL
- Criar todas as tabelas automaticamente
- Criar o usuário SuperAdmin automaticamente
- Iniciar o backend na porta 5000

**5. Instale as dependências do frontend**
```bash
npm install
```

**6. Inicie o frontend**
```bash
npm start
```

**7. Acesse a aplicação**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

### 💻 **OPÇÃO 3: Instalação Manual (sem Docker)**

Se você não quiser usar Docker, siga estas instruções:

#### **Pré-requisitos:**
- [Node.js](https://nodejs.org/) instalado
- [PostgreSQL](https://www.postgresql.org/download/) instalado e rodando

#### **Passo a passo:**

**1. Clone o repositório**
```bash
git clone https://github.com/mariialbano/Connect_Gamers_React.git
cd Connect_Gamers_React
```

**2. Configure o PostgreSQL**
- Certifique-se que o PostgreSQL está rodando na porta 5432
- Crie o banco de dados:
```sql
CREATE DATABASE connect_gamers;
```

**3. Configure as variáveis de ambiente**
```bash
# Windows (PowerShell)
Copy-Item backend\.env.example backend\.env

# Linux/Mac
cp backend/.env.example backend/.env
```

Edite o arquivo `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=connect_gamers
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres
OPENAI_API_KEY=sua_chave_aqui
```

**4. Instale as dependências**
```bash
# Frontend e Backend
npm run install-all
```

**5. Inicialize o banco de dados**
```bash
cd backend
node scripts/initDatabase.js
cd ..
```

**6. Inicie o projeto**
```bash
npm run dev
```

**7. Acesse a aplicação**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## 🔐 Conta Administrador

### **Usuário SuperAdmin**
O projeto cria automaticamente um usuário administrador:

```
👤 SuperAdmin
   Usuário: SuperAdmin
   Senha: SuperAdmin123!
   Cargo: admin
```

### **Características:**
- ✅ **Criado automaticamente** na primeira inicialização
- ✅ **Não é duplicado** - se já existir, não cria outro
- ✅ **Acesso total** ao Dashboard em `http://localhost:3000/dashboard`
- ✅ **Permissões de admin** para todas as funcionalidades

### **Como usar:**
1. Acesse [http://localhost:3000](http://localhost:3000)
2. Clique em "Login"
3. Digite:
   - **Usuário:** `SuperAdmin`
   - **Senha:** `SuperAdmin123!`
4. Você terá acesso completo ao sistema!

---

## 🗄️ Consultando o Banco de Dados via Terminal

### **Scripts Automáticos:**

**Linux/Mac:**
```bash
chmod +x consultar-banco.sh
./consultar-banco.sh
```

**Windows (PowerShell):**
```powershell
.\consultar-banco.ps1
```

### **Comandos Úteis:**

**Conectar ao PostgreSQL via Docker:**
```bash
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers
```

**Comandos SQL úteis:**
```sql
-- Ver todos os usuários
SELECT id, nome, usuario, cargo FROM usuarios;

-- Ver usuário SuperAdmin
SELECT * FROM usuarios WHERE usuario = 'SuperAdmin';

-- Ver todos os squads
SELECT * FROM squads;

-- Ver mensagens do chat
SELECT * FROM channel_messages ORDER BY created_at DESC LIMIT 10;

-- Sair do psql
\q
```

**Scripts prontos para usar:**
```bash
# Ver usuários
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c "SELECT id, nome, usuario, cargo FROM usuarios;"

# Ver squads
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c "SELECT * FROM squads;"

# Ver mensagens recentes
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c "SELECT username, text, created_at FROM channel_messages ORDER BY created_at DESC LIMIT 5;"
```

### **📚 Documentação Completa:**
Para mais detalhes sobre consultas ao banco, consulte o arquivo `GUIA_BANCO_DADOS.md`.

---

## 🐳 Comandos Docker Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs do backend
docker-compose logs -f backend

# Ver logs do banco de dados
docker-compose logs -f postgres

# Parar os containers
docker-compose down

# Parar e remover TODOS os dados (cuidado!)
docker-compose down -v

# Reiniciar containers
docker-compose restart

# Reconstruir as imagens após mudanças no código
docker-compose up --build

# Entrar no container do backend
docker exec -it connect_gamers_backend bash

# Entrar no container do PostgreSQL
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers
```

---

## 🤖 Sobre a API OpenAI

A chave da OpenAI é usada para moderação de conteúdo no chat. 

- Cada pessoa do grupo deve ter sua própria chave API
- Obtenha sua chave em: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **NUNCA** compartilhe sua chave ou faça commit dela no Git
- O arquivo `.env` está no `.gitignore` e não será versionado
- **Opcional:** O projeto funciona sem a chave OpenAI

---

## 📡 Principais endpoints da API

Base URL: `http://localhost:5000/api/`

- **Usuários**: `/usuarios`
- **Squads**: `/squads`
- **Jogos**: `/games`
- **Rankings**: `/rankings`
- **Chat**: `/chat`
- **Social**: `/social`
- **FAQ**: `/faq`

---

## 🛠 Tecnologias utilizadas

### Frontend
- React 19
- Tailwind CSS
- React Router DOM
- Lucide React
- React Icons

### Backend
- Node.js / Express
- PostgreSQL (Banco de dados relacional)
- Bcrypt (Criptografia de senhas)
- OpenAI API (Moderação de conteúdo)
- dotenv (Gerenciamento de variáveis de ambiente)
- express-rate-limit (Proteção contra spam)
- CORS (Cross-Origin Resource Sharing)

### DevOps
- Docker & Docker Compose (Containerização)
- PostgreSQL 15 Alpine (Container do banco de dados)

---

## 👥 Funcionalidades

- ✅ Cadastro e login de usuários com autenticação segura
- ✅ Verificação de login antes de acessar rotas privadas
- ✅ Sistema de permissões (usuário comum e administrador)
- ✅ Cadastro e gerenciamento de squads
- ✅ Sistema de navegação lateral (sidebar) e ícone de perfil
- ✅ Persistência de dados em PostgreSQL

### 🔊 Chat em Tempo Real

- ✅ Canais públicos com histórico persistente (ex.: Geral, League of Legends)
- ✅ Mensagens privadas (1 a 1) com histórico completo
- ✅ Sistema de reações em mensagens
- ✅ Moderação automática com IA (OpenAI)

### 🤝 Sistema Social

- ✅ Sistema de amizades
- ✅ Solicitações de amizade
- ✅ Status de usuário (Disponível, Ausente, Não perturbar, Invisível)
- ✅ Busca de usuários
- ✅ Lista de usuários online

---

## 📁 Estrutura do projeto

```bash
📦 Connect_Gamers_React
├── 📁 backend/                 # Backend Node.js + Express
│   ├── 📁 config/             # Configuração do banco
│   ├── 📁 routes/             # Rotas da API
│   ├── 📁 services/           # Serviços de banco
│   ├── 📁 scripts/            # Scripts de inicialização
│   ├── 📄 server.js           # Servidor principal
│   └── 📄 package.json        # Dependências do backend
├── 📁 src/                    # Frontend React
│   ├── 📁 components/         # Componentes reutilizáveis
│   ├── 📁 pages/              # Páginas da aplicação
│   ├── 📁 services/           # Serviços de API
│   └── 📁 theme/              # Contexto de tema
├── 📁 public/                  # Arquivos públicos
├── 📄 docker-compose.yml      # Configuração Docker
├── 📄 setup.sh                # Script de setup automático
├── 📄 package.json            # Dependências do frontend
└── 📄 README.md               # Este arquivo
```

### 📡 Endpoints de Chat (base: `/api/chat`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /channels | Lista canais e contagem de mensagens |
| GET | /messages/:channel | Mensagens de um canal |
| POST | /messages/:channel | Envia mensagem ao canal |
| GET | /private/:userA/:userB | Histórico privado entre dois usuários |
| POST | /private/:userA/:userB | Envia mensagem privada |

Exemplo de body para enviar mensagem pública:
```json
{ "id": "1", "username": "Player1", "avatar": "/path.png", "text": "olá" }
```

Exemplo de body para mensagem privada:
```json
{ "id": "1", "username": "Player1", "avatar": "/path.png", "text": "oi" }
```

### 🤝 Endpoints Sociais (base: `/api/social`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| PATCH | /status | Atualiza status do usuário (body: id, status) |
| GET | /status/:userId | Obtém status |
| GET | /online | Lista usuários não invisíveis |
| POST | /friend-request | Cria pedido (body: id/senderId, targetId) |
| GET | /requests/:userId | Pedidos pendentes (incoming/outgoing) |
| POST | /friend-request/:id/accept | Aceitar pedido |
| POST | /friend-request/:id/decline | Recusar pedido |
| GET | /friends/:userId | Lista de amigos com status |
| GET | /search?q=term&exclude=id | Busca usuários |

Status válidos: `Disponível`, `Ausente`, `Não perturbar`, `Invisível`.

---

## ❓ Dúvidas ou sugestões?

Fique à vontade para abrir uma issue ou contribuir com melhorias!

---

## 👨‍💻 Projeto desenvolvido por

- [Ana Julia Gonçalves](https://github.com/dsgana)
- [Jéssica Brito](https://github.com/jessbrt19)
- [Mariana Albano](https://github.com/mariialbano)
- [Neemias Silva](https://github.com/neemiasjls)
- [Danilo Senna](https://github.com/)
