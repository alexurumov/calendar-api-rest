import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';

export const router = Router();

router.get('/', async (req, res, next) => await meetingController.getAll(req, res, next));
router.get('/:id', async (req, res, next) => await meetingController.getById(req, res, next));
