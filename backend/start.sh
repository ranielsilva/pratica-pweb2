#!/bin/sh

# Executa as migrations do Sequelize
echo "Running database migrations..."
npx sequelize-cli db:migrate

# Inicia a aplicação
echo "Starting server..."
npm start