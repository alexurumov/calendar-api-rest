import {Request, Response} from "express";
import {testService, TestService} from "../services/test.service";
import {PathParamTestDto, ReqQueryTestDto, TestDto} from "../dtos/base-test.dto";

export class TestController {
    constructor(private testService: TestService) {
    }
    async getAll(req: Request<{}, {}, {}, ReqQueryTestDto>, res: Response) {
        const dto: ReqQueryTestDto = req.query;
        const tests = await this.testService.getAll(dto)
        res.status(200).json(tests);
    }

    async create(req: Request<{}, {}, TestDto>, res: Response) {
        const created = await this.testService.create(req.body);
        // const created = await this.testRepo.create(req.body);
        res.status(201).json(created);
    }

    async getById(req: Request<PathParamTestDto>, res: Response) {
        const id: string = req.params._id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('ID missing!')
        }
        const test = await this.testService.findById(id);
        if (!test) {
            // TODO: HTTP ERRORS!
            res.status(404).json('Not found');
        }
        res.status(200).json(test);
    }

    async updateById(req: Request<PathParamTestDto, {}, Partial<TestDto>>, res: Response) {
        const id: string = req.params._id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('ID missing! ')
        }
        const dto = req.body;
        const updated = await this.testService.update(id, dto);
        res.status(200).json(updated);
    }

    async deleteById(req: Request<PathParamTestDto>, res: Response) {
        const id = req.params._id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('ID missing! ')
        }
        // const deleted = await this.testRepo.delete(id);
        const deleted = await this.testService.delete(id);
        if (!deleted) {
            res.status(404).json('Not found!');
        } else {
            res.status(200).json(deleted);
        }
    }
}

export const testController = new TestController(testService);