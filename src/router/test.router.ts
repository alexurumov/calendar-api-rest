import {Router} from "express";
import {testController} from "../controllers";

export const router = Router();

router.get('/', (req, res) => testController.getAll(req, res));
router.post('/', (req, res) => testController.create(req, res));