import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

// Validação para garantir que as variáveis de ambiente foram carregadas
if (!jwtSecret || !jwtExpiresIn) {
  throw new Error('As variáveis de ambiente JWT_SECRET e JWT_EXPIRES_IN são obrigatórias.');
}

export { jwtSecret, jwtExpiresIn };