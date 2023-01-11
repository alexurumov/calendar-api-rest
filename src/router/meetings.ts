import {Router} from "express";
import {isOwner} from "../middlewares/guards";
import {getAllMeetings, } from "../controllers/meetings";
import {auth} from "../middlewares/auth";

export const router = Router();

// TODO: put back guards when fixed!

router.get('/', meetingsController.getAllMeetings);

router.get('/:filter', meetingsController.getFilteredMeetings);

router.post('/', meetingsController.createMeeting);

router.get('/:id', isOwner, meetingsController.getMeeting);

router.put('/:id', isOwner, meetingsController.editMeeting);

router.delete('/:id', isOwner, meetingsController.removeMeeting);
