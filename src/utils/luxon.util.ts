import { DateTime } from 'luxon';

export function validateTimes (start: string, end: string): boolean {
    const now = DateTime.now();
    const [sHours, sMinutes] = start.split(':');
    const startTime = now.set({ hour: Number(sHours), minute: Number(sMinutes) });
    const [eHours, eMinutes] = end.split(':');
    const endTime = now.set({ hour: Number(eHours), minute: Number(eMinutes) });
    return startTime < endTime;
}
