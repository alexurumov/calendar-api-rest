import {Router} from "express";
import {meetingController} from "../controllers/meeting.controller";

export const router = Router();

router.get('/', (req, res, next) => meetingController.getAll(req, res, next));
router.post('/', (req, res, next) => meetingController.create(req, res, next));
router.get('/:_id', (req, res, next) => meetingController.getById(req, res, next));
router.put('/:_id', (req, res, next) => meetingController.updateById(req, res, next));
router.delete('/:_id', (req, res, next) => meetingController.deleteById(req, res, next));