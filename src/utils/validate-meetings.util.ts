import { validateTimes } from './luxon.util'
import { type MeetingEntity } from '../entities/meeting.entity'
import { type MeetingDto } from '../dtos/meeting.dto'
import createHttpError from 'http-errors'

export function validateUpdateMeeting (existing: MeetingEntity | null, dto: Partial<MeetingDto>, all: MeetingEntity[]): void {
  // Does meeting exist?
  if (!existing) {
    throw createHttpError.NotFound('No such Meeting found!')
  }

  // Is name unique?
  if (dto.name) {
    // Exclude current meeting from check
    const filtered = all.filter(m => m.name !== existing.name)
    // Check if there is a meeting with the same name
    if (filtered.some(m => m.name === existing.name)) {
      throw createHttpError.Conflict('Name is already taken!')
    }
  }

  // Is start time before end time?
  if (dto.startTime) {
    if (!validateTimes(dto.startTime, existing.endTime)) {
      throw createHttpError.BadRequest('Start time must not be after end time!')
    }
  }

  // Is end date after start date?
  if (dto.endTime) {
    if (!validateTimes(existing.startTime, dto.endTime)) {
      throw createHttpError.BadRequest('End time must not be before start time!')
    }
  }
}

export function validateNewMeeting (dto: MeetingDto, all: MeetingEntity[]): void {
  // Is name unique?
  if (dto.name) {
    // Check if there is a meeting with the same name
    if (all.some(m => m.name === dto.name)) {
      throw createHttpError.Conflict('Name is already taken!')
    }
  }
  if (!validateTimes(dto.startTime, dto.endTime)) {
    throw createHttpError.BadRequest('Start time must not be after end time!')
  }
}
