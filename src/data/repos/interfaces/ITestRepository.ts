import {ITest} from "../../../interfaces";
import {TestDtoModel} from "../../models/TestDto.model";

export interface ITestRepository {
    create(testData: TestDtoModel): Promise<ITest>;
    findAll(): Promise<ITest[]>;
    // findById(id: string): Promise<ITest>;
    // delete(id: string): void;
}