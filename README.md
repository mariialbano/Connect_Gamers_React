
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

### 2. Instale as dependências do projeto

```bash
npm run install-all     #Instala dependencias do frontend e backend
```
### 3. Inicie o projeto

```bash
npm run dev
```

Abra [http://localhost:3000/] no navegador para visualizar o app.

### 4. Conta administrador padrão

- Ao iniciar o backend, um usuário especial é criado automaticamente com as credenciais:
	- **Usuário:** `admin`
	- **Senha:** `admin`
- Apenas esse login consegue abrir a rota protegida `http://localhost:3000/dashboard`.
- Assim que possível, acesse o menu Perfil &rarr; Alterar Senha para definir uma senha forte. O backend mantém essa conta com a role `admin`.

### 5. Implementando API OpenIA

Cada pessoa do grupo deve criar seu próprio arquivo `.env` na pasta `backend` usando o modelo `.env.example`. O arquivo `.env` nunca deve ser enviado para o GitHub porque contém informações privadas, como chaves de API. Se alguém subir esse arquivo, pode expor a chave para pessoas de fora, mesmo que o repositório seja privado.

- Nunca compartilhe sua chave real em grupos, e-mails ou no próprio repositório.
- O arquivo `.env` está listado no `.gitignore` e não será versionado.
- Use o arquivo `backend/.env.example` como modelo. Copie-o para um novo arquivo chamado `.env` dentro da pasta `backend` e preencha com sua API Key:

```bash
cp backend/.env.example backend/.env    #Copia o arquivo .env.example para o mesmo diretório
```

```bash
 OPENAI_API_KEY= 'Chave OpenAI API'     #Coloque sua API Key aqui
```

---

Principais endpoints disponíveis: [http://localhost:5000/api/squads], [http://localhost:5000/api/usuarios], [http://localhost:5000/api/games], [http://localhost:5000/api/rankings].
Você também pode visualizar os dados diretamente no arquivo `db.json`.

---

## 🛠 Tecnologias utilizadas

- React
- Tailwind CSS
- React Router DOM
- Lucide React 
- Node.js / Express
- Persistência simples em arquivo `db.json`
- dotenv 
- express-rate-limit 
- CORS 
- OpenAI
- Bcrypt

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
{ "id": "1", "username": "Player1", "avatar": "/path.png", "text": "olá" }
```

Exemplo de body para mensagem privada:
```
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
