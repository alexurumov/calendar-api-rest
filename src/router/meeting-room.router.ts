import { Router } from 'express';
import { meetingRoomController } from '../controllers/meeting-room.controller';
import { isLogged } from '../middlewares/guards';

export const router = Router();

router.get('/', isLogged(), async (req, res, next) => await meetingRoomController.getAll(req, res, next));
router.post('/', isLogged(), async (req, res, next) => await meetingRoomController.create(req, res, next));
router.get('/:_id', isLogged(), async (req, res, next) => await meetingRoomController.getById(req, res, next));
router.put('/:_id', isLogged(), async (req, res, next) => await meetingRoomController.updateById(req, res, next));
router.delete('/:_id', isLogged(), async (req, res, next) => await meetingRoomController.deleteById(req, res, next));
