const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '../../db.json');
function readDB() { return JSON.parse(fs.readFileSync(dbPath, 'utf-8')); }
function writeDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

function ensure(db) {
    if (!db.statuses) db.statuses = {};
    if (!db.friendRequests) db.friendRequests = [];
    if (!db.friendships) db.friendships = [];
    if (normalizeFriendData(db)) writeDB(db);
}

function normalizeFriendData(db) {
    let changed = false;
    if (!Array.isArray(db.friendRequests)) {
        db.friendRequests = [];
        changed = true;
    } else {
        db.friendRequests = db.friendRequests.map(fr => {
            const senderId = fr.senderId || fr.fromUserId;
            const receiverId = fr.receiverId || fr.toUserId;
            const normalized = { ...fr, senderId, receiverId };
            if (fr.fromUserId !== undefined) { delete normalized.fromUserId; changed = true; }
            if (fr.toUserId !== undefined) { delete normalized.toUserId; changed = true; }
            if (fr.senderId !== senderId) changed = true;
            if (fr.receiverId !== receiverId) changed = true;
            return normalized;
        });
    }
    if (!Array.isArray(db.friendships)) {
        db.friendships = [];
        changed = true;
    } else {
        db.friendships = db.friendships.map(f => {
            if (Array.isArray(f.userIds)) return f;
            if (f.userId && f.friendId) {
                changed = true;
                const copy = { ...f, userIds: [f.userId, f.friendId] };
                delete copy.userId;
                delete copy.friendId;
                return copy;
            }
            return f;
        });
    }
    return changed;
}

router.get('/', (req, res) => {
    res.json({
        message: 'Social API',
        endpoints: [
            'PATCH /api/social/status',
            'GET /api/social/status/:userId',
            'GET /api/social/online',
            'POST /api/social/friend-request',
            'GET /api/social/requests/:userId',
            'POST /api/social/friend-request/:id/accept',
            'POST /api/social/friend-request/:id/decline',
            'GET /api/social/friends/:userId',
            'GET /api/social/search?q=term'
        ]
    });
});

const VALID_STATUS = ['Disponível', 'Ausente', 'Não perturbar', 'Invisível'];

// Atualizar status
router.patch('/status', (req, res) => {
    const { id, userId, status } = req.body;
    const targetId = id || userId;
    if (!targetId || !status) return res.status(400).json({ error: 'id e status são obrigatórios' });
    if (!VALID_STATUS.includes(status)) return res.status(400).json({ error: 'Status inválido' });
    const db = readDB(); ensure(db);
    db.statuses[targetId] = status;
    writeDB(db);
    res.json({ id: targetId, status });
});

// Obter status
router.get('/status/:userId', (req, res) => {
    const db = readDB(); ensure(db);
    const status = db.statuses[req.params.userId] || 'Disponível';
    res.json({ id: req.params.userId, status });
});

// Online
router.get('/online', (req, res) => {
    const db = readDB(); ensure(db);
    // Disponível por padrão'.
    const online = (db.usuarios || [])
        .map(u => {
            const st = db.statuses[u.id] || 'Disponível';
            return { id: u.id, username: u.nome || u.usuario, status: st };
        })
        .filter(u => u.status !== 'Invisível');
    res.json(online);
});

// Enviar pedido de amizade
router.post('/friend-request', (req, res) => {
    const { id, senderId, fromUserId, targetId, toUserId } = req.body || {};
    const requesterId = senderId || fromUserId || id;
    const recipientId = targetId || toUserId;
    if (!requesterId || !recipientId) return res.status(400).json({ error: 'IDs obrigatórios' });
    if (requesterId === recipientId) return res.status(400).json({ error: 'Não pode adicionar a si mesmo' });
    const db = readDB(); ensure(db);
    // Já amigos?
    const alreadyFriends = db.friendships.some(f => f.userIds.includes(requesterId) && f.userIds.includes(recipientId));
    if (alreadyFriends) return res.status(409).json({ error: 'Já são amigos' });
    // Pedido pendente existente
    const pending = db.friendRequests.find(fr => fr.status === 'pendente' && ((fr.senderId === requesterId && fr.receiverId === recipientId) || (fr.senderId === recipientId && fr.receiverId === requesterId)));
    if (pending) return res.status(409).json({ error: 'Pedido já pendente' });
    const fr = { id: Date.now().toString(), senderId: requesterId, receiverId: recipientId, status: 'pendente', createdAt: new Date().toISOString() };
    db.friendRequests.push(fr);
    writeDB(db);
    res.status(201).json(fr);
});

// Lista de pedidos 
router.get('/requests/:userId', (req, res) => {
    const { userId } = req.params;
    const db = readDB(); ensure(db);
    const incoming = db.friendRequests.filter(fr => fr.receiverId === userId && fr.status === 'pendente');
    const outgoing = db.friendRequests.filter(fr => fr.senderId === userId && fr.status === 'pendente');
    res.json({ incoming, outgoing });
});

// Aceitar pedido
router.post('/friend-request/:id/accept', (req, res) => {
    const db = readDB(); ensure(db);
    const fr = db.friendRequests.find(fr => fr.id === req.params.id);
    if (!fr) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (fr.status !== 'pendente') return res.status(400).json({ error: 'Pedido já processado' });
    fr.status = 'aceito';
    db.friendships.push({ id: Date.now().toString(), userIds: [fr.senderId, fr.receiverId], since: new Date().toISOString() });
    writeDB(db);
    res.json(fr);
});

// Recusar pedido
router.post('/friend-request/:id/decline', (req, res) => {
    const db = readDB(); ensure(db);
    const fr = db.friendRequests.find(fr => fr.id === req.params.id);
    if (!fr) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (fr.status !== 'pendente') return res.status(400).json({ error: 'Pedido já processado' });
    fr.status = 'recusado';
    writeDB(db);
    res.json(fr);
});

// Cancelar pedido enviado 
router.delete('/friend-request/:id', (req, res) => {
    const db = readDB(); ensure(db);
    const fr = db.friendRequests.find(fr => fr.id === req.params.id);
    if (!fr) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (fr.status !== 'pendente') return res.status(400).json({ error: 'Não é possível cancelar: já processado' });
    // Marcar como cancelado para manter histórico
    fr.status = 'cancelado';
    writeDB(db);
    res.json({ success: true, id: fr.id, status: fr.status });
});

// Lista de amigos
router.get('/friends/:userId', (req, res) => {
    const { userId } = req.params;
    const db = readDB(); ensure(db);
    const friendIds = db.friendships
        .filter(f => f.userIds.includes(userId))
        .map(f => f.userIds.find(id => id !== userId));
    const friends = (db.usuarios || [])
        .filter(u => friendIds.includes(u.id))
        .map(u => {
            const base = { id: u.id, username: u.nome || u.usuario, status: db.statuses[u.id] || 'Disponível' };
            if (u.avatar) base.avatar = u.avatar;
            return base;
        });
    res.json(friends);
});

// Remover amizade
router.delete('/friends/:userId/:friendId', (req, res) => {
    const { userId, friendId } = req.params;
    const db = readDB(); ensure(db);
    const before = db.friendships.length;
    db.friendships = db.friendships.filter(f => !(f.userIds.includes(userId) && f.userIds.includes(friendId)));
    const removed = before !== db.friendships.length;
    writeDB(db);
    if (!removed) return res.status(404).json({ error: 'Amizade não encontrada' });
    res.json({ success: true });
});

// Buscar usuários
router.get('/search', (req, res) => {
    const { q = '', exclude } = req.query;
    const db = readDB(); ensure(db);
    const term = q.toLowerCase();
    const results = (db.usuarios || []).filter(u => (
        (u.usuario && u.usuario.toLowerCase().includes(term)) ||
        (u.nome && u.nome.toLowerCase().includes(term))
    ) && u.id !== exclude).slice(0, 20).map(u => ({ id: u.id, username: u.usuario || u.nome }));
    res.json(results);
});

module.exports = router;