import { isValidObjectId, model, Schema } from 'mongoose';
import { type BaseRepository } from './base.repository';
import { type MeetingEntity } from '../entities/meeting.entity';
import { type MeetingCreateDto, type MeetingUpdateDto } from '../dtos/meeting.dto';
import { toMeetingEntity, toMeetingEntityUpdate } from '../mappers/meeting.mapper';
import { Repeated } from '../types/enums';

const meetingSchema = new Schema<MeetingEntity>({
    creator: {
        username: {
            type: String,
            required: true
        },
        answered: {
            type: String,
            required: true
        }
    },
    meetingRoom: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    participants: [{
        _id: false,
        username: {
            type: String,
            required: true
        },
        answered: {
            type: String,
            required: true
        }
    }],
    repeated: {
        type: String,
        required: true,
        default: Repeated.NO
    }
});

const meetingModel = model<MeetingEntity>('Meeting', meetingSchema);

export class MeetingRepository implements BaseRepository<MeetingEntity, MeetingCreateDto> {
    async create (meetingDto: MeetingCreateDto): Promise<MeetingEntity> {
        const entity: MeetingEntity = toMeetingEntity(meetingDto);
        return await meetingModel.create(entity);
    }

    async findAll (): Promise<MeetingEntity[]> {
        return await meetingModel.find();
    }

    async findById (id: string): Promise<MeetingEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingModel.findById(id);
    }

    async updateById (id: string, dto: MeetingUpdateDto): Promise<MeetingEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        const entity = toMeetingEntityUpdate(dto);
        return await meetingModel.findByIdAndUpdate(id, entity, { new: true });
    }

    async delete (id: string): Promise<MeetingEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingModel.findByIdAndDelete(id);
    }
}

export const meetingRepository = new MeetingRepository();
