# 🗄️ Script PowerShell para Consultar Banco de Dados Connect Gamers
# Este script facilita consultas ao PostgreSQL via terminal

Write-Host "🗄️ Connect Gamers - Consultas ao Banco de Dados" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se os containers estão rodando
$containerRunning = docker ps | Select-String "connect_gamers_db"
if (-not $containerRunning) {
    Write-Host "❌ Container do PostgreSQL não está rodando!" -ForegroundColor Red
    Write-Host "   Execute: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Container PostgreSQL encontrado!" -ForegroundColor Green
Write-Host ""

# Função para executar comandos SQL
function Run-Sql {
    param([string]$query)
    docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c $query
}

# Menu interativo
do {
    Write-Host "📋 Escolha uma opção:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1️⃣  Ver todos os usuários" -ForegroundColor White
    Write-Host "2️⃣  Ver usuário SuperAdmin" -ForegroundColor White
    Write-Host "3️⃣  Ver todos os squads" -ForegroundColor White
    Write-Host "4️⃣  Ver mensagens recentes do chat" -ForegroundColor White
    Write-Host "5️⃣  Ver usuários online" -ForegroundColor White
    Write-Host "6️⃣  Ver solicitações de amizade" -ForegroundColor White
    Write-Host "7️⃣  Ver jogos cadastrados" -ForegroundColor White
    Write-Host "8️⃣  Ver eventos" -ForegroundColor White
    Write-Host "9️⃣  Conectar ao psql (modo interativo)" -ForegroundColor White
    Write-Host "🔟  Sair" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Digite sua opção (1-10)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "👥 Todos os usuários:" -ForegroundColor Cyan
            Write-Host "====================" -ForegroundColor Cyan
            Run-Sql "SELECT id, nome, usuario, cargo, created_at FROM usuarios ORDER BY created_at DESC;"
        }
        "2" {
            Write-Host ""
            Write-Host "👤 Usuário SuperAdmin:" -ForegroundColor Cyan
            Write-Host "====================" -ForegroundColor Cyan
            Run-Sql "SELECT id, nome, usuario, cargo, created_at FROM usuarios WHERE usuario = 'SuperAdmin';"
        }
        "3" {
            Write-Host ""
            Write-Host "🎮 Todos os squads:" -ForegroundColor Cyan
            Write-Host "==================" -ForegroundColor Cyan
            Run-Sql "SELECT id, nome_squad, jogo, nivel, data_cadastro FROM squads ORDER BY created_at DESC;"
        }
        "4" {
            Write-Host ""
            Write-Host "💬 Mensagens recentes do chat:" -ForegroundColor Cyan
            Write-Host "==============================" -ForegroundColor Cyan
            Run-Sql "SELECT username, text, created_at FROM channel_messages ORDER BY created_at DESC LIMIT 10;"
        }
        "5" {
            Write-Host ""
            Write-Host "🟢 Usuários online:" -ForegroundColor Cyan
            Write-Host "==================" -ForegroundColor Cyan
            Run-Sql "SELECT u.id, u.nome, u.usuario, COALESCE(us.status, 'Disponível') as status FROM usuarios u LEFT JOIN user_statuses us ON u.id = us.user_id WHERE COALESCE(us.status, 'Disponível') != 'Invisível' ORDER BY u.nome;"
        }
        "6" {
            Write-Host ""
            Write-Host "🤝 Solicitações de amizade:" -ForegroundColor Cyan
            Write-Host "==========================" -ForegroundColor Cyan
            Run-Sql "SELECT fr.id, u1.usuario as sender, u2.usuario as receiver, fr.status, fr.created_at FROM friend_requests fr JOIN usuarios u1 ON fr.sender_id = u1.id JOIN usuarios u2 ON fr.receiver_id = u2.id ORDER BY fr.created_at DESC;"
        }
        "7" {
            Write-Host ""
            Write-Host "🎯 Jogos cadastrados:" -ForegroundColor Cyan
            Write-Host "====================" -ForegroundColor Cyan
            Run-Sql "SELECT id, name, description, categories FROM jogos ORDER BY name;"
        }
        "8" {
            Write-Host ""
            Write-Host "📅 Eventos:" -ForegroundColor Cyan
            Write-Host "===========" -ForegroundColor Cyan
            Run-Sql "SELECT e.id, e.nome, e.dia, e.horario, j.name as jogo FROM eventos e JOIN jogos j ON e.jogo_id = j.id ORDER BY e.dia, e.horario;"
        }
        "9" {
            Write-Host ""
            Write-Host "🔗 Conectando ao psql..." -ForegroundColor Cyan
            Write-Host "   Digite '\q' para sair" -ForegroundColor Yellow
            Write-Host ""
            docker exec -it connect_gamers_db psql -U postgres -d connect_gamers
        }
        "10" {
            Write-Host ""
            Write-Host "👋 Até logo!" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "❌ Opção inválida! Digite um número de 1 a 10." -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
} while ($true)
