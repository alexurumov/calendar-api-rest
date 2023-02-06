import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { hasMeeting, isCreator, isLogged, isPathOwner } from '../middlewares/guards';

export const router = Router();

router.get('/', isLogged(), async (req, res, next) => await userController.getAll(req, res, next));

router.put('/:username', isPathOwner(), async (req, res, next) => { await userController.updateById(req, res, next); });

router.get('/:username/meetings', isPathOwner(), async (req, res, next) => await userController.getAllMeetings(req, res, next));
router.get('/:username/meetings/:meetingId', isPathOwner(), hasMeeting(), async (req, res, next) => await userController.getMeeting(req, res, next));
router.post('/:username/meetings', isPathOwner(), async (req, res, next) => await userController.createMeeting(req, res, next));
router.delete('/:username/meetings/:meetingId', isPathOwner(), isCreator(), async (req, res, next) => await userController.deleteById(req, res, next));
router.put('/:username/meetings/:meetingId', isPathOwner(), isCreator(), async (req, res, next) => await userController.updateMeeting(req, res, next));
router.patch('/:username/meetings/:meetingId', isPathOwner(), hasMeeting(), async (req, res, next) => await userController.updateStatus(req, res, next));
