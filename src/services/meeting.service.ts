import createHttpError from 'http-errors';
import { meetingRepository, type MeetingRepository } from '../repositories/meeting.repository';
import { type MeetingDto, type MeetingUpdateDto } from '../dtos/meeting.dto';
import { toMeetingDto } from '../mappers/meeting.mapper';

export class MeetingService {
    constructor (private readonly meetingRepository: MeetingRepository) {}

    async getAll (): Promise<MeetingDto[]> {
        const meetings = await this.meetingRepository.findAll();
        return meetings.map(toMeetingDto);
    }

    async create (dto: MeetingDto): Promise<MeetingDto> {
        const created = await this.meetingRepository.create(dto);
        return toMeetingDto(created);
    }

    async findById (id: string): Promise<MeetingDto> {
        const found = await this.meetingRepository.findById(id);
        if (!found) {
            throw createHttpError.NotFound('No such Meeting found!');
        }
        return toMeetingDto(found);
    }

    async update (id: string, dto: MeetingUpdateDto): Promise<MeetingDto> {
        const existing = await this.meetingRepository.findById(id);
        if (!existing) {
            throw createHttpError.NotFound('No such Meeting found!');
        }
        const updated = await this.meetingRepository.updateById(id, dto);
        if (!updated) {
            throw createHttpError.BadRequest('Invalid input!');
        }
        return toMeetingDto(updated);
    }

    async delete (id: string): Promise<MeetingDto> {
        const deleted = await this.meetingRepository.delete(id);
        if (!deleted) {
            throw createHttpError.NotFound('No such Meeting!');
        }
        return toMeetingDto(deleted);
    }
}
export const meetingService = new MeetingService(meetingRepository);
