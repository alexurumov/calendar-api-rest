import createHttpError, { HttpError } from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { type MeetingDto } from '../dtos/meeting.dto';
import { userService, type UserService } from '../services/user.service';
import { DateTime, Interval } from 'luxon';
import { meetingRoomService, type MeetingRoomService } from '../services/meeting-room.service';
import { UserMeeting } from '../entities/user.entity';
import { UserUpdateDto } from '../dtos/user.dto';
import { Answered } from '../entities/meeting.entity';

export class MeetingManager {
    constructor (
        private readonly meetingService: MeetingService,
        private readonly userService: UserService,
        private readonly meetingRoomService: MeetingRoomService
    ) {}

    async create (meetingDto: MeetingDto): Promise<MeetingDto> {
        // TODO: Extract all validations to handler func!

        // TODO: Add repeated to meetings

        /*
        Validate Creator:
        - Existing?
        - Has conflict meetings in same hour? TODO: add meetings to users!
         */
        // Existing?
        const creator = await this.userService.findById(meetingDto.creator);
        meetingDto.creator = creator.username;

        // TODO: Check for conflict meetings in Creator!

        /*
        Validate Meeting Room:
         */

        // Existing?
        const room = await this.meetingRoomService.findByName(meetingDto.meeting_room);

        // Capacity?
        if (meetingDto.participants?.length && meetingDto.participants.length > room.capacity - 1) {
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
        if (start.startOf('day').toMillis() !== end.startOf('day').toMillis()) {
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

        const createdMeeting = await this.meetingService.create(meetingDto);

        const newMeeting = new UserMeeting();
        // Only to satisfy null-check!
        if (createdMeeting._id) {
            newMeeting.meeting_id = createdMeeting._id;
        }

        /*
        Where to add meeting to user? Here, or in User Service? Validation?
        When we add meeting to creator, we must check for conflicts => so best to do it from here!
        When we add to regular user, we do not check for conflicts => we can either add here, or through user service!
        We do both from here for consistency!
         */

        // TODO: Add meeting to creator

        // TODO: Add meeting to user

        newMeeting.answered = Answered.Yes;
        const meetingKey = DateTime.fromJSDate(new Date(createdMeeting.start_time)).toFormat('MM-dd-yyyy');
        const userDto = new UserUpdateDto();
        if (Object.keys(creator.meetings).some((key) => key === meetingKey)) {
            userDto.meetings[meetingKey].push(newMeeting);
        }

        // Only to satisfy null-check!
        if (creator._id) {
            await this.userService.update(creator._id, userDto);
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
