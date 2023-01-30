import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { type Creator, type Participant } from '../dtos/meeting.dto';

export enum Repeated {
    No = 'no',
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly'
}

export enum Answered {
    Yes = 'yes',
    No = 'no',
    Pending = 'pending'
}

export class MeetingEntity {
    @AutoMap()
        _id!: Types.ObjectId;

    creator!: Creator;

    @AutoMap()
        meeting_room!: string;

    @AutoMap()
        start_time!: Date;

    @AutoMap()
        end_time!: Date;

    participants?: Participant[];

    @AutoMap()
        repeated: Repeated = Repeated.No;
}
