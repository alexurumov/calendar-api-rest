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
    }
});

const userModel = model<UserEntity>('User', userSchema);

export class UserRepository implements BaseRepository<UserEntity, UserRegisterDto> {
    async create (userData: UserRegisterDto): Promise<UserEntity> {
        const entity: UserEntity = toUserRegisterEntity(userData);
        return await userModel.create(entity);
    }

    async findAll (): Promise<UserEntity[] | undefined> {
        return await userModel.find();
    }

    async findById (id: string): Promise<UserEntity | null> {
    // Population strategy successful!
    // const entity = await userModel.findById(id).populate<{ tests: TestEntity[] }>('tests');
        return await userModel.findById(id);
    }

    async findByUsername (username: string): Promise<UserEntity | null> {
        return await userModel.findOne({ username });
    }

    async findAllByUsername<ParamDto extends Pick<UserRegisterDto, 'username'>>(params: Required<ParamDto>): Promise<UserEntity[]> {
        return await userModel.find({ name: params.username }).exec();
    }

    async updateById (id: string, dto: Partial<UserRegisterDto>): Promise<UserEntity | null> {
        return await userModel.findByIdAndUpdate(id, dto);
    }

    async delete (id: string): Promise<UserEntity | null> {
        return await userModel.findByIdAndDelete(id);
    }
}

export const userRepository = new UserRepository();
