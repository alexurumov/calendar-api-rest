import {NextFunction, Request, Response} from "express";
import * as dotenv from "dotenv";
import {verifyToken} from "../utils/jwt.util";
import * as process from "process";
import createHttpError from "http-errors";
import {JsonWebTokenError} from "jsonwebtoken";

dotenv.config();

const TOKEN_SECRET: string = process.env.TOKEN_SECRET || 'Calendar Api Secret!';
const COOKIE_NAME: string = process.env.COOKIE_NAME || 'calendar-api-cookie-name';

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const token: string = req.cookies[COOKIE_NAME];
        if (!token) {
            req.user = undefined;
            return next();
        }

        const jwtPayload = verifyToken(token, TOKEN_SECRET);
        const _id: string = jwtPayload.obj._id;
        req.user = {_id};

        return next();
    } catch (err: unknown) {
        if (err instanceof JsonWebTokenError) {
            return next(createHttpError(498, 'Invalid Token!'));
        }
        return next(err);
    }
}