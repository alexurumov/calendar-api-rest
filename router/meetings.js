const express = require('express');
const router = express.Router();
const { Meeting } = require('../models')

router.get('/', (req, res) => {
    Meeting.find({}).then(meeting => {res.json(meeting);})
});

router.post('/', (req, res) => {
    const meeting = new Meeting(req.body);
    meeting.save();
    res.json(meeting);
})

module.exports = router;