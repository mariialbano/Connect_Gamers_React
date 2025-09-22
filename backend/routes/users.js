
const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '../../db.json');

function readDB() {
    try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        // Se não existir ou estiver vazio, retorna estrutura básica
        return { usuarios: [] };
    }
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Rota de login
router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body || {};
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const db = readDB();
    const usuarioBusca = String(usuario).trim();
    const user = (db.usuarios || []).find(u => u.usuario && String(u.usuario).trim() === usuarioBusca);
    if (!user) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    try {
        const senhaArmazenada = user.senha || '';
        let senhaValida = false;

        if (String(senhaArmazenada).startsWith('$2')) {
            // senha armazenada como hash bcrypt
            senhaValida = await bcrypt.compare(senha, senhaArmazenada);
        } else {
            // senha em texto (registro antigo) — comparar e migrar para hash se correto
            senhaValida = senha === senhaArmazenada;
            if (senhaValida) {
                const novoHash = await bcrypt.hash(senha, 10);
                user.senha = novoHash;
                writeDB(db);
            }
        }

        if (!senhaValida) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        // retorna usuário sem a senha
        const { senha: _, ...userSemSenha } = user;
        res.json(userSemSenha);
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

// Criar novo usuário (cadastro)
router.post('/', async (req, res) => {
    const db = readDB();
    const { usuario, senha, ...resto } = req.body || {};
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // Verifica existência (case-insensitive)
    const usuarioNormalized = String(usuario).trim();
    if ((db.usuarios || []).some(u => String(u.usuario).trim() === usuarioNormalized)) {
        return res.status(409).json({ error: 'Usuário já existe' });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        const novoUsuario = { ...resto, usuario: String(usuario).trim(), senha: hash, id: Date.now().toString() };
        db.usuarios = db.usuarios || [];
        db.usuarios.push(novoUsuario);
        writeDB(db);
        res.status(201).json({ ...novoUsuario, senha: undefined }); // não retorna o hash
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Atualizar usuário parcialmente
router.patch('/:id', (req, res) => {
    const db = readDB();
    const usuarioObj = db.usuarios.find(u => u.id === req.params.id);
    if (!usuarioObj) return res.status(404).json({ error: 'Usuário não encontrado' });
    Object.assign(usuarioObj, req.body || {});
    writeDB(db);
    res.json(usuarioObj);
});

module.exports = router;