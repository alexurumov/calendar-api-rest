import createHttpError, { HttpError } from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { type MeetingDto } from '../dtos/meeting.dto';
import { userService, type UserService } from '../services/user.service';
import { DateTime, Interval } from 'luxon';
import { meetingRoomService, type MeetingRoomService } from '../services/meeting-room.service';
import { UserMeeting } from '../entities/user.entity';
import { Answered, Repeated } from '../entities/meeting.entity';
import {
    hasConflictInHours, hasConflictInHoursMonthly,
    hasConflictInHoursWeekly,
    meetingsInConflict
} from '../handlers/validate-datetimes.handler';

export class MeetingManager {
    constructor (
        private readonly meetingService: MeetingService,
        private readonly userService: UserService,
        private readonly meetingRoomService: MeetingRoomService
    ) {}

    async create (meetingDto: MeetingDto): Promise<MeetingDto> {
        // TODO: Extract all validations to handler func!

        /*
        Validate Creator:
        - Existing?
        - Has conflict meetings in same hour?
         */
        // Existing?
        const creator = await this.userService.findById(meetingDto.creator);
        meetingDto.creator = creator.username;

        /*
        Validate Meeting Room:
         */

        // Existing?
        const room = await this.meetingRoomService.findByName(meetingDto.meeting_room);

        // Capacity?
        if (meetingDto.participants?.length && meetingDto.participants.length > room.capacity - 1) {
            throw createHttpError.Conflict('Meeting room capacity exceeded!');
        }

        const meetingStart = DateTime.fromJSDate(new Date(meetingDto.start_time));
        const meetingEnd = DateTime.fromJSDate(new Date(meetingDto.end_time));

        const [sHours, sMinutes] = room.startAvailableHours.split(':');
        const roomStart = meetingStart.set({ hour: Number(sHours), minute: Number(sMinutes) });

        const [eHours, eMinutes] = room.endAvailableHours.split(':');
        const roomEnd = meetingEnd.set({ hour: Number(eHours), minute: Number(eMinutes) });

        const roomInterval = Interval.fromDateTimes(roomStart, roomEnd);

        // Is meetingStart within available hours' interval?
        if (!roomInterval.contains(meetingStart) || !roomInterval.contains(meetingEnd)) {
            throw createHttpError.Conflict('Meeting times must be within meeting room available hours!');
        }

        /*
        Validate Meeting:
         */

        // Meeting start should be before meeting end!
        if (meetingStart > meetingEnd) {
            throw createHttpError.Conflict('Start time cannot be after end time!');
        }

        // Meeting should be within the same day!
        if (meetingStart.startOf('day').toMillis() !== meetingEnd.startOf('day').toMillis()) {
            throw createHttpError.Conflict('Meeting should be limited within a single day!');
        }

        // Participants Validation:
        if (meetingDto.participants && meetingDto.participants.length > 0) {
            try {
                for (const participant of meetingDto.participants) {
                    await this.userService.findByUsername(participant);
                }
                // Participants duplication?
                if (new Set(meetingDto.participants).size !== meetingDto.participants.length) {
                    throw createHttpError.Conflict('Cannot add same user more than once!');
                }

                // Participant not creator?
                if (meetingDto.participants.some((par) => par === creator.username)) {
                    throw createHttpError.Conflict('Cannot add creator as participant!');
                }
            } catch (err: unknown) {
                if (err instanceof HttpError) {
                    if (err.statusCode === 409) {
                        throw err;
                    }
                    throw createHttpError.BadRequest('Only registered users can be added as participants!');
                }
            }
        }

        // Check for conflict meetings in Creator!
        for (const meetingKey in creator.meetings) {
            // Check for conflict with daily meetings
            if (meetingKey === Repeated.Daily) {
                const userMeetings = creator.meetings[Repeated.Daily];
                for (const userMeeting of userMeetings) {
                    const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                    // Check if there is a conflict with the hours of each daily, regardless of date!
                    if (hasConflictInHours(meeting, meetingDto)) {
                        throw createHttpError.Conflict('Meeting must not be in conflict with creator existing daily meetings!');
                    }
                }
            }

            // Check for conflict with weekly meetings
            if (meetingKey === Repeated.Weekly) {
                const userMeetings = creator.meetings[Repeated.Weekly];
                for (const userMeeting of userMeetings) {
                    const meeting = await this.meetingService.findById(userMeeting.meeting_id);

                    // Check if there is a conflict with the meetings only from the current day of each week!
                    if (hasConflictInHoursWeekly(meeting, meetingDto)) {
                        throw createHttpError.Conflict('Meeting must not be in conflict with creator existing weekly meetings!');
                    }
                }
            }

            // Check for conflict with monthly meetings
            if (meetingKey === Repeated.Monthly) {
                const userMeetings = creator.meetings[Repeated.Monthly];
                for (const userMeeting of userMeetings) {
                    const meeting = await this.meetingService.findById(userMeeting.meeting_id);

                    // Check if there is a conflict with all monthly meetings for the current day!
                    if (hasConflictInHoursMonthly(meeting, meetingDto)) {
                        throw createHttpError.Conflict('Meeting must not be in conflict with creator existing monthly meetings!');
                    }
                }
            }

            // Check for conflict with not-repeating meetings
            const date = DateTime.fromFormat(meetingKey, 'MM-dd-yyyy');
            if (date.startOf('day').toMillis() === meetingStart.startOf('day').toMillis()) {
                const userMeetings = creator.meetings[meetingKey];
                for (const userMeeting of userMeetings) {
                    const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                    if (meetingsInConflict(meetingDto, meeting)) {
                        throw createHttpError.Conflict('Meeting must not be in conflict with creator existing meetings for the day!');
                    }
                }
            }
        }

        // Create the meeting!
        const createdMeeting = await this.meetingService.create(meetingDto);

        // Add meeting to creator
        const newUserMeeting = new UserMeeting();
        // Only to satisfy null-check!
        if (createdMeeting._id) {
            newUserMeeting.meeting_id = createdMeeting._id;
        }
        newUserMeeting.answered = Answered.Yes;
        const meetingKey = meetingDto.repeated ? meetingDto.repeated : DateTime.fromJSDate(new Date(createdMeeting.start_time)).toFormat('dd-MM-yyyy');

        // Only to satisfy null-check!
        if (creator._id) {
            // Check if meetingKey already exists! If yes, push to array; If not => create new key
            if (!Object.keys(creator.meetings as Object).includes(meetingKey)) {
                creator.meetings[meetingKey] = new Array<UserMeeting>();
            }
            creator.meetings[meetingKey].push(newUserMeeting);
            await this.userService.update(creator._id, creator);
        }

        // Add meeting to participants
        // Reuse already created User Meeting
        newUserMeeting.answered = Answered.Pending;
        if (meetingDto.participants) {
            for (const participantUsername of meetingDto.participants) {
                const participant = await this.userService.findByUsername(participantUsername);
                if (!Object.keys(participant.meetings as Object).includes(meetingKey)) {
                    participant.meetings[meetingKey] = new Array<UserMeeting>();
                }
                participant.meetings[meetingKey].push(newUserMeeting);
                if (participant._id) {
                    await this.userService.update(participant._id, participant);
                }
            }
        }

        return createdMeeting;
    }

    // TODO: update + delete
    // async updateById (req: Request<PathParamMeetingDto, {}, MeetingUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
    // // Transform request body to MeetingDto Class
    //     const meetingDto = plainToClass(MeetingUpdateDto, req.body, { excludeExtraneousValues: true });
    //
    //     try {
    //         // Validate request params ID
    //         const id: string = req.params._id.trim();
    //         if (!id) {
    //             throw createHttpError.BadRequest('Meeting ID missing!');
    //         }
    //         await validateRequestBody(meetingDto);
    //         const updatedMeeting = await this.meetingService.update(id, meetingDto);
    //         return res.status(200).json(updatedMeeting);
    //     } catch (err: unknown) {
    //         next(err);
    //     }
    // }
}

export const meetingManager = new MeetingManager(meetingService, userService, meetingRoomService);
