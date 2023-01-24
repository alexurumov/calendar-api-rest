import { createMap, createMapper, typeConverter } from '@automapper/core'
import { classes } from '@automapper/classes'
import { Types } from 'mongoose'
import { MeetingEntity } from '../entities/meeting.entity'
import { MeetingDto } from '../dtos/meeting.dto'

const mapper = createMapper({ strategyInitializer: classes() })

createMap(
  mapper,
  MeetingEntity,
  MeetingDto,
  typeConverter(Types.ObjectId, String, (objectId) => objectId.toString())
)
createMap<MeetingDto, MeetingEntity>(
  mapper,
  MeetingDto,
  MeetingEntity
)

export const toMeetingDto = (e: MeetingEntity): MeetingDto => mapper.map(e, MeetingEntity, MeetingDto)
export const toMeetingEntity = (d: MeetingDto): MeetingEntity => mapper.map(d, MeetingDto, MeetingEntity)
