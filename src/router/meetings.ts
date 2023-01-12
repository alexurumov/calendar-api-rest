import {Router} from "express";
// import {isOwner} from "../middlewares/guards";
import {getAllMeetings, createMeeting, getMeeting} from "../controllers/meetings";
import {auth} from "../middlewares/auth";

export const router = Router();

// TODO: put back guards when fixed!

router.get('/', getAllMeetings);

// router.get('/:filter',getFilteredMeetings);

router.post('/', createMeeting);

// router.get('/:id', getMeeting);

// router.put('/:id', meetingsController.editMeeting);

// router.delete('/:id', meetingsController.removeMeeting);
