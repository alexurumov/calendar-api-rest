import {Types} from "mongoose";

export interface UserEntity {
    _id: Types.ObjectId;
    username: string;
    password: string;
}