import {TestEntity} from "../entities/test.entity";
import {TestDto} from "../dtos/base-test.dto";
import {createMap, createMapper, typeConverter} from "@automapper/core";
import {classes} from "@automapper/classes";
import {Types} from "mongoose";

const mapper = createMapper({strategyInitializer: classes()});

createMap(
    mapper,
    TestEntity,
    TestDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
);
createMap<TestDto, TestEntity>(
    mapper,
    TestDto,
    TestEntity
);

export const toTestDto = (e: TestEntity) => mapper.map(e, TestEntity, TestDto);
export const toTestEntity = (d: TestDto) => mapper.map(d, TestDto, TestEntity);
