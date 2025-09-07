require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const squadsRouter = require('./routes/squads');
const gamesRouter = require('./routes/games');
const eventosRouter = require('./routes/eventos');
const rankingsRouter = require('./routes/rankings');
const chatRouter = require('./routes/chat');
const faqRouter = require('./routes/faq');
const socialRouter = require('./routes/social');
const rateLimit = require('express-rate-limit');

const app = express();
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
let currentPort = BASE_PORT;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Você excedeu o limite de requisições, tente novamente mais tarde.'
});

app.set('trust proxy', 1);
app.set('json spaces', 2);
app.use(cors());
app.use(express.json());

app.use(limiter);

app.use('/api/usuarios', usersRouter);
app.use('/api/squads', squadsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/eventos', eventosRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/faq', faqRouter);
app.use('/api/social', socialRouter);

app.get('/', (req, res) => {
    res.send('Você está no backend!');
});

function start(port){
    const server = app.listen(port, () => {
        console.log(`Servidor está rodando em http://localhost:${port}`);
    });
    server.on('error', (err)=>{
        if(err.code === 'EADDRINUSE'){
            if(port < BASE_PORT + 20){
                console.warn(`Porta ${port} ocupada. Tentando ${port+1}...`);
                start(port+1);
            } else {
                console.error('Não foi possível encontrar porta livre (tentadas +20).');
            }
        } else {
            console.error('Erro ao iniciar servidor:', err);
        }
    });
}

start(currentPort);
