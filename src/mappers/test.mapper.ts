import {pojos, PojosMetadataMap} from "@automapper/pojos";
import {TestEntity} from "../entities/baseTestEntity";
import {Types} from "mongoose";
import {TestDto} from "../dtos/baseTestDto";
import {createMap, createMapper, typeConverter} from "@automapper/core";

PojosMetadataMap.create<TestEntity>('TestEntity',
    {
        _id: Types.ObjectId,
        name: String,
        message: String,
    }
);
PojosMetadataMap.create<TestDto>('TestDto',
    {
        _id: String,
        name: String,
        message: String,
    }
);
const mapper = createMapper({strategyInitializer: pojos()});

createMap<TestEntity, TestDto>(
    mapper,
    'TestEntity',
    'TestDto',
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
);
createMap<TestDto, TestEntity>(
    mapper,
    'TestDto',
    'TestEntity'
);

export const toTestDto = (e: TestEntity) => mapper.map<TestEntity, TestDto>(e, 'TestEntity', 'TestDto');
export const toTestEntity = (d: TestDto) => mapper.map<TestDto, TestEntity>(d, 'TestDto', 'TestEntity');
