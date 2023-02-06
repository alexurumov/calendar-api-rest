import { Router } from 'express';
import { isGuest, isLogged } from '../middlewares/guards';
import { authController } from '../controllers/auth.controller';
import { createToken } from '../middlewares/token.middleware';

export const router = Router();

router.post('/register', isGuest(), async (req, res, next) => { await authController.register(req, res, next); }, createToken);
router.post('/login', isGuest(), async (req, res, next) => { await authController.login(req, res, next); }, createToken);
router.get('/logout', isLogged(), (req, res) => authController.logout(req, res));
