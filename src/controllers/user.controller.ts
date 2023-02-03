import { type NextFunction, type Request, type Response } from 'express';
import { userService, type UserService } from '../services/user.service';
import { type PathParamUserDto, UserDto, UserRegisterDto, UserUpdateDto } from '../dtos/user.dto';
import * as dotenv from 'dotenv';
import * as process from 'process';
import { plainToClass } from 'class-transformer';
import { validateDto } from '../handlers/validate-request.handler';
import { MeetingDto, type ReqQueryFilterMeetings } from '../dtos/meeting.dto';
import { userManager, type UserManager } from '../managers/user.manager';

dotenv.config();

const COOKIE_NAME: string = process.env.COOKIE_NAME ?? 'calendar-api-cookie-name';

export class UserController {
    constructor (private readonly userService: UserService, private readonly userManager: UserManager) {}

    async register (req: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void> {
        // Transform req.body to RegisterUserDto
        const userRegisterDto = plainToClass(UserRegisterDto, req.body, { excludeExtraneousValues: true });
        try {
            // Validate RegisterUserDto
            await validateDto(userRegisterDto);

            // Transfer data to next middleware, so response could be constructed!
            res.locals.created = await this.userService.register(userRegisterDto);
            next();
        } catch (err: unknown) {
            next(err);
        }
    }

    async login (req: Request<{}, {}, UserDto>, res: Response, next: NextFunction): Promise<void> {
        // Transform req.body to RegisterUserDto
        const userLoginDto = plainToClass(UserDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate LoginUserDto
            await validateDto(userLoginDto);

            // Transfer data to next middleware, so response could be constructed!
            res.locals.created = await this.userService.login(userLoginDto);
            next(); return;
        } catch (err: unknown) {
            next(err);
        }
    }

    logout (req: Request, res: Response): Response {
        return res.clearCookie(COOKIE_NAME).status(200).json('Logged out!');
    }

    async getAll (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const users = await this.userService.getAll();
            return res.status(200).json(users);
        } catch (err: unknown) {
            next(err);
        }
    }

    async updateById (req: Request<PathParamUserDto, {}, UserUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to UserUpdateDto Class
        const userDto = plainToClass(UserUpdateDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate request body dto
            await validateDto(userDto);
            const updated = await this.userService.update(req.params.username, userDto);
            return res.status(200).json(updated);
        } catch (err: unknown) {
            next(err);
        }
    }

    async getAllMeetings (req: Request<{}, {}, {}, ReqQueryFilterMeetings>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const meetings = await this.userManager.getAllMeetings(req.user!._id, req.query.answered, req.query.period);
            return res.status(200).json(meetings);
        } catch (err: unknown) {
            next(err);
        }
    }

    async createMeeting (req: Request<PathParamUserDto, {}, MeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingDto Class
        const meetingDto = plainToClass(MeetingDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate MeetingDto
            await validateDto(meetingDto);
            meetingDto.creator = req.params.username;
            const createdMeeting = await this.userManager.createMeeting(meetingDto);
            return res.status(201).json(createdMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    // async updateById (req: Request<PathParamMeetingDto, {}, MeetingUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
    //     // Transform request body to MeetingDto Class
    //     const meetingUpdateDto = plainToClass(MeetingUpdateDto, req.body, { excludeExtraneousValues: true });
    //
    //     try {
    //         // Validate request params ID
    //         const id: string = req.params._id.trim();
    //         if (!id) {
    //             throw createHttpError.BadRequest('Meeting ID missing!');
    //         }
    //         await validateRequestBody(meetingUpdateDto);
    //         const updatedMeeting = await this.meetingManager.update(id, meetingUpdateDto);
    //         return res.status(200).json(updatedMeeting);
    //     } catch (err: unknown) {
    //         next(err);
    //     }
    // }

    // async deleteById (req: Request<PathParamMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
    //     try {
    //         // Validate request params ID
    //         const id = req.params._id.trim();
    //         if (!id) {
    //             throw createHttpError.BadRequest('Meeting ID missing!');
    //         }
    //         const deletedMeeting = await this.meetingManager.delete(id);
    //         return res.status(200).json(deletedMeeting);
    //     } catch (err: unknown) {
    //         next(err);
    //     }
    // }

    // async updateStatus (req: Request<PathParamUpdateStatusDto, {}, StatusUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
    //     // Transform request body to MeetingDto Class
    //     const pathParams = plainToClass(PathParamUpdateStatusDto, req.params);
    //     const statusUpdateDto = plainToClass(StatusUpdateDto, req.body, { excludeExtraneousValues: true });
    //
    //     try {
    //         // Validate request params ID and request body
    //         await Promise.all([validateDto(pathParams), validateDto(statusUpdateDto)]);
    //         // Pass userId of Logged user to service
    //         if (!req.user) {
    //             throw createHttpError.Unauthorized('Please, log in!');
    //         }
    //         const user = await this.userService.findById(req.user._id);
    //         let userMeeting;
    //         for (const meetingsKey in user.meetings) {
    //             const found = user.meetings[meetingsKey].find((usm) => usm.meeting_id === pathParams.meetingId);
    //             if (found) {
    //                 userMeeting = found;
    //                 break;
    //             }
    //         }
    //         if (!userMeeting) {
    //             throw createHttpError.NotFound('No such user meeting found!');
    //         }
    //
    //         // TODO: Check for conflict meetings when trying to answer "YES"!
    //
    //         userMeeting.answered = statusUpdateDto.answered;
    //         const updated = await this.userService.update(req.user._id, user);
    //         return res.status(200).json(updated);
    //     } catch (err: unknown) {
    //         next(err);
    //     }
    // }
}

export const userController = new UserController(userService, userManager);
