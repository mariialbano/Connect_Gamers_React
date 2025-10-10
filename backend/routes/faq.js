const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
// Endpoint simples para teste de disponibilidade
router.get('/', (req, res) => {
    res.json({ ok: true, service: 'faq' });
});

const logsDir = path.join(__dirname, '../../logs');
const logPath = path.join(logsDir, 'feedback.log');
const dbPath = path.join(__dirname, '../../db.json');

function readDB() {
    try { return JSON.parse(fs.readFileSync(dbPath, 'utf-8')); } catch { return {}; }
}
function writeDB(data) {
    try { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); } catch (e) { console.error('[FEEDBACK] falha write db.json', e.message); }
}
function ensureSummary(db) {
    if (!db.feedbackSummary) db.feedbackSummary = { total: 0, categories: {}, lastUpdate: null, last: [] };
}

// Grava no arquivo de log
router.post('/feedback', (req, res) => {
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
        const entry = { id, timestamp, category, text: safe, ...(rate !== undefined ? { rating: rate } : {}), ...(userId ? { userId } : {}), ...(username ? { username } : {}) };
        try { if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true }); fs.appendFileSync(logPath, JSON.stringify(entry) + '\n'); }
        catch { return res.status(500).json({ error: 'falha ao gravar log' }); }
        const db = readDB();
        ensureSummary(db);
        db.feedbackSummary.total += 1;
        db.feedbackSummary.categories[category] = (db.feedbackSummary.categories[category] || 0) + 1;
        db.feedbackSummary.lastUpdate = timestamp;
        db.feedbackSummary.last.push({ id, timestamp, category, text: safe.slice(0, 240), ...(rate !== undefined ? { rating: rate } : {}) });
        if (db.feedbackSummary.last.length > 5) db.feedbackSummary.last = db.feedbackSummary.last.slice(-5);
        writeDB(db);
        return res.status(201).json({ ok: true, id });
    } catch (e) { return res.status(500).json({ error: 'falha inesperada' }); }
});

router.get('/feedback/feedbacks', (req, res) => {
    try { const db = readDB(); ensureSummary(db); return res.json(db.feedbackSummary); }
    catch { return res.status(500).json({ error: 'falha ao ler summary' }); }
});

module.exports = router;
