import {model, Schema, Types} from "mongoose";

export interface IMeeting {
    _id?: Types.ObjectId;
    name: string;
    startTime: Date;
    endTime: Date;
    room: string;
    owner: Types.ObjectId;

}

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
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true},
})

export const MeetingModel = model<IMeeting>('Meeting', meetingSchema);
