import { createMap, createMapper, forMember, mapFrom, typeConverter } from '@automapper/core';
import { classes } from '@automapper/classes';
import { Types } from 'mongoose';
import { MeetingDto } from '../dtos/meeting.dto';
import { UserMeetingFull } from '../sub-entities/sub-entities';

const mapper = createMapper({ strategyInitializer: classes() });

createMap(
    mapper,
    MeetingDto,
    UserMeetingFull,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((userMeeting) => userMeeting.creator,
        mapFrom((meeting) => meeting.creator)),
    forMember((userMeeting) => userMeeting.participants,
        mapFrom((meeting) => meeting.participants))
);

export const toUserMeetingFull = (m: MeetingDto): UserMeetingFull => mapper.map(m, MeetingDto, UserMeetingFull);
