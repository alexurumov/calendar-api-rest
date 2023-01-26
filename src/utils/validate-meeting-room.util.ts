import { validateTimes } from './luxon.util';
import { type MeetingRoomEntity } from '../entities/meeting-room.entity';
import { type MeetingRoomDto, type MeetingRoomUpdateDto } from '../dtos/meeting-room.dto';
import createHttpError from 'http-errors';

export function validateUpdateMeetingRoom (existing: MeetingRoomEntity | null, dto: MeetingRoomUpdateDto, all: MeetingRoomEntity[]): void {
    // Does meeting exist?
    if (!existing) {
        throw createHttpError.NotFound('No such Meeting room found!');
    }

    // Is name unique?
    if (dto.name) {
    // Exclude current meeting from check
        const filtered = all.filter(m => m.name !== existing.name);
        // Check if there is a meeting with the same name
        if (filtered.some(m => m.name === dto.name)) {
            throw createHttpError.Conflict('Name is already taken!');
        }
    }

    // Is start time before end time?
    if (dto.startAvailableHours) {
        if (!validateTimes(dto.startAvailableHours, existing.endAvailableHours)) {
            throw createHttpError.BadRequest('Start hours must not be after end hours!');
        }
    }

    // Is end date after start date?
    if (dto.endAvailableHours) {
        if (!validateTimes(existing.startAvailableHours, dto.endAvailableHours)) {
            throw createHttpError.BadRequest('End hours must not be before start hours!');
        }
    }
}

export function validateNewMeetingRoom (dto: MeetingRoomDto, all: MeetingRoomEntity[]): void {
    // Is name unique?
    if (dto.name) {
    // Check if there is a meeting with the same name
        if (all.some(m => m.name === dto.name)) {
            throw createHttpError.Conflict('Name is already taken!');
        }
    }
    if (!validateTimes(dto.startAvailableHours, dto.endAvailableHours)) {
        throw createHttpError.BadRequest('Start hours must not be after end hours!');
    }
}
