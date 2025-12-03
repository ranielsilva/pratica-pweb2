import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão com o Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  // password: process.env.REDIS_PASSWORD, // Se estiver usando senha
  lazyConnect: true,

  // Tenta reconectar algumas vezes antes de desistir
  maxRetriesPerRequest: 3,

  retryStrategy(times) {
    // Delay de reconexão (máx 5s)
    const delay = Math.min(times * 200, 5000);
    console.log(`Redis: Tentando reconectar em ${delay}ms... (Tentativa ${times})`);
    return delay;
  }
});

// Eventos úteis para debug
redis.on('connect', () => {
  console.log('Redis: Conectado ao servidor.');
});

redis.on('ready', () => {
  console.log('Redis: Pronto para uso.');
});

redis.on('error', (err) => {
  console.error('Redis: Erro de conexão:', err);
});

redis.on('end', () => {
  console.log('Redis: Conexão encerrada.');
});

// Força a tentativa de conexão inicial
(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error('Redis: Falha ao conectar inicialmente:', err);
  }
})();

export default redis;
