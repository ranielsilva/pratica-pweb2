# Use uma imagem base do Node.js v20, que é compatível com as dependências do Supabase
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de manifesto de pacote
COPY package.json package-lock.json* ./

# Instala as dependências
# Usamos 'npm install' em vez de 'npm ci' para resolver problemas de sincronia com o package-lock.json
# e garantir que as dependências corretas sejam instaladas.
RUN npm install

# Copia o código fonte da aplicação
COPY . .

# Expõe a porta que a aplicação usará
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]