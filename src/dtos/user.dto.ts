import { AutoMap } from '@automapper/classes';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserDto {
    @AutoMap()
        _id?: string;

    @AutoMap()
        username!: string;

    @AutoMap()
        password!: string;

    confirmPassword?: string;
}

export class UserRegisterDto {
    @IsNotEmpty({ message: 'Username is required!' })
    @Expose()
    @AutoMap()
        username!: string;

    @IsNotEmpty({ message: 'Password is required!' })
    @Expose()
    @AutoMap()
        password!: string;

    @IsNotEmpty({ message: 'Confirm Password is required!' })
    @Expose()
    @AutoMap()
        confirmPassword!: string;
}

export class UserLoginDto {
    @IsNotEmpty({ message: 'Username is required!' })
    @Expose()
    @AutoMap()
        username!: string;

    @IsNotEmpty({ message: 'Password is required!' })
    @Expose()
    @AutoMap()
        password!: string;
}

// export type RegisterUserDto = Required<Pick<UserDto, "username" | "password" | "confirmPassword">>

// export type LoginUserDto = Required<Pick<UserDto, "username" | "password">>
