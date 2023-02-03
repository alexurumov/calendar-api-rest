import { AutoMap } from '@automapper/classes';
import { IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { type UserMeeting } from '../entities/user.entity';

abstract class BaseUserDto {
    @AutoMap()
        _id?: string;

    @IsOptional()
    @MinLength(5, { message: 'Name must be at least 5 characters long!' })
    @MaxLength(20, { message: 'Name must not be more than 20 characters long!' })
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

    @IsPhoneNumber(undefined, { message: 'Valid phone number is required!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        phone?: string;

    @IsOptional()
    @Expose()
    @AutoMap()
        company?: string;

    @Expose()
        meetings: Record<string, UserMeeting[]> = {};
}

export class UserDto extends BaseUserDto {
    @MinLength(4, { message: 'Username must be at least 4 characters long!' })
    @MaxLength(20, { message: 'Username must not be more than 20 characters long!' })
    @IsNotEmpty({ message: 'Username is required!' })
    @Expose()
    @AutoMap()
        username!: string;

    @MinLength(5, { message: 'Password must be at least 5 characters long!' })
    @MaxLength(20, { message: 'Password must not be more than 20 characters long!' })
    @IsNotEmpty({ message: 'Password is required!' })
    @Expose()
    @AutoMap()
        password!: string;
}

export class UserRegisterDto extends UserDto {
    @IsNotEmpty({ message: 'Confirm Password is required!' })
    @Expose()
    @AutoMap()
        confirmPassword!: string;

    @AutoMap()
        meetings: Record<string, UserMeeting[]> = {};
}

export class UserUpdateDto extends BaseUserDto {
    @MinLength(4, { message: 'Username must be at least 4 characters long!' })
    @MaxLength(20, { message: 'Username must not be more than 20 characters long!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        username?: string;

    @MinLength(5, { message: 'Password must be at least 5 characters long!' })
    @MaxLength(20, { message: 'Password must not be more than 20 characters long!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        password?: string;
}

export type ReqQueryUserDto = Partial<UserDto>;

export class PathParamUserDto implements Required<Pick<UserDto, 'username'>> {
    @IsNotEmpty({ message: 'Username is required to access resources!' })
    @Expose()
        username!: string;
}

// TODO: Refactor!
export class PathParamUpdateStatusDto {
    @IsNotEmpty({ message: 'Meeting ID is required for update status' })
    @Expose()
        meetingId!: string;
}
