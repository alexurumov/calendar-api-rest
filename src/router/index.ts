import express from 'express';
import {router as testRouter} from './test.router'
import {router as userRouter} from './user.router'
import {auth} from "../middlewares/auth.middleware";

export const routes = express.Router();

routes.use(auth);
routes.use('/test', testRouter);
routes.use('/user', userRouter);