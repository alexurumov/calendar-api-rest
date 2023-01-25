import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class MeetingRoomDto {
    @AutoMap()
        _id?: string;

    @IsNotEmpty({ message: 'Meeting name is required!' })
    @Expose()
    @AutoMap()
        name!: string;

    @IsNotEmpty({ message: 'Meeting start available hours is required!' })
    @Expose()
    @AutoMap()
        startAvailableHours!: Date;

    @IsNotEmpty({ message: 'Meeting end available hours is required!' })
    @Expose()
    @AutoMap()
        endAvailableHours!: Date;

    @IsInt({ message: 'Meeting capacity must be an integer number!' })
    @Min(1, { message: 'Meeting capacity must be at least 1!' })
    @IsNotEmpty({ message: 'Meeting capacity is required!' })
    @Expose()
    @AutoMap()
        capacity!: number;
}

export type ReqQueryMeetingDto = Partial<MeetingRoomDto>;

export type PathParamMeetingDto = Required<Pick<MeetingRoomDto, '_id'>>;
