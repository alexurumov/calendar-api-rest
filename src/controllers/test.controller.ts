import {Request, Response} from "express";
import {TestRepository} from "../data/repos/impl/Test.repository";
import {ITest} from "../interfaces";

export default class TestController {
    constructor(private testRepo: TestRepository) {}
    async getAll(req: Request, res: Response) {
        const records = await this.testRepo.findAll();
        res.status(200).json(records);
    }

    // async function createTest(req: Request, res: Response) {
    //
    // }
}