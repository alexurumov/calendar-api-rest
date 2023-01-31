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
        meeting_room!: string;

    @IsDateString(undefined, { message: 'Meeting start time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsNotEmpty({ message: 'Meeting start time is required!' })
    @Expose()
    @AutoMap()
        start_time!: Date;

    @IsDateString(undefined, { message: 'Meeting end time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsNotEmpty({ message: 'Meeting end time is required!' })
    @Expose()
    @AutoMap()
        end_time!: Date;

    @IsOptional()
    @Expose()
        participants?: string[];

    @IsOptional()
    @IsEnum(Repeated, { message: 'Repeated must be one of the following: daily, weekly, monthly' })
    @Expose()
    @AutoMap()
        repeated: Repeated = Repeated.No;
}

export class MeetingUpdateDto implements Partial<MeetingDto> {
    @IsOptional()
    @Expose()
    @AutoMap()
        meeting_room?: string;

    @IsDateString(undefined, { message: 'Meeting start time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        start_time?: Date;

    @IsDateString(undefined, { message: 'Meeting end time must of format: YYYY-MM-DDTHH:MM:SS+TIMZ!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        end_time?: Date;
}

export type ReqQueryMeetingDto = Partial<MeetingDto>;

export type PathParamMeetingDto = Required<Pick<MeetingDto, '_id'>>;
