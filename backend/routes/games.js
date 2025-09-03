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
    res.json(db.jogos || []);
});

router.post('/', (req, res) => {
    const db = readDB();
    const novoJogo = { ...req.body, id: Date.now().toString() };
    db.jogos.push(novoJogo);
    writeDB(db);
    res.status(201).json(novoJogo);
});

router.patch('/:id', (req, res) => {
    const db = readDB();
    const jogo = db.jogos.find(g => g.id === req.params.id);
    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
    Object.assign(jogo, req.body);
    writeDB(db);
    res.json(jogo);
});

router.delete('/:id', (req, res) => {
    const db = readDB();
    const index = db.jogos.findIndex(g => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Jogo não encontrado' });
    const removed = db.jogos.splice(index, 1);
    writeDB(db);
    res.json(removed[0]);
});

module.exports = router;
