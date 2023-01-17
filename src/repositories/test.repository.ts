import {model, Schema} from "mongoose";
import {BaseTestEntity, TestEntity} from "../entities/baseTestEntity";
import {BaseRepository} from "./base.repository";
import {BaseTestDto} from "../dtos/baseTestDto";

const testSchema = new Schema<BaseTestEntity>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    message: {
        type: String,
    },

})

const testModel = model<BaseTestEntity>('Test', testSchema);

export class TestRepository implements BaseRepository<BaseTestEntity, BaseTestDto> {
    async create(testData: BaseTestDto): Promise<TestEntity> {
        const entity: BaseTestEntity = Object.assign({}, testData);
        return testModel.create(entity);
    }
    async findAll(): Promise<TestEntity[]> {
        return testModel.find();
    }

    async findById(id: string): Promise<TestEntity> {
        const entity = await testModel.findById(id);
        if (!entity) {
            throw new Error('Not found');
        }
        return entity;
    }

    findAllByName<ParamDto extends Pick<BaseTestDto, 'name'>>(params: Required<ParamDto>): Promise<TestEntity[]> {
        return testModel.find({name: params.name}).exec();
    }

    findAllByMessage<ParamDto extends Pick<BaseTestDto, 'message'>>(params: Required<ParamDto>): Promise<TestEntity[]> {
        return testModel.find({message: params.message}).exec();
    }

    async updateById(id: string, dto: BaseTestDto): Promise<TestEntity> {
        const entity = await testModel.findById(id);
        if (!entity) {
            // todo: use http-errors lib
            throw new Error('Not found');
        }
        Object.assign(entity, dto);
        return await entity.save();
    }

    async delete(id: string): Promise<TestEntity | null> {
        return testModel.findByIdAndDelete(id);
    }
}

export const testRepository = new TestRepository();