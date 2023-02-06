import { type NextFunction, type Request, type Response } from 'express';
import { meetingService } from '../services/meeting.service';
import { PathParamUserDto, PathParamUserMeetingDto } from '../dtos/user.dto';
import createHttpError from 'http-errors';
import { plainToClass } from 'class-transformer';
import { validateDto } from '../handlers/validate-request.handler';
import { type MeetingDto } from '../dtos/meeting.dto';

function userExistsInMeeteing (username: string, meeting: MeetingDto): boolean {
    return meeting.creator.username === username || !!(meeting.participants?.map((part) => part.username).includes(username));
}

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

export function isPathOwner () {
    return async (req: Request<PathParamUserMeetingDto>, res: Response, next: NextFunction) => {
        try {
            // Transform request params to class
            const pathParams = plainToClass(PathParamUserDto, req.params);
            // Validate request params object
            await validateDto(pathParams);
            const username = req.params.username;
            const owns = username === req.user?.username;
            if (req.user && owns) {
                next();
            } else {
                next(createHttpError.Unauthorized('You are not authorised to access this user resources!'));
            }
        } catch (err: unknown) {
            next(err);
        }
    };
}

export function hasMeeting () {
    return async (req: Request<PathParamUserMeetingDto>, res: Response, next: NextFunction) => {
        try {
            // Transform request params to class
            const pathParams = plainToClass(PathParamUserMeetingDto, req.params);
            // Validate request params object
            await validateDto(pathParams);
            const { username, meetingId } = pathParams;
            const meeting = await meetingService.findById(meetingId);
            if (userExistsInMeeteing(username, meeting)) {
                next();
            } else {
                next(createHttpError.Unauthorized('You can access only meetings you are a part of!'));
            }
        } catch (err: unknown) {
            next(err);
        }
    };
}

export function isCreator () {
    return async (req: Request<PathParamUserMeetingDto>, res: Response, next: NextFunction) => {
        try {
            // Transform request params to class
            const pathParams = plainToClass(PathParamUserMeetingDto, req.params);
            // Validate request params object
            await validateDto(pathParams);
            const meeting = await meetingService.findById(req.params.meetingId);
            if (meeting.creator.username === req.user?.username) {
                next();
            } else {
                next(createHttpError.Unauthorized('You are not authorised!'));
            }
        } catch (err: unknown) {
            next(err);
        }
    };
}
