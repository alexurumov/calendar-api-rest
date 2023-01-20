import {AutoMap} from "@automapper/classes";

export class MeetingDto {
    @AutoMap()
    _id?: string;

    @AutoMap()
    name!: string;

    @AutoMap()
    startTime!: Date;

    @AutoMap()
    endTime!: Date;

    @AutoMap()
    room!: string;
}

export type ReqQueryMeetingDto = Partial<MeetingDto>;

export type PathParamMeetingDto = Required<Pick<MeetingDto, "_id">>