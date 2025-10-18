require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const usersRouter = require('./routes/users');
const squadsRouter = require('./routes/squads');
const gamesRouter = require('./routes/games');
const eventosRouter = require('./routes/eventos');
const rankingsRouter = require('./routes/rankings');
const chatRouter = require('./routes/chat');
const faqRouter = require('./routes/faq');
const socialRouter = require('./routes/social');
const rateLimit = require('express-rate-limit');
const DatabaseService = require('./services/databaseService');

const logsDir = path.join(__dirname, '../logs');

function ensureLogsDir() {
    try {
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    } catch (e) {
        console.error('Falha ao criar pasta de logs:', e);
    }
}

function migrateRootLogs() {
    try {
        const rootDir = path.join(__dirname, '..');
        const files = fs.readdirSync(rootDir, { withFileTypes: true })
            .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.log'))
            .map(d => d.name);
        files.forEach(name => {
            const from = path.join(rootDir, name);
            const to = path.join(logsDir, name);
            try {
                if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
                const data = fs.readFileSync(from);
                fs.appendFileSync(to, data);
                fs.unlinkSync(from);
                console.log(`[logs] Migrado ${name} para /logs/${name}`);
            } catch (e) {
                console.warn(`[logs] Falha ao migrar ${name}:`, e.message);
            }
        });
    } catch (e) {
        console.warn('[logs] Erro na migração de logs da raiz:', e.message);
    }
}

ensureLogsDir();
migrateRootLogs();

try {
    const ensureFiles = ['login.log', 'ratelimit.log'];
    ensureFiles.forEach(f => {
        const p = path.join(logsDir, f);
        if (!fs.existsSync(p)) fs.writeFileSync(p, '');
    });
    try {
        const p = path.join(logsDir, 'chat_requests.log');
        if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) { }
} catch (e) {
    console.warn('[logs] Não foi possível pré-criar arquivos de log:', e.message);
}

const app = express();
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
let currentPort = BASE_PORT;
const LOG_DEDUP_MS = Math.max(parseInt(process.env.LOG_DEDUP_MS || '0', 10) || 0, 0);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req, res, next, options) => {
        const logEntry = {
            time: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress,
            method: req.method,
            url: req.originalUrl || req.url,
            reason: 'rate_limited'
        };
        try {
            fs.appendFileSync(path.join(logsDir, 'ratelimit.log'), JSON.stringify(logEntry) + '\n');
        } catch (e) {
            console.error('Erro ao gravar ratelimit.log:', e);
        }
        res.status(429).json({ 
            error: 'Muitas requisições. Tente novamente mais tarde.',
            retryAfter: Math.ceil(options.windowMs / 1000)
        });
    }
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

function start(port) {
    const server = app.listen(port, () => {
        console.log(`Servidor está rodando em http://localhost:${port}`);
        try {
            const boot = {
                time: new Date().toISOString(),
                ip: '::1',
                method: 'SERVER',
                url: '/server-started',
                status: 0,
                durationMs: 0,
                ua: `node ${process.version}`,
                port
            };
        } catch (e) { }
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            if (port < BASE_PORT + 20) {
                console.warn(`Porta ${port} ocupada. Tentando ${port + 1}...`);
                start(port + 1);
            } else {
                console.error('Não foi possível encontrar porta livre (tentadas +20).');
            }
        } else {
            console.error('Erro ao iniciar servidor:', err);
        }
    });
}

start(currentPort);
