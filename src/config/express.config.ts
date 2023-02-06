import { type Express } from 'express';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { validateContentType } from '../middlewares/content-type.middleware';

dotenv.config();

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'calendar-api-cookie-name';

export const expressConfig = (app: Express): void => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser(COOKIE_NAME));
    // Configure Cors
    app.use(cors());
    app.post('*', validateContentType);
    app.put('*', validateContentType);
    app.patch('*', validateContentType);
};
