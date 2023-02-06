import { Types } from 'mongoose';
import { AutoMap } from '@automapper/classes';
import { type UserMeeting } from '../sub-entities/sub-entities';

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

    meetings!: Map<string, UserMeeting[]>;
}
