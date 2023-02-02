import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { type UserDto } from './user.dto';
import { Answered, Repeated } from '../entities/meeting.entity';

export class Participant implements Pick<UserDto, 'username'> {
    @AutoMap()
        username!: string;

    @AutoMap()
        answered: Answered = Answered.Pending;
}

export class Creator implements Pick<UserDto, 'username'> {
    username!: string;

    answered: Answered = Answered.Yes;
}

export class MeetingDto {
    @IsOptional()
    @AutoMap()
        _id?: string;

    creator!: string;

    @IsNotEmpty({ message: 'Meeting room is required!' })
    @Expose()
    @AutoMap()
        meetingRoom!: string;

    @IsDateString(undefined, { message: 'Meeting start time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsNotEmpty({ message: 'Meeting start time is required!' })
    @Expose()
    @AutoMap()
        startTime!: Date;

    @IsDateString(undefined, { message: 'Meeting end time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsNotEmpty({ message: 'Meeting end time is required!' })
    @Expose()
    @AutoMap()
        endTime!: Date;

    @IsOptional()
    @Expose()
        participants?: string[];

    @IsOptional()
    @IsEnum(Repeated, { message: 'Repeated must be one of the following: daily, weekly, monthly, (default: no)' })
    @Expose()
    @AutoMap()
        repeated: Repeated = Repeated.No;
}

export class MeetingUpdateDto {
    @IsOptional()
    @AutoMap()
        _id?: string;

    creator?: string;

    @IsOptional()
    @Expose()
    @AutoMap()
        meetingRoom?: string;

    @IsDateString(undefined, { message: 'Meeting start time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        startTime?: Date;

    @IsDateString(undefined, { message: 'Meeting end time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        endTime?: Date;

    @IsOptional()
    @Expose()
        participants?: string[];

    @IsOptional()
    @IsEnum(Repeated, { message: 'Repeated must be one of the following: daily, weekly, monthly, (default: no)' })
    @Expose()
    @AutoMap()
        repeated?: Repeated;
}

export type ReqQueryMeetingDto = Partial<MeetingDto>;

export type PathParamMeetingDto = Required<Pick<MeetingDto, '_id'>>;
