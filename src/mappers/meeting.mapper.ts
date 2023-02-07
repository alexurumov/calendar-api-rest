import {
    createMap,
    createMapper,
    forMember, ignore,
    mapFrom,
    typeConverter
} from '@automapper/core';
import { classes } from '@automapper/classes';
import { Types } from 'mongoose';
import { MeetingEntity } from '../entities/meeting.entity';
import { MeetingCreateDto, MeetingDto, MeetingUpdateDto } from '../dtos/meeting.dto';
import { Participant } from '../sub-entities/Participant.sub-entity';

const mapper = createMapper({ strategyInitializer: classes() });

createMap(
    mapper,
    MeetingCreateDto,
    MeetingDto,
    forMember(
        (dto) => dto._id, ignore()
    ),
    forMember(
        (dto) => dto.participants,
        mapFrom((updateDto) => updateDto.participants?.map((part) => {
            const newPart = new Participant();
            newPart.username = part;
            return newPart;
        }))
    )
);

createMap(
    mapper,
    MeetingUpdateDto,
    MeetingDto,
    forMember(
        (dto) => dto._id, ignore()
    ),
    forMember(
        (dto) => dto.participants,
        mapFrom((updateDto) => updateDto.participants?.map((part) => {
            const newPart = new Participant();
            newPart.username = part;
            return newPart;
        }))
    )
);

createMap(
    mapper,
    MeetingEntity,
    MeetingDto,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((dto) => dto.creator,
        mapFrom((entity) => entity.creator)
    ),
    forMember((dto) => dto.participants,
        mapFrom((entity) => entity.participants)
    )
);

createMap(
    mapper,
    MeetingDto,
    MeetingEntity,
    typeConverter(Types.ObjectId, String, (objectId) => objectId.toString()),
    forMember((dto) => dto.creator,
        mapFrom((entity) => entity.creator)
    ),
    forMember((dto) => dto.participants,
        mapFrom((entity) => entity.participants)
    )
);

export const toMeetingDto = (e: MeetingEntity): MeetingDto => mapper.map(e, MeetingEntity, MeetingDto);
export const toMeetingEntity = (d: MeetingDto): MeetingEntity => mapper.map(d, MeetingDto, MeetingEntity);
export const fromCreateToMeetingDto = (d: MeetingCreateDto): MeetingDto => mapper.map(d, MeetingCreateDto, MeetingDto);
export const fromUpdateToMeetingDto = (d: MeetingUpdateDto): MeetingDto => mapper.map(d, MeetingUpdateDto, MeetingDto);
