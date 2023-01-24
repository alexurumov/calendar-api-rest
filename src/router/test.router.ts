import {Router} from "express";
import {testController} from "../controllers/test.controller";

export const router = Router();

router.get('/', (req, res) => testController.getAll(req, res));
router.post('/', (req, res) => testController.create(req, res));
router.get('/:_id', (req, res) => testController.getById(req, res));
router.put('/:_id', (req, res) => testController.updateById(req, res));
router.delete('/:_id', (req, res) => testController.deleteById(req, res));