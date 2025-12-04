import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Estendendo a interface Request do Express para incluir a propriedade 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; email: string };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('A variável de ambiente JWT_SECRET não está definida.');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; email: string };
    req.user = decoded; // Anexa os dados do usuário à requisição
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}