const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

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

router.get('/raw-log', (req,res)=>{
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
router.post('/messages/:channel', (req, res) => {
    const { channel } = req.params;
    const { userId, username, avatar, text } = req.body;
    if (!text || !userId) return res.status(400).json({ error: 'userId e text são obrigatórios' });

    const db = readDB();
    ensureStructures(db);
    if (!db.chatChannels[channel]) db.chatChannels[channel] = [];
    const now = Date.now();
    const message = {
        id: now.toString(),
        userId,
        username,
        text,
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
router.post('/private/:userA/:userB', (req, res) => {
    const { userA, userB } = req.params;
    const { fromUserId, text, username } = req.body;
    if (!text || !fromUserId) return res.status(400).json({ error: 'fromUserId e text são obrigatórios' });
    const db = readDB();
    ensureStructures(db);
    const keySet = new Set([userA, userB]);
    let convo = db.privateChats.find(c => c.users.length === 2 && c.users.every(u => keySet.has(u)));
    if (!convo) {
        convo = { users: [userA, userB], messages: [] };
        db.privateChats.push(convo);
    }
    const now = Date.now();
    const message = { id: now.toString(), fromUserId, username, text, time: new Date(now).toISOString(), timestamp: now };
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
router.post('/group/:id/messages', (req, res) => {
    const { fromUserId, username, text } = req.body || {};
    if (!fromUserId || !text) return res.status(400).json({ error: 'fromUserId e text são obrigatórios' });
    const db = readDB(); ensureStructures(db);
    const g = (db.groupChats || []).find(g => g.id === req.params.id);
    if (!g) return res.status(404).json({ error: 'Grupo não encontrado' });
    if (!g.members.includes(fromUserId)) return res.status(403).json({ error: 'Não participante do grupo' });
    const now = Date.now();
    const message = { id: now.toString(), fromUserId, username, text, time: new Date(now).toISOString(), timestamp: now };
    g.messages.push(message);
    writeDB(db);
    logMessage({ type:'group', groupId:g.id, squadId:g.squadId, message });
    res.status(201).json(message);
});