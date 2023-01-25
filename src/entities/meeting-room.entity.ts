import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';

export class MeetingRoomEntity {
    @AutoMap()
        _id!: Types.ObjectId;

    @AutoMap()
        name!: string;

    @AutoMap()
        startAvailableHours!: Date;

    @AutoMap()
        endAvailableHours!: Date;

    @AutoMap()
        capacity!: number;
}
