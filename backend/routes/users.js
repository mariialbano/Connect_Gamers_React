const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '../../db.json');

function readDB() {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
    const db = readDB();
    res.json(db.usuarios || []);
});

router.post('/', (req, res) => {
    const db = readDB();
    const novoUsuario = { ...req.body, id: Date.now().toString() };
    db.usuarios.push(novoUsuario);
    writeDB(db);
    res.status(201).json(novoUsuario);
});

router.patch('/:id', (req, res) => {
    const db = readDB();
    const usuario = db.usuarios.find(u => u.id === req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    Object.assign(usuario, req.body);
    writeDB(db);
    res.json(usuario);
});

module.exports = router;