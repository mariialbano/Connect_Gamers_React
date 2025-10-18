#!/bin/bash

# Script de Setup Rápido - Connect Gamers
# Este script facilita a configuração inicial do projeto

echo "🎮 Connect Gamers - Setup Automático"
echo "===================================="
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "   Baixe em: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    exit 1
fi

echo "✅ Docker encontrado: $(docker --version)"
echo "✅ Docker Compose encontrado: $(docker-compose --version)"
echo ""

# Verificar se o arquivo .env existe
if [ ! -f "backend/.env" ]; then
    echo "📝 Criando arquivo .env a partir do template..."
    cp backend/.env.example backend/.env
    echo "✅ Arquivo backend/.env criado!"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo backend/.env e adicione sua chave OpenAI:"
    echo "   OPENAI_API_KEY=sua_chave_aqui"
    echo ""
else
    echo "✅ Arquivo backend/.env já existe"
    echo ""
fi

# Perguntar se quer iniciar o Docker
read -p "🚀 Deseja iniciar o backend e banco de dados agora? (s/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo "🐳 Iniciando containers Docker..."
    docker-compose up -d
    echo ""
    echo "⏳ Aguardando containers ficarem prontos..."
    sleep 5
    echo ""
    echo "📊 Status dos containers:"
    docker-compose ps
    echo ""
    echo "✅ Backend rodando em: http://localhost:5000"
    echo "✅ PostgreSQL rodando em: localhost:5432"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Ver logs:           docker-compose logs -f"
    echo "   Parar containers:   docker-compose down"
    echo "   Reiniciar:          docker-compose restart"
    echo ""
fi

# Perguntar se quer instalar dependências do frontend
read -p "📦 Deseja instalar dependências do frontend React? (s/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
    echo ""
    echo "✅ Dependências instaladas!"
    echo ""
    echo "🚀 Para iniciar o frontend, execute:"
    echo "   npm start"
    echo ""
fi

echo ""
echo "================================="
echo "✨ Setup concluído com sucesso!"
echo "================================="
echo ""
echo "📚 Documentação: README.md e DOCKER_GUIDE.md"
echo ""
echo "🚀 Aplicação rodando em:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🎮 Bom trabalho!"

