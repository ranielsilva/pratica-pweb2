import { Request, Response } from 'express';
import { uploadAvatarAndUpdateUser } from '../services/upload.service';

export async function uploadAvatarController(req: Request, res: Response) {
  // O middleware de autenticação já garantiu que req.user existe
  const userId = req.user!.userId;

  // O middleware multer garante que req.file existe
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
  }

  try {
    const updatedUser = await uploadAvatarAndUpdateUser(userId, req.file.buffer, req.file.originalname);
    return res.status(200).json({
      message: 'Avatar atualizado com sucesso!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    return res.status(500).json({ message: (error as Error).message });
  }
}