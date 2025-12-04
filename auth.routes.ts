import { Router, Request, Response } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rotas públicas
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/signin', loginController); // Adicionado alias para a rota de login



// Apenas usuários com um token JWT válido podem acessar
router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  // Graças ao middleware, temos acesso a req.user
  res.status(200).json({ message: 'Bem-vindo ao seu perfil!', user: req.user });
});

export default router;