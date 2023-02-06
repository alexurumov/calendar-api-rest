import { type NextFunction, type Request, type Response } from 'express';
import * as dotenv from 'dotenv';
import { jwtVerifyToken } from '../utils/jwt.util';
import * as process from 'process';
import createHttpError from 'http-errors';
import { JsonWebTokenError } from 'jsonwebtoken';

dotenv.config();

const TOKEN_SECRET: string = process.env.TOKEN_SECRET ?? 'Calendar Api Secret!';
const COOKIE_NAME: string = process.env.COOKIE_NAME ?? 'calendar-api-cookie-name';

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const token: string = req.cookies[COOKIE_NAME];
    if (!token) {
        req.user = undefined;
        next();
        return;
    }
    try {
        const jwtPayload = jwtVerifyToken(token, TOKEN_SECRET);
        const _id: string = jwtPayload.obj._id;
        const username: string = jwtPayload.obj.username;
        req.user = { _id, username };
        next();
    } catch (err: unknown) {
        if (err instanceof JsonWebTokenError) {
            next(createHttpError(498, 'Invalid Token!'));
            return;
        }
        next(err);
    }
};
