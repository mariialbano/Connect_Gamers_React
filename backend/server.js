const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const squadsRouter = require('./routes/squads');
const gamesRouter = require('./routes/games');
const eventosRouter = require('./routes/eventos');
const rankingsRouter = require('./routes/rankings');
const chatRouter = require('./routes/chat');
const socialRouter = require('./routes/social');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api/social', socialRouter);

app.get('/', (req, res) => {
    res.send('Você está no backend!');
});

app.listen(PORT, () => {
    console.log(`Servidor está rodando em http://localhost:${PORT}`);
});
