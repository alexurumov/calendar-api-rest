import express, {NextFunction, Request,  Response} from 'express';
import {router as userRouter} from './user.router'
import {router as meetingRouter} from './meeting.router'
import {auth} from "../middlewares/auth.middleware";
import {HttpError} from "http-errors";

export const routes = express.Router();

routes.use(auth);
routes.use('/user', userRouter);
routes.use('/meeting', meetingRouter);

// TODO: Export to function for enhanced readability
// Error Handler
routes.use((err: Error, req: Request, res: Response, next: NextFunction): Response | void => {
    if (err) {
        console.error(err);

        if (err instanceof HttpError) {
            return res.status(err.status).json(err.message);
        }
        return res.status(500).json('Oops! Something happened...');
    }
    next();
});