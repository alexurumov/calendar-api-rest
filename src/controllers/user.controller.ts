import { type NextFunction, type Request, type Response } from 'express';
import { userService, type UserService } from '../services/user.service';
import { type PathParamUserDto, type PathParamUserMeetingDto, UserUpdateDto } from '../dtos/user.dto';

import { plainToClass } from 'class-transformer';
import { validateDto } from '../handlers/validate-request.handler';
import { MeetingCreateDto, MeetingUpdateDto, ReqQueryFilterMeetings, StatusUpdateDto } from '../dtos/meeting.dto';
import { userManager, type UserManager } from '../managers/user.manager';
import createHttpError from 'http-errors';

export class UserController {
    constructor (private readonly userService: UserService, private readonly userManager: UserManager) {}

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
            if (!req.user) {
                throw createHttpError.Unauthorized('Please, log in!');
            }
            // Transform request query params to class
            const queryParams = plainToClass(ReqQueryFilterMeetings, req.query);
            // Validate query params class
            await validateDto(queryParams);
            const meetings = await this.userManager.getAllMeetings(req.user._id, queryParams.answered, queryParams.period);
            return res.status(200).json(meetings);
        } catch (err: unknown) {
            next(err);
        }
    }

    async getMeeting (req: Request<PathParamUserMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const meeting = await this.userManager.getMeeting(req.params.meetingId);
            return res.status(200).json(meeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    async createMeeting (req: Request<PathParamUserDto, {}, MeetingCreateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingDto Class
        const meetingCrateDto = plainToClass(MeetingCreateDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate MeetingDto
            await validateDto(meetingCrateDto);
            meetingCrateDto.creator = req.params.username;
            const createdMeeting = await this.userManager.createMeeting(meetingCrateDto);
            return res.status(201).json(createdMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    async updateMeeting (req: Request<PathParamUserMeetingDto, {}, MeetingUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingDto Class
        const meetingUpdateDto = plainToClass(MeetingUpdateDto, req.body, { excludeExtraneousValues: true });

        try {
            await validateDto(meetingUpdateDto);
            const updatedMeeting = await this.userManager.updateMeeting(req.params.meetingId, meetingUpdateDto);
            return res.status(200).json(updatedMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    async deleteById (req: Request<PathParamUserMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const deletedMeeting = await this.userManager.deleteMeeting(req.params.meetingId);
            return res.status(200).json(deletedMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    async updateStatus (req: Request<PathParamUserMeetingDto, {}, StatusUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to Status Update Dto
        const statusUpdateDto = plainToClass(StatusUpdateDto, req.body, { excludeExtraneousValues: true });
        try {
            // Validate request params ID and request body
            await validateDto(statusUpdateDto);

            const updated = await this.userManager.updateStatus(req.params.username, req.params.meetingId, statusUpdateDto);
            return res.status(200).json(updated);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const userController = new UserController(userService, userManager);
