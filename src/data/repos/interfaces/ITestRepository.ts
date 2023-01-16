import {ITest} from "../../../interfaces";

export interface ITestRepository {
    // create(testData: TestDto): Promise<ITest>;
    findAll(): Promise<ITest[]>;
    // findById(id: string): Promise<ITest>;
    // delete(id: string): void;
}