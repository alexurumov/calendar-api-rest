import {Types} from "mongoose";
import {IMeeting} from "./IMeeting";

export interface IUser {
    _id?: Types.ObjectId;
    username: string;
    password: string;
    meetings: Types.Array<IMeeting>;

    matchPassword(pass: string): boolean;
}