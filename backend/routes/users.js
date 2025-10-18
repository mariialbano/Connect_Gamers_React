
const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DatabaseService = require('../services/databaseService');

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

// Rota de login
router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body || {};
    if (!usuario || !senha) {
        const ev = { time: new Date().toISOString(), ip: req.ip, usuario, ok: false, reason: 'missing_fields' };
        appendLog(unifiedLoginLogFile, ev);
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    try {
        const user = await DatabaseService.getUserByUsername(usuario.trim());
        if (!user) {
            const ev = { time: new Date().toISOString(), ip: req.ip, usuario, ok: false, reason: 'user_not_found' };
            appendLog(unifiedLoginLogFile, ev);
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            const ev = { time: new Date().toISOString(), ip: req.ip, usuario, ok: false, reason: 'wrong_password', userId: user.id };
            appendLog(unifiedLoginLogFile, ev);
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        // retorna usuário sem a senha
        const { senha: _, ...userSemSenha } = user;
        const okEv = { time: new Date().toISOString(), ip: req.ip, usuario: userSemSenha.usuario, userId: userSemSenha.id, cargo: userSemSenha.cargo, ok: true };
        appendLog(unifiedLoginLogFile, okEv);
        
        res.json({
            ...userSemSenha,
            nivelAcesso: userSemSenha.cargo || 'user'
        });
    } catch (err) {
        console.error('Erro na autenticação:', err);
        res.status(500).json({ error: 'Erro ao autenticar usuário' });
    }
});

// Listar usuários
router.get('/', async (req, res) => {
    try {
        const users = await DatabaseService.getUsers();
        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

// Obter usuário por ID
router.get('/:id', async (req, res) => {
    try {
        const user = await DatabaseService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(user);
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.status(500).json({ error: 'Erro ao obter usuário' });
    }
});

// Criar novo usuário
router.post('/', async (req, res) => {
    const { usuario, senha, ...resto } = req.body || {};
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // senha forte
    if (!isStrongPassword(senha)) {
        return res.status(400).json({ error: 'A senha deve ter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.' });
    }

    try {
        // Verifica existência
        const existingUser = await DatabaseService.getUserByUsername(usuario.trim());
        if (existingUser) {
            return res.status(409).json({ error: 'Usuário já existe' });
        }

        const hash = await bcrypt.hash(senha, 10);
        const novoUsuario = await DatabaseService.createUser({
            nome: resto.nome || '',
            usuario: usuario.trim(),
            senha: hash,
            cargo: 'user',
            avatar: resto.avatar
        });

        const { senha: _, ...semSenha } = novoUsuario;
        res.status(201).json({ ...semSenha, nivelAcesso: semSenha.cargo || 'user' });
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const usuarioObj = await DatabaseService.getUserById(req.params.id);
        if (!usuarioObj) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const atualizacoes = { ...(req.body || {}) };
        delete atualizacoes.nivelAcesso;
        delete atualizacoes.id;

        if (Object.prototype.hasOwnProperty.call(atualizacoes, 'senha')) {
            const senhaNova = String(atualizacoes.senha || '').trim();
            if (!senhaNova) {
                return res.status(400).json({ error: 'Senha inválida' });
            }
            if (!isStrongPassword(senhaNova)) {
                return res.status(400).json({ error: 'A nova senha deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.' });
            }
            atualizacoes.senha = await bcrypt.hash(senhaNova, 10);
        }

        const usuarioAtualizado = await DatabaseService.updateUser(req.params.id, atualizacoes);
        const { senha: _, ...semSenha } = usuarioAtualizado;
        res.json(semSenha);
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

module.exports = router;