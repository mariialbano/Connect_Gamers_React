# Como rodar o backend Express em HTTPS local

1. Instale o mkcert:
   - https://github.com/FiloSottile/mkcert
   - Baixe e instale o mkcert e o nss tools (veja instruções do mkcert)

2. Gere o certificado:
   ```powershell
   mkcert -install
   mkcert 192.168.0.141 localhost
   ```
   Isso vai criar arquivos tipo:
   - 192.168.0.141+1-key.pem
   - 192.168.0.141+1.pem

3. Coloque os arquivos na pasta `backend/` do projeto.

4. Edite o `server.js` para usar HTTPS:
   - Adicione no topo:
     ```js
     const https = require('https');
     const sslKey = fs.readFileSync(path.join(__dirname, '192.168.0.141+1-key.pem'));
     const sslCert = fs.readFileSync(path.join(__dirname, '192.168.0.141+1.pem'));
     ```
   - Troque o `app.listen` por:
     ```js
     const server = https.createServer({ key: sslKey, cert: sslCert }, app).listen(port, ...)
     ```

5. Rode o backend normalmente:
   ```powershell
   node server.js
   ```
   O backend vai rodar em `https://192.168.0.141:5000`

6. No frontend, ajuste a URL da API para `https://192.168.0.141:5000`
   - Edite o `.env` do frontend ou ajuste o código para usar HTTPS.

7. Gere o QR code normalmente — ele vai apontar para URLs HTTPS.

---

Dúvidas? Veja https://github.com/FiloSottile/mkcert ou peça ajuda aqui!