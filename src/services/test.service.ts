import {testRepository, TestRepository} from "../repositories/test.repository";
import {toTestDto} from "../mappers/test.mapper";
import {ReqQueryTestDto, TestDto} from "../dtos/base-test.dto";
import {TestEntity} from "../entities/test.entity";

export class TestService {
    constructor(private testRepository: TestRepository) {
    }

    async getAll(dto: ReqQueryTestDto): Promise<TestDto[]> {
        const {name, message} = dto;
        let tests: TestEntity[];
        if (name) {
            tests = await this.testRepository.findAllByName({name});
        } else if (message) {
            tests = await this.testRepository.findAllByMessage({message});
        } else {
            tests = await this.testRepository.findAll();
        }
        return tests.map(toTestDto);
    }

    async create(dto: TestDto): Promise<TestDto> {
        const created = await this.testRepository.create(dto);
        return toTestDto(created);
    }

    async findById(id: string): Promise<TestDto> {
        const test = await this.testRepository.findById(id)
        if (!test) {
            // TODO: HTTP Errors
            throw new Error('Not Found!');
        }
        return toTestDto(test);
    }

    async update(id: string, dto: Partial<TestDto>): Promise<TestDto> {
        const updated = await this.testRepository.updateById(id, dto);
        if (!updated) {
            throw new Error('Update failed!');
        }
        return toTestDto(updated);
    }

    async delete(id: string): Promise<TestDto> {
        const deleted = await this.testRepository.delete(id);
        if (!deleted) {
            // TODO: HTTP Errors
            throw new Error('Delete failed!')
        }
        return toTestDto(deleted);
    }
}

export const testService = new TestService(testRepository);