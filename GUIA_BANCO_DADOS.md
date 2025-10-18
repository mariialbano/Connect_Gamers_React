# 🗄️ Guia de Consultas ao Banco de Dados

Este guia mostra como consultar o banco de dados PostgreSQL do Connect Gamers diretamente pelo terminal, sem precisar usar o pgAdmin.

---

## 🚀 Como Usar

### **Opção 1: Script Interativo (MAIS FÁCIL)**

Execute o script `consultar-banco.sh`:

```bash
# Linux/Mac
chmod +x consultar-banco.sh
./consultar-banco.sh

# Windows (PowerShell)
bash consultar-banco.sh
```

O script oferece um menu com opções pré-definidas para consultas comuns.

### **Opção 2: Comandos Diretos**

Conecte diretamente ao PostgreSQL:

```bash
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers
```

---

## 📋 Consultas Mais Usadas

### **👥 Usuários**

```sql
-- Ver todos os usuários
SELECT id, nome, usuario, cargo, created_at FROM usuarios ORDER BY created_at DESC;

-- Ver usuário SuperAdmin
SELECT * FROM usuarios WHERE usuario = 'SuperAdmin';

-- Contar usuários por cargo
SELECT cargo, COUNT(*) as total FROM usuarios GROUP BY cargo;

-- Buscar usuário específico
SELECT * FROM usuarios WHERE usuario ILIKE '%nome%';
```

### **🎮 Squads**

```sql
-- Ver todos os squads
SELECT id, nome_squad, jogo, nivel, data_cadastro FROM squads ORDER BY created_at DESC;

-- Ver squads com integrantes
SELECT s.nome_squad, s.jogo, s.nivel, 
       array_agg(u.usuario) as integrantes
FROM squads s
LEFT JOIN squad_integrantes si ON s.id = si.squad_id
LEFT JOIN usuarios u ON si.usuario_id = u.id
GROUP BY s.id, s.nome_squad, s.jogo, s.nivel;

-- Contar squads por jogo
SELECT jogo, COUNT(*) as total FROM squads GROUP BY jogo;
```

### **💬 Chat**

```sql
-- Ver mensagens recentes
SELECT username, text, created_at 
FROM channel_messages 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver mensagens de um canal específico
SELECT username, text, created_at 
FROM channel_messages cm
JOIN chat_channels cc ON cm.channel_id = cc.id
WHERE cc.channel_name = 'Geral'
ORDER BY created_at DESC;

-- Contar mensagens por canal
SELECT cc.channel_name, COUNT(cm.id) as total_mensagens
FROM chat_channels cc
LEFT JOIN channel_messages cm ON cc.id = cm.channel_id
GROUP BY cc.id, cc.channel_name;
```

### **🤝 Sistema Social**

```sql
-- Ver usuários online
SELECT u.id, u.nome, u.usuario, 
       COALESCE(us.status, 'Disponível') as status
FROM usuarios u
LEFT JOIN user_statuses us ON u.id = us.user_id
WHERE COALESCE(us.status, 'Disponível') != 'Invisível'
ORDER BY u.nome;

-- Ver solicitações de amizade
SELECT fr.id, u1.usuario as sender, u2.usuario as receiver, 
       fr.status, fr.created_at
FROM friend_requests fr
JOIN usuarios u1 ON fr.sender_id = u1.id
JOIN usuarios u2 ON fr.receiver_id = u2.id
ORDER BY fr.created_at DESC;

-- Ver amizades
SELECT u1.usuario as usuario, u2.usuario as amigo, f.created_at
FROM friendships f
JOIN usuarios u1 ON f.user_id = u1.id
JOIN usuarios u2 ON f.friend_id = u2.id
ORDER BY f.created_at DESC;
```

### **🎯 Jogos e Eventos**

```sql
-- Ver todos os jogos
SELECT id, name, description, categories FROM jogos ORDER BY name;

-- Ver eventos com jogos
SELECT e.id, e.nome, e.dia, e.horario, j.name as jogo
FROM eventos e
JOIN jogos j ON e.jogo_id = j.id
ORDER BY e.dia, e.horario;

-- Contar eventos por jogo
SELECT j.name as jogo, COUNT(e.id) as total_eventos
FROM jogos j
LEFT JOIN eventos e ON j.id = e.jogo_id
GROUP BY j.id, j.name;
```

---

## 🔧 Comandos Úteis do psql

```sql
-- Listar todas as tabelas
\dt

-- Descrever estrutura de uma tabela
\d usuarios

-- Listar bancos de dados
\l

-- Listar usuários
\du

-- Ver comandos disponíveis
\?

-- Sair do psql
\q
```

---

## 📊 Scripts Prontos para Copiar e Colar

### **Verificar Status do Sistema**

```bash
# Ver usuários cadastrados
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c "SELECT COUNT(*) as total_usuarios FROM usuarios;"

# Ver squads cadastrados
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c "SELECT COUNT(*) as total_squads FROM squads;"

# Ver mensagens no chat
docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c "SELECT COUNT(*) as total_mensagens FROM channel_messages;"
```

### **Limpeza de Dados (CUIDADO!)**

```sql
-- Remover todas as mensagens do chat
DELETE FROM channel_messages;

-- Remover todos os squads
DELETE FROM squad_integrantes;
DELETE FROM squads;

-- Remover todos os usuários (exceto SuperAdmin)
DELETE FROM usuarios WHERE usuario != 'SuperAdmin';
```

### **Backup e Restore**

```bash
# Fazer backup do banco
docker exec connect_gamers_db pg_dump -U postgres connect_gamers > backup.sql

# Restaurar backup
docker exec -i connect_gamers_db psql -U postgres connect_gamers < backup.sql
```

---

## ⚠️ Dicas Importantes

1. **Sempre use `ORDER BY`** para resultados organizados
2. **Use `LIMIT`** em consultas grandes para evitar sobrecarga
3. **Teste comandos** em ambiente de desenvolvimento primeiro
4. **Faça backup** antes de operações de DELETE/UPDATE
5. **Use transações** para operações críticas:

```sql
BEGIN;
-- seus comandos aqui
COMMIT; -- ou ROLLBACK se algo der errado
```

---

## 🆘 Resolução de Problemas

### **Container não está rodando**
```bash
docker-compose up -d
```

### **Erro de conexão**
```bash
# Verificar se o container está saudável
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres
```

### **Esqueceu a senha do SuperAdmin**
```sql
-- Verificar se existe
SELECT usuario, cargo FROM usuarios WHERE usuario = 'SuperAdmin';

-- Se não existir, será criado automaticamente na próxima inicialização
```

---

**🎮 Bom trabalho com o Connect Gamers!**
