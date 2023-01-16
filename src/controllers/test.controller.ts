import {Request, Response} from "express";
import {TestRepository} from "../repositories/test.repository";
import {TestDto} from "../dtos/test.dto";
import {TestEntity} from "../entities/test.entity";

export default class TestController {
    constructor(private testRepo: TestRepository) {
    }

    async getAll(req: Request, res: Response) {
        let tests: TestEntity[];
        if (req.query.name) {
            tests = await this.testRepo.findAllByName({name: req.query.name as string});
            console.log(req.query.name);
        } else if (req.query.message) {
            tests = await this.testRepo.findAllByMessage({message: req.query.message as string});
            console.log(req.query.message)
        } else {
            tests = await this.testRepo.findAll();
        }
        res.status(200).json(tests);
    }

    async create(req: Request, res: Response) {
        const newTestData = Object.assign(req.body, new TestDto());
        const created = await this.testRepo.create(newTestData);
        res.status(201).json(created);
    }

    async getById(req: Request, res: Response) {
        const id: string | undefined = req.params.id;
        if (!id) {
            res.status(400).json('ID missing! ')
        }
        const test = await this.testRepo.findById(id);
        if (!test) {
            res.status(404).json('Not found');
        }
        res.status(200).json(test);
    }

    async updateById(req: Request, res: Response) {
        const id: string | undefined = req.params.id;
        if (!id) {
            res.status(400).json('ID missing! ')
        }
        const updated = await this.testRepo.updateById(id, req.body);
        res.status(200).json(updated);
    }

    async deleteById(req: Request, res: Response) {
        const id: string | undefined = req.params.id;
        if (!id) {
            res.status(400).json('ID missing! ')
        }
        const deleted = await this.testRepo.delete(id);
        if (!deleted) {
            res.status(404).json('Not found!');
        } else {
            res.status(200).json(deleted);
        }
    }
}