import {Router} from "express";
import {meetingsController} from "../controllers";

export const router = Router();

// TODO: put back guards when fixed!
router.get('/', meetingsController.getAllMeetings);

// router.get('/:filter',getFilteredMeetings);

router.post('/', meetingsController.createMeeting);

// router.get('/:id', getMeeting);

// router.put('/:id', meetingsController.editMeeting);

// router.delete('/:id', meetingsController.removeMeeting);
