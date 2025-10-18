const express = require('express');
const router = express.Router();
const DatabaseService = require('../services/databaseService');

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
router.patch('/status', async (req, res) => {
    const { id, userId, status } = req.body;
    const targetId = id || userId;
    if (!targetId || !status) return res.status(400).json({ error: 'id e status são obrigatórios' });
    if (!VALID_STATUS.includes(status)) return res.status(400).json({ error: 'Status inválido' });
    
    try {
        await DatabaseService.updateUserStatus(targetId, status);
        res.json({ id: targetId, status });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// Obter status
router.get('/status/:userId', async (req, res) => {
    try {
        const status = await DatabaseService.getUserStatus(req.params.userId);
        res.json({ id: req.params.userId, status });
    } catch (error) {
        console.error('Erro ao obter status:', error);
        res.status(500).json({ error: 'Erro ao obter status' });
    }
});

// Online
router.get('/online', async (req, res) => {
    try {
        const online = await DatabaseService.getOnlineUsers();
        res.json(online);
    } catch (error) {
        console.error('Erro ao obter usuários online:', error);
        res.status(500).json({ error: 'Erro ao obter usuários online' });
    }
});

// Enviar pedido de amizade
router.post('/friend-request', async (req, res) => {
    const { id, senderId, fromUserId, targetId, toUserId } = req.body || {};
    const requesterId = senderId || fromUserId || id;
    const recipientId = targetId || toUserId;
    if (!requesterId || !recipientId) return res.status(400).json({ error: 'IDs obrigatórios' });
    if (requesterId === recipientId) return res.status(400).json({ error: 'Não pode adicionar a si mesmo' });
    
    try {
        // Verificar se já são amigos
        const friends = await DatabaseService.getUserFriends(requesterId);
        const alreadyFriends = friends.some(f => f.id === recipientId);
        if (alreadyFriends) return res.status(409).json({ error: 'Já são amigos' });
        
        // Verificar se já existe pedido pendente
        const requests = await DatabaseService.getFriendRequests(requesterId);
        const pending = [...requests.incoming, ...requests.outgoing].find(fr => 
            fr.status === 'pendente' && 
            (fr.sender_id === requesterId || fr.receiver_id === requesterId) &&
            (fr.sender_id === recipientId || fr.receiver_id === recipientId)
        );
        if (pending) return res.status(409).json({ error: 'Pedido já pendente' });
        
        const fr = await DatabaseService.createFriendRequest(requesterId, recipientId);
        res.status(201).json(fr);
    } catch (error) {
        console.error('Erro ao criar pedido de amizade:', error);
        res.status(500).json({ error: 'Erro ao criar pedido de amizade' });
    }
});

// Lista de pedidos 
router.get('/requests/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const requests = await DatabaseService.getFriendRequests(userId);
        res.json(requests);
    } catch (error) {
        console.error('Erro ao obter pedidos:', error);
        res.status(500).json({ error: 'Erro ao obter pedidos' });
    }
});

// Aceitar pedido
router.post('/friend-request/:id/accept', async (req, res) => {
    try {
        const fr = await DatabaseService.acceptFriendRequest(req.params.id);
        res.json(fr);
    } catch (error) {
        console.error('Erro ao aceitar pedido:', error);
        res.status(500).json({ error: 'Erro ao aceitar pedido' });
    }
});

// Recusar pedido
router.post('/friend-request/:id/decline', async (req, res) => {
    try {
        const fr = await DatabaseService.declineFriendRequest(req.params.id);
        res.json(fr);
    } catch (error) {
        console.error('Erro ao recusar pedido:', error);
        res.status(500).json({ error: 'Erro ao recusar pedido' });
    }
});

// Cancelar pedido enviado 
router.delete('/friend-request/:id', async (req, res) => {
    try {
        const fr = await DatabaseService.cancelFriendRequest(req.params.id);
        res.json({ success: true, id: fr.id, status: fr.status });
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({ error: 'Erro ao cancelar pedido' });
    }
});

// Lista de amigos
router.get('/friends/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const friends = await DatabaseService.getUserFriends(userId);
        res.json(friends);
    } catch (error) {
        console.error('Erro ao obter amigos:', error);
        res.status(500).json({ error: 'Erro ao obter amigos' });
    }
});

// Remover amizade
router.delete('/friends/:userId/:friendId', async (req, res) => {
    const { userId, friendId } = req.params;
    try {
        const removed = await DatabaseService.removeFriendship(userId, friendId);
        if (!removed) return res.status(404).json({ error: 'Amizade não encontrada' });
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao remover amizade:', error);
        res.status(500).json({ error: 'Erro ao remover amizade' });
    }
});

// Buscar usuários
router.get('/search', async (req, res) => {
    const { q = '', exclude } = req.query;
    try {
        const results = await DatabaseService.searchUsers(q, exclude);
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

module.exports = router;