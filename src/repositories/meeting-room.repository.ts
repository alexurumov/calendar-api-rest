import { isValidObjectId, model, Schema } from 'mongoose';
import { type BaseRepository } from './base.repository';
import { type MeetingRoomEntity } from '../entities/meeting-room.entity';
import { type MeetingRoomDto } from '../dtos/meeting-room.dto';
import { toMeetingRoomEntity } from '../mappers/meeting-room.mapper';

const meetingSchema = new Schema<MeetingRoomEntity>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    startAvailableHours: {
        type: String,
        required: true
    },
    endAvailableHours: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    }
});

const meetingModel = model<MeetingRoomEntity>('Meeting', meetingSchema);

export class MeetingRoomRepository implements BaseRepository<MeetingRoomEntity, MeetingRoomDto> {
    async create (meetingDto: MeetingRoomDto): Promise<MeetingRoomEntity> {
        const entity: MeetingRoomEntity = toMeetingRoomEntity(meetingDto);
        return await meetingModel.create(entity);
    }

    async findAll (): Promise<MeetingRoomEntity[]> {
        return await meetingModel.find();
    }

    async findById (id: string): Promise<MeetingRoomEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingModel.findById(id);
    }

    async findAllByName<ParamDto extends Pick<MeetingRoomDto, 'name'>>(params: Required<ParamDto>): Promise<MeetingRoomEntity[]> {
        return await meetingModel.find({ name: params.name }).exec();
    }

    async updateById (id: string, dto: Partial<MeetingRoomDto>): Promise<MeetingRoomEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingModel.findByIdAndUpdate(id, dto);
    }

    async delete (id: string): Promise<MeetingRoomEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingModel.findByIdAndDelete(id);
    }
}

export const meetingRepository = new MeetingRoomRepository();
