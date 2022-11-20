const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { isOwner } = require('../middlewares/guards');
const meetingsController = require('../controllers/meetings');

router.get('/', auth(), meetingsController.getAllMeetings);

router.get('/:filter', auth(), meetingsController.getFilteredMeetings);

router.post('/', auth(), meetingsController.createMeeting);

router.get('/:id', auth(), isOwner(), meetingsController.getMeeting);

router.put('/:id', auth(), isOwner(), meetingsController.editMeeting);

router.delete('/:id', auth(), isOwner(), meetingsController.removeMeeting);


module.exports = router;