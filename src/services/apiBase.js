// ============================================================
// CONFIGURAÇÃO DE API - FACEID NO IPHONE/SAFARI
// ============================================================
// IMPORTANTE: Para iOS/Safari funcionar sem problemas:
// 1. Frontend e Backend devem estar na MESMA ORIGEM
// 2. Use HTTPS
// 3. Certificado deve ser confiável ou importado no iPhone

// A melhor solução é servir o React pelo próprio backend
// Então o iPhone acessa APENAS: https://192.168.0.141:5000

export const API_BASE = 'https://192.168.0.141:5000';

console.log('📡 API_BASE configurado para iOS/Safari:', API_BASE);