import {ITestRepository} from "../interfaces/ITestRepository";
import {ITest} from "../../../interfaces";
import {TestModel} from "../../../models";

export class TestRepository implements ITestRepository {
    async findAll(): Promise<any> {
        return TestModel.find();
    }
    // create(testData: TestDto): Promise<ITest> {
    //     const newTest = new TestModel(testData);
    //     return newTest.save();
    // }
}