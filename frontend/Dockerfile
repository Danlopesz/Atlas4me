# 1. Usamos uma imagem leve do Node.js
FROM node:22-alpine

# 2. Pasta de trabalho no container
WORKDIR /app

# 3. Copiamos os arquivos de dependência primeiro
COPY package*.json ./

# 4. Instalamos as dependências
RUN npm install

# 5. Copiamos todo o resto do projeto
COPY . .

# 6. Expomos a porta 3000 (padrão do React)
EXPOSE 3000

# 7. Comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev"]