import { AutoMap } from '@automapper/classes';
import {
    IsAlpha, IsAlphanumeric,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    MaxLength,
    Min,
    MinLength
} from 'class-validator';
import { Expose } from 'class-transformer';

export class UserDto {
    @AutoMap()
        _id?: string;

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

    @IsOptional()
    @IsAlpha(undefined, { message: 'Name must consist only English letters!' })
    @MinLength(5, { message: 'Name must be at least 5 characters long!' })
    @MaxLength(20, { message: 'Name must not be more than 20 characters long!' })
    @Expose()
    @AutoMap()
        name?: string;

    @IsInt({ message: 'Age must be an integer number!' })
    @Min(18, { message: 'Age must be at least 18!' })
    @Min(120, { message: 'Age must not be more than 120!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        age?: number;

    @IsPhoneNumber(undefined, { message: 'Valid phone number is required!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        phone?: string;

    @IsAlphanumeric(undefined, { message: 'Company must consist only Alphanumeric characters!' })
    @IsOptional()
    @Expose()
    @AutoMap()
        company?: string;
}

export class UserRegisterDto extends UserDto {
    @IsNotEmpty({ message: 'Confirm Password is required!' })
    @Expose()
    @AutoMap()
        confirmPassword!: string;
}

// export type RegisterUserDto = Required<Pick<UserDto, "username" | "password" | "confirmPassword">>

// export type LoginUserDto = Required<Pick<UserDto, "username" | "password">>

export type ReqQueryUserDto = Partial<UserDto>;

export type PathParamUserDto = Required<Pick<UserDto, '_id'>>;
