import {model, Schema} from "mongoose";
import {BaseRepository} from "./base.repository";
import {UserEntity} from "../entities/user.entity";
import {UserDto} from "../dtos/user.dto";
import {toUserEntity} from "../mappers/user.mapper";

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
})

const userModel = model<UserEntity>('User', userSchema);

export class UserRepository implements BaseRepository<UserEntity, UserDto> {
    async create(userData: UserDto): Promise<UserEntity> {
        const entity: UserEntity = toUserEntity(userData);
        return userModel.create(entity);
    }

    async findAll(): Promise<UserEntity[] | undefined> {
        return userModel.find();
    }

    async findById(id: string): Promise<UserEntity | null> {
        // Population strategy succesfull!
        // const entity = await userModel.findById(id).populate<{ tests: TestEntity[] }>('tests');
        return userModel.findById(id);
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        return userModel.findOne({username});
    }

    findAllByUsername<ParamDto extends Pick<UserDto, 'username'>>(params: Required<ParamDto>): Promise<UserEntity[]> {
        return userModel.find({name: params.username}).exec();
    }

    async updateById(id: string, dto: Partial<UserDto>): Promise<UserEntity | null> {
        return userModel.findByIdAndUpdate(id, dto);
    }

    async delete(id: string): Promise<UserEntity | null> {
        return userModel.findByIdAndDelete(id);
    }
}

export const userRepository = new UserRepository();