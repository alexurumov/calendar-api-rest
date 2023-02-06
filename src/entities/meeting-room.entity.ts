import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';

export class MeetingRoomEntity {
    @AutoMap()
        _id!: Types.ObjectId;

    @AutoMap()
        name!: string;

    @AutoMap()
        startAvailableHours!: string;

    @AutoMap()
        endAvailableHours!: string;

    @AutoMap()
        capacity!: number;
}
