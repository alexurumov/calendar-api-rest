import { Types } from 'mongoose'
import { createMap, createMapper, forMember, ignore, typeConverter } from '@automapper/core'
import { UserEntity } from '../entities/user.entity'
import { UserDto } from '../dtos/user.dto'
import { classes } from '@automapper/classes'

const mapper = createMapper({ strategyInitializer: classes() })

createMap(
  mapper,
  UserEntity,
  UserDto,
  typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
  forMember((d) => d.password, ignore())
)

createMap<UserDto, UserEntity>(
  mapper,
  UserDto,
  UserEntity
)

export const toUserDto = (e: UserEntity): UserDto => mapper.map(e, UserEntity, UserDto)
export const toUserEntity = (d: UserDto): UserEntity => mapper.map(d, UserDto, UserEntity)
