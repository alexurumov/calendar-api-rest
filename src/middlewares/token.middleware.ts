import {NextFunction, Request, Response} from "express";
import * as dotenv from "dotenv";
import {JWTCreateToken} from "../utils/jwt.util";
import {UserDto} from "../dtos/user.dto";

dotenv.config();

export const createToken = (req: Request, res: Response, next: NextFunction): Response => {
    const created: UserDto = res.locals.created;
    JWTCreateToken<UserDto>(res, created);
    return res.status(201).json(created);
}