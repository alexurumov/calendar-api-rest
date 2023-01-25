import { type NextFunction, type Request, type Response } from 'express';
import { type MeetingRoomService, meetingService } from '../services/meeting-room.service';
import {
    MeetingRoomDto,
    MeetingRoomUpdateDto,
    type PathParamMeetingDto,
    type ReqQueryMeetingDto
} from '../dtos/meeting-room.dto';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../utils/validate-request.util';
import createHttpError from 'http-errors';

export class MeetingControllerController {
    constructor (private readonly meetingService: MeetingRoomService) {
    }

    async getAll (req: Request<{}, {}, {}, ReqQueryMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const dto: ReqQueryMeetingDto = req.query;
            const meetings = await this.meetingService.getAll(dto);
            return res.status(200).json(meetings);
        } catch (err: unknown) {
            next(err);
        }
    }

    async create (req: Request<{}, {}, MeetingRoomDto>, res: Response, next: NextFunction): Promise<Response | void> {
    // Transform request body to MeetingRoomDto Class
        const meetingDto = plainToClass(MeetingRoomDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate MeetingRoomDto
            await validateRequestBody(meetingDto);
            const created = await this.meetingService.create(meetingDto);
            return res.status(201).json(created);
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

    async updateById (req: Request<PathParamMeetingDto, {}, MeetingRoomUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingRoomDto Class
        const meetingDto = plainToClass(MeetingRoomUpdateDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            await validateRequestBody(meetingDto);
            const updated = await this.meetingService.update(id, meetingDto);
            return res.status(200).json(updated);
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
            const deleted = await this.meetingService.delete(id);
            return res.status(200).json(deleted);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const meetingController = new MeetingControllerController(meetingService);
