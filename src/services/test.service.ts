import {testRepository, TestRepository} from "../repositories/test.repository";
import {toTestDto} from "../mappers/test.mapper";
import {ReqQueryTestDto, TestDto} from "../dtos/base-test.dto";
import {TestEntity} from "../entities/test.entity";

export class TestService {
    constructor(private testRepository: TestRepository) {}

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
        return toTestDto(await this.testRepository.create(dto));
    }
}

export const testService = new TestService(testRepository);