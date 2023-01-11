import {model, Schema} from "mongoose";
import {User} from "./User";

export interface Meeting {
    _id?: number | string;
    name?: string;
    startTime?: Date;
    endTime?: Date;
    room?: string;
    owner?: User;
}

export const meetingModel = model("Meeting", new Schema<Meeting>({
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
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
}));
