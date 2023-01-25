import { AutoMap } from '@automapper/classes';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserLoginDto {
    @AutoMap()
        _id?: string;

    @IsNotEmpty({ message: 'Username is required!' })
    @Expose()
    @AutoMap()
        username!: string;

    @IsNotEmpty({ message: 'Password is required!' })
    @Expose()
    @AutoMap()
        password!: string;
}

export class UserRegisterDto extends UserLoginDto {
    @IsNotEmpty({ message: 'Confirm Password is required!' })
    @Expose()
    @AutoMap()
        confirmPassword!: string;
}

// export type RegisterUserDto = Required<Pick<UserDto, "username" | "password" | "confirmPassword">>

// export type LoginUserDto = Required<Pick<UserDto, "username" | "password">>
