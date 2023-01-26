import { isValidObjectId, model, Schema } from 'mongoose';
import { type BaseRepository } from './base.repository';
import { type MeetingEntity } from '../entities/meeting.entity';
import { type MeetingDto, type MeetingUpdateDto } from '../dtos/meeting.dto';
import { toMeetingEntity } from '../mappers/meeting.mapper';

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
    meeting_room: {
        type: String,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
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
    }]
});

const meetingModel = model<MeetingEntity>('Meeting', meetingSchema);

export class MeetingRepository implements BaseRepository<MeetingEntity, MeetingDto> {
    async create (meetingDto: MeetingDto): Promise<MeetingEntity> {
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
        return await meetingModel.findByIdAndUpdate(id, dto);
    }

    async delete (id: string): Promise<MeetingEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingModel.findByIdAndDelete(id);
    }
}

export const meetingRepository = new MeetingRepository();
