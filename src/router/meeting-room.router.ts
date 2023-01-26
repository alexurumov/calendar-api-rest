import { Router } from 'express';
import { meetingRoomController } from '../controllers/meeting-room.controller';

export const router = Router();

router.get('/', async (req, res, next) => await meetingRoomController.getAll(req, res, next));
router.post('/', async (req, res, next) => await meetingRoomController.create(req, res, next));
router.get('/:_id', async (req, res, next) => await meetingRoomController.getById(req, res, next));
router.put('/:_id', async (req, res, next) => await meetingRoomController.updateById(req, res, next));
router.delete('/:_id', async (req, res, next) => await meetingRoomController.deleteById(req, res, next));
