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
  const { integrantes = [], jogo, eventoId } = req.body || {};

  // Validação básica de campos obrigatórios
  if (!jogo || !eventoId) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes (jogo, eventoId).' });
  }

  // Garantir array
  if (!Array.isArray(integrantes) || integrantes.length === 0) {
    return res.status(400).json({ error: 'Informe ao menos um integrante.' });
  }

  // Carregar usuários existentes
  const usuariosValidos = new Set((db.usuarios || []).map(u => (u.usuario || '').toLowerCase().trim()));

  // Encontrar integrantes inexistentes
  const integrantesNormalizados = integrantes.map(n => (n || '').toLowerCase().trim()).filter(Boolean);
  const invalidos = integrantesNormalizados.filter(n => !usuariosValidos.has(n));

  if (invalidos.length > 0) {
    return res.status(400).json({
      error: 'Usuário não foi encontrado.',
      mensagem: 'Um ou mais usuários informados não existem no sistema.',
      usuariosInvalidos: invalidos
    });
  }

  const novoSquad = { ...req.body, id: Date.now().toString() };
  db.squads.push(novoSquad);
  // Criar chat de grupo automaticamente se houver mais de 1 integrante
  try {
    if (!db.groupChats) db.groupChats = [];
    const userMap = new Map((db.usuarios || []).map(u => [(u.usuario || '').toLowerCase().trim(), u.id]));
    const memberIds = integrantesNormalizados.map(n => userMap.get(n)).filter(Boolean);
    const already = db.groupChats.some(g => g.squadId === novoSquad.id);
    if (memberIds.length > 1 && !already) {
      db.groupChats.push({
        id: Date.now().toString() + '-g',
        squadId: novoSquad.id,
        name: novoSquad.nomeSquad || 'Squad',
        members: memberIds,
        messages: []
      });
    }
  } catch(e){ /* silencioso */ }
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