const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DatabaseService = require('../services/databaseService');

// Endpoint simples para teste de disponibilidade
router.get('/', (req, res) => {
    res.json({ ok: true, service: 'faq' });
});

const logsDir = path.join(__dirname, '../../logs');
const logPath = path.join(logsDir, 'feedback.log');

function ensureLogsDir() { 
    try { 
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true }); 
    } catch (e) { } 
}

// Grava no arquivo de log
router.post('/feedback', async (req, res) => {
    try {
        const { text, rating, userId, username } = req.body || {};
        if (!text || typeof text !== 'string') return res.status(400).json({ error: 'texto obrigatório' });
        const trimmed = text.trim();
        if (trimmed.length < 5 || trimmed.length > 1000) return res.status(400).json({ error: 'tamanho inválido (5-1000)' });
        
        let rate;
        if (rating !== undefined) {
            const n = Number(rating);
            if (!Number.isInteger(n) || n < 1 || n > 5) return res.status(400).json({ error: 'rating deve ser 1-5' });
            rate = n;
        }
        
        const category = 'geral';
        const safe = trimmed.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();
        const entry = { 
            id, 
            timestamp, 
            category, 
            text: safe, 
            ...(rate !== undefined ? { rating: rate } : {}), 
            ...(userId ? { userId } : {}), 
            ...(username ? { username } : {}) 
        };
        
        try { 
            ensureLogsDir(); 
            fs.appendFileSync(logPath, JSON.stringify(entry) + '\n'); 
        } catch { 
            return res.status(500).json({ error: 'falha ao gravar log' }); 
        }
        
        // Atualizar summary no banco
        const summary = await DatabaseService.getFeedbackSummary();
        const newSummary = {
            total: (summary?.total || 0) + 1,
            categories: {
                ...summary?.categories,
                [category]: (summary?.categories?.[category] || 0) + 1
            },
            lastUpdate: timestamp,
            last: [
                ...(summary?.last || []).slice(-4),
                { id, timestamp, category, text: safe.slice(0, 240), ...(rate !== undefined ? { rating: rate } : {}) }
            ]
        };
        
        await DatabaseService.updateFeedbackSummary(newSummary);
        return res.status(201).json({ ok: true, id });
    } catch (e) { 
        console.error('Erro no feedback:', e);
        return res.status(500).json({ error: 'falha inesperada' }); 
    }
});

router.get('/feedback/feedbacks', async (req, res) => {
    try { 
        const summary = await DatabaseService.getFeedbackSummary();
        return res.json(summary || { total: 0, categories: {}, lastUpdate: null, last: [] });
    } catch { 
        return res.status(500).json({ error: 'falha ao ler summary' }); 
    }
});

module.exports = router;
