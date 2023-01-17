import {pojos, PojosMetadataMap} from "@automapper/pojos";
import {Types} from "mongoose";
import {createMap, createMapper, forMember, ignore, typeConverter} from "@automapper/core";
import {UserEntity} from "../entities/user.entity";
import {UserDto} from "../dtos/user.dto";

PojosMetadataMap.create<UserEntity>('UserEntity',
    {
        _id: Types.ObjectId,
        username: String,
        password: String,
        tests: ['Test']
    }
);
PojosMetadataMap.create<UserDto>('UserDto',
    {
        _id: String,
        username: String,
        password: String,
        tests: ['Test']
    }
);
const mapper = createMapper({strategyInitializer: pojos()});

createMap<UserEntity, UserDto>(
    mapper,
    'UserEntity',
    'UserDto',
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((d) => d.password, ignore())
);

createMap<UserDto, UserEntity>(
    mapper,
    'UserDto',
    'UserEntity',
);

export const toUserDto = (e: UserEntity) => mapper.map<UserEntity, UserDto>(e, 'UserEntity', 'UserDto');
export const toUserEntity = (d: UserDto) => mapper.map<UserDto, UserEntity>(d, 'UserDto', 'UserEntity');
