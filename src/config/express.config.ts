import {Express, json} from "express";
import cookieParser from 'cookie-parser';
import * as dotenv from "dotenv";
dotenv.config();

const COOKIE_NAME = process.env.COOKIE_NAME;

export const expressConfig = (app: Express) => {
    app.use(json());
    app.use(cookieParser(COOKIE_NAME));
}