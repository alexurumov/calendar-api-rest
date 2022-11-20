const { Meeting, User } = require('../models');

const ERROR_MESSAGE = 'NO MEETING FOUND!'

/*
Helper function to check if there are conflicting meetings! 
*/
function hasConflictingMeetings (req, meeting) {
    const existingMeetings = req.user.meetings;
    if (existingMeetings.length < 1) {
        return false;
    }
    const sameRoomMeetings = existingMeetings.filter(mtng => mtng.room === meeting.room); 
    if (sameRoomMeetings.length < 1) {
        return false;
    }
    const conflictingMeetings = sameRoomMeetings.filter((mtng) =>  {
        const currentStartTime = new Date (mtng.startTime);
        const currentEndTime = new Date (mtng.endTime);
        const newStartTime = new Date(meeting.startTime);
        const newEndTime = new Date(meeting.endTime);
        return (newStartTime >= currentStartTime && newStartTime <= currentEndTime)
        || (newEndTime >= currentStartTime && newEndTime <= currentEndTime); 
    });
    return conflictingMeetings.length < 1 ? false : true;
}

async function createMeeting(req, res) {
    const meeting = new Meeting(req.body);
    meeting.owner = req.user._id;
    const owner = await User.findById(meeting.owner);

    /*
    Check for conflict with existing meetings! 
    */
    if (hasConflictingMeetings(req, meeting)) {
        res.status(409).send({ message: 'Another meeting in the same room has already been scheduled in this time frame!' });
        return;
    }
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
        return res.status(201).json(savedMeeting);
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
    try {
        const meeting = await Meeting.findById({_id: meetingId});
        res.status(200).json(meeting);
    }
    catch (err) {
        debugger;
        res.status(404).send({message: 'No such meeting found!'});
    }
}

async function editMeeting (req, res) {
    const meetingId = req.params.id;
    const updatedMeetingDetails = req.body;
    try {
        const meeting = await Meeting.findById({_id: meetingId});
        /*
        If Error is our custom one above, we know it is wrong! >>> This is prevented by the isOwner Guard!
        */
        // if (!meeting) {
        //     throw new Error(ERROR_MESSAGE);
        // }
        Object.assign(meeting, updatedMeetingDetails);

        /*
        Check for conflict with existing meetings! 
        */
        if (hasConflictingMeetings(req, meeting)) {
            res.status(409).send({ message: 'Another meeting in the same room has already been scheduled in this time frame!' });
            return;
        }
        const updated = await meeting.save();
        res.status(200).json(updated);
    }
    catch (err) {
        /*
        If Error is our custom one above, we know it is wrong! >>> This is prevented by the isOwner Guard!
        */
        // if (err.message === ERROR_MESSAGE) {
        //     res.status(404).send({message: "Invalid Meeting ID!"});
        // }
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

module.exports = {
    createMeeting, 
    getMeeting, 
    editMeeting
}