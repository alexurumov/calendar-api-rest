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
import { type MeetingRoomDto } from '../dtos/meeting-room.dto';
import { type UserDto } from '../dtos/user.dto';

function validateRoomCapacity (meetingDto: MeetingDto, room: MeetingRoomDto): void {
    if (meetingDto.participants?.length && meetingDto.participants.length > room.capacity - 1) {
        throw createHttpError.Conflict('Meeting room capacity exceeded!');
    }
}

function constructRoomInterval (room: MeetingRoomDto, meetingStart: DateTime, meetingEnd: DateTime): Interval {
    const [sHours, sMinutes] = room.startAvailableHours.split(':');
    const roomStart = meetingStart.set({
        hour: Number(sHours),
        minute: Number(sMinutes)
    });

    const [eHours, eMinutes] = room.endAvailableHours.split(':');
    const roomEnd = meetingEnd.set({
        hour: Number(eHours),
        minute: Number(eMinutes)
    });

    const roomInterval = Interval.fromDateTimes(roomStart, roomEnd);
    return roomInterval;
}

function validateTimesInInterval (roomInterval: Interval, meetingStart: DateTime, meetingEnd: DateTime): void {
    if (!roomInterval.contains(meetingStart) || !roomInterval.contains(meetingEnd)) {
        throw createHttpError.Conflict('Meeting times must be within meeting room available hours!');
    }
}

function validateStartAndEndTime (meetingStart: DateTime, meetingEnd: DateTime): void {
    if (meetingStart > meetingEnd) {
        throw createHttpError.Conflict('Start time cannot be after end time!');
    }
}

function validateWithinSameDay (meetingStart: DateTime, meetingEnd: DateTime): void {
    if (meetingStart.startOf('day').toMillis() !== meetingEnd.startOf('day').toMillis()) {
        throw createHttpError.Conflict('Meeting should be limited within a single day!');
    }
}

export class MeetingManager {
    constructor (
        private readonly meetingService: MeetingService,
        private readonly userService: UserService,
        private readonly meetingRoomService: MeetingRoomService
    ) {}

    async create (meetingDto: MeetingDto): Promise<MeetingDto> {
        // Is Creator existing? If yes => store in variable and use below; If no => userService method will throw error, which will be handled by Controller
        const creator = await this.userService.findById(meetingDto.creator);

        // Is Meeting Room existing? If yes => store in variable and use below; If no => meetingRoomService method will throw error, which will be handled by Controller
        const room = await this.meetingRoomService.findByName(meetingDto.meeting_room);

        // Check if new meeting participants + creator does not exceed Meeting Room's capacity?
        validateRoomCapacity(meetingDto, room);

        // Transform new meeting start and end times to Luxon object DateTime and use variables below
        const meetingStart = DateTime.fromJSDate(new Date(meetingDto.start_time));
        const meetingEnd = DateTime.fromJSDate(new Date(meetingDto.end_time));

        // Make interval from room available hours in format HH:mm
        const roomInterval = constructRoomInterval(room, meetingStart, meetingEnd);

        // Is Meeting within room interval span?
        validateTimesInInterval(roomInterval, meetingStart, meetingEnd);

        // Meeting start should be before meeting end!
        validateStartAndEndTime(meetingStart, meetingEnd);

        // Meeting should be within the same day!
        validateWithinSameDay(meetingStart, meetingEnd);

        // Participants Validation:
        await this.validateParticipants(meetingDto, creator);

        // Check for conflict meetings in Creator!
        await this.validateCreatorMeetingsConflict(creator, meetingDto, meetingStart);

        // Map Creator username to meeting Dto
        meetingDto.creator = creator.username;

        // Create the meeting!
        const createdMeeting = await this.meetingService.create(meetingDto);

        // Construct UserMeeting Key
        const meetingKey = meetingDto.repeated ? meetingDto.repeated : DateTime.fromJSDate(new Date(createdMeeting.start_time)).toFormat('dd-MM-yyyy');

        const newUserMeeting = new UserMeeting();
        // Only to satisfy null-check! If Meeting is created, Entity will always map _id to Dto! If it is not, an error will be thrown from the Service and will be handled by the Controller.
        if (createdMeeting._id) {
            newUserMeeting.meeting_id = createdMeeting._id;
        }

        // Add meeting to creator
        await this.addUserMeetingToCreator(newUserMeeting, creator, meetingKey);

        // Add meeting to participants
        await this.addUserMeetingToParticipants(newUserMeeting, meetingDto, meetingKey);

        return createdMeeting;
    }

    private async addUserMeetingToParticipants (newUserMeeting: UserMeeting, meetingDto: MeetingDto, meetingKey: string): Promise<void> {
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
    }

    private async addUserMeetingToCreator (newUserMeeting: UserMeeting, creator: UserDto, meetingKey: string): Promise<void> {
        newUserMeeting.answered = Answered.Yes;

        // Only to satisfy null-check! If Creator exists, Entity will always map _id to Dto! If not, an error will be thrown from the Service and will be handled by the Controller.
        if (creator._id) {
            // Check if meetingKey already exists! If yes, push to array; If not => create new key
            if (!Object.keys(creator.meetings as Object).includes(meetingKey)) {
                creator.meetings[meetingKey] = new Array<UserMeeting>();
            }
            creator.meetings[meetingKey].push(newUserMeeting);
            await this.userService.update(creator._id, creator);
        }
    }

    private async validateCreatorMeetingsConflict (creator: UserDto, meetingDto: MeetingDto, meetingStart: DateTime): Promise<void> {
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
            const date = DateTime.fromFormat(meetingKey, 'dd-MM-yyyy');
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
    }

    private async validateParticipants (meetingDto: MeetingDto, creator: UserDto): Promise<void> {
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
