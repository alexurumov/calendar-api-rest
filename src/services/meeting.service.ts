import {MeetingRepository, meetingRepository} from "../repositories/meeting.repository";
import {MeetingEntity} from "../entities/meeting.entity";
import {MeetingDto, ReqQueryMeetingDto} from "../dtos/meeting.dto";
import {toMeetingDto} from "../mappers/meeting.mapper";

export class MeetingService {
    constructor(private meetingRepository: MeetingRepository) {
    }

    async getAll(dto: ReqQueryMeetingDto): Promise<MeetingDto[]> {
        const {name, room} = dto;
        let meetings: MeetingEntity[];
        if (name) {
            meetings = await this.meetingRepository.findAllByName({name});
        } else if (room) {
            meetings = await this.meetingRepository.findAllByRoom({room});
        } else {
            meetings = await this.meetingRepository.findAll();
        }
        return meetings.map(toMeetingDto);
    }

    async create(dto: MeetingDto): Promise<MeetingDto> {
        const {name, startTime, endTime, room} = dto;
        if (!name || !startTime || !endTime || !room || !name.trim()  || !room.trim()) {
            throw new Error('Invalid meeting input!');
        }
        const created = await this.meetingRepository.create(dto);
        return toMeetingDto(created);
    }

    async findById(id: string): Promise<MeetingDto | null> {
        const meeting = await this.meetingRepository.findById(id);
        if (!meeting) {
            return null
        }
        return toMeetingDto(meeting);
    }

    async update(id: string, dto: Partial<MeetingDto>): Promise<MeetingDto | null> {
        const updated = await this.meetingRepository.updateById(id, dto);
        if (!updated) {
            return null;
        }
        return toMeetingDto(updated);
    }

    async delete(id: string): Promise<MeetingDto | null> {
        const deleted = await this.meetingRepository.delete(id);
        if (!deleted) {
            return null;
        }
        return toMeetingDto(deleted);
    }
}

export const meetingService = new MeetingService(meetingRepository);