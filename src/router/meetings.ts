import {Router} from "express";
import {isOwner} from "../middlewares/guards";
import {meetingsController} from "../controllers/meetings";
import {auth} from "../middlewares/auth";

export const router = Router();

router.get('/',auth, meetingsController.getAllMeetings);

router.get('/:filter',auth, meetingsController.getFilteredMeetings);

router.post('/',auth, meetingsController.createMeeting);

router.get('/:id', auth, isOwner, meetingsController.getMeeting);

router.put('/:id',auth, isOwner, meetingsController.editMeeting);

router.delete('/:id', auth, isOwner, meetingsController.removeMeeting);
