
const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const router = express.Router();
// Alerts desativados: não importamos mais onLoginEvent

const dbPath = path.join(__dirname, '../../db.json');
const logsDir = path.join(__dirname, '../../logs');

function ensureLogsDir() {
    try { if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true }); } catch (e) { }
}
function appendLog(file, obj) {
    try { ensureLogsDir(); fs.appendFileSync(path.join(logsDir, file), JSON.stringify(obj) + "\n"); } catch (e) { }
}
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const unifiedLoginLogFile = 'login.log';

function isStrongPassword(password) {
    const value = String(password || '');
    return STRONG_PASSWORD_REGEX.test(value);
}

function readDB() {
    try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        const db = JSON.parse(data);
        if (normalizeUserRecords(db)) {
            writeDB(db);
        }
        return db;
    } catch (err) {
        // Se não existir ou estiver vazio, retorna estrutura básica
        const fallback = { usuarios: [] };
        return fallback;
    }
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function normalizeUserRecords(db) {
    if (!db || typeof db !== 'object') return false;
    let changed = false;
    if (!Array.isArray(db.usuarios)) {
        db.usuarios = [];
        return true;
    }
    db.usuarios = db.usuarios.map(user => {
        if (!user || typeof user !== 'object') return user;
        const normalized = { ...user };
        if (normalized.role && !normalized.cargo) {
            normalized.cargo = normalized.role;
            changed = true;
        }
        if ('role' in normalized) {
            delete normalized.role;
            changed = true;
        }
        // migrar campo antigo 'nivelAcesso' para 'cargo'
        if (normalized.nivelAcesso && !normalized.cargo) {
            normalized.cargo = normalized.nivelAcesso;
            delete normalized.nivelAcesso;
            changed = true;
        }
        if (normalized.updatedAt && !normalized.Data) {
            normalized.Data = normalized.updatedAt;
            changed = true;
        }
        if ('updatedAt' in normalized) {
            delete normalized.updatedAt;
            changed = true;
        }
        if (!normalized.Data) {
            if (normalized.createdAt) {
                normalized.Data = normalized.createdAt;
            } else {
                normalized.Data = new Date().toISOString();
            }
            changed = true;
        }
        if (!normalized.cargo) {
            const isAdmin = normalized.usuario && normalized.usuario.toLowerCase() === 'admin';
            normalized.cargo = isAdmin ? 'admin' : 'user';
            changed = true;
        }
        return normalized;
    });
    return changed;
}

// Rota de login
router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body || {};
    if (!usuario || !senha) {
        const ev = { time: new Date().toISOString(), ip: req.ip, usuario, ok: false, reason: 'missing_fields' };
        appendLog(unifiedLoginLogFile, ev);
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }


    const db = readDB();
    const usuarioBusca = String(usuario).trim();
    const user = (db.usuarios || []).find(u => u.usuario && String(u.usuario).trim() === usuarioBusca);
    if (!user) {
        const ev = { time: new Date().toISOString(), ip: req.ip, usuario, ok: false, reason: 'user_not_found' };
        appendLog(unifiedLoginLogFile, ev);
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (!user.cargo) {
        user.cargo = user.usuario && user.usuario.toLowerCase() === 'admin' ? 'admin' : 'user';
        writeDB(db);
    }

    try {
        const senhaArmazenada = user.senha || '';
        let senhaValida = false;

        if (String(senhaArmazenada).startsWith('$2')) {
            // senha armazenada como hash bcrypt
            senhaValida = await bcrypt.compare(senha, senhaArmazenada);
        } else {
            // Comparar e migrar para hash se correto
            senhaValida = senha === senhaArmazenada;
            if (senhaValida) {
                const novoHash = await bcrypt.hash(senha, 10);
                user.senha = novoHash;
                writeDB(db);
            }
        }

        if (!senhaValida) {
            const ev = { time: new Date().toISOString(), ip: req.ip, usuario, ok: false, reason: 'wrong_password', userId: user.id };
            appendLog(unifiedLoginLogFile, ev);
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        // retorna usuário sem a senha
        const { senha: _, ...userSemSenha } = user;
        const okEv = { time: new Date().toISOString(), ip: req.ip, usuario: userSemSenha.usuario, userId: userSemSenha.id, cargo: userSemSenha.cargo || userSemSenha.nivelAcesso, ok: true };
        appendLog(unifiedLoginLogFile, okEv);
        // garantir campo nivelAcesso para o frontend
        res.json({
            ...userSemSenha,
            nivelAcesso: userSemSenha.nivelAcesso || userSemSenha.cargo || (userSemSenha.usuario && userSemSenha.usuario.toLowerCase() === 'admin' ? 'admin' : 'user')
        });
    } catch (err) {
        console.error('Erro na autenticação:', err);
        res.status(500).json({ error: 'Erro ao autenticar usuário' });
    }
});

// Listar usuários
router.get('/', (req, res) => {
    const db = readDB();
    res.json(db.usuarios || []);
});

// Obter usuário por ID
router.get('/:id', (req, res) => {
    const db = readDB();
    const user = (db.usuarios || []).find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
});

// Criar novo usuário
router.post('/', async (req, res) => {
    const db = readDB();
    const { usuario, senha, ...resto } = req.body || {};
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // senha forte
    if (!isStrongPassword(senha)) {
        return res.status(400).json({ error: 'A senha deve ter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.' });
    }

    // Verifica existência
    const usuarioNormalized = String(usuario).trim();
    if ((db.usuarios || []).some(u => String(u.usuario).trim() === usuarioNormalized)) {
        return res.status(409).json({ error: 'Usuário já existe' });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        const camposExtras = { ...resto };
        delete camposExtras.nivelAcesso;
        delete camposExtras.senha;

        const novoUsuario = {
            ...camposExtras,
            usuario: String(usuario).trim(),
            senha: hash,
            cargo: 'user',
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            Data: new Date().toISOString()
        };
        db.usuarios = db.usuarios || [];
        db.usuarios.push(novoUsuario);
        writeDB(db);
    const { senha: _, ...semSenha } = novoUsuario;
    appendLog('account_creation.log', { time: new Date().toISOString(), ip: req.ip, userId: semSenha.id, usuario: semSenha.usuario, cargo: semSenha.cargo, createdAt: semSenha.createdAt });
    res.status(201).json({ ...semSenha, nivelAcesso: semSenha.cargo || 'user' });
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

router.patch('/:id', async (req, res) => {
    const db = readDB();
    const usuarioObj = (db.usuarios || []).find(u => u.id === req.params.id);
    if (!usuarioObj) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const atualizacoes = { ...(req.body || {}) };
    delete atualizacoes.nivelAcesso;
    // aceitar 'cargo' e 'nivelAcesso' mas normalizar para 'cargo'
    if (Object.prototype.hasOwnProperty.call(atualizacoes, 'nivelAcesso')) {
        atualizacoes.cargo = atualizacoes.nivelAcesso;
        delete atualizacoes.nivelAcesso;
    }
    delete atualizacoes.id;

    try {
        if (Object.prototype.hasOwnProperty.call(atualizacoes, 'senha')) {
            const senhaNova = String(atualizacoes.senha || '').trim();
            if (!senhaNova) {
                return res.status(400).json({ error: 'Senha inválida' });
            }
            if (!isStrongPassword(senhaNova)) {
                return res.status(400).json({ error: 'A nova senha deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.' });
            }
            usuarioObj.senha = await bcrypt.hash(senhaNova, 10);
            usuarioObj.mustChangePassword = false;
            delete atualizacoes.senha;
        }

        Object.entries(atualizacoes).forEach(([chave, valor]) => {
            usuarioObj[chave] = valor;
        });

        usuarioObj.Data = new Date().toISOString();
        writeDB(db);
        const { senha: _, ...semSenha } = usuarioObj;
        res.json(semSenha);
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

module.exports = router;