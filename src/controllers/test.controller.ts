import {Request, Response} from "express";
import {testService, TestService} from "../services/test.service";
import {TestDto} from "../dtos/baseTestDto";

export class TestController {
    constructor(private testService: TestService) {
    }
    async getAll(req: Request, res: Response) {
        let tests: TestDto[];
        if (req.query.name as string) {
            tests = await this.testService.findAllByName(req.query.name as string);
        } else if (req.query.message as string) {
            tests = await this.testService.findAllByMessage(req.query.message as string);
        } else {
            tests = await this.testService.getAll();
        }
        res.status(200).json(tests);
    }

    // async create(req: Request, res: Response) {
    //     const created = await this.testRepo.create(req.body);
    //     res.status(201).json(created);
    // }
    //
    // async getById(req: Request, res: Response) {
    //     const id: string | undefined = req.params.id.trim();
    //     if (!id) {
    //         res.status(400).json('ID missing! ')
    //     }
    //     const test = await this.testRepo.findById(id);
    //     if (!test) {
    //         res.status(404).json('Not found');
    //     }
    //     res.status(200).json(test);
    // }
    //
    // async updateById(req: Request, res: Response) {
    //     const id: string | undefined = req.params.id.trim();
    //     if (!id) {
    //         res.status(400).json('ID missing! ')
    //     }
    //     const updated = await this.testRepo.updateById(id, req.body);
    //     res.status(200).json(updated);
    // }
    //
    // async deleteById(req: Request, res: Response) {
    //     const id: string | undefined = req.params.id.trim();
    //     if (!id) {
    //         res.status(400).json('ID missing! ')
    //     }
    //     const deleted = await this.testRepo.delete(id);
    //     if (!deleted) {
    //         res.status(404).json('Not found!');
    //     } else {
    //         res.status(200).json(deleted);
    //     }
    // }
}

export const testController = new TestController(testService);