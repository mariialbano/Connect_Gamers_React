# Usa imagem oficial do Node.js LTS (Long Term Support)
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro (para aproveitar cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production

# Copia todo o código do backend
COPY . .

# Expõe a porta que o servidor vai usar
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["node", "server.js"]

