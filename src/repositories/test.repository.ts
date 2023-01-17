import {model, Schema} from "mongoose";
import {TestEntity} from "../entities/test.entity";
import {BaseRepository} from "./base.repository";
import {TestDto} from "../dtos/base-test.dto";
import {toTestEntity} from "../mappers/test.mapper";

const testSchema = new Schema<TestEntity>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    message: {
        type: String,
    },

})

const testModel = model<TestEntity>('Test', testSchema);

export class TestRepository implements BaseRepository<TestEntity, TestDto> {
    async create(testData: TestDto): Promise<TestEntity> {
        const entity: TestEntity = toTestEntity(testData);
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

    findAllByName<ParamDto extends Pick<TestDto, 'name'>>(params: Required<ParamDto>): Promise<TestEntity[]> {
        return testModel.find({name: params.name}).exec();
    }

    findAllByMessage<ParamDto extends Pick<TestDto, 'message'>>(params: Required<ParamDto>): Promise<TestEntity[]> {
        return testModel.find({message: params.message}).exec();
    }

    async updateById(id: string, dto: Partial<TestDto>): Promise<TestEntity> {
        const entity = await testModel.findById(id);
        if (!entity) {
            // todo: use http-errors lib
            throw new Error('Not found');
        }
        if (dto.name) {
            entity.name = dto.name;
        }
        if (dto.message) {
            entity.message = dto.message;
        }
        entity.update()
        return await entity.save();
    }

    async delete(id: string): Promise<TestEntity | null> {
        return testModel.findByIdAndDelete(id);
    }
}

export const testRepository = new TestRepository();