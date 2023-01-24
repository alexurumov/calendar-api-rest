import {Router} from "express";
import {meetingController} from "../controllers/meeting.controller";

export const router = Router();

router.get('/', (req, res) => meetingController.getAll(req, res));
router.post('/', (req, res) => meetingController.create(req, res));
router.get('/:_id', (req, res) => meetingController.getById(req, res));
router.put('/:_id', (req, res) => meetingController.updateById(req, res));
router.delete('/:_id', (req, res) => meetingController.deleteById(req, res));