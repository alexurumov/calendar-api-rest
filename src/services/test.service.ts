import {TestRepository} from "../repositories/test.repository";
import {pojos, PojosMetadataMap} from '@automapper/pojos'
import {createMapper} from '@automapper/core'
import {TestEntity} from "../entities/test.entity";
import {TestDto} from "../dtos/test.dto";

export class TestService {
    constructor(private testRepository: TestRepository) {}

    async getAll() {
        const testEntities = await this.testRepository.findAll();
        const mapper = createMapper({
            strategyInitializer: pojos()
        });
        PojosMetadataMap.create<TestEntity>('TestEntity');
        PojosMetadataMap.create<TestDto>('TestDto');
        // mapper.map<TestEntity, TestDto>(
        //
        // )

        const testEntity = testEntities[0];
    }
}