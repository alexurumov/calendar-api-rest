import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { type Creator, MeetingDto } from '../dtos/meeting.dto';
import { Answered } from '../types/enums';

// TODO: Move DTOs
export class UserMeeting implements Pick<Creator, 'answered'> {
    meetingId!: string;
    answered: Answered = Answered.PENDING;
}

// TODO: Move DTOs
export class UserMeetingFull extends MeetingDto {
    answered!: Answered;
}

export class UserEntity {
    @AutoMap()
        _id!: Types.ObjectId;

    @AutoMap()
        username!: string;

    @AutoMap()
        password!: string;

    @AutoMap()
        name?: string;

    @AutoMap()
        age?: number;

    @AutoMap()
        phone?: string;

    @AutoMap()
        company?: string;

    // @AutoMap(() => UserMeeting)
    meetings!: Map<string, UserMeeting[]>;
}
