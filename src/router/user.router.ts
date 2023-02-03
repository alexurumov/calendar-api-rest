import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { createToken } from '../middlewares/token.middleware';
import { isGuest, isLogged, isOwner } from '../middlewares/guards';

export const router = Router();

router.post('/register', isGuest(), async (req, res, next) => { await userController.register(req, res, next); }, createToken);
router.post('/login', isGuest(), async (req, res, next) => { await userController.login(req, res, next); }, createToken);
router.get('/logout', isLogged(), (req, res) => userController.logout(req, res));
router.get('/', isLogged(), async (req, res, next) => await userController.getAll(req, res, next));
router.put('/:username', isOwner(), async (req, res, next) => { await userController.updateById(req, res, next); });

router.get('/:username/meetings', isOwner(), async (req, res, next) => await userController.getAllMeetings(req, res, next));

router.post('/:username/meetings', isOwner(), async (req, res, next) => await userController.createMeeting(req, res, next));
// router.delete('/:_id', isCreator(), async (req, res, next) => await meetingController.deleteById(req, res, next));
// router.patch('/:meetingId', async (req, res, next) => await userController.updateStatus(req, res, next));
