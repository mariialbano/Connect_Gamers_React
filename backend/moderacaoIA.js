// IA de moderação usando OpenAI
let client = null;
let hasOpenAI = false;
try {
    const OpenAI = require('openai');
    if (process.env.OPENAI_API_KEY) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        hasOpenAI = true;
    }
} catch (e) {
    console.warn('[moderacaoIA] OpenAI não inicializado:', e.message);
}

function censoredRegex(word){
    const raw = word;
    const escaped = raw.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');
    if(raw.length < 3){
        return new RegExp('\\b'+escaped+'\\b','gi');
    }
    const chars = raw.split('');
    let pattern = '\\b';
    for(let i=0;i<chars.length;i++){
        const c = chars[i];
        const esc = c.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');
        if(/[0-9a-zá-úç]/i.test(c)){
            pattern += esc + '(?:\\*+)?';
        } else {
            pattern += esc;
        }
    }    pattern = pattern.replace(/(?:\(\?:\\\*\+\)\)\?)+$/,'');
    pattern += '\\b';
    return new RegExp(pattern,'gi');
}

const PROFANIDADES = ['porra','caralho','merda','puta','putaria','foder','fodase','foda-se','cuceta'];
const INSULTOS = ['vadia','otario','otária','idiota','burro','retardado','lixo'];
const SEVERAS = ['estupro','estuprador','estuprada','pedofilia','pedofilo','incesto'];
const SEXUAIS = ['porno','pornô','xxx','nude','nudes'];
// Frases / ameaças graves ou auto / incitação
const AMEACAS = [
    /\b(vou te matar|matar você|te matar|vou te arrebentar|te espanco|te bater)\b/gi,
    /\b(se mata|se mate|va(i|) morrer|morra)\b/gi
];

const FALLBACK_PATTERNS = [
    ...PROFANIDADES.map(w=>({ re: censoredRegex(w), label:'profanidade', weight:1 })),
    ...INSULTOS.map(w=>({ re: censoredRegex(w), label:'insulto', weight:2 })),
    ...SEVERAS.map(w=>({ re: censoredRegex(w), label:'+18_grave', weight:3 })),
    ...SEXUAIS.map(w=>({ re: censoredRegex(w), label:'sexual', weight:1 })),
    ...AMEACAS.map(r=>({ re: r, label:'ameaça', weight:3 }))
];

function maskWord(w){
    if(w.length <= 2) return '*'.repeat(w.length);
    const mid = w.slice(1, -1).replace(/./g,'*');
    return w[0] + mid + w[w.length-1];
}

function fallbackMask(text){
    let reasons = new Set();
    let triggers = [];
    let result = text;
    let counts = { profanidade:0, insulto:0, sexual:0, '+18_grave':0, ameaça:0 };
    let highestWeight = 0;

    FALLBACK_PATTERNS.forEach(p => {
        p.re.lastIndex = 0;
        result = result.replace(p.re, m => {
            // Guardar match sem criar falsos positivos de letras isoladas.
            const cleaned = m.replace(/\*/g,'').trim();
            if(cleaned.length < 3) return m; // ignora fragmentos muito curtos
            reasons.add(p.label);
            triggers.push({ label: p.label, match: m });
            if(counts[p.label] !== undefined) counts[p.label]++;
            if(p.weight > highestWeight) highestWeight = p.weight;
            return maskWord(cleaned);
        });
    });

    // Evitando falso severity 2 por matches isolados.
    let severity = 0;
    const distinct = reasons.size;
    const totalProf = counts.profanidade;
    if(highestWeight === 3 || counts.ameaça) severity = 3;
    else if(distinct >= 2 || counts.insulto > 0 || totalProf >= 3) severity = 2;
    else if(distinct === 1) severity = 1;
    return { text: result, reasons: [...reasons], severity, triggers };
}

async function aiModerate(text){
    if(!hasOpenAI || !client){
    const fb = fallbackMask(text);
    const severity = fb.severity;
    const allowed = severity < 3;
    return { allowed, filteredText: allowed ? (severity>0? fb.text : text) : '', originalText: text, reasons: fb.reasons, triggers: fb.triggers, severity, action: allowed? (severity>0? 'filter':'allow'):'block', source:'none' };
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
    const fb = fallbackMask(text);
    const severity = fb.severity;
    const allowed = severity < 3;
    return { allowed, filteredText: allowed ? (severity>0? fb.text : text):'', originalText: text, reasons: ['ai_error', ...fb.reasons], triggers: fb.triggers, severity, action: allowed? (severity>0? 'filter':'allow'):'block', source:'openai_error' };
    }
}

module.exports = { aiModerate };
