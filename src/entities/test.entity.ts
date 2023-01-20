import {Types} from "mongoose";
import {AutoMap} from "@automapper/classes";

export class TestEntity {
    @AutoMap()
    _id!: Types.ObjectId

    @AutoMap()
    name!: string;

    @AutoMap()
    message!: string;
}