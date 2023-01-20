import {AutoMap} from "@automapper/classes";
import {Expose} from "class-transformer";

export class MeetingDto {
    @AutoMap()
    _id?: string;

    @Expose()
    @AutoMap()
    name!: string;

    @Expose()
    @AutoMap()
    startTime!: Date;

    @Expose()
    @AutoMap()
    endTime!: Date;

    @Expose()
    @AutoMap()
    room!: string;
}

export type ReqQueryMeetingDto = Partial<MeetingDto>;

export type PathParamMeetingDto = Required<Pick<MeetingDto, "_id">>