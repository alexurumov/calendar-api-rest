import { createMap, createMapper, typeConverter } from '@automapper/core';
import { classes } from '@automapper/classes';
import { Types } from 'mongoose';
import { MeetingRoomEntity } from '../entities/meeting-room.entity';
import { MeetingRoomDto } from '../dtos/meeting-room.dto';

const mapper = createMapper({ strategyInitializer: classes() });

createMap(
    mapper,
    MeetingRoomEntity,
    MeetingRoomDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString())
);
createMap(
    mapper,
    MeetingRoomDto,
    MeetingRoomEntity
);

export const toMeetingRoomDto = (e: MeetingRoomEntity): MeetingRoomDto => mapper.map(e, MeetingRoomEntity, MeetingRoomDto);
export const toMeetingRoomEntity = (d: MeetingRoomDto): MeetingRoomEntity => mapper.map(d, MeetingRoomDto, MeetingRoomEntity);
