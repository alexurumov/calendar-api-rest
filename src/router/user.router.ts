import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { createToken } from '../middlewares/token.middleware';

export const router = Router();

router.post('/register', async (req, res, next) => { await userController.register(req, res, next); }, createToken);
router.post('/login', async (req, res, next) => { await userController.login(req, res, next); }, createToken);
router.get('/logout', (req, res) => userController.logout(req, res));
