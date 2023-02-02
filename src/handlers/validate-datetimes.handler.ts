import { DateTime, Interval } from 'luxon';
import { type MeetingDto } from '../dtos/meeting.dto';

export function validateTimesHHMM (start: string, end: string): boolean {
    const now = DateTime.now();
    const [sHours, sMinutes] = start.split(':');
    const startTime = now.set({ hour: Number(sHours), minute: Number(sMinutes) });
    const [eHours, eMinutes] = end.split(':');
    const endTime = now.set({ hour: Number(eHours), minute: Number(eMinutes) });
    return startTime < endTime;
}

export function hasConflictInHours (existing: MeetingDto, meeting: MeetingDto): boolean {
    // Extract Hours and Minutes from all 4 dates
    const existingStartTime = DateTime.fromJSDate(new Date(existing.startTime)).toFormat('HH:mm');
    const existingEndTime = DateTime.fromJSDate(new Date(existing.endTime)).toFormat('HH:mm');
    const meetingStartTime = DateTime.fromJSDate(new Date(meeting.startTime)).toFormat('HH:mm');
    const meetingEndTime = DateTime.fromJSDate(new Date(meeting.endTime)).toFormat('HH:mm');

    // Construct dummy start and end date for EXISTING from "now", so we can compare times only!
    const now = DateTime.now();
    const [intervalStartHours, intervalStartMinutes] = existingStartTime.split(':');
    const [intervalEndHours, intervalEndMinutes] = existingEndTime.split(':');
    const intervalStart = now.set({ hour: Number(intervalStartHours), minute: Number(intervalStartMinutes) });
    const intervalEnd = now.set({ hour: Number(intervalEndHours), minute: Number(intervalEndMinutes) });
    const interval = Interval.fromDateTimes(intervalStart, intervalEnd);

    // Construct dummy start and end date for NEW MEETING from "now", so we can compare times only!
    const [meetingStartHours, meetingStartMinutes] = meetingStartTime.split(':');
    const [meetingEndHours, meetingEndMinutes] = meetingEndTime.split(':');
    const meetingStart = now.set({ hour: Number(meetingStartHours), minute: Number(meetingStartMinutes) });
    const meetingEnd = now.set({ hour: Number(meetingEndHours), minute: Number(meetingEndMinutes) });

    return interval.contains(meetingStart) || interval.contains(meetingEnd);
}

export function hasConflictInHoursWeekly (existing: MeetingDto, meeting: MeetingDto): boolean {
    const existingDay = DateTime.fromJSDate(new Date(existing.startTime)).get('weekday');
    const meetingDay = DateTime.fromJSDate(new Date(existing.startTime)).get('weekday');

    if (existingDay === meetingDay) {
        return hasConflictInHours(existing, meeting);
    }

    return false;
}

export function hasConflictInHoursMonthly (existing: MeetingDto, meeting: MeetingDto): boolean {
    const existingDay = DateTime.fromJSDate(new Date(existing.startTime)).get('day');
    const meetingDay = DateTime.fromJSDate(new Date(existing.startTime)).get('day');

    if (existingDay === meetingDay) {
        return hasConflictInHours(existing, meeting);
    }

    return false;
}

export function meetingsInConflict (meeting: MeetingDto, existing: MeetingDto): boolean {
    const existingStart = DateTime.fromJSDate(new Date(existing.startTime));
    const existingEnd = DateTime.fromJSDate(new Date(existing.endTime));
    const existingInterval = Interval.fromDateTimes(existingStart, existingEnd);

    const meetingStart = DateTime.fromJSDate(new Date(meeting.startTime));
    const meetingEnd = DateTime.fromJSDate(new Date(meeting.endTime));

    return existingInterval.contains(meetingStart) || existingInterval.contains(meetingEnd);
}
