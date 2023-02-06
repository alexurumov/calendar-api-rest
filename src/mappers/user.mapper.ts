import { Types } from 'mongoose';
import { createMap, createMapper, forMember, ignore, mapFrom, typeConverter } from '@automapper/core';
import { UserEntity } from '../entities/user.entity';
import { UserDto, UserRegisterDto } from '../dtos/user.dto';
import { classes } from '@automapper/classes';
import { type UserMeeting } from '../sub-entities/sub-entities';

const mapper = createMapper({ strategyInitializer: classes() });

createMap(
    mapper,
    UserEntity,
    UserDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((d) => d.password, ignore()),
    forMember(
        (dto) => dto.meetings,
        mapFrom((enity) => Object.fromEntries(enity.meetings))
    )
);

createMap(
    mapper,
    UserDto,
    UserEntity,
    forMember(
        (entity) => entity.meetings,
        mapFrom((dto) => dto.meetings ? new Map(Object.entries(dto.meetings)) : new Map<string, UserMeeting[]>())
    )
);

createMap(
    mapper,
    UserEntity,
    UserRegisterDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((d) => d.password, ignore()),
    forMember((d) => d.confirmPassword, ignore()),
    forMember(
        (dto) => dto.meetings,
        mapFrom((enity) => Object.fromEntries(enity.meetings))
    )
);

createMap(
    mapper,
    UserRegisterDto,
    UserEntity,
    forMember(
        (entity) => entity.meetings,
        mapFrom((dto) => dto.meetings ? new Map(Object.entries(dto.meetings)) : new Map<string, UserMeeting[]>())
    )
);

export const toUserDto = (e: UserEntity): UserDto => mapper.map(e, UserEntity, UserDto);
export const toUserRegisterDto = (e: UserEntity): UserRegisterDto => mapper.map(e, UserEntity, UserRegisterDto);
export const toUserRegisterEntity = (d: UserRegisterDto): UserEntity => mapper.map(d, UserRegisterDto, UserEntity);
