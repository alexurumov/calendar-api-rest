import { type MeetingRepository, meetingRepository } from '../repositories/meeting.repository'
import { type MeetingEntity } from '../entities/meeting.entity'
import { type MeetingDto, type ReqQueryMeetingDto } from '../dtos/meeting.dto'
import { toMeetingDto } from '../mappers/meeting.mapper'
import { validateNewMeeting, validateUpdateMeeting } from '../utils/validate-meetings.util'
import createHttpError from 'http-errors'

export class MeetingService {
  constructor (private readonly meetingRepository: MeetingRepository) {}

  async getAll (dto: ReqQueryMeetingDto): Promise<MeetingDto[]> {
    const { name, room } = dto
    let meetings: MeetingEntity[]
    if (name !== undefined) {
      meetings = await this.meetingRepository.findAllByName({ name })
    } else if (room !== undefined) {
      meetings = await this.meetingRepository.findAllByRoom({ room })
    } else {
      meetings = await this.meetingRepository.findAll()
    }
    return meetings.map(toMeetingDto)
  }

  async create (dto: MeetingDto): Promise<MeetingDto> {
    // Validate Specific Meeting requirements!
    const all = await this.meetingRepository.findAll()
    validateNewMeeting(dto, all)
    const created = await this.meetingRepository.create(dto)
    return toMeetingDto(created)
  }

  async findById (id: string): Promise<MeetingDto> {
    const meeting = await this.meetingRepository.findById(id)
    if (meeting == null) {
      throw createHttpError.NotFound('No such Meeting found!')
    }
    return toMeetingDto(meeting)
  }

  async update (id: string, dto: Partial<MeetingDto>): Promise<MeetingDto> {
    const [existing, all] = await Promise.all([this.meetingRepository.findById(id), this.meetingRepository.findAll()])

    // Validate specific meeting requirements
    validateUpdateMeeting(existing, dto, all)

    const updated = await this.meetingRepository.updateById(id, dto)
    if (updated == null) {
      throw createHttpError.BadRequest('Invalid input!')
    }
    return toMeetingDto(updated)
  }

  async delete (id: string): Promise<MeetingDto> {
    const deleted = await this.meetingRepository.delete(id)
    if (deleted == null) {
      throw createHttpError.NotFound('No such Meeting!')
    }
    return toMeetingDto(deleted)
  }
}
export const meetingService = new MeetingService(meetingRepository)
