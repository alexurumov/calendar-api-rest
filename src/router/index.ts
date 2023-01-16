import express from 'express';
import {router as testRouter} from './test.router'

export const routes = express.Router();

routes.use('/test', testRouter);
