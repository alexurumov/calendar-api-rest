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

export function meetingsInConflict (meeting: MeetingDto, existing: MeetingDto): boolean {
    const existingStart = DateTime.fromJSDate(new Date(existing.start_time));
    const existingEnd = DateTime.fromJSDate(new Date(existing.end_time));
    const existingInterval = Interval.fromDateTimes(existingStart, existingEnd);

    const meetingStart = DateTime.fromJSDate(new Date(meeting.start_time));
    const meetingEnd = DateTime.fromJSDate(new Date(meeting.end_time));

    return existingInterval.contains(meetingStart) || existingInterval.contains(meetingEnd);
}
