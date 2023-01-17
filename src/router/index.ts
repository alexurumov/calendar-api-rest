import express from 'express';
import {router as testRouter} from './test.router'
import {router as userRouter} from './user.router'

export const routes = express.Router();

routes.use('/test', testRouter);
routes.use('/user', userRouter);