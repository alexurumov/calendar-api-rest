import { type MeetingRoomRepository, meetingRoomRepository } from '../repositories/meeting-room.repository';
import { type MeetingRoomDto, type MeetingRoomUpdateDto } from '../dtos/meeting-room.dto';
import { toMeetingRoomDto } from '../mappers/meeting-room.mapper';
import { validateNewMeetingRoom, validateUpdateMeetingRoom } from '../handlers/validate-meeting-room.handler';
import createHttpError from 'http-errors';

export class MeetingRoomService {
    constructor (private readonly meetingRoomRepository: MeetingRoomRepository) {}

    async getAll (): Promise<MeetingRoomDto[]> {
        const meetings = await this.meetingRoomRepository.findAll();
        return meetings.map(toMeetingRoomDto);
    }

    async create (dto: MeetingRoomDto): Promise<MeetingRoomDto> {
        // Validate Specific Meeting Room requirements!
        const all = await this.meetingRoomRepository.findAll();
        validateNewMeetingRoom(dto, all);
        const created = await this.meetingRoomRepository.create(dto);
        return toMeetingRoomDto(created);
    }

    async findById (id: string): Promise<MeetingRoomDto> {
        const meeting = await this.meetingRoomRepository.findById(id);
        if (meeting == null) {
            throw createHttpError.NotFound('No such Meeting room found!');
        }
        return toMeetingRoomDto(meeting);
    }

    async update (id: string, dto: MeetingRoomUpdateDto): Promise<MeetingRoomDto> {
        const [existing, all] = await Promise.all([this.meetingRoomRepository.findById(id), this.meetingRoomRepository.findAll()]);

        // Validate specific Meeting Room requirements
        validateUpdateMeetingRoom(existing, dto, all);

        const updated = await this.meetingRoomRepository.updateById(id, dto);
        if (updated == null) {
            throw createHttpError.BadRequest('Invalid input!');
        }
        return toMeetingRoomDto(updated);
    }

    async delete (id: string): Promise<MeetingRoomDto> {
        const deleted = await this.meetingRoomRepository.delete(id);
        if (deleted == null) {
            throw createHttpError.NotFound('No such Meeting room found!');
        }
        return toMeetingRoomDto(deleted);
    }

    async findByName (name: string): Promise<MeetingRoomDto> {
        const meeting = await this.meetingRoomRepository.findByName(name);
        if (!meeting) {
            throw createHttpError.NotFound('No such Meeting room found!');
        }
        return toMeetingRoomDto(meeting);
    }
}
export const meetingRoomService = new MeetingRoomService(meetingRoomRepository);
