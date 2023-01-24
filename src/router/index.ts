import express, {NextFunction, Request,  Response} from 'express';
import {router as userRouter} from './user.router'
import {router as meetingRouter} from './meeting.router'
import {auth} from "../middlewares/auth.middleware";
import {HttpError} from "http-errors";
import {handleErrors} from "../middlewares/error-handler.middleware";

export const routes = express.Router();

routes.use(auth);
routes.use('/user', userRouter);
routes.use('/meeting', meetingRouter);

// Error Handler
routes.use(handleErrors);