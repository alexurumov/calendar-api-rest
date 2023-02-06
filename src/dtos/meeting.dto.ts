import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Answered, type Period, Repeated } from '../types/enums';
import { Participant } from '../sub-entities/Participant.sub-entity';
import { Creator } from '../sub-entities/Creator.sub-entity';

abstract class BaseMeetingDto {
    @IsOptional()
    @AutoMap()
        _id?: string;

    @IsString({ message: 'Meeting room must be of type string!' })
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
    @IsEnum(Repeated, { message: 'Repeated must be one of the following: daily, weekly, monthly, (default: no)' })
    @Expose()
    @AutoMap()
        repeated: Repeated = Repeated.NO;
}

export class MeetingCreateDto extends BaseMeetingDto {
    creator!: string;

    @IsArray({ message: 'Participants must be of type Array!' })
    @IsOptional()
    @Expose()
        participants?: string[];
}

export class MeetingDto extends BaseMeetingDto {
    @IsOptional()
    @AutoMap()
        _id!: string;

    @AutoMap(() => Creator)
        creator!: Creator;

    @AutoMap()
        meetingRoom!: string;

    @AutoMap()
        startTime!: Date;

    @AutoMap()
        endTime!: Date;

    @AutoMap(() => [Participant])
        participants!: Participant[];

    @AutoMap()
        repeated!: Repeated;
}

export class MeetingUpdateDto implements Partial<MeetingCreateDto> {
    @IsOptional()
    @AutoMap()
        _id?: string;

    creator?: string;

    @IsString({ message: 'Meeting room must be of type string!' })
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

    @IsArray({ message: 'Participants must be of type Array!' })
    @IsOptional()
    @Expose()
        participants?: string[];

    @IsOptional()
    @IsEnum(Repeated, { message: 'Repeated must be one of the following: daily, weekly, monthly, (default: no)' })
    @Expose()
    @AutoMap()
        repeated?: Repeated;
}

export class ReqQueryFilterMeetings implements Partial<StatusUpdateDto> {
    @IsString({ message: 'Answered filter must be of type string!' })
    @IsOptional()
        answered?: Answered;

    @IsString({ message: 'Period filter must be of type string!' })
    @IsOptional()
        period?: Period;
}

export class StatusUpdateDto implements Required<Pick<Participant, 'answered'>> {
    @IsEnum(Answered, { message: 'New status must be one of the following: yes | no | pending' })
    @IsNotEmpty({ message: 'New status cannot be empty!' })
    @Expose()
        answered!: Answered;
}

export class PathParamMeetingDto {
    @IsString({ message: 'Meeting id must be of type string!' })
    @IsNotEmpty({ message: 'Meeting id is required!' })
    @Expose()
        id!: string;
}
