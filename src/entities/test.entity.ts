import {Types} from "mongoose";

export interface TestEntity {
    _id: Types.ObjectId;
    name: string;
    message?: string;
}