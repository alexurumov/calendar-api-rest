import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { Repeated } from '../types/enums';
import { Participant } from '../sub-entities/Participant.sub-entity';
import { Creator } from '../sub-entities/Creator.sub-entity';

export class MeetingEntity {
    @AutoMap()
        _id!: Types.ObjectId;

    @AutoMap(() => Creator)
        creator!: Creator;

    @AutoMap()
        meetingRoom!: string;

    @AutoMap()
        startTime!: Date;

    @AutoMap()
        endTime!: Date;

    @AutoMap(() => [Participant])
        participants?: Participant[];

    @AutoMap()
        repeated?: Repeated = Repeated.NO;
}
