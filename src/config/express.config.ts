import {Express, json} from "express";
import cookieParser from 'cookie-parser';
import * as dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const COOKIE_NAME = process.env.COOKIE_NAME;

export const expressConfig = (app: Express) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(cookieParser(COOKIE_NAME));
}