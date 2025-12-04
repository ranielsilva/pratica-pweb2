import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
// Supondo que você tenha um cliente Prisma configurado
import { prisma } from '../src/lib/prisma'; // Ajuste o caminho se necessário

const saltRounds = 10;

/**
 * Registra um novo usuário, criptografando a senha.
 */
export async function registerUser(email: string, password: string) {
  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Um usuário com este email já existe.');
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });
  return { id: user.id, email: user.email };
}

/**
 * Autentica um usuário e retorna um token JWT.
 */
export async function loginUser(email: string, passwordAttempt: string) {
  // 1. Encontre o usuário no banco de dados pelo email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  // 2. Compare a senha fornecida com o hash salvo no banco
  const isPasswordMatch = await bcrypt.compare(passwordAttempt, user.password);

  if (!isPasswordMatch) {
    return null; // Senha incorreta
  }

  // 3. Gere o token JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('A variável de ambiente JWT_SECRET não está definida.');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });

  return { user: { id: user.id, email: user.email }, token };
}