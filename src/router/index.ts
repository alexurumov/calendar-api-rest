import express from 'express';
import { router as authRouter } from './auth.router';
import { router as usersRouter } from './user.router';
import { router as meetingRoomsRouter } from './meeting-room.router';
import { router as meetingsRouter } from './meeting.router';
import { auth } from '../middlewares/auth.middleware';
import { handleErrors } from '../middlewares/error-handler.middleware';
import { isLogged } from '../middlewares/guards';

export const routes = express.Router();

routes.use(auth);
routes.use('/', authRouter);
routes.use('/users', usersRouter);
routes.use('/rooms', isLogged(), meetingRoomsRouter);
routes.use('/meetings', isLogged(), meetingsRouter);
routes.use(handleErrors);
