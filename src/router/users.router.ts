import {Router} from "express";
import {usersController} from "../controllers";

// TODO: put back guards when fixed!
export const router = Router();

router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.post('/logout', usersController.logout);
