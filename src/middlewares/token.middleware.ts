import { type Request, type Response } from 'express';
import * as dotenv from 'dotenv';
import { JWTCreateToken } from '../utils/jwt.util';
import { type UserLoginDto, type UserRegisterDto } from '../dtos/user.dto';

dotenv.config();

export const createToken = (req: Request, res: Response): Response => {
    const created: UserLoginDto | UserRegisterDto = res.locals.created;
    JWTCreateToken<UserLoginDto | UserRegisterDto>(res, created);
    return res.status(201).json(created);
};
