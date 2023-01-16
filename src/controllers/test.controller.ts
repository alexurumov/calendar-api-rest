import {Request, Response} from "express";
import {TestRepository} from "../data/repos/impl/Test.repository";
import {ITest} from "../interfaces";
import {TestDtoModel} from "../data/models/TestDto.model";

export default class TestController {
    constructor(private testRepo: TestRepository) {}
    async getAll(req: Request, res: Response) {
        const records = await this.testRepo.findAll();
        res.status(200).json(records);
    }

    async create(req: Request, res: Response) {
        const newTestData = Object.assign(req.body, new TestDtoModel());
        const created = await this.testRepo.create(newTestData);
        res.status(201).json(created);
    }
}