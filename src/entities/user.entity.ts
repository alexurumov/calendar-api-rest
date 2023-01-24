import { Types } from 'mongoose'
import { AutoMap } from '@automapper/classes'

export class UserEntity {
  @AutoMap()
    _id!: Types.ObjectId

  @AutoMap()
    username!: string

  @AutoMap()
    password!: string
}
