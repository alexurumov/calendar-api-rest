import { Types } from 'mongoose';
import { createMap, createMapper, forMember, ignore, typeConverter } from '@automapper/core';
import { UserEntity } from '../entities/user.entity';
import { UserLoginDto, UserRegisterDto } from '../dtos/user.dto';
import { classes } from '@automapper/classes';

const mapper = createMapper({ strategyInitializer: classes() });

createMap(
    mapper,
    UserEntity,
    UserLoginDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((d) => d.password, ignore())
);

createMap(
    mapper,
    UserLoginDto,
    UserEntity
);

createMap(
    mapper,
    UserEntity,
    UserRegisterDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((d) => d.password, ignore()),
    forMember((d) => d.confirmPassword, ignore())
);

createMap(
    mapper,
    UserRegisterDto,
    UserEntity
);

export const toUserLoginDto = (e: UserEntity): UserLoginDto => mapper.map(e, UserEntity, UserLoginDto);
export const toUserRegisterDto = (e: UserEntity): UserRegisterDto => mapper.map(e, UserEntity, UserRegisterDto);
export const toUserLoginEntity = (d: UserLoginDto): UserEntity => mapper.map(d, UserLoginDto, UserEntity);
export const toUserRegisterEntity = (d: UserRegisterDto): UserEntity => mapper.map(d, UserRegisterDto, UserEntity);
