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
    },
    tests: [
        {
            type: Schema.Types.ObjectId,
            ref: "Test"
        }
    ],
})

const userModel = model<UserEntity>('User', userSchema);

export class UserRepository implements BaseRepository<UserEntity, UserDto> {
    async create(userData: UserDto): Promise<UserEntity> {
        const entity: UserEntity = toUserEntity(userData);
        return userModel.create(entity);
    }

    async findAll(): Promise<UserEntity[]> {
        return userModel.find();
    }

    async findById(id: string): Promise<UserEntity> {
        const entity = await userModel.findById(id);
        if (!entity) {
            //TODO: HTTP ERRORS!
            throw new Error('Not found');
        }
        return entity;
    }

    findAllByUsername<ParamDto extends Pick<UserDto, 'username'>>(params: Required<ParamDto>): Promise<UserEntity[]> {
        return userModel.find({name: params.username}).exec();
    }

    async updateById(id: string, dto: Partial<UserDto>): Promise<UserEntity> {
        const entity = await userModel.findById(id);
        if (!entity) {
            // todo: use http-errors lib
            throw new Error('Not found');
        }
        if (dto.username) {
            entity.username = dto.username;
        }
        entity.update()
        return await entity.save();
    }

    async delete(id: string): Promise<UserEntity | null> {
        return userModel.findByIdAndDelete(id);
    }
}

export const userRepository = new UserRepository();