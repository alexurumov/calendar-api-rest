import { type NextFunction, type Request, type Response } from 'express';
import { userService, type UserService } from '../services/user.service';
import { type ReqQueryUserDto, UserDto, UserRegisterDto } from '../dtos/user.dto';
import * as dotenv from 'dotenv';
import * as process from 'process';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../utils/validate-request.util';

dotenv.config();

const COOKIE_NAME: string = process.env.COOKIE_NAME ?? 'calendar-api-cookie-name';

export class UserController {
    constructor (private readonly userService: UserService) {}

    async register (req: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void> {
        // Transform req.body to RegisterUserDto
        const userRegisterDto = plainToClass(UserRegisterDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate RegisterUserDto
            await validateRequestBody(userRegisterDto);

            // Transfer data to next middleware, so response could be constructed!
            res.locals.created = await this.userService.register(userRegisterDto);
            next();
        } catch (err: unknown) {
            next(err);
        }
    }

    async login (req: Request<{}, {}, UserDto>, res: Response, next: NextFunction): Promise<void> {
    // Transform req.body to RegisterUserDto
        const userLoginDto = plainToClass(UserDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate LoginUserDto
            await validateRequestBody(userLoginDto);

            // Transfer data to next middleware, so response could be constructed!
            res.locals.created = await this.userService.login(userLoginDto);
            next(); return;
        } catch (err: unknown) {
            next(err);
        }
    }

    logout (req: Request, res: Response): Response {
        return res.clearCookie(COOKIE_NAME).status(200).json('Logged out!');
    }

    async getAll (req: Request<{}, {}, {}, ReqQueryUserDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const dto: ReqQueryUserDto = req.body;
            const users = await this.userService.getAll(dto);
            return res.status(200).json(users);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const userController = new UserController(userService);
