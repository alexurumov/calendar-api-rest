import { type NextFunction, type Request, type Response } from 'express';
import { type MeetingRoomService, meetingRoomService } from '../services/meeting-room.service';
import { MeetingRoomDto, MeetingRoomUpdateDto, PathParamMeetingRoomDto } from '../dtos/meeting-room.dto';
import { plainToClass } from 'class-transformer';
import { validateDto } from '../handlers/validate-request.handler';

export class MeetingRoomController {
    constructor (private readonly meetingRoomService: MeetingRoomService) {
    }

    async getAll (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
            await validateDto(roomDto);
            const created = await this.meetingRoomService.create(roomDto);
            return res.status(201).json(created);
        } catch (err: unknown) {
            next(err);
        }
    }

    async getById (req: Request<PathParamMeetingRoomDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request params to Object
        const params = plainToClass(PathParamMeetingRoomDto, req.params);
        try {
            // Validate request params Object
            await validateDto(params);
            const room = await this.meetingRoomService.findById(params.id);
            return res.status(200).json(room);
        } catch (err: unknown) {
            next(err);
        }
    }

    async updateById (req: Request<PathParamMeetingRoomDto, {}, MeetingRoomUpdateDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request body to MeetingRoomDto Class
        const meetingDto = plainToClass(MeetingRoomUpdateDto, req.body, { excludeExtraneousValues: true });
        // Transform request params to Object
        const params = plainToClass(PathParamMeetingRoomDto, req.params);
        try {
            // Validate request params Object + MeetingDto
            await Promise.all([validateDto(params), validateDto(meetingDto)]);
            const updatedRoom = await this.meetingRoomService.update(params.id, meetingDto);
            return res.status(200).json(updatedRoom);
        } catch (err: unknown) {
            next(err);
        }
    }

    async deleteById (req: Request<PathParamMeetingRoomDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform request params to Object
        const params = plainToClass(PathParamMeetingRoomDto, req.params);
        try {
            // Validate request params Object
            await validateDto(params);
            const deletedRoom = await this.meetingRoomService.delete(params.id);
            return res.status(200).json(deletedRoom);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const meetingRoomController = new MeetingRoomController(meetingRoomService);
