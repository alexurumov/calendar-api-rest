import { type Request, type Response } from 'express';
import * as dotenv from 'dotenv';
import { JWTCreateToken } from '../utils/jwt.util';
import { type UserDto } from '../dtos/user.dto';

dotenv.config();

export const createToken = (req: Request, res: Response): Response => {
    const created: UserDto = res.locals.created;
    JWTCreateToken<UserDto>(res, created);
    return res.status(201).json(created);
};
