import { Types } from 'mongoose'
import { AutoMap } from '@automapper/classes'

export class MeetingEntity {
  @AutoMap()
    _id!: Types.ObjectId

  @AutoMap()
    name!: string

  @AutoMap()
    startTime!: Date

  @AutoMap()
    endTime!: Date

  @AutoMap()
    room!: string
}
