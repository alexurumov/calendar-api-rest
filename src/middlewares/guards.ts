import { type NextFunction, type Request, type Response } from 'express';
import { meetingService } from '../services/meeting.service';
import { type PathParamUserDto } from '../dtos/user.dto';
import createHttpError from 'http-errors';

export function isLogged () {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user) {
            next();
        } else {
            next(createHttpError.Unauthorized('Please, log in!'));
        }
    };
}

export function isGuest () {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            next();
        } else {
            next(createHttpError.Unauthorized('You are already logged in!'));
        }
    };
}

export function isOwner () {
    return async (req: Request<PathParamUserDto>, res: Response, next: NextFunction) => {
        const username = req.params.username;
        const owns = username === req.user?.username;
        if (req.user && owns) {
            next();
        } else {
            next(createHttpError.Unauthorized('You are not authorised!'));
        }
    };
}

export function isCreator () {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const meetingId = req.params._id;
            const meeting = await meetingService.findById(meetingId);
            const ownsMeeting = meeting.creator === req.user?.username;
            if (req.user && ownsMeeting) {
                next();
            } else {
                next(createHttpError.Unauthorized('You are not authorised!'));
            }
        } catch (err: unknown) {
            next(err);
        }
    };
}
