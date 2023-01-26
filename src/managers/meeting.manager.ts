import { type NextFunction, type Request, type Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validateRequestBody } from '../utils/validate-request.util';
import createHttpError from 'http-errors';
import { meetingService, type MeetingService } from '../services/meeting.service';
import { type MeetingDto, MeetingUpdateDto, type PathParamMeetingDto } from '../dtos/meeting.dto';

export class MeetingManager {
    constructor (private readonly meetingService: MeetingService) {}

    async create (meetingDto: MeetingDto): Promise<Response | void> {
        // Transform DTO
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
}

export const meetingManager = new MeetingManager(meetingService);
