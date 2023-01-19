export interface UserDto{
    _id?: string,
    username: string,
    password: string,
}

export interface PathParamUserDto {
    id: string;
}

export interface ReqQueryUserDto extends Partial<UserDto>{}