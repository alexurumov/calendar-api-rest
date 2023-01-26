import { type NextFunction, type Request, type Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../utils/validate-request.util';
import createHttpError from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { type MeetingDto, MeetingUpdateDto, type PathParamMeetingDto } from '../dtos/meeting.dto';
import { userService, type UserService } from '../services/user.service';
import { DateTime, Interval } from 'luxon';
import { meetingRoomService, type MeetingRoomService } from '../services/meeting-room.service';

export class MeetingManager {
    constructor (
        private readonly meetingService: MeetingService,
        private readonly userService: UserService,
        private readonly meetingRoomService: MeetingRoomService
    ) {}

    async create (meetingDto: MeetingDto): Promise<MeetingDto> {
        /*
        Validate Creator:
        - Existing?
        - Has conflict meetings in same hour? TODO: add meetings to users!
         */
        // const creator = await this.userService.findByUsername(meetingDto.creator);
        //
        // const meetingStart = DateTime.fromJSDate(new Date(meetingDto.start_time));
        // const meetingEnd = DateTime.fromJSDate(new Date(meetingDto.end_time));
        // const meetingInterval = Interval.fromDateTimes(meetingStart, meetingEnd);

        /*
        Validate Meeting Room:
         */

        // Existing?
        const room = await this.meetingRoomService.findByName(meetingDto.meeting_room);

        // Capacity?
        if (meetingDto.participants?.length && meetingDto.participants.length > room.capacity) {
            throw createHttpError.Conflict('Meeting room capacity exceeded!');
        }

        const start = DateTime.fromJSDate(new Date(meetingDto.start_time));
        const end = DateTime.fromJSDate(new Date(meetingDto.end_time));

        const [sHours, sMinutes] = room.startAvailableHours.split(':');
        const roomStart = start.set({ hour: Number(sHours), minute: Number(sMinutes) });

        const [eHours, eMinutes] = room.endAvailableHours.split(':');
        const roomEnd = end.set({ hour: Number(eHours), minute: Number(eMinutes) });

        const roomInterval = Interval.fromDateTimes(roomStart, roomEnd);

        // Available hours?
        if (!roomInterval.contains(start) || !roomInterval.contains(end)) {
            throw createHttpError.Conflict('Meeting times must be within meeting room available hours!');
        }

        /*
        Validate Meeting:
         */

        // Meeting start should be before meeting end!
        if (start > end) {
            throw createHttpError.Conflict('Start time cannot be after end time!');
        }

        // Meeting should be within the same day!
        if (start.startOf('day') !== end.startOf('day')) {
            throw createHttpError.Conflict('Meeting should be limited within a single day!');
        }

        // TODO: Conflict with other meetings?

        return meetingDto;
    }

    async updateById (req: Request<PathParamMeetingDto, {}, MeetingUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
    // Transform request body to MeetingDto Class
        const meetingDto = plainToClass(MeetingUpdateDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            await validateRequestBody(meetingDto);
            const updatedMeeting = await this.meetingService.update(id, meetingDto);
            return res.status(200).json(updatedMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const meetingManager = new MeetingManager(meetingService, userService, meetingRoomService);
