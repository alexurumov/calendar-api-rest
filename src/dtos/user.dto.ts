import {TestDto} from "./base-test.dto";

export interface UserDto{
    _id?: string,
    username: string,
    password: string,
    tests?: TestDto[]
}

export interface PathParamUserDto {
    id: string;
}

export interface ReqQueryUserDto extends Partial<UserDto>{}