import {model, Schema} from "mongoose";
import {IMeeting} from "../interfaces";

const meetingSchema = new Schema<IMeeting>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    // owner: {type: Schema.Types.ObjectId, ref: "User", required: true},
})

export const MeetingModel = model<IMeeting>('Meeting', meetingSchema);
