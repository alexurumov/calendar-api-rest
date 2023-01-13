import express from 'express';
import {router as meetingsRouter} from './meetings.router'
import {router as usersRouter} from './users.router'
// import {router as testRouter} from './test'
// const auth = require('../middlewares/auth');
// const { isLogged } = require('../middlewares/guards');

export const routes = express.Router();

routes.use('/meetings', meetingsRouter);
routes.use('/users', usersRouter);
// routes.use('/test', testRouter);
