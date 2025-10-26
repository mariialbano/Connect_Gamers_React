# Script para configurar certificados SSL automaticamente
# Detecta o IP da rede e gera certificados mkcert

Write-Host "=== Setup SSL para Connect Gamers ===" -ForegroundColor Cyan
Write-Host ""

# 1. Detectar IP da rede
Write-Host "1. Detectando IP da rede..." -ForegroundColor Yellow
$networkIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"
} | Select-Object -First 1).IPAddress

if (-not $networkIP) {
    Write-Host "❌ Não foi possível detectar o IP da rede!" -ForegroundColor Red
    exit 1
}

Write-Host "   IP detectado: $networkIP" -ForegroundColor Green
Write-Host ""

# 2. Verificar/Instalar mkcert
Write-Host "2. Verificando mkcert..." -ForegroundColor Yellow
$mkcertPath = Get-Command mkcert -ErrorAction SilentlyContinue

if (-not $mkcertPath) {
    Write-Host "   mkcert não encontrado. Instalando via winget..." -ForegroundColor Yellow
    winget install FiloSottile.mkcert
    
    # Atualizar PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "   ✅ mkcert instalado!" -ForegroundColor Green
} else {
    Write-Host "   ✅ mkcert já instalado" -ForegroundColor Green
}
Write-Host ""

# 3. Instalar CA local
Write-Host "3. Instalando CA local do mkcert..." -ForegroundColor Yellow
mkcert -install
Write-Host ""

# 4. Gerar certificados
Write-Host "4. Gerando certificados SSL..." -ForegroundColor Yellow

# Gerar certificados com nome baseado no IP (formato igual ao mkcert padrão)
$certPath = Join-Path $PSScriptRoot "backend"
Set-Location $certPath

# mkcert gera automaticamente com formato: IP+1.pem e IP+1-key.pem
mkcert $networkIP localhost 127.0.0.1 "::1"

# Copiar para a pasta public
Copy-Item "${networkIP}+1-key.pem" -Destination "..\public\${networkIP}+1-key.pem" -Force
Copy-Item "${networkIP}+1.pem" -Destination "..\public\${networkIP}+1.pem" -Force

Write-Host "   ✅ Certificados gerados em:" -ForegroundColor Green
Write-Host "      - backend/${networkIP}+1.pem" -ForegroundColor White
Write-Host "      - backend/${networkIP}+1-key.pem" -ForegroundColor White
Write-Host "      - public/${networkIP}+1.pem" -ForegroundColor White
Write-Host "      - public/${networkIP}+1-key.pem" -ForegroundColor White
Write-Host ""

# 5. Atualizar .env na raiz
Write-Host "5. Atualizando .env na raiz..." -ForegroundColor Yellow
$rootEnvPath = Join-Path $PSScriptRoot ".env"

$envContent = @"
# ============================================
# REACT APP ENVIRONMENT VARIABLES
# ============================================

# API Backend URL (for mobile testing)
REACT_APP_API_URL=https://${networkIP}:5000

# HTTPS Configuration
HTTPS=true
SSL_CRT_FILE=public/${networkIP}+1.pem
SSL_KEY_FILE=public/${networkIP}+1-key.pem

# Disable automatic browser opening
BROWSER=none

"@

Set-Content -Path $rootEnvPath -Value $envContent -Encoding UTF8
Write-Host "   ✅ .env atualizado com IP: $networkIP" -ForegroundColor Green
Write-Host ""

# 6. Atualizar backend/.env
Write-Host "6. Atualizando backend/.env..." -ForegroundColor Yellow
$backendEnvPath = Join-Path $PSScriptRoot "backend\.env"

if (Test-Path $backendEnvPath) {
    $backendEnv = Get-Content $backendEnvPath -Raw
    
    # Atualizar FRONTEND_URL
    $backendEnv = $backendEnv -replace 'FRONTEND_URL=.*', "FRONTEND_URL=https://${networkIP}:3000"
    
    # Adicionar/Atualizar SERVER_IP se não existir
    if ($backendEnv -notmatch 'SERVER_IP=') {
        $backendEnv += "`nSERVER_IP=${networkIP}`n"
    } else {
        $backendEnv = $backendEnv -replace 'SERVER_IP=.*', "SERVER_IP=${networkIP}"
    }
    
    Set-Content -Path $backendEnvPath -Value $backendEnv -Encoding UTF8
    Write-Host "   ✅ backend/.env atualizado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  backend/.env não encontrado" -ForegroundColor Yellow
}
Write-Host ""

# Resumo final
Write-Host "=== ✅ Configuração SSL concluída! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📱 URLs configuradas:" -ForegroundColor Cyan
Write-Host "   Frontend: https://${networkIP}:3000" -ForegroundColor White
Write-Host "   Backend:  https://${networkIP}:5000" -ForegroundColor White
Write-Host ""
Write-Host "▶️  Execute agora: npm run dev" -ForegroundColor Yellow
Write-Host ""
