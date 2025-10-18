#!/bin/bash

# 🗄️ Script para Consultar Banco de Dados Connect Gamers
# Este script facilita consultas ao PostgreSQL via terminal

echo "🗄️ Connect Gamers - Consultas ao Banco de Dados"
echo "=============================================="
echo ""

# Verificar se os containers estão rodando
if ! docker ps | grep -q "connect_gamers_db"; then
    echo "❌ Container do PostgreSQL não está rodando!"
    echo "   Execute: docker-compose up -d"
    exit 1
fi

echo "✅ Container PostgreSQL encontrado!"
echo ""

# Função para executar comandos SQL
run_sql() {
    docker exec -it connect_gamers_db psql -U postgres -d connect_gamers -c "$1"
}

# Menu interativo
while true; do
    echo "📋 Escolha uma opção:"
    echo ""
    echo "1️⃣  Ver todos os usuários"
    echo "2️⃣  Ver usuário SuperAdmin"
    echo "3️⃣  Ver todos os squads"
    echo "4️⃣  Ver mensagens recentes do chat"
    echo "5️⃣  Ver usuários online"
    echo "6️⃣  Ver solicitações de amizade"
    echo "7️⃣  Ver jogos cadastrados"
    echo "8️⃣  Ver eventos"
    echo "9️⃣  Conectar ao psql (modo interativo)"
    echo "🔟  Sair"
    echo ""
    read -p "Digite sua opção (1-10): " choice
    
    case $choice in
        1)
            echo ""
            echo "👥 Todos os usuários:"
            echo "===================="
            run_sql "SELECT id, nome, usuario, cargo, created_at FROM usuarios ORDER BY created_at DESC;"
            ;;
        2)
            echo ""
            echo "👤 Usuário SuperAdmin:"
            echo "===================="
            run_sql "SELECT id, nome, usuario, cargo, created_at FROM usuarios WHERE usuario = 'SuperAdmin';"
            ;;
        3)
            echo ""
            echo "🎮 Todos os squads:"
            echo "=================="
            run_sql "SELECT id, nome_squad, jogo, nivel, data_cadastro FROM squads ORDER BY created_at DESC;"
            ;;
        4)
            echo ""
            echo "💬 Mensagens recentes do chat:"
            echo "=============================="
            run_sql "SELECT username, text, created_at FROM channel_messages ORDER BY created_at DESC LIMIT 10;"
            ;;
        5)
            echo ""
            echo "🟢 Usuários online:"
            echo "=================="
            run_sql "SELECT u.id, u.nome, u.usuario, COALESCE(us.status, 'Disponível') as status FROM usuarios u LEFT JOIN user_statuses us ON u.id = us.user_id WHERE COALESCE(us.status, 'Disponível') != 'Invisível' ORDER BY u.nome;"
            ;;
        6)
            echo ""
            echo "🤝 Solicitações de amizade:"
            echo "=========================="
            run_sql "SELECT fr.id, u1.usuario as sender, u2.usuario as receiver, fr.status, fr.created_at FROM friend_requests fr JOIN usuarios u1 ON fr.sender_id = u1.id JOIN usuarios u2 ON fr.receiver_id = u2.id ORDER BY fr.created_at DESC;"
            ;;
        7)
            echo ""
            echo "🎯 Jogos cadastrados:"
            echo "===================="
            run_sql "SELECT id, name, description, categories FROM jogos ORDER BY name;"
            ;;
        8)
            echo ""
            echo "📅 Eventos:"
            echo "==========="
            run_sql "SELECT e.id, e.nome, e.dia, e.horario, j.name as jogo FROM eventos e JOIN jogos j ON e.jogo_id = j.id ORDER BY e.dia, e.horario;"
            ;;
        9)
            echo ""
            echo "🔗 Conectando ao psql..."
            echo "   Digite '\\q' para sair"
            echo ""
            docker exec -it connect_gamers_db psql -U postgres -d connect_gamers
            ;;
        10)
            echo ""
            echo "👋 Até logo!"
            exit 0
            ;;
        *)
            echo ""
            echo "❌ Opção inválida! Digite um número de 1 a 10."
            ;;
    esac
    
    echo ""
    echo "----------------------------------------"
    echo ""
done
