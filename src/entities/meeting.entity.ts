import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { type Creator, type Participant } from '../dtos/meeting.dto';

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
}
