import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';

export const router = Router();

router.get('/', async (req, res, next) => await meetingController.getAll(req, res, next));
router.get('/:_id', async (req, res, next) => await meetingController.getById(req, res, next));

// router.put('/:_id', isCreator(), async (req, res, next) => await meetingController.updateById(req, res, next));
// router.post('/', isLogged(), async (req, res, next) => await meetingController.create(req, res, next));
// router.delete('/:_id', isCreator(), async (req, res, next) => await meetingController.deleteById(req, res, next));
