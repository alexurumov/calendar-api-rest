import { type Request, type Response } from 'express';
import * as dotenv from 'dotenv';
import { JWTCreateToken } from '../utils/jwt.util';
import { UserDto } from '../dtos/user.dto';
import { plainToInstance } from 'class-transformer';

dotenv.config();

export const createToken = (req: Request, res: Response): Response => {
    const created = plainToInstance(UserDto, res.locals.created);
    JWTCreateToken<UserDto>(res, created);
    return res.status(201).json(created);
};
