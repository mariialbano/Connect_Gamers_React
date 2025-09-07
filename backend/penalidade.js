const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

function ensureDBFile(){
    if(!fs.existsSync(dbPath)){
        const initial = { users: [], squads: [], games: [], eventos: [], rankings: [], moderation: { users: {} }, chatChannels: {}, privateChats: [], groupChats: [] };
        try { fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2)); }
        catch(e){ console.error('Falha ao criar db.json:', e); }
    }
}

function readDB() { ensureDBFile(); return JSON.parse(fs.readFileSync(dbPath, 'utf-8')); }
function writeDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); }

// Regras de bloqueio
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const BLOCKS = {
    severity2: 30 * 60 * 1000,        // 30 minutos
    severity3: 24 * 60 * 60 * 1000,   // 24 horas
    escalate2: 24 * 60 * 60 * 1000,   // Escalada para 24h após 3x severity 2 em uma janela de 7 dias
    escalate3: 7 * 24 * 60 * 60 * 1000// Escalada para 7 dias após 3x severity 3 em uma janela de 7 dias
};

function ensureStructures(db) {
    if (!db.moderation) db.moderation = {};
    if (!db.moderation.users) db.moderation.users = {};
}

function getUserState(db, userId) {
    ensureStructures(db);
    if (!db.moderation.users[userId]) {
        db.moderation.users[userId] = { infractions: [], blockUntil: 0 };
    }
    return db.moderation.users[userId];
}

function isBlocked(userId) {
    const db = readDB();
    const state = getUserState(db, userId);
    const now = Date.now();
    if (state.blockUntil && state.blockUntil > now) {
        return { blocked: true, blockUntil: state.blockUntil };
    }
    return { blocked: false };
}

function applyPenalty(userId, severity) {
    const db = readDB();
    const state = getUserState(db, userId);
    const now = Date.now();
    // Limpar infrações antigas (mais de 7 dias)
    state.infractions = state.infractions.filter(i => now - i.timestamp <= WEEK_MS);
    // Registrar a nova infração
    state.infractions.push({ severity, timestamp: now });

    let applied = null;

    if (severity === 2) {
        // Bloqueio de 30 minutos
        const baseUntil = now + BLOCKS.severity2;
        if (baseUntil > state.blockUntil) state.blockUntil = baseUntil;
        applied = { type: 'severity2', durationMs: BLOCKS.severity2 };
        // Escalada se 3 infrações severity 2 
        const sev2Count = state.infractions.filter(i => i.severity === 2).length;
        if (sev2Count >= 3) {
            const escUntil = now + BLOCKS.escalate2;
            if (escUntil > state.blockUntil) state.blockUntil = escUntil;
            applied = { type: 'severity2_escalated_3_in_week', durationMs: BLOCKS.escalate2 };
        }
    } else if (severity === 3) {
        // Bloqueio de 24 horas
        const baseUntil = now + BLOCKS.severity3;
        if (baseUntil > state.blockUntil) state.blockUntil = baseUntil;
        applied = { type: 'severity3', durationMs: BLOCKS.severity3 };
        // Escalada se 3 infrações severity 3
        const sev3Count = state.infractions.filter(i => i.severity === 3).length;
        if (sev3Count >= 3) {
            const escUntil = now + BLOCKS.escalate3;
            if (escUntil > state.blockUntil) state.blockUntil = escUntil;
            applied = { type: 'severity3_escalated_3_in_week', durationMs: BLOCKS.escalate3 };
        }
    }

    writeDB(db);
    return { blockUntil: state.blockUntil, applied };
}

// Limpa apenas bloqueios ativos (mantém histórico)
function clearActiveBlocks(){
    const db = readDB();
    ensureStructures(db);
    const users = db.moderation.users || {};
    const now = Date.now();
    let cleared = 0;
    Object.keys(users).forEach(uid => {
        const st = users[uid];
        if(st.blockUntil && st.blockUntil > now){
            st.blockUntil = 0;
            cleared++;
        }
    });
    writeDB(db);
    return { usersUnblocked: cleared };
}

// Remove histórico e bloqueio de um usuário
function clearUserHistory(userId){
    const db = readDB();
    ensureStructures(db);
    const state = getUserState(db, userId);
    state.infractions = [];
    state.blockUntil = 0;
    writeDB(db);
    return { cleared:true, userId };
}
module.exports = { isBlocked, applyPenalty, clearActiveBlocks, clearUserHistory };
