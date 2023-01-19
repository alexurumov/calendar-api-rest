import jwt, {JwtPayload} from "jsonwebtoken";
import {Response} from "express";
import * as dotenv from "dotenv";
import * as process from "process";
dotenv.config();

const COOKIE_NAME: string = process.env.COOKIE_NAME || 'calendar-api-cookie-name';
const TOKEN_SECRET: string = process.env.TOKEN_SECRET || 'Calendar Api Secret!';

export function createToken<T extends Object>(res: Response, obj: T): void {
    const token = jwt.sign(obj, TOKEN_SECRET , {expiresIn: '1 day'});
    res.cookie(COOKIE_NAME, token, {httpOnly: true});
}

export function verifyToken(token: string, secret: string): JwtPayload {
    return jwt.verify(token, secret) as JwtPayload;
}