const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../../chat.log');

function migrateLine(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const cloned = { ...obj };
  if (cloned.message && typeof cloned.message === 'object') {
    const m = { ...cloned.message };
    const originalMsgId = m.messageId || m.id || m.timestamp || Date.now().toString();
    const authorId = m.userId || m.fromUserId || m.id;
    const migrated = {
      messageId: String(originalMsgId),
      id: String(authorId || originalMsgId),
      username: m.username || m.user || 'Usuário',
      text: m.text,
      time: m.time || (m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString())
    };
    if (m.avatar) migrated.avatar = m.avatar;
    cloned.message = migrated;
  }
  return cloned;
}

// Quebra conteúdo inteiro em objetos JSON mesmo quando vários estão concatenados na mesma linha
function extractJsonObjects(raw) {
  const objs = [];
  let depth = 0; let start = -1; let inStr = false; let escape = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inStr) {
      if (escape) { escape = false; }
      else if (ch === '\\') { escape = true; }
      else if (ch === '"') { inStr = false; }
    } else {
      if (ch === '"') { inStr = true; }
      else if (ch === '{') { if (depth === 0) start = i; depth++; }
      else if (ch === '}') { depth--; if (depth === 0 && start !== -1) { objs.push(raw.slice(start, i + 1)); start = -1; } }
    }
  }
  return objs;
}

function run() {
  if (!fs.existsSync(logPath)) {
    console.log('chat.log não encontrado, nada a migrar.');
    return;
  }
  const raw = fs.readFileSync(logPath, 'utf8');
  const objectStrings = extractJsonObjects(raw);
  if (objectStrings.length === 0) {
    console.log('Nenhum objeto JSON detectado em chat.log');
    return;
  }
  let changed = false;
  const migratedLines = objectStrings.map(str => {
    try {
      const obj = JSON.parse(str);
      const migr = migrateLine(obj);
      if (JSON.stringify(obj) !== JSON.stringify(migr)) changed = true;
      return JSON.stringify(migr);
    } catch (e) {
      return str;
    }
  });

  if (changed) {
    const backupPath = logPath + '.bak';
    if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, raw);
    fs.writeFileSync(logPath, migratedLines.join('\n') + '\n');
    console.log('Migração aplicada ao chat.log (objetos concatenados tratados).');
  } else {
    console.log('Nenhuma alteração necessária em chat.log');
  }
}

run();
