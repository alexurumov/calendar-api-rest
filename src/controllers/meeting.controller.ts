import { type NextFunction, type Request, type Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../utils/validate-request.util';
import createHttpError from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { MeetingDto, MeetingUpdateDto, type PathParamMeetingDto, type ReqQueryMeetingDto } from '../dtos/meeting.dto';

export class MeetingController {
    constructor (private readonly meetingService: MeetingService) {
    }

    async getAll (req: Request<{}, {}, {}, ReqQueryMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const meetings = await this.meetingService.getAll();
            return res.status(200).json(meetings);
        } catch (err: unknown) {
            next(err);
        }
    }

    async create (req: Request<{}, {}, MeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingDto Class
        const meetingDto = plainToClass(MeetingDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate MeetingDto
            await validateRequestBody(meetingDto);
            const createdMeeting = await this.meetingService.create(meetingDto);
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
        const meetingDto = plainToClass(MeetingUpdateDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            await validateRequestBody(meetingDto);
            const updatedMeeting = await this.meetingService.update(id, meetingDto);
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
            const deletedMeeting = await this.meetingService.delete(id);
            return res.status(200).json(deletedMeeting);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const meetingController = new MeetingController(meetingService);
