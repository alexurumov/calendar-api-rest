import {Request, Response} from "express";
import {MeetingService, meetingService} from "../services/meeting.service";
import {MeetingDto, PathParamMeetingDto, ReqQueryMeetingDto} from "../dtos/meeting.dto";

export class MeetingController {
    constructor(private meetingService: MeetingService) {
    }

    async getAll(req: Request<{}, {}, {}, ReqQueryMeetingDto>, res: Response) {
        const dto: ReqQueryMeetingDto = req.query;
        const meetings = await this.meetingService.getAll(dto)
        res.status(200).json(meetings);
    }

    async create(req: Request<{}, {}, MeetingDto>, res: Response) {
        try {
            const created = await this.meetingService.create(req.body);
            res.status(201).json(created);
        } catch (err: any) {
            res.status(401).json(err.message);
        }
    }

    async getById(req: Request<PathParamMeetingDto>, res: Response) {
        const id: string = req.params._id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('Meeting ID missing!')
        }
        const meeting = await this.meetingService.findById(id);
        if (!meeting) {
            // TODO: HTTP ERRORS!
            res.status(404).json('No such meeting found');
        }
        res.status(200).json(meeting);
    }

    async updateById(req: Request<PathParamMeetingDto, {}, Partial<MeetingDto>>, res: Response) {
        const id: string = req.params._id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('Meeting ID missing! ')
        }
        const dto = req.body;
        const updated = await this.meetingService.update(id, dto);
        if (!updated) {
            res.status(404).json('No such meeting found');
        }
        res.status(200).json(updated);
    }

    async deleteById(req: Request<PathParamMeetingDto>, res: Response) {
        const id = req.params._id.trim();
        if (!id) {
            // TODO: HTTP ERRORS!
            res.status(400).json('ID missing! ')
        }
        const deleted = await this.meetingService.delete(id);
        if (!deleted) {
            res.status(404).json('No such meeting found!');
        } else {
            res.status(200).json(deleted);
        }
    }
}

export const meetingController = new MeetingController(meetingService);