import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { type Creator, type Participant } from '../dtos/meeting.dto';

// TODO: Move ENUMS
export enum Repeated {
    No = 'no',
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly'
}

// TODO: Move ENUMS
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
        meetingRoom!: string;

    @AutoMap()
        startTime!: Date;

    @AutoMap()
        endTime!: Date;

    participants?: Participant[];

    @AutoMap()
        repeated: Repeated = Repeated.No;
}
