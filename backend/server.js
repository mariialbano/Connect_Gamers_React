const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const squadsRouter = require('./routes/squads');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
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

app.get('/', (req, res) => {
    res.send('Você está no backend!');
});

app.listen(PORT, () => {
    console.log(`Servidor está rodando em http://localhost:${PORT}`);
});
