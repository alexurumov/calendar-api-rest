import {ITestRepository} from "../interfaces/ITestRepository";
import {ITest} from "../../../interfaces";
import {TestModel} from "../../../models";
import {TestDtoModel} from "../../models/TestDto.model";

export class TestRepository implements ITestRepository {
    async findAll(): Promise<ITest[]> {
        return TestModel.find();
    }

    create(testData: TestDtoModel): Promise<ITest> {
        const newTest = new TestModel(testData);
        return newTest.save();
    }

}