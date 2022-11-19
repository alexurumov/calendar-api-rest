const { Meeting, User } = require('../models');

async function createMeeting(req, res) {
    const meeting = new Meeting(req.body);
    meeting.owner = req.user._id;
    const owner = await User.findById(meeting.owner);
    debugger;

    try {
        /*
        Trying to save the meeting in the DB, so DB validation rules can be applied! 
        */
        const savedMeeting = await meeting.save();
        /*
        Adding the meeting to the owner's collection also!
        */
        owner.meetings.push(savedMeeting);
        await owner.save();
        /*
        If both operations are successful, we return status ok and the newly added book!
        */
        return res.status(200).json(savedMeeting);
    }
    catch (err) {
        /*
        If Error is with code 11000, then the DB restriction for "unique" has been violated! 
        */
        if (err.code === 11000) {
            const { keyValue } = err;

            res.status(409)
                .send({ message: `Meeting with such ${Object.keys(keyValue)[0]} is already registered!` });
            return;
        }
        /*
        Other errors are a result of validation of fields. In this case - "required"!
        */
        res.status(409)
            .send({
                message: err.message
                    .replace('Meeting validation failed: ', '')
                    .split(", ")
                    .map(msg => msg.split(": ")[1])
                    .join("; ")
            });
        return;
    }
}

async function getMeeting (req, res) {
    const meetingId = req.params.id;
    console.log(meetingId);
    try {
        const meeting = await Meeting.findById({_id: meetingId});
        res.status(200).json(meeting);
    }
    catch (err) {
        debugger;
        res.status(404).send({message: err.message});
    }
}

module.exports = {
    createMeeting, 
    getMeeting
}