import {NextFunction, Request, Response} from "express";
import * as dotenv from "dotenv";
import {verifyToken} from "../utils/jwt";
import * as process from "process";

dotenv.config();

dotenv.config();

const TOKEN_SECRET: string = process.env.TOKEN_SECRET || 'Calendar Api Secret!';
const COOKIE_NAME: string = process.env.COOKIE_NAME || 'calendar-api-cookie-name';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.cookies[COOKIE_NAME];
        if (!token) {
            req.user = undefined;
            next();
            return;
        }
        const jwtPayload = verifyToken(token, TOKEN_SECRET);
        const _id: string = jwtPayload._id;
        if (req.user) {
            res.status(401).send("Already logged in! ");
        }
        req.user = {_id};

        next();
    } catch (err) {
        res.status(401).send({message: "Invalid token!"});
    }
}