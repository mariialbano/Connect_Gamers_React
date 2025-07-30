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
  res.json(db.squads || []);
});

router.post('/', (req, res) => {
  const db = readDB();
  const novoSquad = { ...req.body, id: Date.now().toString() };
  db.squads.push(novoSquad);
  writeDB(db);
  res.status(201).json(novoSquad);
});

router.patch('/:id', (req, res) => {
  const db = readDB();
  const squad = db.squads.find(s => s.id === req.params.id);
  if (!squad) return res.status(404).json({ error: 'Squad não encontrado' });
  Object.assign(squad, req.body);
  writeDB(db);
  res.json(squad);
});

module.exports = router;