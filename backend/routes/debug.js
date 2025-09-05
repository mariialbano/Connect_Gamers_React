const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '../../db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function safeUsers(list = []) {
  return list.map(u => ({ ...u, senha: u.senha ? '***' : undefined }));
}

// GET /api/debug/db  -> snapshot completo (sanitizado)
router.get('/db', (req, res) => {
  try {
    const db = readDB();
    const clone = { ...db };
    if (clone.usuarios) clone.usuarios = safeUsers(clone.usuarios);
    res.json(clone);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao ler DB' });
  }
});

router.get('/usuarios', (req, res) => {
  try { res.json(safeUsers(readDB().usuarios || [])); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/squads', (req, res) => {
  try { res.json(readDB().squads || []); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/jogos', (req, res) => {
  try { res.json(readDB().jogos || []); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/chat-channels', (req, res) => {
  try { res.json(readDB().chatChannels || {}); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/chat-channels/:channel', (req, res) => {
  try {
    const db = readDB();
    const ch = db.chatChannels && db.chatChannels[req.params.channel];
    if (!ch) return res.status(404).json({ error: 'Canal não encontrado' });
    res.json(ch);
  } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/private-chats', (req, res) => {
  try { res.json(readDB().privateChats || []); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/group-chats', (req, res) => {
  try { res.json(readDB().groupChats || []); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/friend-requests', (req, res) => {
  try { res.json(readDB().friendRequests || []); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/friendships', (req, res) => {
  try { res.json(readDB().friendships || []); } catch { res.status(500).json({ error: 'Falha' }); }
});

router.get('/statuses', (req, res) => {
  try {
    const statuses = readDB().statuses || {};
    const list = Object.entries(statuses).map(([userId, status]) => ({ userId, status }));
    res.json(list);
  } catch { res.status(500).json({ error: 'Falha' }); }
});

// Ajuda rápida
router.get('/', (req, res) => {
  res.json({
    message: 'Debug API - somente leitura',
    endpoints: [
      'GET /api/debug/db',
      'GET /api/debug/usuarios',
      'GET /api/debug/squads',
      'GET /api/debug/jogos',
      'GET /api/debug/chat-channels',
      'GET /api/debug/chat-channels/:channel',
      'GET /api/debug/private-chats',
      'GET /api/debug/group-chats',
      'GET /api/debug/friend-requests',
      'GET /api/debug/friendships',
      'GET /api/debug/statuses'
    ]
  });
});

module.exports = router;
