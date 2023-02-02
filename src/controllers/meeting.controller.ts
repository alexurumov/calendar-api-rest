import { type NextFunction, type Request, type Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../handlers/validate-request.handler';
import createHttpError from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import {
    MeetingDto,
    MeetingUpdateDto,
    type PathParamMeetingDto,
    type ReqQueryFilterMeetings
} from '../dtos/meeting.dto';
import { meetingManager, type MeetingManager } from '../managers/meeting.manager';

export class MeetingController {
    constructor (
        private readonly meetingService: MeetingService,
        private readonly meetingManager: MeetingManager
    ) {}

    async getAll (req: Request<{}, {}, {}, ReqQueryFilterMeetings>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // const meetings = await this.meetingService.getAll();
            if (req.user?._id) {
                const meetings = await this.meetingManager.getAll(req.user._id, req.query.answered, req.query.period);
                return res.status(200).json(meetings);
            } else throw createHttpError.Unauthorized('Please, log in!');
        } catch (err: unknown) {
            next(err);
        }
    }

    async create (req: Request<{}, {}, MeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingDto Class
        const meetingDto = plainToClass(MeetingDto, req.body, { excludeExtraneousValues: true });

        try {
            const userId = req.user?._id;
            if (!userId) {
                throw createHttpError.Unauthorized('You must log in to create a meeting!');
            }
            // Validate MeetingDto
            await validateRequestBody(meetingDto);
            meetingDto.creator = userId;
            const createdMeeting = await this.meetingManager.create(meetingDto);
            return res.status(201).json(createdMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    async getById (req: Request<PathParamMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            const meeting = await this.meetingService.findById(id);
            return res.status(200).json(meeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    async updateById (req: Request<PathParamMeetingDto, {}, MeetingUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingDto Class
        const meetingUpdateDto = plainToClass(MeetingUpdateDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            await validateRequestBody(meetingUpdateDto);
            const updatedMeeting = await this.meetingManager.update(id, meetingUpdateDto);
            return res.status(200).json(updatedMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }

    async deleteById (req: Request<PathParamMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Validate request params ID
            const id = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            const deletedMeeting = await this.meetingManager.delete(id);
            return res.status(200).json(deletedMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const meetingController = new MeetingController(meetingService, meetingManager);
