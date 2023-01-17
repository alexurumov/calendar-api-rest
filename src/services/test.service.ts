import {testRepository, TestRepository} from "../repositories/test.repository";
import {toTestDto} from "../mappers/test.mapper";
import {TestDto} from "../dtos/baseTestDto";

export class TestService {
    constructor(private testRepository: TestRepository) {}

    async getAll(): Promise<TestDto[]> {
        console.log('Reached Test Service!');
        const testEntities = await this.testRepository.findAll();
        return testEntities.map(toTestDto);
    }

    async findAllByName(name: string): Promise<TestDto[]> {
        const testEntities = await this.testRepository.findAllByName({name});
        return testEntities.map(toTestDto);
    }

    async findAllByMessage(message: string): Promise<TestDto[]> {
        const testEntities = await this.testRepository.findAllByMessage({message});
        return testEntities.map(toTestDto);
    }
}

export const testService = new TestService(testRepository);