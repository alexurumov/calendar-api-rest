import {validateTimes} from "./luxon.util";
import {MeetingEntity} from "../entities/meeting.entity";
import {MeetingDto} from "../dtos/meeting.dto";

export function validateUpdateMeeting(existing: MeetingEntity | null, dto: Partial<MeetingDto>, all: MeetingEntity[]) {
    // Does meeting exist?
    if (!existing) {
        throw new Error('No such meeting!');
    }

    // Is name unique?
    if (dto.name) {
        // Exclude current meeting from check
        const filtered = all.filter(m => m.name !== existing.name);
        // Check if there is a meeting with the same name
        if (filtered.some(m => m.name === existing.name)) {
            throw new Error('Name is already taken!');
        }
    }

    // Is start time before end time?
    if (dto.startTime) {
        if (!validateTimes(dto.startTime, existing.endTime)) {
            throw new Error('Start time must not be after end time!');
        }
    }

    // Is end date after start date?
    if (dto.endTime) {
        if (!validateTimes(existing.startTime, dto.endTime)) {
            throw new Error('End time must not be before start time!');
        }
    }
}

export function validateNewMeeting(dto: MeetingDto, all: MeetingEntity[]) {
    // Is name unique?
    if (dto.name) {
        // Check if there is a meeting with the same name
        if (all.some(m => m.name === dto.name)) {
            throw new Error('Name is already taken!');
        }
    }
    if (!validateTimes(dto.startTime, dto.endTime)) {
        throw new Error('Start time must not be after end time!');
    }
}
