# Como rodar o frontend em HTTPS local

Para liberar a câmera no iPhone/Safari, rode o React em HTTPS usando certificado próprio.

## Passos rápidos (Windows)

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

3. Coloque os arquivos na pasta `public/` do projeto.

4. Edite o `package.json` para rodar o React em HTTPS:
   - Adicione no início do script `start`:
     ```json
     "start": "set HTTPS=true&&set SSL_CRT_FILE=public/192.168.0.141+1.pem&&set SSL_KEY_FILE=public/192.168.0.141+1-key.pem&&react-scripts start"
     ```
   - Ou, para Linux/Mac:
     ```json
     "start": "HTTPS=true SSL_CRT_FILE=public/192.168.0.141+1.pem SSL_KEY_FILE=public/192.168.0.141+1-key.pem react-scripts start"
     ```

5. Rode o frontend normalmente:
   ```powershell
   npm start
   ```
   O React vai rodar em https://192.168.0.141:3000

6. No celular, acesse https://192.168.0.141:3000
   - Aceite o certificado não confiável (pode aparecer aviso, clique em "Continuar" ou "Avançado")
   - Agora o Safari/iOS libera a câmera!

## Observação
- O backend pode continuar rodando em HTTP, só o frontend precisa HTTPS para liberar a câmera.
- Se quiser, pode gerar certificado para outro IP ou domínio local.

---

Dúvidas? Veja https://github.com/FiloSottile/mkcert ou peça ajuda aqui!