const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { aiModerate } = require('../moderacaoIA');
const { isBlocked, applyPenalty, clearActiveBlocks, clearUserHistory } = require('../penalidade');

const logPath = path.join(__dirname, '../../chat.log');
function logMessage(entry){
    try { fs.appendFileSync(logPath, JSON.stringify(entry)+"\n"); } catch(e) {}
}

const dbPath = path.join(__dirname, '../../db.json');

function readDB() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}
function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function ensureStructures(db) {
    if (!db.chatChannels) db.chatChannels = {};
    if (!db.privateChats) db.privateChats = [];
    if (!db.groupChats) db.groupChats = [];
}

const DEFAULT_CHANNELS = [
    'Geral',
    'Valorant',
    'League of Legends',
    'Fortnite',
    'Rocket League',
    'CS2'
];

router.get('/log', (req,res)=>{
    const { type, limit='100', offset='0' } = req.query;
    let data=[];
    try{
        if(fs.existsSync(logPath)){
            const lines = fs.readFileSync(logPath,'utf8').trim().split(/\n+/).filter(l=>l);
            lines.forEach(l=>{ try{ const o=JSON.parse(l); if(!type || o.type===type) data.push(o);}catch(e){} });
        }
    }catch(e){ return res.status(500).json({ error:'Falha ao ler log'}); }
    const off = Math.max(parseInt(offset)||0,0);
    const lim = Math.min(Math.max(parseInt(limit)||50,1),500);
    const slice = data.slice(-1 * (off+lim), data.length - off || undefined);
    res.json({ total:data.length, returned:slice.length, items:slice });
});

router.get('/chatlog', (req,res)=>{
    try{
        if(!fs.existsSync(logPath)) return res.status(404).send('Log vazio');
        res.setHeader('Content-Type','text/plain; charset=utf-8');
        res.send(fs.readFileSync(logPath,'utf8'));
    }catch(e){ res.status(500).send('Erro lendo log'); }
});

router.get('/channels', (req, res) => {
    const db = readDB();
    ensureStructures(db);
    DEFAULT_CHANNELS.forEach(ch => { if (!db.chatChannels[ch]) db.chatChannels[ch] = []; });
    writeDB(db);
    const result = Object.keys(db.chatChannels).map(ch => ({ name: ch, count: db.chatChannels[ch].length }));
    res.json(result);
});

// Mensagens de um canal
router.get('/messages/:channel', (req, res) => {
    const { channel } = req.params;
    const db = readDB();
    ensureStructures(db);
    if (!db.chatChannels[channel]) db.chatChannels[channel] = [];
    let changed = false;
    db.chatChannels[channel].forEach(m => {
        if (!m.timestamp) {
            const ts = m.time ? Date.parse(m.time) : (Number(m.id) || Date.now());
            if (ts && !isNaN(ts)) { m.timestamp = ts; changed = true; }
        }
    });
    if (changed) writeDB(db);
    res.json(db.chatChannels[channel]);
});

// Enviar mensagem para um canal
router.post('/messages/:channel', async (req, res) => {
    const { channel } = req.params;
    const { userId, username, avatar, text } = req.body;
    if (!text || !userId) return res.status(400).json({ error: 'userId e text são obrigatórios' });

    // Verifica bloqueio existente
    const block = isBlocked(userId);
    if(block.blocked){
        return res.status(423).json({ error:'Usuário bloqueado temporariamente', blockUntil: block.blockUntil });
    }

    const moderation = await aiModerate(text);
    if (!moderation.allowed) {
        // Aplica penalidade severity 3
        const penalty = applyPenalty(userId, 3);
        return res.status(400).json({ error: 'Mensagem bloqueada por violar políticas.', reasons: moderation.reasons, severity: moderation.severity, penalty });
    }
    if(moderation.severity === 2){
        const penalty = applyPenalty(userId, 2);
        if(penalty?.applied){
            // Nota de aviso pode ser retornada
        }
    }

    const db = readDB();
    ensureStructures(db);
    if (!db.chatChannels[channel]) db.chatChannels[channel] = [];
    const now = Date.now();
    const message = {
        id: now.toString(),
        userId,
        username,
        text: moderation.filteredText,
        time: new Date(now).toISOString(),
        timestamp: now
    };
    if (avatar) message.avatar = avatar; 
    db.chatChannels[channel].push(message);
    writeDB(db);
    logMessage({ type:'channel', channel, message });
    res.status(201).json(message);
});

// Chat privado
router.get('/private/:userA/:userB', (req, res) => {
    const { userA, userB } = req.params;
    const db = readDB();
    ensureStructures(db);
    const keySet = new Set([userA, userB]);
    let convo = db.privateChats.find(c => c.users.length === 2 && c.users.every(u => keySet.has(u)));
    if (!convo) {
        convo = { users: [userA, userB], messages: [] };
        db.privateChats.push(convo);
        writeDB(db);
    }
    res.json(convo.messages);
});

// Enviar mensagem
router.post('/private/:userA/:userB', async (req, res) => {
    const { userA, userB } = req.params;
    const { fromUserId, text, username } = req.body;
    if (!text || !fromUserId) return res.status(400).json({ error: 'fromUserId e text são obrigatórios' });
    const block = isBlocked(fromUserId);
    if(block.blocked){
        return res.status(423).json({ error:'Usuário bloqueado temporariamente', blockUntil: block.blockUntil });
    }
    const moderation = await aiModerate(text);
    if (!moderation.allowed) {
        const penalty = applyPenalty(fromUserId, 3);
        return res.status(400).json({ error: 'Mensagem bloqueada por violar políticas.', reasons: moderation.reasons, severity: moderation.severity, penalty });
    }
    if(moderation.severity === 2){
        applyPenalty(fromUserId, 2);
    }
    const db = readDB();
    ensureStructures(db);
    const keySet = new Set([userA, userB]);
    let convo = db.privateChats.find(c => c.users.length === 2 && c.users.every(u => keySet.has(u)));
    if (!convo) {
        convo = { users: [userA, userB], messages: [] };
        db.privateChats.push(convo);
    }
    const now = Date.now();
    const message = { id: now.toString(), fromUserId, username, text: moderation.filteredText, time: new Date(now).toISOString(), timestamp: now };
    convo.messages.push(message);
    writeDB(db);
    logMessage({ type:'private', users:[userA,userB], message });
    res.status(201).json(message);
});

module.exports = router;

// Lista grupos do usuário
router.get('/groups', (req, res) => {
    const { userId } = req.query;
    const db = readDB(); ensureStructures(db);
    if (!userId) return res.json([]);
    const groups = (db.groupChats || []).filter(g => g.members.includes(userId)).map(g => ({ id: g.id, name: g.name, squadId: g.squadId, members: g.members }));
    res.json(groups);
});

// Mensagens de um grupo
router.get('/group/:id/messages', (req, res) => {
    const db = readDB(); ensureStructures(db);
    const g = (db.groupChats || []).find(g => g.id === req.params.id);
    if (!g) return res.status(404).json({ error: 'Grupo não encontrado' });
    let changed = false;
    (g.messages||[]).forEach(m => {
        if (!m.timestamp){
            const ts = m.time ? Date.parse(m.time) : (Number(m.id)||Date.now());
            if (ts && !isNaN(ts)) { m.timestamp = ts; changed = true; }
        }
    });
    if (changed) writeDB(db);
    res.json(g.messages || []);
});

// Enviar mensagem para grupo
router.post('/group/:id/messages', async (req, res) => {
    const { fromUserId, username, text } = req.body || {};
    if (!fromUserId || !text) return res.status(400).json({ error: 'fromUserId e text são obrigatórios' });
    const block = isBlocked(fromUserId);
    if(block.blocked){
        return res.status(423).json({ error:'Usuário bloqueado temporariamente', blockUntil: block.blockUntil });
    }
    const moderation = await aiModerate(text);
    if (!moderation.allowed) {
        const penalty = applyPenalty(fromUserId, 3);
        return res.status(400).json({ error: 'Mensagem bloqueada por violar políticas.', reasons: moderation.reasons, severity: moderation.severity, penalty });
    }
    if(moderation.severity === 2){
        applyPenalty(fromUserId, 2);
    }
    const db = readDB(); ensureStructures(db);
    const g = (db.groupChats || []).find(g => g.id === req.params.id);
    if (!g) return res.status(404).json({ error: 'Grupo não encontrado' });
    if (!g.members.includes(fromUserId)) return res.status(403).json({ error: 'Não participante do grupo' });
    const now = Date.now();
    const message = { id: now.toString(), fromUserId, username, text: moderation.filteredText, time: new Date(now).toISOString(), timestamp: now };
    g.messages.push(message);
    writeDB(db);
    logMessage({ type:'group', groupId:g.id, squadId:g.squadId, message });
    res.status(201).json(message);
});

// Estado de bloqueio de um usuário (para UI exibir aviso)
router.get('/block-status/:userId', (req,res)=>{
    const { userId } = req.params;
    if(!userId) return res.status(400).json({ error:'userId obrigatório'});
    try {
        // Lê DB direto para expor histórico de infrações básicas ao cliente (somente metadados).
        const db = readDB();
        let history = [];
        if(db.moderation && db.moderation.users && db.moderation.users[userId]){
            history = (db.moderation.users[userId].infractions||[]).slice(-5).map(i=>({ severity:i.severity, timestamp:i.timestamp }));
        }
        const block = isBlocked(userId);
        if(block.blocked){
            const remainingMs = Math.max(block.blockUntil - Date.now(), 0);
            return res.json({ blocked:true, blockUntil:block.blockUntil, remainingMs, recentInfractions: history });
        }
        return res.json({ blocked:false, recentInfractions: history });
    } catch(e){
        res.status(500).json({ error:'Falha ao verificar bloqueio'});
    }
});

// Desbloqueia apenas usuários atualmente bloqueados (mantém histórico de infrações)
router.post('/clear-active-blocks', (req,res)=>{
    try {
        const result = clearActiveBlocks();
        res.json({ ok:true, ...result });
    } catch(e){
        res.status(500).json({ error:'Falha ao limpar bloqueios ativos' });
    }
});

// Limpa histórico (infrações + bloqueio) de um usuário específico
router.post('/clear-user-history/:userId', (req,res)=>{
    const { userId } = req.params;
    if(!userId) return res.status(400).json({ error:'userId obrigatório' });
    try {
        const result = clearUserHistory(userId);
        res.json({ ok:true, ...result });
    } catch(e){
        res.status(500).json({ error:'Falha ao limpar histórico do usuário' });
    }
});