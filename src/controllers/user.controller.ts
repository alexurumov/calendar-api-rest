import {Request, Response} from "express";
import {userService, UserService} from "../services/user.service";
import {PathParamUserDto, ReqQueryUserDto, UserDto} from "../dtos/user.dto";

export class UserController {
    constructor(private userService: UserService) {
    }

    async getAll(req: Request<{}, {}, {}, ReqQueryUserDto>, res: Response) {
        const dto: ReqQueryUserDto = req.query;
        const users = await this.userService.getAll(dto)
        res.status(200).json(users);
    }

    async create(req: Request<{}, {}, UserDto>, res: Response) {
        const created = await this.userService.create(req.body);
        res.status(201).json(created);
    }

    async getById(req: Request<PathParamUserDto>, res: Response) {
        const id: string = req.params.id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('ID missing!')
        }
        const user = await this.userService.findById(id);
        if (!user) {
            // TODO: HTTP ERRORS!
            res.status(404).json('Not found');
        }
        res.status(200).json(user);
    }

    async updateById(req: Request<PathParamUserDto, {}, Partial<UserDto>>, res: Response) {
        const id: string = req.params.id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('ID missing! ')
        }
        const dto = req.body;
        const updated = await this.userService.update(id, dto);
        res.status(200).json(updated);
    }

    async deleteById(req: Request<PathParamUserDto>, res: Response) {
        const id = req.params.id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('ID missing! ')
        }
        // const deleted = await this.testRepo.delete(id);
        const deleted = await this.userService.delete(id);
        if (!deleted) {
            res.status(404).json('Not found!');
        } else {
            res.status(200).json(deleted);
        }
    }
}

export const userController = new UserController(userService);