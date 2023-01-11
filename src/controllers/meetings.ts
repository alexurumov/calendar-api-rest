import {Request, Response} from "express";
import {IMeeting, MeetingModel} from "../models/Meeting";
import {UserModel} from "../models/User";

const hasConflictingMeetings = (req: Request, meeting: IMeeting, edit: boolean) => {
    let existingMeetings = req.body.user.meetings as IMeeting[];
    if (edit) {
        existingMeetings = existingMeetings.filter(mtng => mtng.name !== meeting.name);
    }
    if (existingMeetings.length < 1) {
        return false;
    }
    const sameRoomMeetings = existingMeetings.filter(mtng => mtng.room === meeting.room);
    if (sameRoomMeetings.length < 1) {
        return false;
    }
    const conflictingMeetings = sameRoomMeetings.filter((mtng) => {
        const currentStartTime = new Date(mtng.startTime!);
        const currentEndTime = new Date(mtng.endTime!);
        const newStartTime = new Date(meeting.startTime!);
        const newEndTime = new Date(meeting.endTime!);
        return (newStartTime >= currentStartTime && newStartTime <= currentEndTime)
            || (newEndTime >= currentStartTime && newEndTime <= currentEndTime);
    });
    return conflictingMeetings.length >= 1;
}

const hasCorrectTime = (meeting: IMeeting) => {
    return new Date(meeting.startTime!) < new Date(meeting.endTime!);
}

export async function createMeeting(req: Request, res: Response) {
    const meeting = req.body;
    meeting.owner = req.user!._id;

    const owner = await UserModel.findById(meeting.owner);
    /*
     Check for conflict with existing meetings! 
     */

    if (hasConflictingMeetings(req, meeting, false)) {
        res.status(409).send({message: 'Another meeting in the same room has already been scheduled in this time frame!'});
        return;
    }
    if (!hasCorrectTime(meeting)) {
        res.status(400).send({message: 'Start time cannot be later than End time!'});
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

        // TODO
        // owner.meetings.push(savedMeeting);
        // await owner.save();
        /*
        If both operations are successful, we return status ok and the newly added book!
        */
        return res.status(201).json(savedMeeting);
    } catch (err: any) {
        /*
        If Error is with code 11000, then the DB restriction for "unique" has been violated! 
        */

        if (err.code === 11000) {
            const {keyValue} = err;

            res.status(409)
                .send({message: `Meeting with such ${Object.keys(keyValue)[0]} is already registered!`});
            return;
        }
        /*
        Other errors are a result of validation of fields. In this case - "required"!
        */
        res.status(409)
            .send({
                message: err.message
                // TODO: fix
                // .replace('Meeting validation failed: ', '')
                // .split(", ")
                // .map(msg => msg.split(": ")[1])
                // .join("; ")
            });
        return;
    }
}

export async function getMeeting(req: Request, res: Response) {
    const meetingId = req.params.id;
    try {
        const meeting = await MeetingModel.findById({_id: meetingId});
        res.status(200).json(meeting);
    } catch (err) {
        debugger;
        res.status(404).send({message: 'No such meeting found!'});
    }
}

export function getAllMeetings(req: Request, res: Response) {
    // const userId = req.user!._id;

    const meetings = MeetingModel.find({});
    res.status(200).json(meetings);
}

// TODO: implement later!
// async function getFilteredMeetings(req: Request, res: Response) {
//     const filter = req.params.filter;
//     const todayStart = new Date();
//     todayStart.setHours(0);
//     todayStart.setMinutes(0);
//     todayStart.setSeconds(0);
//
//     const todayEnd = new Date();
//     todayEnd.setHours(23);
//     todayEnd.setMinutes(59);
//     todayEnd.setSeconds(59);
//     let meetings;
//     switch (filter.toLocaleLowerCase()) {
//         case 'past':
//             meetings = req.user.meetings
//                 .filter(mtng => new Date(mtng.endTime) < todayStart);
//             break;
//         case 'today':
//             meetings = req.user.meetings
//                 .filter(mtng => new Date(mtng.startTime) >= todayStart && new Date(mtng.endTime) <= todayEnd);
//             break;
//         case 'future':
//             meetings = req.user.meetings
//                 .filter(mtng => new Date(mtng.startTime) > todayEnd);
//             break;
//         default:
//             res.status(404).send({message: 'Invalid Filter'});
//             return;
//     }
//
//     if (meetings.length > 0) {
//         res.status(200).json(meetings);
//     } else {
//         res.status(200).send({message: 'No meetings to list!'});
//     }
// }

// TODO: fix later!
// export async function editMeeting(req: Request, res: Response) {
//     const meetingId = req.params.id;
//     const updatedMeetingDetails = req.body;
//     try {
//         const meeting = await MeetingModel.findById({_id: meetingId});
//         /*
//         If Error is our custom one above, we know it is wrong! >>> This is prevented by the isOwner Guard!
//         */
//         // if (!meeting) {
//         //     throw new Error(ERROR_MESSAGE);
//         // }
//         Object.assign(meeting, updatedMeetingDetails);
//
//         /*
//         Check for conflict with existing meetings!
//         */
//         if (hasConflictingMeetings(req, meeting, true)) {
//             res.status(409).send({message: 'Another meeting in the same room has already been scheduled in this time frame!'});
//             return;
//         }
//         if (!hasCorrectTime(meeting)) {
//             res.status(400).send({message: 'Start time cannot be later than End time!'});
//             return;
//         }
//         const updated = await meeting.save();
//         res.status(200).json(updated);
//     } catch (err) {
//         /*
//         If Error is our custom one above, we know it is wrong! >>> This is prevented by the isOwner Guard!
//         */
//         // if (err.message === ERROR_MESSAGE) {
//         //     res.status(404).send({message: "Invalid Meeting ID!"});
//         // }
//         /*
//         If Error is with code 11000, then the DB restriction for "unique" has been violated!
//         */
//         if (err.code === 11000) {
//             const {keyValue} = err;
//
//             res.status(409)
//                 .send({message: `Meeting with such ${Object.keys(keyValue)[0]} is already registered!`});
//             return;
//         }
//         /*
//         Other errors are a result of validation of fields. In this case - "required"!
//         */
//         res.status(409)
//             .send({
//                 message: err.message
//                     .replace('Meeting validation failed: ', '')
//                     .split(", ")
//                     .map(msg => msg.split(": ")[1])
//                     .join("; ")
//             });
//         return;
//     }
// }

// TODO: Fix later!
// export async function removeMeeting(req: Request, res: Response) {
//     const meetingId = req.params.id;
//     const meeting = await MeetingModel.findById({_id: meetingId});
//     await meeting.deleteOne();
//     res.status(200).json(meeting);
// }