import {Request, Response} from "express";
import {userService, UserService} from "../services/user.service";
import {LoginUserDto, RegisterUserDto, UserDto} from "../dtos/user.dto";
import {createToken} from "../utils/jwt.util";
import * as dotenv from "dotenv";
import * as process from "process";

dotenv.config();

const COOKIE_NAME: string = process.env.COOKIE_NAME || 'calendar-api-cookie-name';

export class UserController {
    constructor(private userService: UserService) {
    }

    async register(req: Request<{}, {}, RegisterUserDto>, res: Response) {
        // TODO: Transform req.body and validate!
        const dto = req.body;
        try {
            const created = await this.userService.register(dto);
            createToken<UserDto>(res, created);
            res.status(201).json(created);
        } catch (err: any) {
            res.status(400).json(err.message);
        }
    }

    async login(req: Request<{}, {}, LoginUserDto>, res: Response) {
        // TODO: Transform req.body and validate!
        const dto = req.body;
        try {
            const user = await this.userService.login(dto);
            createToken<UserDto>(res, user);
            res.status(200).json(user);
        } catch (err: any) {
            res.status(400).json(err.message);
        }
    }

    logout(req: Request, res: Response) {
        res.clearCookie(COOKIE_NAME);
        res.status(200).json('Logged out!');
    }
}

export const userController = new UserController(userService);