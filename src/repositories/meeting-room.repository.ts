import { isValidObjectId, model, Schema } from 'mongoose';
import { type BaseRepository } from './base.repository';
import { type MeetingRoomEntity } from '../entities/meeting-room.entity';
import { type MeetingRoomDto, type MeetingRoomUpdateDto } from '../dtos/meeting-room.dto';
import { toMeetingRoomEntity } from '../mappers/meeting-room.mapper';

const meetingRoomSchema = new Schema<MeetingRoomEntity>({
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

const meetingRoomModel = model<MeetingRoomEntity>('MeetingRoom', meetingRoomSchema);

export class MeetingRoomRepository implements BaseRepository<MeetingRoomEntity, MeetingRoomDto> {
    async create (meetingRoomDto: MeetingRoomDto): Promise<MeetingRoomEntity> {
        const entity: MeetingRoomEntity = toMeetingRoomEntity(meetingRoomDto);
        return await meetingRoomModel.create(entity);
    }

    async findAll (): Promise<MeetingRoomEntity[]> {
        return await meetingRoomModel.find();
    }

    async findById (id: string): Promise<MeetingRoomEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingRoomModel.findById(id);
    }

    // async findAllByName<ParamDto extends Pick<MeetingRoomDto, 'name'>>(params: Required<ParamDto>): Promise<MeetingRoomEntity[]> {
    //     return await meetingRoomModel.find({ name: params.name }).exec();
    // }

    async findByName (name: string): Promise<MeetingRoomEntity | null> {
        return await meetingRoomModel.findOne({ name });
    }

    async updateById (id: string, dto: MeetingRoomUpdateDto): Promise<MeetingRoomEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingRoomModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete (id: string): Promise<MeetingRoomEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return await meetingRoomModel.findByIdAndDelete(id);
    }
}

export const meetingRoomRepository = new MeetingRoomRepository();
