import { type NextFunction, type Request, type Response } from 'express';
import { meetingService } from '../services/meeting.service';
import { type PathParamUserDto, type UserUpdateDto } from '../dtos/user.dto';
import createHttpError from 'http-errors';
import { type MeetingUpdateDto, type PathParamMeetingDto } from '../dtos/meeting.dto';

export function isLogged () {
    return (req: Request<PathParamMeetingDto>, res: Response, next: NextFunction) => {
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
    return async (req: Request<PathParamUserDto, {}, UserUpdateDto>, res: Response, next: NextFunction) => {
        const userId = req.params._id;
        const owns = userId === req.user?._id;
        if (req.user && owns) {
            next();
        } else {
            next(createHttpError.Unauthorized('You are not authorised!'));
        }
    };
}

export function isCreator () {
    return async (req: Request<PathParamMeetingDto, {}, MeetingUpdateDto>, res: Response, next: NextFunction) => {
        const meetingId = req.params._id;
        const meeting = await meetingService.findById(meetingId);
        const ownsMeeting = meeting.creator === req.user?.username;
        if (req.user && ownsMeeting) {
            next();
        } else {
            next(createHttpError.Unauthorized('You are not authorised!'));
        }
    };
}
