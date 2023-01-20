import {AutoMap} from "@automapper/classes";

export class UserDto{
    @AutoMap()
    _id?: string;
    @AutoMap()
    username!: string;
    @AutoMap()
    password!: string;

    confirmPassword?: string;
}

export type RegisterUserDto = Required<Pick<UserDto, "username" | "password" | "confirmPassword">>

export type LoginUserDto = Required<Pick<UserDto, "username" | "password">>