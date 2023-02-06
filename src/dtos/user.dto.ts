import { AutoMap } from '@automapper/classes';
import {
    IsInt,
    IsNotEmpty, IsObject,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength
} from 'class-validator';
import { Expose } from 'class-transformer';
import { type UserMeeting } from '../sub-entities/user-meeting.sub-entity';

abstract class BaseUserDto {
    @IsOptional()
    @AutoMap()
        _id?: string;

    @MinLength(5, { message: 'Name must be at least 5 characters long!' })
    @MaxLength(20, { message: 'Name must not be more than 20 characters long!' })
    @IsString({ message: 'User name must be of type string!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        name?: string;

    @IsInt({ message: 'Age must be an integer number!' })
    @Min(18, { message: 'Age must be at least 18!' })
    @Max(120, { message: 'Age must not be more than 120!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        age?: number;

    @IsString({ message: 'User phone must be of type string!' })
    @IsPhoneNumber(undefined, { message: 'Valid phone number is required!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        phone?: string;

    @IsString({ message: 'User company must be of type string!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        company?: string;

    @IsObject({ message: 'User meetings must be of type object!' })
    @IsOptional()
    @Expose()
        meetings: Record<string, UserMeeting[]> = {};
}

export class UserDto extends BaseUserDto {
    @MinLength(4, { message: 'Username must be at least 4 characters long!' })
    @MaxLength(20, { message: 'Username must not be more than 20 characters long!' })
    @IsString({ message: 'User username must be of type string!' })
    @IsNotEmpty({ message: 'Username is required!' })
    @Expose()
    @AutoMap()
        username!: string;

    @MinLength(5, { message: 'Password must be at least 5 characters long!' })
    @MaxLength(20, { message: 'Password must not be more than 20 characters long!' })
    @IsNotEmpty({ message: 'Password is required!' })
    @IsString({ message: 'User password must be of type string!' })
    @Expose()
    @AutoMap()
        password!: string;
}

export class UserRegisterDto extends UserDto {
    @IsString({ message: 'User confirm password must be of type string!' })
    @IsNotEmpty({ message: 'Confirm Password is required!' })
    @Expose()
    @AutoMap()
        confirmPassword!: string;

    @IsObject({ message: 'User meetings must be of type object!' })
    @IsOptional()
    @AutoMap()
        meetings: Record<string, UserMeeting[]> = {};
}

export class UserUpdateDto extends BaseUserDto {
    @MinLength(4, { message: 'Username must be at least 4 characters long!' })
    @MaxLength(20, { message: 'Username must not be more than 20 characters long!' })
    @IsString({ message: 'User username must be of type string!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        username?: string;

    @MinLength(5, { message: 'Password must be at least 5 characters long!' })
    @MaxLength(20, { message: 'Password must not be more than 20 characters long!' })
    @IsString({ message: 'User password must be of type string!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        password?: string;
}

export class PathParamUserDto implements Required<Pick<UserDto, 'username'>> {
    @IsString({ message: 'User username must be of type string!' })
    @IsNotEmpty({ message: 'Username is required to access resources!' })
    @Expose()
        username!: string;
}

export class PathParamUserMeetingDto extends PathParamUserDto {
    @IsString({ message: 'Meeting ID must be of type string!' })
    @IsNotEmpty({ message: 'Meeting ID is required for update status' })
    @Expose()
        meetingId!: string;
}
