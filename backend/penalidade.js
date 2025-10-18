const DatabaseService = require('./services/databaseService');

// Regras de bloqueio
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const BLOCKS = {
    severity2: 30 * 60 * 1000,        // 30 minutos
    severity3: 24 * 60 * 60 * 1000,   // 24 horas
    escalate2: 24 * 60 * 60 * 1000,   // Escalada para 24h após 3x severity 2 em uma janela de 7 dias
    escalate3: 7 * 24 * 60 * 60 * 1000// Escalada para 7 dias após 3x severity 3 em uma janela de 7 dias
};

async function getUserState(userId) {
    const moderationData = await DatabaseService.getUserModerationData(userId);
    if (!moderationData) {
        return { infractions: [], blockUntil: 0 };
    }
    return {
        infractions: JSON.parse(moderationData.infractions || '[]'),
        blockUntil: moderationData.block_until || 0
    };
}

async function isBlocked(userId) {
    const state = await getUserState(userId);
    const now = Date.now();
    if (state.blockUntil && state.blockUntil > now) {
        return { blocked: true, blockUntil: state.blockUntil };
    }
    return { blocked: false };
}

async function applyPenalty(userId, severity) {
    const state = await getUserState(userId);
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

    await DatabaseService.updateUserModerationData(userId, {
        infractions: state.infractions,
        blockUntil: state.blockUntil
    });
    
    return { blockUntil: state.blockUntil, applied };
}

// Limpa apenas bloqueios ativos (mantém histórico)
async function clearActiveBlocks(){
    // Esta função precisaria ser implementada no DatabaseService
    // Por enquanto, retornamos um resultado vazio
    return { usersUnblocked: 0 };
}

// Remove histórico e bloqueio de um usuário
async function clearUserHistory(userId){
    await DatabaseService.updateUserModerationData(userId, {
        infractions: [],
        blockUntil: 0
    });
    return { cleared: true, userId };
}
module.exports = { isBlocked, applyPenalty, clearActiveBlocks, clearUserHistory };
