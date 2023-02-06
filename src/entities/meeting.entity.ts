import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { type Creator, type Participant } from '../dtos/meeting.dto';
import { Repeated } from '../types/enums';

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
        repeated: Repeated = Repeated.NO;
}
