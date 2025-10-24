#!/usr/bin/env python3
"""
Simple tunnel script using pyngrok
Run: pip install pyngrok
Then: python tunnel.py
"""

try:
    from pyngrok import ngrok
except ImportError:
    print("❌ pyngrok não está instalado")
    print("Execute: pip install pyngrok")
    exit(1)

# Inicia o tunnel
print("🌐 Iniciando tunnel para http://localhost:5000...")
public_url = ngrok.connect(5000)
print(f"✅ Tunnel criado!")
print(f"🔗 URL Pública: {public_url}")
print(f"\n📱 Use esta URL no seu iPhone/QR code:")
print(f"{public_url}")
print(f"\n📝 Mantenha este terminal aberto enquanto estiver usando")

# Mantém aberto
try:
    ngrok_process = ngrok.get_ngrok_process()
    ngrok_process.proc.wait()
except KeyboardInterrupt:
    print("\n\n🛑 Tunnel encerrado")
    ngrok.kill()
