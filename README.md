
# 🎮 Connect Gamers

Projeto React criado com **Create React App**, voltado para gamers que desejam criar squads, participar de eventos e se conectar com outros jogadores.

---

## 🚀 Como rodar o projeto localmente

Siga os passos abaixo para rodar o projeto completo (front-end + API local):

### 1. Clone o repositório

```bash
git clone https://github.com/mariialbano/Connect_Gamers_React.git
cd Connect_Gamers_React
```

### 2. Instale as dependências do frontend

```bash
npm install
```

#### Depois instale as dependências do backend:

```bash
cd backend        # acessa o diretório do backend
npm install       # instala dependências do backend
cd ..             # retorna um diretório (diretório raiz)
```

### 3. Inicie o projeto

```bash
npm run dev        
```

Abra [http://localhost:3000/] no navegador para visualizar o app.

Principais endpoints disponíveis: [http://localhost:5000/api/squads], [http://localhost:5000/api/usuarios], [http://localhost:5000/api/games], [http://localhost:5000/api/rankings].
Você também pode visualizar os dados diretamente no arquivo `db.json`.

---

## 🛠 Tecnologias utilizadas

- React
- Tailwind CSS
- React Router DOM
- Lucide React (ícones)
- Node.js / Express
- Persistência simples em arquivo `db.json`
- Tailwind CSS
- React Router DOM
- Lucide React (ícones)

---

## 👥 Funcionalidades

- Cadastro e login de usuários  
- Verificação de login antes de acessar rotas privadas  
- Cadastro de squads (apenas para usuários logados)  
- Sistema de navegação lateral (sidebar) e ícone de perfil  
- API local com persistência de dados em `db.json`

### 🔊 Funcionalidades de Chat Persistente

- Canais públicos com histórico salvo (ex.: Geral, League of Legends)
- Mensagens privadas (1 a 1) com histórico
- Estruturas são salvas automaticamente em `db.json` quando usadas
- Ponto de partida para futuras evoluções (amigos, status, anúncios)

---

## 📁 Estrutura do projeto

```bash
📦 src
├── components         # Navbar, Sidebar, Footer, etc.
├── pages              # Login.jsx, Perfil.jsx, Cadastro.jsx...
├── services           # api.js (funções de conexão com json-server)
└── App.jsx            # Componente principal com as rotas
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
```
{ "userId": "1", "username": "Player1", "avatar": "/path.png", "text": "olá" }
```

Exemplo de body para mensagem privada:
```
{ "fromUserId": "1", "username": "Player1", "avatar": "/path.png", "text": "oi" }
```

### 🤝 Endpoints Sociais (base: `/api/social`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| PATCH | /status | Atualiza status do usuário (body: userId, status) |
| GET | /status/:userId | Obtém status |
| GET | /online | Lista usuários não invisíveis |
| POST | /friend-request | Cria pedido (body: fromUserId, toUserId) |
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
- [Neemias Silva](https://github.com/neemiasv)
- [Danilo Senna](https://github.com/)
