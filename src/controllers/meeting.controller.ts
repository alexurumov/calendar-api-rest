import { type NextFunction, type Request, type Response } from 'express';
import { plainToClass } from 'class-transformer';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { PathParamMeetingDto } from '../dtos/meeting.dto';
import { validateDto } from '../handlers/validate-request.handler';
import { handleRequestAndValidate } from '../handlers/handleRequestAndValidate'

export class MeetingController {
    constructor (
        private readonly meetingService: MeetingService
    ) {}

    getAll = handleRequestAndValidate(null, this.meetingService.getAll);
    async getById (req: Request<PathParamMeetingDto>, res: Response, next: NextFunction): Promise<Response | void> {
        // Transform req.params to object
        const pathParamMeetingDto = plainToClass(PathParamMeetingDto, req.params);
        try {
            // Validate request params object
            await validateDto(pathParamMeetingDto);
            const meeting = await this.meetingService.findById(pathParamMeetingDto.id);
            return res.status(200).json(meeting);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export const meetingController = new MeetingController(meetingService);
