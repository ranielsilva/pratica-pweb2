import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export async function registerController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const user = await registerUser(email, password);
    res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
  } catch (error) {
    // Verifica se o erro é a nossa exceção customizada de usuário existente
    if (error instanceof Error && error.message.includes('já existe')) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }

    // Para todos os outros erros, mantém a resposta genérica de erro 500
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const result = await loginUser(email, password);
    if (!result) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', error: (error as Error).message });
  }
}