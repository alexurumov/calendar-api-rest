import createHttpError from 'http-errors';
import { meetingRepository, type MeetingRepository } from '../repositories/meeting.repository';
import { type MeetingCreateDto, type MeetingDto, MeetingUpdateDto } from '../dtos/meeting.dto';
import { fromCreateToMeetingDto, fromUpdateToMeetingDto, toMeetingDto } from '../mappers/meeting.mapper';

export class MeetingService {
    constructor (private readonly meetingRepository: MeetingRepository) {}

    async getAll (): Promise<MeetingDto[]> {
        const meetings = await this.meetingRepository.findAll();
        return meetings.map(toMeetingDto);
    }

    async create (dto: MeetingCreateDto): Promise<MeetingDto> {
        const newDto = fromCreateToMeetingDto(dto);
        const created = await this.meetingRepository.create(newDto);
        return toMeetingDto(created);
    }

    async findById (id: string): Promise<MeetingDto> {
        const found = await this.meetingRepository.findById(id);
        if (!found) {
            throw createHttpError.NotFound('No such Meeting found!');
        }
        return toMeetingDto(found);
    }

    async update (id: string, dto: MeetingDto | MeetingUpdateDto): Promise<MeetingDto> {
        const existing = await this.meetingRepository.findById(id);
        if (!existing) {
            throw createHttpError.NotFound('No such Meeting found!');
        }
        // If dto is updateDto, convert to meetingDto and them pass to Repository
        if (dto instanceof MeetingUpdateDto) {
            dto = fromUpdateToMeetingDto(dto);
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
