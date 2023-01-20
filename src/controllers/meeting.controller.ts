import {Request, Response} from "express";
import {MeetingService, meetingService} from "../services/meeting.service";
import {MeetingDto, PathParamMeetingDto, ReqQueryMeetingDto} from "../dtos/meeting.dto";
import {plainToClass} from "class-transformer";
import {validateRequestBody} from "../utils/validate-request.util";

export class MeetingController {
    constructor(private meetingService: MeetingService) {
    }

    async getAll(req: Request<{}, {}, {}, ReqQueryMeetingDto>, res: Response): Promise<void> {
        const dto: ReqQueryMeetingDto = req.query;
        const meetings = await this.meetingService.getAll(dto)
        res.status(200).json(meetings);
        return;
    }

    async create(req: Request<{}, {}, MeetingDto>, res: Response): Promise<void> {
        // Tranform request body to MeeetingDto Class
        const meetingDto = plainToClass(MeetingDto, req.body, {excludeExtraneousValues: true});

        // Validate MeetingDto
        if (!await validateRequestBody(meetingDto, res)) {
            return;
        }

        try {
            const created = await this.meetingService.create(meetingDto);
            res.status(201).json(created);
            return;
        } catch (err: any) {
            res.status(401).json(err.message);
            return;
        }
    }

    async getById(req: Request<PathParamMeetingDto>, res: Response): Promise<void> {
        const id: string = req.params._id.trim();
        if (!id) {
            res.status(400).json('Meeting ID missing!');
            return;
        }
        const meeting = await this.meetingService.findById(id);
        if (!meeting) {
            res.status(404).json('No such meeting found');
            return;
        }
        res.status(200).json(meeting);
        return;
    }

    async updateById(req: Request<PathParamMeetingDto, {}, Partial<MeetingDto>>, res: Response): Promise<void> {
        const id: string = req.params._id.trim();
        if (!id) {
            res.status(400).json('Meeting ID missing! ');
            return;
        }
        const meetingDto = plainToClass(MeetingDto, req.body, {excludeExtraneousValues: true});
        try {
            const updated = await this.meetingService.update(id, meetingDto);
            res.status(200).json(updated);
            return;
        } catch (err: any) {
            res.status(401).json(err.message);
            return;
        }
    }

    async deleteById(req: Request<PathParamMeetingDto>, res: Response): Promise<void> {
        const id = req.params._id.trim();
        if (!id) {
            res.status(400).json('ID missing! ');
            return;
        }
        const deleted = await this.meetingService.delete(id);
        if (!deleted) {
            res.status(404).json('No such meeting found!');
            return;
        } else {
            res.status(200).json(deleted);
            return;
        }
    }
}

export const meetingController = new MeetingController(meetingService);