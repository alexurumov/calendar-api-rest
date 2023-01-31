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
import { Creator, MeetingDto, MeetingUpdateDto, Participant } from '../dtos/meeting.dto';

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
    forMember(
        (dto) => dto.creator,
        mapFrom((entity) => entity.creator.username)
    ),
    forMember(
        (dto) => dto.participants,
        mapFrom((entity) => entity.participants ? entity.participants.map((p) => p.username) : undefined)
    )
);
createMap(
    mapper,
    MeetingDto,
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
export const toMeetingEntity = (d: MeetingDto): MeetingEntity => mapper.map(d, MeetingDto, MeetingEntity);
export const toMeetingEntityUpdate = (d: MeetingUpdateDto): MeetingEntity => mapper.map(d, MeetingUpdateDto, MeetingEntity);
