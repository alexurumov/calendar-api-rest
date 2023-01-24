import {Router} from "express";
import {userController} from "../controllers/user.controller";
import {createToken} from "../middlewares/token.middleware";

export const router = Router();

router.post('/register', (req, res, next) => userController.register(req, res, next), createToken);
router.post('/login', (req, res, next) => userController.login(req, res, next), createToken);
router.get('/logout', (req, res) => userController.logout(req, res));