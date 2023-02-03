import createHttpError, { HttpError } from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { type MeetingDto, type MeetingUpdateDto, Period } from '../dtos/meeting.dto';
import { userService, type UserService } from '../services/user.service';
import { DateTime, Interval } from 'luxon';
import { meetingRoomService, type MeetingRoomService } from '../services/meeting-room.service';
import { UserMeeting, type UserMeetingFull } from '../entities/user.entity';
import { Answered, Repeated } from '../entities/meeting.entity';
import {
    hasConflictInHours,
    hasConflictInHoursMonthly,
    hasConflictInHoursWeekly,
    meetingsInConflict
} from '../handlers/validate-datetimes.handler';
import { type MeetingRoomDto } from '../dtos/meeting-room.dto';
import { type UserDto } from '../dtos/user.dto';
import { toUserMeetingFull } from '../mappers/userMeeting.mapper';

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

function isUserMeetingFromToday (userMeeting: UserMeetingFull): boolean {
    switch (userMeeting.repeated) {
        case Repeated.Daily: {
            // Check if daily has already begun
            const userMeetingStart = DateTime.fromJSDate(new Date(userMeeting.startTime));
            const todayEnd = DateTime.now().endOf('day');
            return userMeetingStart <= todayEnd;
        }
        case Repeated.Weekly: {
            // Check if weekly matches the weekday
            const userMeetingWeekDay = DateTime.fromJSDate(new Date(userMeeting.startTime)).weekday;
            const todayWeekDay = DateTime.now().weekday;

            // Check if weekly has already begun
            const meetingStart = DateTime.fromJSDate(new Date(userMeeting.startTime));
            const todayEnd = DateTime.now().endOf('day');

            return userMeetingWeekDay === todayWeekDay && meetingStart <= todayEnd;
        }
        case Repeated.Monthly: {
            // Check if monthly matches the weekday
            const userMeetingMonthDay = DateTime.fromJSDate(new Date(userMeeting.startTime)).get('day');
            const todayMonthDay = DateTime.now().get('day');

            // Check if monthly has already begun
            const meetingStart = DateTime.fromJSDate(new Date(userMeeting.startTime));
            const todayEnd = DateTime.now().endOf('day');

            return userMeetingMonthDay === todayMonthDay && meetingStart <= todayEnd;
        }
        default:{
            // Check if non-repeating meeting is for today
            const userMeetingStart = DateTime.fromJSDate(new Date(userMeeting.startTime));
            const todayStart = DateTime.now().startOf('day');
            const todayEnd = DateTime.now().endOf('day');
            const todayInterval = Interval.fromDateTimes(todayStart, todayEnd);

            return todayInterval.contains(userMeetingStart);
        }
    }
}

function isUserMeetingInPast (userMeeting: UserMeetingFull): boolean {
    // Check if end time is before the start of today
    const userMeetingEnd = DateTime.fromJSDate(new Date(userMeeting.endTime));
    const todayStart = DateTime.now().startOf('day');

    return userMeetingEnd < todayStart;
}

function isUserMeetingInFuture (userMeeting: UserMeetingFull): boolean {
    // Check if start time is after the end of today
    const userMeetingStart = DateTime.fromJSDate(new Date(userMeeting.startTime));
    const todayEnd = DateTime.now().endOf('day');

    return userMeetingStart > todayEnd;
}

export class UserManager {
    constructor (
        private readonly meetingService: MeetingService,
        private readonly userService: UserService,
        private readonly meetingRoomService: MeetingRoomService
    ) {
    }

    async getAllMeetings (_id: string, answered?: string, period?: string): Promise<UserMeetingFull[]> {
        const user = await this.userService.findById(_id);
        let userMeetings: UserMeetingFull[] = [];
        for (const meetingsKey in user.meetings) {
            for (const userMeeting of user.meetings[meetingsKey]) {
                const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                const userMeetingFull = toUserMeetingFull(meeting);
                userMeetingFull.answered = userMeeting.answered;
                userMeetings.push(userMeetingFull);
            }
        }

        if (answered) {
            if (!Object.values(Answered as Object).includes(answered)) {
                throw createHttpError.BadRequest('Answered filter must be one of the following: yes | no | pending');
            }
            switch (answered) {
                case Answered.Yes:
                    userMeetings = userMeetings.filter((userMeeting) => userMeeting.answered === Answered.Yes);
                    break;
                case Answered.Pending:
                    userMeetings = userMeetings.filter((userMeeting) => userMeeting.answered === Answered.Pending);
                    break;
                default:
                    userMeetings = userMeetings.filter((userMeeting) => userMeeting.answered === Answered.No);
                    break;
            }
        }

        if (period) {
            if (!Object.values(Period as Object).includes(period)) {
                throw createHttpError.BadRequest('Period filter must be one of the following: today | past | future');
            }
            switch (period) {
                case Period.Today:
                    userMeetings = userMeetings.filter((userMeeting) => isUserMeetingFromToday(userMeeting));
                    break;
                case Period.Past:
                    userMeetings = userMeetings.filter((userMeeting) => isUserMeetingInPast(userMeeting));
                    break;
                default:
                    userMeetings = userMeetings.filter((userMeeting) => isUserMeetingInFuture(userMeeting));
                    break;
            }
        }
        return userMeetings;
    }

    async create (meetingDto: MeetingDto): Promise<MeetingDto> {
        // Is Creator existing? If yes => store in variable and use below; If no => userService method will throw error, which will be handled by Controller
        const creator = await this.userService.findById(meetingDto.creator);

        // Is Meeting Room existing? If yes => store in variable and use below; If no => meetingRoomService method will throw error, which will be handled by Controller
        const room = await this.meetingRoomService.findByName(meetingDto.meetingRoom);

        // Check if new meeting participants + creator does not exceed Meeting Room's capacity?
        validateRoomCapacity(meetingDto, room);

        // Transform new meeting start and end times to Luxon object DateTime and use variables below
        const meetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
        const meetingEnd = DateTime.fromJSDate(new Date(meetingDto.endTime));

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
        const meetingKey = meetingDto.repeated && meetingDto.repeated !== Repeated.No ? meetingDto.repeated : DateTime.fromJSDate(new Date(createdMeeting.startTime)).toFormat('dd-MM-yyyy');

        const newUserMeeting = new UserMeeting();

        newUserMeeting.meeting_id = createdMeeting._id!;

        // Add meeting to creator
        await this.addUserMeetingToCreator(newUserMeeting, creator, meetingKey);

        // Add meeting to participants
        await this.addUserMeetingToParticipants(newUserMeeting, meetingDto, meetingKey);

        return createdMeeting;
    }

    async update (id: string, meetingUpdateDto: MeetingUpdateDto): Promise<MeetingDto> {
    // 1. Does meeting exist?
        const existing = await this.meetingService.findById(id);

        // Make a DUMMY MeetingDto to simulate conflict validation of a newly created meeting!
        const dummy = await this.meetingService.findById(id);

        // 2. Check Meeting Room:
        let meetingRoom;
        if (meetingUpdateDto.meetingRoom) {
            // 2.1: Does meeting room exist?
            meetingRoom = await this.meetingRoomService.findByName(meetingUpdateDto.meetingRoom);

            // If new room is valid, set it to DUMMY
            dummy.meetingRoom = meetingRoom.name;
        } else {
            meetingRoom = await this.meetingRoomService.findByName(existing.meetingRoom);
        }

        // 3. Start Time:
        if (meetingUpdateDto.startTime) {
            const newMeetingStart = DateTime.fromJSDate(new Date(meetingUpdateDto.startTime));
            // 3.1: If there is also a new End Time
            if (meetingUpdateDto.endTime) {
                // 3.1.1: Check if start is before end
                const newMeetingEnd = DateTime.fromJSDate(new Date(meetingUpdateDto.endTime));
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
            dummy.startTime = meetingUpdateDto.startTime;
        }

        // 4. End Time:
        if (meetingUpdateDto.endTime && !meetingUpdateDto.startTime) {
            // 3.2: If there is no new End Time, perform validations with existing Start Time
            const existingMeetingStart = DateTime.fromJSDate((new Date(existing.startTime)));
            const newMeetingEnd = DateTime.fromJSDate((new Date(meetingUpdateDto.endTime)));
            // 4.2.1: Check if start is before end
            validateStartAndEndTime(existingMeetingStart, newMeetingEnd);

            // 4.2.2: Check if both are within the same day
            validateWithinSameDay(existingMeetingStart, newMeetingEnd);

            // 4.2.3: Check if they are in conflict with room available hours
            const roomInterval = constructRoomInterval(meetingRoom, existingMeetingStart, newMeetingEnd);
            validateTimesInInterval(roomInterval, existingMeetingStart, newMeetingEnd);

            // If end_time is valid, set it to DUMMY
            dummy.endTime = meetingUpdateDto.endTime;
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
            const meetingKey = existing.repeated !== Repeated.No ? existing.repeated : DateTime.fromJSDate(new Date(existing.startTime)).toFormat('dd-MM-yyyy');
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
            const oldMeetingKey = existing.repeated !== Repeated.No ? existing.repeated : DateTime.fromJSDate(new Date(existing.startTime)).toFormat('dd-MM-yyyy');
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
            const newMeetingKey = meetingUpdateDto.repeated !== Repeated.No ? meetingUpdateDto.repeated : DateTime.fromJSDate(new Date(updated.startTime)).toFormat('dd-MM-yyyy');

            const userMeeting = new UserMeeting();
            userMeeting.meeting_id = id;

            // Append the UserMeeting to the proper place in Creator's Map
            await this.addUserMeetingToCreator(userMeeting, creator, newMeetingKey);
            await this.addUserMeetingToParticipants(userMeeting, updated, newMeetingKey);
        }

        return updated;
    }

    async delete (id: string): Promise<MeetingDto> {
        // Delete meeting from meetings
        const deleted = await this.meetingService.delete(id);

        const creator = await this.userService.findByUsername(deleted.creator);
        const oldMeetingKey = deleted.repeated !== Repeated.No ? deleted.repeated : DateTime.fromJSDate(new Date(deleted.startTime)).toFormat('dd-MM-yyyy');

        // Remove UserMeetings from creator
        await this.removeUserMeeting(oldMeetingKey, creator, deleted._id!);

        // Remove UserMeetings from participants
        if (deleted.participants) {
            for (const participantUsername of deleted.participants) {
                const participant = await this.userService.findByUsername(participantUsername);
                await this.removeUserMeeting(oldMeetingKey, participant, deleted._id!);
            }
        }
        return deleted;
    }

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

        // Check if meetingKey already exists! If yes, push to array; If not => create new key
        if (!Object.keys(creator.meetings as Object).includes(meetingKey)) {
            creator.meetings[meetingKey] = new Array<UserMeeting>();
        }
        creator.meetings[meetingKey].push(newUserMeeting);

        await this.userService.update(creator._id!, creator);
    }

    private async validateCreatorMeetingsConflictNonRepeating (creator: UserDto, meetingDto: MeetingDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
        for (const meetingKey in creator.meetings) {
            switch (meetingKey) {
                // Check for conflict with daily meetings
                case Repeated.Daily: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    const userMeetings = creator.meetings[Repeated.Daily].filter((meetings) => meetings.meeting_id !== meetingId);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                        const existingStart = DateTime.fromJSDate(new Date(meeting.startTime));
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
                        const existingStart = DateTime.fromJSDate(new Date(meeting.startTime));
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
                        const existingStart = DateTime.fromJSDate(new Date(meeting.startTime));
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
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
        for (const meetingKey in creator.meetings) {
            if (meetingKey === Repeated.No || undefined) {
                const userMeetings = creator.meetings[meetingKey].filter((meetings) => meetings.meeting_id !== meetingId);
                for (const userMeeting of userMeetings) {
                    const meeting = await this.meetingService.findById(userMeeting.meeting_id);
                    const existingStart = DateTime.fromJSDate(new Date(meeting.startTime));
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
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
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
                        const existingStart = DateTime.fromJSDate(new Date(meeting.startTime));
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
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
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
                        const existingStart = DateTime.fromJSDate(new Date(meeting.startTime));
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
        await this.userService.update(user._id!, user);
    }
}

export const userManager = new UserManager(meetingService, userService, meetingRoomService);
