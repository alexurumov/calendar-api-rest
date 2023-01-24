import { AutoMap } from '@automapper/classes'
import { Expose } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'

export class MeetingDto {
  @AutoMap()
    _id?: string

  @IsNotEmpty({ message: 'Meeting name is required!' })
  @Expose()
  @AutoMap()
    name!: string

  @IsNotEmpty({ message: 'Meeting name is required!' })
  @Expose()
  @AutoMap()
    startTime!: Date

  @IsNotEmpty({ message: 'Meeting name is required!' })
  @Expose()
  @AutoMap()
    endTime!: Date

  @IsNotEmpty({ message: 'Meeting room is required!' })
  @Expose()
  @AutoMap()
    room!: string
}

export type ReqQueryMeetingDto = Partial<MeetingDto>

export type PathParamMeetingDto = Required<Pick<MeetingDto, '_id'>>
