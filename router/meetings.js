const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { isOwner } = require('../middlewares/guards');
const meetingsController = require('../controllers/meetings');

router.get('/', auth(), (req, res) => {
    Meeting.find({}).then(meeting => { res.json(meeting); })
});

router.post('/', auth(), meetingsController.createMeeting);

router.get('/:id', auth(), isOwner(), meetingsController.getMeeting);

router.put('/:id', auth(), isOwner(), meetingsController.editMeeting);

router.delete('/:id', auth(), isOwner(), meetingsController.removeMeeting);


module.exports = router;