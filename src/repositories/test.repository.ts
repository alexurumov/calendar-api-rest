import {FilterQuery, model, Schema} from "mongoose";
import {TestEntity} from "../entities/test.entity";
import {BaseRepository} from "./base.repository";
import {TestDto} from "../dtos/test.dto";

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
        const entity: TestEntity = Object.assign({}, testData);
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

    findAllByMessage<ParamDto extends Pick<TestDto, 'message'>>(params: Required<ParamDto>): Promise<TestEntity[]> {
        return testModel.find({message: params.message}).exec();
    }

    findAllByName<ParamDto extends Pick<TestDto, 'name'>>(params: Required<ParamDto>): Promise<TestEntity[]> {
        return testModel.find({message: params.name}).exec();
    }

    async delete(id: string): Promise<void> {
        await testModel.findByIdAndDelete(id).exec();
    }

}