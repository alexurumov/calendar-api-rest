import {Types} from "mongoose";

export interface BaseTestEntity {
    name: string;
    message?: string;
}

export interface TestEntity extends BaseTestEntity {
    _id: Types.ObjectId
}