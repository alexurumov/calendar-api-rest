import createHttpError, { HttpError } from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { type MeetingDto, type MeetingUpdateDto } from '../dtos/meeting.dto';
import { userService, type UserService } from '../services/user.service';
import { DateTime, Interval } from 'luxon';
import { meetingRoomService, type MeetingRoomService } from '../services/meeting-room.service';
import { UserMeeting } from '../entities/user.entity';
import { Answered, Repeated } from '../entities/meeting.entity';
import {
    hasConflictInHours,
    hasConflictInHoursMonthly,
    hasConflictInHoursWeekly,
    meetingsInConflict
} from '../handlers/validate-datetimes.handler';
import { type MeetingRoomDto } from '../dtos/meeting-room.dto';
import { type UserDto } from '../dtos/user.dto';

function validateRoomCapacity (meetingDto: MeetingDto | MeetingUpdateDto, room: MeetingRoomDto): void {
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
    return Interval.fromDateTimes(roomStart, roomEnd);
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
    ) {
    }

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
        switch (meetingDto.repeated) {
            case Repeated.Daily:
                await this.validateCreatorMeetingsConflictDaily(creator, meetingDto);
                break;
            case Repeated.Weekly:
                await this.validateCreatorMeetingsConflictWeekly(creator, meetingDto);
                break;
            case Repeated.Monthly:
                await this.validateCreatorMeetingsConflictMonthly(creator, meetingDto);
                break;
            default:
                await this.validateCreatorMeetingsConflictNonRepeating(creator, meetingDto);
                break;
        }

        // Map Creator username to meeting Dto
        meetingDto.creator = creator.username;

        // Create the meeting!
        const createdMeeting = await this.meetingService.create(meetingDto);

        // Construct UserMeeting Key
        const meetingKey = meetingDto.repeated && meetingDto.repeated !== Repeated.No ? meetingDto.repeated : DateTime.fromJSDate(new Date(createdMeeting.start_time)).toFormat('dd-MM-yyyy');

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

    async update (id: string, meetingUpdateDto: MeetingUpdateDto): Promise<MeetingDto> {
    // TODO: Validate if creator! => Guard
    // 1. Does meeting exist?
        const existing = await this.meetingService.findById(id);

        // Make a DUMMY MeetingDto to simulate conflict validation of a newly created meeting!
        const dummy = await this.meetingService.findById(id);

        // TODO: Validate Creator Meetings: Make switch and make sure it doesn't circle around each meeting when Repeated.No!

        // 2. Check Meeting Room:
        let meetingRoom;
        if (meetingUpdateDto.meeting_room) {
            // 2.1: Does meeting room exist?
            meetingRoom = await this.meetingRoomService.findByName(meetingUpdateDto.meeting_room);

            // If new room is valid, set it to DUMMY
            dummy.meeting_room = meetingRoom.name;
        } else {
            meetingRoom = await this.meetingRoomService.findByName(existing.meeting_room);
        }

        // 3. Start Time:
        if (meetingUpdateDto.start_time) {
            const newMeetingStart = DateTime.fromJSDate(new Date(meetingUpdateDto.start_time));
            // 3.1: If there is also a new End Time
            if (meetingUpdateDto.end_time) {
                // 3.1.1: Check if start is before end
                const newMeetingEnd = DateTime.fromJSDate(new Date(meetingUpdateDto.end_time));
                validateStartAndEndTime(newMeetingStart, newMeetingEnd);

                // 3.1.2: Check if both are within the same day
                validateWithinSameDay(newMeetingStart, newMeetingEnd);

                // 3.1.3: Check if they are in conflict with room available hours
                const roomInterval = constructRoomInterval(meetingRoom, newMeetingStart, newMeetingEnd);
                validateTimesInInterval(roomInterval, newMeetingStart, newMeetingEnd);
            } else {
                // 3.2: If no new End time, perform validations with existing End Time
                const existingMeetingEnd = DateTime.fromJSDate(new Date(meetingRoom.endAvailableHours));
                // 3.2.1: Check if start is before end
                validateStartAndEndTime(newMeetingStart, existingMeetingEnd);

                // 3.2.2: Check if both are within the same day
                validateWithinSameDay(newMeetingStart, existingMeetingEnd);

                // 3.2.3: Check if they are in conflict with room available hours
                const roomInterval = constructRoomInterval(meetingRoom, newMeetingStart, existingMeetingEnd);
                validateTimesInInterval(roomInterval, newMeetingStart, existingMeetingEnd);
            }
            // If start_time is valid, set it to DUMMY
            dummy.start_time = meetingUpdateDto.start_time;
        }

        // 4. End Time:
        if (meetingUpdateDto.end_time && !meetingUpdateDto.start_time) {
            // 3.2: If there is no new End Time, perform validations with existing Start Time
            const existingMeetingStart = DateTime.fromJSDate((new Date(existing.start_time)));
            const newMeetingEnd = DateTime.fromJSDate((new Date(meetingUpdateDto.end_time)));
            // 4.2.1: Check if start is before end
            validateStartAndEndTime(existingMeetingStart, newMeetingEnd);

            // 4.2.2: Check if both are within the same day
            validateWithinSameDay(existingMeetingStart, newMeetingEnd);

            // 4.2.3: Check if they are in conflict with room available hours
            const roomInterval = constructRoomInterval(meetingRoom, existingMeetingStart, newMeetingEnd);
            validateTimesInInterval(roomInterval, existingMeetingStart, newMeetingEnd);

            // If end_time is valid, set it to DUMMY
            dummy.end_time = meetingUpdateDto.end_time;
        }

        const creator = await this.userService.findByUsername(existing.creator);
        meetingUpdateDto.creator = creator.username;

        // 5. Participants:
        if (meetingUpdateDto.participants) {
            // Concat existing participants and newly added ones!
            const newParticipants = meetingUpdateDto.participants;
            const allParticipants = existing.participants?.concat(meetingUpdateDto.participants);

            // 5.1: Check if all are existing participants' usernames
            // 5.2: Check for duplicates
            // 5.3: Check if creator is in participants
            meetingUpdateDto.participants = allParticipants;
            await this.validateParticipants(meetingUpdateDto, creator);

            // Populate meetings to new participants!
            const userMeeting = new UserMeeting();
            userMeeting.meeting_id = id;
            const meetingKey = existing.repeated !== Repeated.No ? existing.repeated : DateTime.fromJSDate(new Date(existing.start_time)).toFormat('dd-MM-yyyy');
            meetingUpdateDto.participants = newParticipants;
            await this.addUserMeetingToParticipants(userMeeting, meetingUpdateDto, meetingKey);

            meetingUpdateDto.participants = allParticipants;
            // If new participants are valid, append them to DUMMY also
            dummy.participants = meetingUpdateDto.participants;
        }

        // 2.3: Is Capacity Exceeded? => Check after participants
        validateRoomCapacity(meetingUpdateDto, meetingRoom);

        // We pass DUMMY Meeting Dto to validator + we exclude the current meeting from the conflict checks
        switch (meetingUpdateDto.repeated) {
            case Repeated.Daily:
                await this.validateCreatorMeetingsConflictDaily(creator, dummy, id);
                break;
            case Repeated.Weekly:
                await this.validateCreatorMeetingsConflictWeekly(creator, dummy, id);
                break;
            case Repeated.Monthly:
                await this.validateCreatorMeetingsConflictMonthly(creator, dummy, id);
                break;
            default:
                await this.validateCreatorMeetingsConflictNonRepeating(creator, dummy, id);
                break;
        }

        // If all validator checks pass, we have valid input and no conflicts, so we can update the meeting
        const updated = await this.meetingService.update(id, meetingUpdateDto);

        // We would need to amend meetings in Creator and in Participants only if the Repeat feature is changed!
        if (meetingUpdateDto.repeated && meetingUpdateDto.repeated !== existing.repeated) {
            // Construct the key of the existing meeting, so we can search by it more easily
            const oldMeetingKey = existing.repeated !== Repeated.No ? existing.repeated : DateTime.fromJSDate(new Date(existing.start_time)).toFormat('dd-MM-yyyy');
            // Remove UserMeeting from Creator
            await this.removeUserMeeting(oldMeetingKey, creator, id);

            // Remove UserMeeting from each Participant
            if (updated.participants) {
                for (const participantUsername of updated.participants) {
                    const participant = await this.userService.findByUsername(participantUsername);
                    await this.removeUserMeeting(oldMeetingKey, participant, id);
                }
            }

            // Construct the new key of the meeting, so we can add it to the proper place in the map
            const newMeetingKey = meetingUpdateDto.repeated !== Repeated.No ? meetingUpdateDto.repeated : DateTime.fromJSDate(new Date(updated.start_time)).toFormat('dd-MM-yyyy');

            const userMeeting = new UserMeeting();
            userMeeting.meeting_id = id;

            // Only to satisfy null-check! UserMeeting will never be undefined!
            if (userMeeting) {
                // Append the UserMeeting to the proper place in Creator's Map
                await this.addUserMeetingToCreator(userMeeting, creator, newMeetingKey);
                await this.addUserMeetingToParticipants(userMeeting, updated, newMeetingKey);
            }
        }

        return updated;
    }

    // TODO: delete

    private async addUserMeetingToParticipants (newUserMeeting: UserMeeting, meetingDto: MeetingDto | MeetingUpdateDto, meetingKey: string): Promise<void> {
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

    private async validateCreatorMeetingsConflictNonRepeating (creator: UserDto, meetingDto: MeetingDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.start_time));
        for (const meetingKey in creator.meetings) {
            switch (meetingKey) {
                // Check for conflict with daily meetings
                case Repeated.Daily: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Daily].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        const existingStart = DateTime.fromJSDate(new Date(meeting.start_time));
                        // Check dates: Perform conflict validation only if date of new meeting is equal or greater than existing meeting
                        if (newMeetingStart >= existingStart) {
                            // Check if there is a conflict with the hours of each daily, regardless of date!
                            if (hasConflictInHours(meeting, meetingDto)) {
                                throw createHttpError.Conflict('Meeting must not be in conflict with creator existing daily meetings!');
                            }
                        }
                    }
                    break;
                }
                // Check for conflict with weekly meetings
                case Repeated.Weekly: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Weekly].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        const existingStart = DateTime.fromJSDate(new Date(meeting.start_time));
                        // Check dates: Perform conflict validation only if date of new meeting is equal or greater than existing meeting
                        if (newMeetingStart >= existingStart) {
                            // Check if there is a conflict with the meetings only from the current day of each week!
                            if (hasConflictInHoursWeekly(meeting, meetingDto)) {
                                throw createHttpError.Conflict('Meeting must not be in conflict with creator existing weekly meetings!');
                            }
                        }
                    }
                }
                    break;
                    // Check for conflict with monthly meetings
                case Repeated.Monthly: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Monthly].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        const existingStart = DateTime.fromJSDate(new Date(meeting.start_time));
                        // Check dates: Perform conflict validation only if date of new meeting is equal or greater than existing meeting
                        if (newMeetingStart >= existingStart) {
                            // Check if there is a conflict with all monthly meetings for the current day!
                            if (hasConflictInHoursMonthly(meeting, meetingDto)) {
                                throw createHttpError.Conflict('Meeting must not be in conflict with creator existing monthly meetings!');
                            }
                        }
                    }
                    break;
                }
                // Check for conflict with not-repeating meetings
                default: {
                    const date = DateTime.fromFormat(meetingKey, 'dd-MM-yyyy');
                    if (date.startOf('day').toMillis() === newMeetingStart.startOf('day').toMillis()) {
                        // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                        const userMeetings = creator.meetings[meetingKey].filter((meetings) => meetings.meeting_id !== meetingId);
                        for (const userMeeting of userMeetings) {
                            const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                            if (meetingsInConflict(meetingDto, meeting)) {
                                throw createHttpError.Conflict('Meeting must not be in conflict with creator existing meetings for the day!');
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    private async validateCreatorMeetingsConflictDaily (creator: UserDto, meetingDto: MeetingDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.start_time));
        for (const meetingKey in creator.meetings) {
            if (meetingKey === Repeated.No || undefined) {
                const userMeetings = creator.meetings[meetingKey].filter((meetings) => meetings.meeting_id !== meetingId);
                for (const userMeeting of userMeetings) {
                    const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                    const existingStart = DateTime.fromJSDate(new Date(meeting.start_time));
                    // Check dates: Perform conflict validation only if date of new daily meeting is equal or earlier than existing non-repeated meeting
                    if (newMeetingStart <= existingStart) {
                        // Check if there is a conflict with the hours of each daily, regardless of date!
                        if (hasConflictInHours(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing meetings!');
                        }
                    }
                }
            }
            // Check for direct hours conflict with all meetings, regardless of type and date!
            // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
            const userMeetings = creator.meetings[meetingKey].filter((meetings) => meetings.meeting_id !== meetingId);
            for (const userMeeting of userMeetings) {
                const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                // Check if there is a conflict with the hours of each daily, regardless of date!
                if (hasConflictInHours(meeting, meetingDto)) {
                    throw createHttpError.Conflict('Meeting must not be in conflict with creator existing meetings!');
                }
            }
        }
    }

    private async validateCreatorMeetingsConflictWeekly (creator: UserDto, meetingDto: MeetingDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.start_time));
        for (const meetingKey in creator.meetings) {
            switch (meetingKey) {
                // Check for conflict with daily meetings
                case Repeated.Daily: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Daily].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        // Check if there is a conflict with the hours of each daily, regardless of date!
                        if (hasConflictInHours(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing daily meetings!');
                        }
                    }
                    break;
                }
                // Check for conflict with weekly meetings
                case Repeated.Weekly: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Weekly].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);

                        // Check if there is a conflict with the meetings only from the current day of each week!
                        if (hasConflictInHoursWeekly(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing weekly meetings!');
                        }
                    }
                }
                    break;
                    // Check for conflict with monthly meetings
                case Repeated.Monthly: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Monthly].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);

                        // Check if there is a conflict with all monthly meetings for the current day!
                        if (hasConflictInHoursMonthly(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing monthly meetings!');
                        }
                    }
                    break;
                }
                // Check for conflict with not-repeating meetings
                default: {
                    const userMeetings = creator.meetings[meetingKey].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        const existingStart = DateTime.fromJSDate(new Date(meeting.start_time));
                        // Check dates: Perform conflict validation only if date of new weekly meeting is equal or earlier than existing non-repeated meeting
                        if (newMeetingStart <= existingStart) {
                            if (hasConflictInHoursWeekly(meetingDto, meeting)) {
                                throw createHttpError.Conflict('Meeting must not be in conflict with creator existing meetings for the day!');
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    private async validateCreatorMeetingsConflictMonthly (creator: UserDto, meetingDto: MeetingDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.start_time));
        for (const meetingKey in creator.meetings) {
            switch (meetingKey) {
                // Check for conflict with daily meetings
                case Repeated.Daily: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Daily].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        // Check if there is a conflict with the hours of each daily, regardless of date!
                        if (hasConflictInHours(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing daily meetings!');
                        }
                    }
                    break;
                }
                // Check for conflict with weekly meetings
                case Repeated.Weekly: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Weekly].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);

                        // Check if there is a conflict with the meetings only from the current day of each week!
                        if (hasConflictInHoursWeekly(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing weekly meetings!');
                        }
                    }
                }
                    break;
                    // Check for conflict with monthly meetings
                case Repeated.Monthly: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Monthly].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);

                        // Check if there is a conflict with all monthly meetings for the current day!
                        if (hasConflictInHoursMonthly(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing monthly meetings!');
                        }
                    }
                    break;
                }
                // Check for conflict with not-repeating meetings
                default: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[meetingKey].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        const existingStart = DateTime.fromJSDate(new Date(meeting.start_time));
                        // Check dates: Perform conflict validation only if date of new weekly meeting is equal or earlier than existing non-repeated meeting
                        if (newMeetingStart <= existingStart) {
                            if (hasConflictInHoursMonthly(meetingDto, meeting)) {
                                throw createHttpError.Conflict('Meeting must not be in conflict with creator existing meetings for the day!');
                            }
                        }
                    }
                    break;
                }
            }
        }
    }

    private async validateParticipants (meetingDto: MeetingDto | MeetingUpdateDto, creator: UserDto): Promise<void> {
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

    private async removeUserMeeting (oldMeetingKey: string, user: UserDto, id: string): Promise<void> {
    // Remove the meeting from Creator's Map
        user.meetings[oldMeetingKey] = user.meetings[oldMeetingKey].filter((meetings) => meetings.meeting_id !== id);
        // Only to satisfy null check! Creator ID will always be present!
        if (user._id) {
            await this.userService.update(user._id, user);
        }
    }
}

export const meetingManager = new MeetingManager(meetingService, userService, meetingRoomService);
