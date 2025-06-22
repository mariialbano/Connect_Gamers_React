
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

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o projeto React

```bash
npm start
```

Abra [http://localhost:3000/](http://localhost:3000/) no navegador para visualizar o app.

### 4. Inicie a API local com json-server

Em um novo terminal (por exemplo, Git Bash), execute:

```bash
npx json-server --watch db.json --port 3001
```

Isso iniciará a API simulada no endereço: [http://localhost:3001/squads](http://localhost:3001/squads)<br/>
Você também pode visualizar os usuários e squads cadastrados no arquivo db.json

---

## 🛠 Tecnologias utilizadas

- React
- Tailwind CSS
- React Router DOM
- Lucide React (ícones)
- JSON Server (API local fake)

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
- [Vinícius Gonzales](https://github.com/vngon)
