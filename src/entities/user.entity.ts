import {Types} from "mongoose";
import {TestEntity} from "./test.entity";

export interface UserEntity {
    _id: Types.ObjectId;
    username: string;
    password: string;
    tests?: TestEntity[];
}