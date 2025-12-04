import { Router, Request, Response } from 'express';
import multer from 'multer';
import { registerController, loginController } from '../controllers/auth.controller';
import { uploadAvatarController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Configuração do Multer para usar armazenamento em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB por arquivo
});

// Rotas públicas
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/signin', loginController); // Adicionado alias para a rota de login

// Rotas de Perfil (Protegidas)
router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  // Graças ao middleware, temos acesso a req.user
  res.status(200).json({ message: 'Bem-vindo ao seu perfil!', user: req.user });
});

// Rota para upload de avatar
router.put('/profile/avatar', authMiddleware, upload.single('avatar'), uploadAvatarController);

export default router;