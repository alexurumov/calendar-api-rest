import { type NextFunction, type Request, type Response } from 'express';
import { type MeetingRoomService, meetingRoomService } from '../services/meeting-room.service';
import {
    MeetingRoomDto,
    MeetingRoomUpdateDto,
    type PathParamMeetingRoomDto
} from '../dtos/meeting-room.dto';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../handlers/validate-request.handler';
import createHttpError from 'http-errors';

export class MeetingRoomController {
    constructor (private readonly meetingRoomService: MeetingRoomService) {
    }

    async getAll (req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const rooms = await this.meetingRoomService.getAll();
            return res.status(200).json(rooms);
        } catch (err: unknown) {
            next(err);
        }
    }

    async create (req: Request<{}, {}, MeetingRoomDto>, res: Response, next: NextFunction): Promise<Response | void> {
    // Transform request body to MeetingRoomDto Class
        const roomDto = plainToClass(MeetingRoomDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate MeetingRoomDto
            await validateRequestBody(roomDto);
            const created = await this.meetingRoomService.create(roomDto);
            return res.status(201).json(created);
        } catch (err: unknown) {
            next(err);
        }
    }

    async getById (req: Request<PathParamMeetingRoomDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            const room = await this.meetingRoomService.findById(id);
            return res.status(200).json(room);
        } catch (err: unknown) {
            next(err);
        }
    }

    async updateById (req: Request<PathParamMeetingRoomDto, {}, MeetingRoomUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingRoomDto Class
        const meetingDto = plainToClass(MeetingRoomUpdateDto, req.body, { excludeExtraneousValues: true });

        try {
            // Validate request params ID
            const id: string = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            await validateRequestBody(meetingDto);
            const updatedRoom = await this.meetingRoomService.update(id, meetingDto);
            return res.status(200).json(updatedRoom);
        } catch (err: unknown) {
            next(err);
        }
    }

    async deleteById (req: Request<PathParamMeetingRoomDto>, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Validate request params ID
            const id = req.params._id.trim();
            if (!id) {
                throw createHttpError.BadRequest('Meeting ID missing!');
            }
            const deletedRoom = await this.meetingRoomService.delete(id);
            return res.status(200).json(deletedRoom);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const meetingRoomController = new MeetingRoomController(meetingRoomService);
