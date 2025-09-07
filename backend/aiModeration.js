// IA de moderação usando OpenAI + fallback local
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Padrões de fallback
const FALLBACK_PATTERNS = [
    { re: /\b(porra|caralho|merda|puta|putaria|foder|foda-se|fodase|cuceta)\b/gi, label: 'profanidade' },
    { re: /\b(vadia|otario|otária|otario|idiota|burro|retardado|lixo)\b/gi, label: 'insulto' },
    { re: /\b(estupr\w+|pedofil\w+|incesto)\b/gi, label: '+18_grave' },
    { re: /\b(porno|pornô|xxx|nude(s)?)\b/gi, label: 'sexual' }
];

function maskWord(w){
    if(w.length <= 2) return '*'.repeat(w.length);
    const mid = w.slice(1, -1).replace(/./g,'*');
    return w[0] + mid + w[w.length-1];
}

function fallbackMask(text){
    let reasons = new Set();
    let result = text;
    FALLBACK_PATTERNS.forEach(p => {
        result = result.replace(p.re, m => { reasons.add(p.label); return maskWord(m); });
    });
    return { text: result, reasons: [...reasons] };
}

async function aiModerate(text){
    if(!process.env.OPENAI_API_KEY){
        const fb = fallbackMask(text);       const severity = fb.reasons.length ? 1 : 0;
        return { allowed: true, filteredText: fb.text, originalText: text, reasons: fb.reasons, severity, action: severity? 'filter':'allow', source:'none' };
    }
    try {
        const prompt = [
            'Você modera um chat de gamers em português. Responda SOMENTE JSON válido.',
            'Campos exigidos: { "severity": number, "reasons": string[], "masked": string }',
            'Regras de classificação:',
            'severity 0 = linguagem neutra ou aceitável.',
            'severity 1 = leve: gíria, palavrão leve isolado, frustração sem ataque direto.',
            'severity 2 = ofensivo: insulto direto, assédio, conteúdo sexual implícito, referência +18 moderada, tentativa de briga, múltiplos palavrões.',
            'severity 3 = grave (bloquear): ódio direcionado a grupos, sexual explícito, exploração infantil, ameaça de violência, gore explícito, doxxing, apologia crime, incitação ódio/violência.',
            'Mascaramento: em "masked" substitua termos problemáticos mantendo primeira e última letra e trocando o meio por asteriscos (ex: "palavrão" → "p******o"). NÃO remova conteúdo restante.',
            'Se severity 3, ainda produza uma versão masked (máscara tudo que for grave).',
            'Reasons: lista curta de categorias (ex: ["profanidade","insulto","sexual","odio","ameaça"]).',
            `Mensagem: ${text}`
        ].join('\n');

        const response = await client.responses.create({
            model: process.env.OPENAI_MODERATION_MODEL || 'gpt-5-nano',
            input: prompt,
            temperature: 0,
            max_output_tokens: 400,
            store: false
        });

        const raw = response.output_text || '';
        let parsed = {};
        try { parsed = JSON.parse(raw); } catch { parsed = {}; }
        let severity = Math.min(3, Math.max(0, parsed.severity ?? 0));
        let reasons = Array.isArray(parsed.reasons) ? parsed.reasons : [];
        let masked = typeof parsed.masked === 'string' && parsed.masked.trim() ? parsed.masked : text;

        // Se IA não mascarou nada mas deveria, aplicar fallback
        if(severity > 0 && masked === text){
            const fb = fallbackMask(text);
            if(fb.reasons.length){
                masked = fb.text;
                reasons = [...new Set([...reasons, ...fb.reasons])];
                if(severity === 0) severity = 1;
            }
        }

        const allowed = severity < 3;
        return {
            allowed,
            filteredText: allowed ? (severity>0 ? masked : text) : '',
            originalText: text,
            reasons,
            severity,
            action: allowed ? (severity>0 ? 'filter' : 'allow') : 'block',
            source: 'openai'
        };
    } catch (e) {
        // Fallback total em erro de API
        const fb = fallbackMask(text);
        const severity = fb.reasons.length ? 1 : 0;
        return { allowed: true, filteredText: fb.text, originalText: text, reasons: ['ai_error', ...fb.reasons], severity, action: severity? 'filter':'allow', source:'openai_error' };
    }
}

module.exports = { aiModerate };
