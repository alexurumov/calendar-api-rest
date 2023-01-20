import {isValidObjectId, model, Schema} from "mongoose";
import {BaseRepository} from "./base.repository";
import {MeetingEntity} from "../entities/meeting.entity";
import {MeetingDto} from "../dtos/meeting.dto";
import {toMeetingEntity} from "../mappers/meeting.mapper";

const meetingSchema = new Schema<MeetingEntity>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    room: {
        type: String,
        required: true
    },
})

const meetingModel = model<MeetingEntity>('Meeting', meetingSchema);

export class MeetingRepository implements BaseRepository<MeetingEntity, MeetingDto> {
    async create(meetingDto: MeetingDto): Promise<MeetingEntity> {
        const entity: MeetingEntity = toMeetingEntity(meetingDto);
        return meetingModel.create(entity);
    }

    async findAll(): Promise<MeetingEntity[]> {
        return meetingModel.find();
    }

    async findById(id: string): Promise<MeetingEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return meetingModel.findById(id);
    }

    findAllByName<ParamDto extends Pick<MeetingDto, 'name'>>(params: Required<ParamDto>): Promise<MeetingEntity[]> {
        return meetingModel.find({name: params.name}).exec();
    }

    findAllByRoom<ParamDto extends Pick<MeetingDto, 'room'>>(params: Required<ParamDto>): Promise<MeetingEntity[]> {
        return meetingModel.find({room: params.room}).exec();
    }

    async updateById(id: string, dto: Partial<MeetingDto>): Promise<MeetingEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return meetingModel.findByIdAndUpdate(id, dto);
    }

    async delete(id: string): Promise<MeetingEntity | null> {
        if (!isValidObjectId(id)) {
            return null;
        }
        return meetingModel.findByIdAndDelete(id);
    }
}

export const meetingRepository = new MeetingRepository();