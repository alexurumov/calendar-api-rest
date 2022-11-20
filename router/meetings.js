const express = require('express');
const router = express.Router();
const { isOwner } = require('../middlewares/guards');
const meetingsController = require('../controllers/meetings');

router.get('/', meetingsController.getAllMeetings);

router.get('/:filter', meetingsController.getFilteredMeetings);

router.post('/', meetingsController.createMeeting);

router.get('/:id', isOwner(), meetingsController.getMeeting);

router.put('/:id',isOwner(), meetingsController.editMeeting);

router.delete('/:id', isOwner(), meetingsController.removeMeeting);

module.exports = router;