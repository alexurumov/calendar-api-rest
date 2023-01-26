import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { type UserDto } from './user.dto';

export class Participant implements Pick<UserDto, 'username'> {
    @AutoMap()
        username!: string;

    @AutoMap()
        answered: 'yes' | 'no' | 'pending' = 'pending';
}

export class Creator implements Pick<UserDto, 'username'> {
    username!: string;

    answered: 'yes' | 'no' | 'pending' = 'yes';
}

export class MeetingDto {
    @IsOptional()
    @AutoMap()
        _id?: string;

    @IsNotEmpty({ message: 'Meeting creator is required!' })
    @Expose()
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
    @AutoMap()
        participants?: string[];
}

export class MeetingUpdateDto implements Partial<MeetingDto> {
    @IsOptional()
    @Expose()
    @AutoMap()
        creator?: string;

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
