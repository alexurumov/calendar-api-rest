import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { Repeated } from '../types/enums';
import { type Participant } from '../sub-entities/Participant.sub-entity';
import { type Creator } from '../sub-entities/Creator.sub-entity';

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
