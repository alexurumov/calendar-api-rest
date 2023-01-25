import { Types } from 'mongoose';
import { createMap, createMapper, forMember, ignore, typeConverter } from '@automapper/core';
import { UserEntity } from '../entities/user.entity';
import { UserDto, UserRegisterDto } from '../dtos/user.dto';
import { classes } from '@automapper/classes';

const mapper = createMapper({ strategyInitializer: classes() });

createMap(
    mapper,
    UserEntity,
    UserDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((d) => d.password, ignore())
);

createMap(
    mapper,
    UserDto,
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

export const toUserDto = (e: UserEntity): UserDto => mapper.map(e, UserEntity, UserDto);
export const toUserRegisterEntity = (d: UserRegisterDto): UserEntity => mapper.map(d, UserRegisterDto, UserEntity);
