import createHttpError, { HttpError } from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { type MeetingCreateDto, type MeetingDto, type MeetingUpdateDto, type StatusUpdateDto } from '../dtos/meeting.dto';
import { userService, type UserService } from '../services/user.service';
import { DateTime, Interval } from 'luxon';
import { meetingRoomService, type MeetingRoomService } from '../services/meeting-room.service';
import {
    hasConflictInHours,
    hasConflictInHoursMonthly,
    hasConflictInHoursWeekly,
    meetingsInConflict
} from '../handlers/validate-datetimes.handler';
import { type MeetingRoomDto } from '../dtos/meeting-room.dto';
import { type UserDto } from '../dtos/user.dto';
import { toUserMeetingFull } from '../mappers/userMeeting.mapper';
import { Answered, Period, Repeated } from '../types/enums';
import { UserMeeting, type UserMeetingFull } from '../sub-entities/user-meeting.sub-entity';
import { Participant } from '../sub-entities/Participant.sub-entity';

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
        case Repeated.DAILY: {
            // Check if daily has already begun
            const userMeetingStart = DateTime.fromJSDate(new Date(userMeeting.startTime));
            const todayEnd = DateTime.now().endOf('day');
            return userMeetingStart <= todayEnd;
        }
        case Repeated.WEEKLY: {
            // Check if weekly matches the weekday
            const userMeetingWeekDay = DateTime.fromJSDate(new Date(userMeeting.startTime)).weekday;
            const todayWeekDay = DateTime.now().weekday;

            // Check if weekly has already begun
            const meetingStart = DateTime.fromJSDate(new Date(userMeeting.startTime));
            const todayEnd = DateTime.now().endOf('day');

            return userMeetingWeekDay === todayWeekDay && meetingStart <= todayEnd;
        }
        case Repeated.MONTHLY: {
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

    async getAllMeetings (id: string, answered?: string, period?: string): Promise<UserMeetingFull[]> {
        const user = await this.userService.findById(id);
        let userMeetings: UserMeetingFull[] = [];
        for (const meetingsKey in user.meetings) {
            for (const userMeeting of user.meetings[meetingsKey]) {
                const meeting = await this.meetingService.findById(userMeeting.meetingId);
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
                case Answered.YES:
                    userMeetings = userMeetings.filter((userMeeting) => userMeeting.answered === Answered.YES);
                    break;
                case Answered.PENDING:
                    userMeetings = userMeetings.filter((userMeeting) => userMeeting.answered === Answered.PENDING);
                    break;
                default:
                    userMeetings = userMeetings.filter((userMeeting) => userMeeting.answered === Answered.NO);
                    break;
            }
        }

        if (period) {
            if (!Object.values(Period as Object).includes(period)) {
                throw createHttpError.BadRequest('Period filter must be one of the following: today | past | future');
            }
            switch (period) {
                case Period.TODAY:
                    userMeetings = userMeetings.filter((userMeeting) => isUserMeetingFromToday(userMeeting));
                    break;
                case Period.PAST:
                    userMeetings = userMeetings.filter((userMeeting) => isUserMeetingInPast(userMeeting));
                    break;
                default:
                    userMeetings = userMeetings.filter((userMeeting) => isUserMeetingInFuture(userMeeting));
                    break;
            }
        }
        return userMeetings;
    }

    async getMeeting (meetingId: string): Promise<MeetingDto> {
        return await this.meetingService.findById(meetingId);
    }

    async createMeeting (meetingCreateDto: MeetingCreateDto): Promise<MeetingDto> {
        // Is Creator existing? If yes => store in variable and use below; If no => userService method will throw error, which will be handled by Controller
        const creator = await this.userService.findByUsername(meetingCreateDto.creator);

        // Is Meeting Room existing? If yes => store in variable and use below; If no => meetingRoomService method will throw error, which will be handled by Controller
        const room = await this.meetingRoomService.findByName(meetingCreateDto.meetingRoom);

        // Check if new meeting participants + creator does not exceed Meeting Room's capacity?
        validateRoomCapacity(meetingCreateDto, room);

        // Transform new meeting start and end times to Luxon object DateTime and use variables below
        const meetingStart = DateTime.fromJSDate(new Date(meetingCreateDto.startTime));
        const meetingEnd = DateTime.fromJSDate(new Date(meetingCreateDto.endTime));

        // Make interval from room available hours in format HH:mm
        const roomInterval = constructRoomInterval(room, meetingStart, meetingEnd);

        // Is Meeting within room interval span?
        validateTimesInInterval(roomInterval, meetingStart, meetingEnd);

        // Meeting start should be before meeting end!
        validateStartAndEndTime(meetingStart, meetingEnd);

        // Meeting should be within the same day!
        validateWithinSameDay(meetingStart, meetingEnd);

        // Participants Validation:
        await this.validateParticipants(meetingCreateDto, creator);

        // Check for conflict meetings in Creator!
        switch (meetingCreateDto.repeated) {
            case Repeated.DAILY:
                await this.validateCreatorMeetingsConflictDaily(creator, meetingCreateDto);
                break;
            case Repeated.WEEKLY:
                await this.validateCreatorMeetingsConflictWeekly(creator, meetingCreateDto);
                break;
            case Repeated.MONTHLY:
                await this.validateCreatorMeetingsConflictMonthly(creator, meetingCreateDto);
                break;
            default:
                await this.validateCreatorMeetingsConflictNonRepeating(creator, meetingCreateDto);
                break;
        }

        // Map Creator username to meeting Dto
        meetingCreateDto.creator = creator.username;

        // Create the meeting!
        const createdMeeting = await this.meetingService.create(meetingCreateDto);

        // Construct UserMeeting Key
        const meetingKey = meetingCreateDto.repeated && meetingCreateDto.repeated !== Repeated.NO ? meetingCreateDto.repeated : DateTime.fromJSDate(new Date(createdMeeting.startTime)).toFormat('dd-MM-yyyy');

        const newUserMeeting = new UserMeeting();

        if (!createdMeeting._id) {
            throw createHttpError.NotFound('No such meeting found!');
        }
        newUserMeeting.meetingId = createdMeeting._id;

        // Add meeting to creator
        await this.addUserMeetingToCreator(newUserMeeting, creator, meetingKey);

        // Add meeting to participants
        await this.addUserMeetingToParticipants(newUserMeeting, meetingCreateDto, meetingKey);

        return createdMeeting;
    }

    async updateMeeting (id: string, meetingUpdateDto: MeetingUpdateDto): Promise<MeetingDto> {
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

        const creator = await this.userService.findByUsername(existing.creator.username);
        meetingUpdateDto.creator = creator.username;

        // 5. Participants:
        if (meetingUpdateDto.participants) {
            // Concat existing participants and newly added ones!
            const newParticipants = meetingUpdateDto.participants;
            const allParticipants = existing.participants?.concat(meetingUpdateDto.participants.map((username) => {
                const newParticipant = new Participant();
                newParticipant.username = username;
                return newParticipant;
            }));

            // 5.1: Check if all are existing participants' usernames
            // 5.2: Check for duplicates
            // 5.3: Check if creator is in participants
            meetingUpdateDto.participants = allParticipants.map((part) => part.username);
            await this.validateParticipants(meetingUpdateDto, creator);

            // Populate meetings to new participants!
            const userMeeting = new UserMeeting();
            userMeeting.meetingId = id;
            const meetingKey = existing.repeated !== Repeated.NO ? existing.repeated : DateTime.fromJSDate(new Date(existing.startTime)).toFormat('dd-MM-yyyy');
            meetingUpdateDto.participants = newParticipants;
            await this.addUserMeetingToParticipants(userMeeting, meetingUpdateDto, meetingKey);

            meetingUpdateDto.participants = allParticipants.map((part) => part.username);
            // If new participants are valid, append them to DUMMY also
            dummy.participants = meetingUpdateDto.participants.map((username) => {
                const newPart = new Participant();
                newPart.username = username;
                return newPart;
            });
        }

        // 2.3: Is Capacity Exceeded? => Check after participants
        validateRoomCapacity(meetingUpdateDto, meetingRoom);

        // We pass DUMMY Meeting Dto to validator + we exclude the current meeting from the conflict checks
        switch (meetingUpdateDto.repeated) {
            case Repeated.DAILY:
                await this.validateCreatorMeetingsConflictDaily(creator, dummy, id);
                break;
            case Repeated.WEEKLY:
                await this.validateCreatorMeetingsConflictWeekly(creator, dummy, id);
                break;
            case Repeated.MONTHLY:
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
            const oldMeetingKey = existing.repeated !== Repeated.NO ? existing.repeated : DateTime.fromJSDate(new Date(existing.startTime)).toFormat('dd-MM-yyyy');
            // Remove UserMeeting from Creator
            await this.removeUserMeeting(oldMeetingKey, creator, id);

            // Remove UserMeeting from each Participant
            if (updated.participants) {
                for (const participantUsername of updated.participants) {
                    const participant = await this.userService.findByUsername(participantUsername.username);
                    await this.removeUserMeeting(oldMeetingKey, participant, id);
                }
            }

            // Construct the new key of the meeting, so we can add it to the proper place in the map
            const newMeetingKey = meetingUpdateDto.repeated !== Repeated.NO ? meetingUpdateDto.repeated : DateTime.fromJSDate(new Date(updated.startTime)).toFormat('dd-MM-yyyy');

            const userMeeting = new UserMeeting();
            userMeeting.meetingId = id;

            // Append the UserMeeting to the proper place in Creator's Map
            await this.addUserMeetingToCreator(userMeeting, creator, newMeetingKey);
            await this.addUserMeetingToParticipants(userMeeting, updated, newMeetingKey);
        }

        return updated;
    }

    async deleteMeeting (id: string): Promise<MeetingDto> {
        // Delete meeting from meetings
        const deleted = await this.meetingService.delete(id);

        const creator = await this.userService.findByUsername(deleted.creator.username);
        const oldMeetingKey = deleted.repeated !== Repeated.NO ? deleted.repeated : DateTime.fromJSDate(new Date(deleted.startTime)).toFormat('dd-MM-yyyy');

        // Remove UserMeetings from creator
        if (!deleted._id) {
            throw createHttpError.NotFound('No such Meeting found!');
        }
        await this.removeUserMeeting(oldMeetingKey, creator, deleted._id);

        // Remove UserMeetings from participants
        if (deleted.participants) {
            for (const participantUsername of deleted.participants) {
                const participant = await this.userService.findByUsername(participantUsername.username);
                await this.removeUserMeeting(oldMeetingKey, participant, deleted._id);
            }
        }
        return deleted;
    }

    async updateStatus (username: string, meetingId: string, statusUpdateDto: StatusUpdateDto): Promise<UserDto> {
        const user = await this.userService.findByUsername(username);
        // Find user meeting
        let userMeeting;
        for (const meetingsKey in user.meetings) {
            const found = user.meetings[meetingsKey].find((userMeeting) => userMeeting.meetingId === meetingId);
            if (found) {
                userMeeting = found;
                break;
            }
        }
        // If statusDto.answered = Answered.Yes
        if (statusUpdateDto.answered === Answered.YES) {
            // Get Meeting
            const meeting = await this.meetingService.findById(meetingId);
            // Validate for conflicts
            switch (meeting.repeated) {
                case Repeated.DAILY:
                    await this.validateCreatorMeetingsConflictDaily(user, meeting, meetingId);
                    break;
                case Repeated.WEEKLY:
                    await this.validateCreatorMeetingsConflictWeekly(user, meeting, meetingId);
                    break;
                case Repeated.MONTHLY:
                    await this.validateCreatorMeetingsConflictMonthly(user, meeting, meetingId);
                    break;
                default:
                    await this.validateCreatorMeetingsConflictNonRepeating(user, meeting, meetingId);
                    break;
            }
        }

        if (!userMeeting) {
            throw new createHttpError.NotFound('No such User Meeting found!');
        }
        userMeeting.answered = statusUpdateDto.answered;
        // Update User Meeting for user!
        const updated = await this.userService.update(username, user);

        // Update Participant/Creator in Meeting also!
        const meeting = await this.meetingService.findById(meetingId);
        // If user is creator
        if (meeting.creator.username === username) {
            const creator = meeting.creator;
            creator.answered = statusUpdateDto.answered;
            await this.meetingService.update(meetingId, meeting);
        } else {
            // If user is participant
            const participant = meeting.participants.find((part) => part.username === username);
            if (participant) {
                participant.answered = statusUpdateDto.answered;
                await this.meetingService.update(meetingId, meeting);
            }
        }

        return updated;
    }

    private async addUserMeetingToParticipants (newUserMeeting: UserMeeting, meetingDto: MeetingDto | MeetingCreateDto | MeetingUpdateDto, meetingKey: string): Promise<void> {
        newUserMeeting.answered = Answered.PENDING;
        if (meetingDto.participants) {
            for (const participant of meetingDto.participants) {
                let username;
                if (typeof participant === 'string') {
                    username = participant;
                } else {
                    username = participant.username;
                }
                const user = await this.userService.findByUsername(username);
                if (!Object.keys(user.meetings as Object).includes(meetingKey)) {
                    user.meetings[meetingKey] = new Array<UserMeeting>();
                }
                user.meetings[meetingKey].push(newUserMeeting);
                if (user._id) {
                    await this.userService.update(username, user);
                }
            }
        }
    }

    private async addUserMeetingToCreator (newUserMeeting: UserMeeting, creator: UserDto, meetingKey: string): Promise<void> {
        newUserMeeting.answered = Answered.YES;

        // Check if meetingKey already exists! If yes, push to array; If not => create new key
        if (!Object.keys(creator.meetings as Object).includes(meetingKey)) {
            creator.meetings[meetingKey] = new Array<UserMeeting>();
        }
        creator.meetings[meetingKey].push(newUserMeeting);

        await this.userService.update(creator.username, creator);
    }

    private async validateCreatorMeetingsConflictNonRepeating (creator: UserDto, meetingDto: MeetingDto | MeetingCreateDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
        for (const meetingKey in creator.meetings) {
            switch (meetingKey) {
                // Check for conflict with daily meetings
                case Repeated.DAILY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.DAILY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);
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
                case Repeated.WEEKLY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.WEEKLY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);
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
                case Repeated.MONTHLY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.MONTHLY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);
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
                        // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                        const userMeetings = creator.meetings[meetingKey].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                        for (const userMeeting of userMeetings) {
                            const meeting = await this.meetingService.findById(userMeeting.meetingId);
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

    private async validateCreatorMeetingsConflictDaily (creator: UserDto, meetingDto: MeetingDto | MeetingCreateDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
        for (const meetingKey in creator.meetings) {
            if (meetingKey === Repeated.NO || undefined) {
                // If method is used for Update Meeting, meetingId will be valid and will return all meetings, except the one we are updating!
                // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                const userMeetings = creator.meetings[meetingKey].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                for (const userMeeting of userMeetings) {
                    const meeting = await this.meetingService.findById(userMeeting.meetingId);
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
            // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
            const userMeetings = creator.meetings[meetingKey].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
            for (const userMeeting of userMeetings) {
                const meeting = await this.meetingService.findById(userMeeting.meetingId);
                // Check if there is a conflict with the hours of each daily, regardless of date!
                if (hasConflictInHours(meeting, meetingDto)) {
                    throw createHttpError.Conflict('Meeting must not be in conflict with creator existing meetings!');
                }
            }
        }
    }

    private async validateCreatorMeetingsConflictWeekly (creator: UserDto, meetingDto: MeetingDto | MeetingCreateDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
        for (const meetingKey in creator.meetings) {
            switch (meetingKey) {
                // Check for conflict with daily meetings
                case Repeated.DAILY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.DAILY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);
                        // Check if there is a conflict with the hours of each daily, regardless of date!
                        if (hasConflictInHours(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing daily meetings!');
                        }
                    }
                    break;
                }
                // Check for conflict with weekly meetings
                case Repeated.WEEKLY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.WEEKLY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);

                        // Check if there is a conflict with the meetings only from the current day of each week!
                        if (hasConflictInHoursWeekly(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing weekly meetings!');
                        }
                    }
                }
                    break;
                    // Check for conflict with monthly meetings
                case Repeated.MONTHLY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.MONTHLY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);

                        // Check if there is a conflict with all monthly meetings for the current day!
                        if (hasConflictInHoursMonthly(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing monthly meetings!');
                        }
                    }
                    break;
                }
                // Check for conflict with not-repeating meetings
                default: {
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[meetingKey].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);
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

    private async validateCreatorMeetingsConflictMonthly (creator: UserDto, meetingDto: MeetingDto | MeetingCreateDto, meetingId: string = 'some-invalid-username!'): Promise<void> {
        const newMeetingStart = DateTime.fromJSDate(new Date(meetingDto.startTime));
        for (const meetingKey in creator.meetings) {
            switch (meetingKey) {
                // Check for conflict with daily meetings
                case Repeated.DAILY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.DAILY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);
                        // Check if there is a conflict with the hours of each daily, regardless of date!
                        if (hasConflictInHours(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing daily meetings!');
                        }
                    }
                    break;
                }
                // Check for conflict with weekly meetings
                case Repeated.WEEKLY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.WEEKLY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);

                        // Check if there is a conflict with the meetings only from the current day of each week!
                        if (hasConflictInHoursWeekly(meeting, meetingDto)) {
                            throw createHttpError.Conflict('Meeting must not be in conflict with creator existing weekly meetings!');
                        }
                    }
                }
                    break;
                    // Check for conflict with monthly meetings
                case Repeated.MONTHLY: {
                    // If meetingId param is present, we filter all meetings with it, so to exclude this particular meeting => We use this when Updating Meeting
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[Repeated.MONTHLY].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);

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
                    // We also filter meeting by Answered.Yes, because we want to check only for meetings, which are confirmed!
                    const userMeetings = creator.meetings[meetingKey].filter((userMeeting) => userMeeting.meetingId !== meetingId && userMeeting.answered === Answered.YES);
                    for (const userMeeting of userMeetings) {
                        const meeting = await this.meetingService.findById(userMeeting.meetingId);
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

    private async validateParticipants (meetingDto: MeetingCreateDto | MeetingUpdateDto, creator: UserDto): Promise<void> {
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
        user.meetings[oldMeetingKey] = user.meetings[oldMeetingKey].filter((meetings) => meetings.meetingId !== id);
        await this.userService.update(user.username, user);
    }
}

export const userManager = new UserManager(meetingService, userService, meetingRoomService);
