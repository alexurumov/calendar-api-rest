import {Request, Response} from "express";
import {userService, UserService} from "../services/user.service";
import {UserDto, UserLoginDto, UserRegisterDto} from "../dtos/user.dto";
import {createToken} from "../utils/jwt.util";
import * as dotenv from "dotenv";
import * as process from "process";
import {plainToClass} from "class-transformer";
import {validate} from "class-validator";

dotenv.config();

const COOKIE_NAME: string = process.env.COOKIE_NAME || 'calendar-api-cookie-name';

export class UserController {
    constructor(private userService: UserService) {
    }

    async register(req: Request<{}, {}, UserRegisterDto>, res: Response) {
        // Transform req.body to RegisterUserDto
        const userRegisterDto = plainToClass(UserRegisterDto, req.body, {excludeExtraneousValues: true});

        // Validate RegisterUserDto

        const errors = await validate(userRegisterDto);

        // TODO: Refactor to util func
        if (errors.length) {
            return res.status(401).json(errors.map(err => {
                for (const constraintsKey in err.constraints) {
                    return err.constraints[constraintsKey];
                }
            }));
        }

        try {
            const created = await this.userService.register(userRegisterDto);
            createToken<UserDto>(res, created);
            res.status(201).json(created);
        } catch (err: any) {
            res.status(400).json(err.message);
        }
    }

    async login(req: Request<{}, {}, UserLoginDto>, res: Response) {
        // Transform req.body to RegisterUserDto
        const userLoginDto = plainToClass(UserLoginDto, req.body, {excludeExtraneousValues: true});

        // Validate RegisterUserDto
        const errors = await validate(userLoginDto);

        // TODO: Refactor to util func
        if (errors.length) {
            return res.status(401).json(errors.map(err => {
                for (const constraintsKey in err.constraints) {
                    return err.constraints[constraintsKey];
                }
            }));
        }

        try {
            const user = await this.userService.login(userLoginDto);
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