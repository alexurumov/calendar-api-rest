import express from 'express';
import {router as userRouter} from './user.router'
import {router as meetingRouter} from './meeting.router'
import {auth} from "../middlewares/auth.middleware";
import {handleErrors} from "../middlewares/error-handler.middleware";

export const routes = express.Router();

routes.use(auth);
routes.use('/user', userRouter);
routes.use('/meeting', meetingRouter);
routes.use(handleErrors);