
# 🎮 Connect Gamers

Um projeto React criado com **Create React App**, voltado para gamers que desejam criar squads, participar de eventos e se conectar com outros jogadores!

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

#### Em seguida, instale as dependências do backend:

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

A API estará no endereço: [http://localhost:5000/api/squads] & [http://localhost:5000/api/usuarios]
Você também pode visualizar os usuários e squads cadastrados no arquivo db.json

---

## 🛠 Tecnologias utilizadas

- React
- Tailwind CSS
- React Router DOM
- Lucide React (ícones)
- JSON Server (API)
- Node.js
- Express (API)

---

## 👥 Funcionalidades

- Cadastro e login de usuários  
- Verificação de login antes de acessar rotas privadas  
- Cadastro de squads (apenas para usuários logados)  
- Sistema de navegação lateral (sidebar) e ícone de perfil  
- API local com persistência de dados em `db.json`

---

## 📁 Estrutura do projeto

```bash
📦 src
├── components         # Navbar, Sidebar, Footer, etc.
├── pages              # Login.jsx, Perfil.jsx, Cadastro.jsx...
├── services           # api.js (funções de conexão com json-server)
└── App.jsx            # Componente principal com as rotas
```

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
