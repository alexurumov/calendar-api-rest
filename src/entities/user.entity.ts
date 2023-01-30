import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { type Creator } from '../dtos/meeting.dto';
import { Answered } from './meeting.entity';

export class UserMeeting implements Pick<Creator, 'answered'> {
    meeting_id!: string;
    answered: Answered = Answered.Pending;
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
    // meetings!: Map<string, UserMeeting[]> = new Map<string, UserMeeting[]>();
}
