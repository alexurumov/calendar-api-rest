import { type Creator, MeetingDto } from '../dtos/meeting.dto';
import { Answered } from '../types/enums';

export class UserMeeting implements Pick<Creator, 'answered'> {
    meetingId!: string;
    answered: Answered = Answered.PENDING;
}

export class UserMeetingFull extends MeetingDto {
    answered!: Answered;
}
