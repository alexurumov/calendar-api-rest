import express, {NextFunction, Request,  Response} from 'express';
import {router as userRouter} from './user.router'
import {router as meetingRouter} from './meeting.router'
import {auth} from "../middlewares/auth.middleware";

export const routes = express.Router();

routes.use(auth);
routes.use('/user', userRouter);
routes.use('/meeting', meetingRouter);
routes.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        console.error(err);
        res.status(500).json('Oops! Something happened...');
    }
    next();
});