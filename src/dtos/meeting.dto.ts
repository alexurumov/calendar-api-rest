import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { type UserDto } from './user.dto';
import { Answered, type Period, Repeated } from '../types/enums';

// TODO: Move to subEntities dir
export class Participant implements Pick<UserDto, 'username'> {
    @AutoMap()
        username!: string;

    @AutoMap()
        answered: Answered = Answered.PENDING;
}

// TODO: Move to subEntities dir
export class Creator implements Pick<UserDto, 'username'> {
    username!: string;

    answered: Answered = Answered.YES;
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
        repeated: Repeated = Repeated.NO;
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

export class ReqQueryFilterMeetings {
    answered?: Answered;
    period?: Period;
}

export class StatusUpdateDto implements Required<Pick<Participant, 'answered'>> {
    @IsEnum(Answered, { message: 'New status must be one of the following: yes | no | pending' })
    @IsNotEmpty({ message: 'New status cannot be empty!' })
    @Expose()
        answered!: Answered;
}

export class PathParamMeetingDto {
    @IsNotEmpty({ message: 'Meeting id is required!' })
    @Expose()
        _id!: string;
}
