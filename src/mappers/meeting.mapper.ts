import {
    type Converter,
    convertUsing,
    createMap,
    createMapper,
    forMember,
    mapFrom,
    typeConverter
} from '@automapper/core';
import { classes } from '@automapper/classes';
import { Types } from 'mongoose';
import { MeetingEntity } from '../entities/meeting.entity';
import { MeetingCreateDto, MeetingDto, MeetingUpdateDto } from '../dtos/meeting.dto';
import { Creator } from '../sub-entities/Creator.sub-entity';
import { Participant } from '../sub-entities/Participant.sub-entity';

const mapper = createMapper({ strategyInitializer: classes() });

const creatorConverter: Converter<string, Object> = {
    convert (source: string): Object {
        const creator = new Creator();
        creator.username = source;
        return creator;
    }
};
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
    MeetingCreateDto,
    MeetingEntity,
    forMember(
        (entity) => entity.creator,
        convertUsing(creatorConverter, (dto) => dto.creator)
    ),
    forMember(
        (entity) => entity.participants,
        mapFrom((dto) => dto.participants
            ? dto.participants.map((part) => {
                const participant = new Participant();
                participant.username = part;
                return participant;
            })
            : undefined)
    )
);

createMap(
    mapper,
    MeetingUpdateDto,
    MeetingEntity,
    forMember(
        (entity) => entity.creator,
        convertUsing(creatorConverter, (dto) => dto.creator)
    ),
    forMember(
        (entity) => entity.participants,
        mapFrom((dto) => dto.participants
            ? dto.participants.map((part) => {
                const participant = new Participant();
                participant.username = part;
                return participant;
            })
            : undefined)
    )
);

export const toMeetingDto = (e: MeetingEntity): MeetingDto => mapper.map(e, MeetingEntity, MeetingDto);
export const toMeetingEntity = (d: MeetingCreateDto): MeetingEntity => mapper.map(d, MeetingCreateDto, MeetingEntity);
export const toMeetingEntityUpdate = (d: MeetingUpdateDto): MeetingEntity => mapper.map(d, MeetingUpdateDto, MeetingEntity);
