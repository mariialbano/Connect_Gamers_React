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
const pontosRouter = require('./routes/pontos');
const verificationRouter = require('./routes/verification');
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

// HTTPS config (mkcert)
const https = require('https');
let sslKey, sslCert;
try {
    sslKey = fs.readFileSync(path.join(__dirname, '192.168.0.141+1-key.pem'));
    sslCert = fs.readFileSync(path.join(__dirname, '192.168.0.141+1.pem'));
} catch (e) {
    console.error('Certificados SSL não encontrados. Gere com mkcert e coloque em backend/.', e.message);
}

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

// Rota para baixar o certificado no iPhone
app.get('/ca.crt', (req, res) => {
    try {
        const certPath = path.join(__dirname, '../public/192.168.0.141+1.pem');
        if (fs.existsSync(certPath)) {
            res.download(certPath, '192.168.0.141.pem');
        } else {
            res.status(404).send('Certificado não encontrado');
        }
    } catch (error) {
        console.error('Erro ao servir certificado:', error);
        res.status(500).send('Erro ao baixar certificado');
    }
});

// Servir arquivos estáticos do React (após build)
app.use(express.static(path.join(__dirname, '../build')));

app.use('/api/usuarios', usersRouter);
app.use('/api/squads', squadsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/eventos', eventosRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/faq', faqRouter);
app.use('/api/social', socialRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/pontos', pontosRouter);

// Rota raiz
app.get('/', (req, res) => {
    const buildPath = path.join(__dirname, '../build/index.html');
    if (fs.existsSync(buildPath)) {
        res.sendFile(buildPath);
    } else {
        res.send('Backend rodando! Execute "npm run build" no frontend para servir a aplicação React.');
    }
});

// Rota catch-all para React Router (SPA) - deve ser a última rota não-API
app.use((req, res, next) => {
    // Se a rota começa com /api, deixa o Express retornar 404 naturalmente
    if (req.path.startsWith('/api')) {
        return next();
    }
    
    const buildPath = path.join(__dirname, '../build/index.html');
    if (fs.existsSync(buildPath)) {
        // Serve o index.html para todas as rotas de aplicação (React Router)
        res.sendFile(buildPath);
    } else {
        res.status(404).send('Aplicação não foi construída. Execute: npm run build');
    }
});

function start(port) {
    if (sslKey && sslCert) {
        const server = https.createServer({ key: sslKey, cert: sslCert }, app).listen(port, () => {
            console.log(`Servidor HTTPS rodando em https://192.168.0.141:${port}`);
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
                console.error('Erro ao iniciar servidor HTTPS:', err);
            }
        });
    } else {
        console.error('Certificados SSL não encontrados. Backend rodando apenas em HTTP NÃO é seguro para câmera no iOS/Safari.');
    }
}

start(currentPort);
