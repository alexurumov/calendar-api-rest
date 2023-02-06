import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import { IsInt, IsMilitaryTime, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class MeetingRoomDto {
    @AutoMap()
        _id?: string;

    @IsNotEmpty({ message: 'Meeting room name is required!' })
    @Expose()
    @AutoMap()
        name!: string;

    @IsMilitaryTime({ message: 'Meeting room start available hours must be in format: HH:MM' })
    @IsNotEmpty({ message: 'Meeting room start available hours is required!' })
    @Expose()
    @AutoMap()
        startAvailableHours!: string;

    @IsMilitaryTime({ message: 'Meeting room end available hours must be in format: HH:MM' })
    @IsNotEmpty({ message: 'Meeting room end available hours is required!' })
    @Expose()
    @AutoMap()
        endAvailableHours!: string;

    @IsInt({ message: 'Meeting room capacity must be an integer number!' })
    @Min(1, { message: 'Meeting room capacity must be at least 1!' })
    @IsNotEmpty({ message: 'Meeting room capacity is required!' })
    @Expose()
    @AutoMap()
        capacity!: number;
}

export class MeetingRoomUpdateDto implements Partial<MeetingRoomDto> {
    @AutoMap()
        _id?: string;

    @IsOptional()
    @Expose()
    @AutoMap()
        name?: string;

    @IsMilitaryTime({ message: 'Meeting room start available hours must be in format: HH:MM' })
    @IsOptional()
    @Expose()
    @AutoMap()
        startAvailableHours?: string;

    @IsMilitaryTime({ message: 'Meeting room end available hours must be in format: HH:MM' })
    @IsOptional()
    @Expose()
    @AutoMap()
        endAvailableHours?: string;

    @IsInt({ message: 'Meeting room capacity must be an integer number!' })
    @Min(1, { message: 'Meeting room capacity must be at least 1!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        capacity?: number;
}

export type PathParamMeetingRoomDto = Required<Pick<MeetingRoomDto, '_id'>>;
