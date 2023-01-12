import express from 'express';
import {router as meetingsRouter} from './meetings'
import {router as usersRouter} from './users'
// const auth = require('../middlewares/auth');
// const { isLogged } = require('../middlewares/guards');

export const routes = express.Router();

routes.use('/meetings', meetingsRouter);
routes.use('/users', usersRouter);
