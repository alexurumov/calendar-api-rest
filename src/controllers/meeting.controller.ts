import {NextFunction, Request, Response} from "express";
import {MeetingService, meetingService} from "../services/meeting.service";
import {MeetingDto, PathParamMeetingDto, ReqQueryMeetingDto} from "../dtos/meeting.dto";
import {plainToClass} from "class-transformer";
import {validateRequestBody} from "../utils/validate-request.util";
import createHttpError from "http-errors";

export class MeetingController {
    constructor(private meetingService: MeetingService) {
    }

    async getAll(req: Request<{}, {}, {}, ReqQueryMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const dto: ReqQueryMeetingDto = req.query;
            const meetings = await this.meetingService.getAll(dto)
            return res.status(200).json(meetings);
        } catch (err: unknown) {
            next(err);
        }
    }

    async create(req: Request<{}, {}, MeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Tranform request body to MeeetingDto Class
        const meetingDto = plainToClass(MeetingDto, req.body, {excludeExtraneousValues: true});

        try {
            // Validate MeetingDto
            await validateRequestBody(meetingDto);
            const created = await this.meetingService.create(meetingDto);
            return res.status(201).json(created);
        } catch (err: unknown) {
            next(err);
        }
    }

    async getById(req: Request<PathParamMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            const meeting = await this.meetingService.findById(id);
            return res.status(200).json(meeting);
        } catch (err: unknown) {
            next(err)
        }
    }

    async updateById(req: Request<PathParamMeetingDto, {}, Partial<MeetingDto>>, res: Response, next: NextFunction): Promise<Response | void> {
        // Tranform request body to MeeetingDto Class
        const meetingDto = plainToClass(MeetingDto, req.body, {excludeExtraneousValues: true});

        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            const updated = await this.meetingService.update(id, meetingDto);
            return res.status(200).json(updated);
        } catch (err: unknown) {
            next(err)
        }
    }

    async deleteById(req: Request<PathParamMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Validate request params ID
            const id = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            const deleted = await this.meetingService.delete(id);
            return res.status(200).json(deleted);
        } catch (err: unknown) {
            next(err)
        }
    }
}

export const meetingController = new MeetingController(meetingService);