import {Request, Response} from "express";
import {TestRepository} from "../repositories/test.repository";
import {TestDto} from "../dtos/test.dto";

export default class TestController {
    constructor(private testRepo: TestRepository) {}
    async getAll(req: Request, res: Response) {
        const records = await this.testRepo.findAll();
        res.status(200).json(records);
    }

    async create(req: Request, res: Response) {
        const newTestData = Object.assign(req.body, new TestDto());
        const created = await this.testRepo.create(newTestData);
        res.status(201).json(created);
    }
}