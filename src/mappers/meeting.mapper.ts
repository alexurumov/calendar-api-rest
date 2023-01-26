import { createMap, createMapper, forMember, mapFrom, typeConverter } from '@automapper/core';
import { classes } from '@automapper/classes';
import { Types } from 'mongoose';
import { MeetingEntity } from '../entities/meeting.entity';
import { MeetingDto } from '../dtos/meeting.dto';

const mapper = createMapper({ strategyInitializer: classes() });

// TODO: Implement nested objects mapping

createMap(
    mapper,
    MeetingEntity,
    MeetingDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember(
        (dto) => dto.creator,
        mapFrom((entity) => entity.creator.username)
    )
);
createMap(
    mapper,
    MeetingDto,
    MeetingEntity,
    forMember(
        (entity) => entity.creator.username,
        mapFrom((dto) => dto.creator)
    )
);

export const toMeetingDto = (e: MeetingEntity): MeetingDto => mapper.map(e, MeetingEntity, MeetingDto);
export const toMeetingEntity = (d: MeetingDto): MeetingEntity => mapper.map(d, MeetingDto, MeetingEntity);
