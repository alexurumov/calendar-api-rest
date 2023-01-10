import {Express, json} from "express";
import cookieParser from 'cookie-parser';

const COOKIE_NAME = process.env.COOKIE_NAME;

export const customExpress = (app: Express) => {
    app.use(json());
    app.use(cookieParser(COOKIE_NAME));    
}