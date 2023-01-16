import {Router} from "express";
import {testController} from "../controllers";

export const router = Router();

router.get('/', (req, res) => testController.getAll(req, res));

router.post('/', (req, res) => testController.create(req, res));

router.get('/:id', (req, res) => testController.getById(req, res));

router.put('/:id', (req, res) => testController.updateById(req, res));

router.delete('/:id', (req, res) => testController.deleteById(req, res));