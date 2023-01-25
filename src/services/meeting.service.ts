import { type MeetingRoomRepository, meetingRepository } from '../repositories/meeting-room.repository';
import { type MeetingRoomEntity } from '../entities/meeting-room.entity';
import { type MeetingRoomDto, type ReqQueryMeetingDto } from '../dtos/meeting-room.dto';
import { toMeetingRoomDto } from '../mappers/meeting-room.mapper';
import { validateNewMeeting, validateUpdateMeeting } from '../utils/validate-meetings.util';
import createHttpError from 'http-errors';

export class MeetingService {
    constructor (private readonly meetingRepository: MeetingRoomRepository) {}

    async getAll (dto: ReqQueryMeetingDto): Promise<MeetingRoomDto[]> {
        const { name } = dto;
        let meetings: MeetingRoomEntity[];
        if (name !== undefined) {
            meetings = await this.meetingRepository.findAllByName({ name });
        } else {
            meetings = await this.meetingRepository.findAll();
        }
        return meetings.map(toMeetingRoomDto);
    }

    async create (dto: MeetingRoomDto): Promise<MeetingRoomDto> {
    // Validate Specific Meeting requirements!
        const all = await this.meetingRepository.findAll();
        validateNewMeeting(dto, all);
        const created = await this.meetingRepository.create(dto);
        return toMeetingRoomDto(created);
    }

    async findById (id: string): Promise<MeetingRoomDto> {
        const meeting = await this.meetingRepository.findById(id);
        if (meeting == null) {
            throw createHttpError.NotFound('No such Meeting found!');
        }
        return toMeetingRoomDto(meeting);
    }

    async update (id: string, dto: Partial<MeetingRoomDto>): Promise<MeetingRoomDto> {
        const [existing, all] = await Promise.all([this.meetingRepository.findById(id), this.meetingRepository.findAll()]);

        // Validate specific meeting requirements
        validateUpdateMeeting(existing, dto, all);

        const updated = await this.meetingRepository.updateById(id, dto);
        if (updated == null) {
            throw createHttpError.BadRequest('Invalid input!');
        }
        return toMeetingRoomDto(updated);
    }

    async delete (id: string): Promise<MeetingRoomDto> {
        const deleted = await this.meetingRepository.delete(id);
        if (deleted == null) {
            throw createHttpError.NotFound('No such Meeting!');
        }
        return toMeetingRoomDto(deleted);
    }
}
export const meetingService = new MeetingService(meetingRepository);
