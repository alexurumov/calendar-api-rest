import { MeetingDto } from '../dtos/meeting.dto';
import { Answered } from '../types/enums';
import { type Creator } from './Creator.sub-entity';

export class UserMeeting implements Pick<Creator, 'answered'> {
    meetingId!: string;
    answered: Answered = Answered.PENDING;
}

export class UserMeetingFull extends MeetingDto {
    answered!: Answered;
}
