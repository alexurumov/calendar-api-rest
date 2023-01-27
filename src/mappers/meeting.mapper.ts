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
import { MeetingDto, Participant } from '../dtos/meeting.dto';

const mapper = createMapper({ strategyInitializer: classes() });

const participantsConverter: Converter<string[], Object[]> = {
    convert (source: string[]): Object[] {
        return source.map((username) => {
            const participant = new Participant();
            participant.username = username;
            return participant;
        });
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
        mapFrom((entity) => entity.participants !== undefined ? entity.participants.map((p) => p.username) : [])
    )
);
createMap(
    mapper,
    MeetingDto,
    MeetingEntity,
    forMember(
        (entity) => entity.participants,
        convertUsing(participantsConverter, (dto) => dto.participants)
    )
);

export const toMeetingDto = (e: MeetingEntity): MeetingDto => mapper.map(e, MeetingEntity, MeetingDto);
export const toMeetingEntity = (d: MeetingDto): MeetingEntity => mapper.map(d, MeetingDto, MeetingEntity);
