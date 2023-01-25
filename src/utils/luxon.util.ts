import { DateTime } from 'luxon';

export function validateTimes (start: Date, end: Date): boolean {
    return DateTime.fromJSDate(new Date(start)) < DateTime.fromJSDate(new Date(end));
}
