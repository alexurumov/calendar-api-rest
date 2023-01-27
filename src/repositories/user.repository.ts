import { model, Schema } from 'mongoose';
import { type BaseRepository } from './base.repository';
import { type UserEntity } from '../entities/user.entity';
import { type UserRegisterDto } from '../dtos/user.dto';
import { toUserRegisterEntity } from '../mappers/user.mapper';

const userSchema = new Schema<UserEntity>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    age: {
        type: Number
    },
    phone: {
        type: String
    },
    company: {
        type: String
    },
    meetings: {
        type: Map,
        of: [{
            _id: false,
            meeting_id: String,
            answered: String
        }],
        default: {},
        required: true
    }
});

const userModel = model<UserEntity>('User', userSchema);

export class UserRepository implements BaseRepository<UserEntity, UserRegisterDto> {
    async create (userData: UserRegisterDto): Promise<UserEntity> {
        const entity: UserEntity = toUserRegisterEntity(userData);
        return await userModel.create(entity);
    }

    async findAll (): Promise<UserEntity[]> {
        return await userModel.find();
    }

    async findById (id: string): Promise<UserEntity | null> {
        return await userModel.findById(id);
    }

    async findByUsername (username: string): Promise<UserEntity | null> {
        return await userModel.findOne({ username });
    }

    async findAllByCompany<ParamDto extends Pick<UserRegisterDto, 'company'>>(params: Required<ParamDto>): Promise<UserEntity[]> {
        return await userModel.find({ name: params.company }).exec();
    }

    async updateById (id: string, dto: Partial<UserRegisterDto>): Promise<UserEntity | null> {
        return await userModel.findByIdAndUpdate(id, dto);
    }

    async delete (id: string): Promise<UserEntity | null> {
        return await userModel.findByIdAndDelete(id);
    }
}

export const userRepository = new UserRepository();
