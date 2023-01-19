import {Router} from "express";
import {userController} from "../controllers/user.controller";

export const router = Router();

// router.get('/', (req, res) => userController.getAll(req, res));
// router.post('/', (req, res) => userController.create(req, res));
// router.get('/:id', (req, res) => userController.getById(req, res));
// router.put('/:id', (req, res) => userController.updateById(req, res));
// router.delete('/:id', (req, res) => userController.deleteById(req, res));

router.post('/register', (req, res) => userController.register(req, res));
router.post('/login', (req, res) => userController.login(req, res));
router.get('/logout', (req, res) => userController.logout(req, res));