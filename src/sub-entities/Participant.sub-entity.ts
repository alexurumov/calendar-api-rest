import { Answered } from '../types/enums';
import { type UserDto } from '../dtos/user.dto';
import { AutoMap } from '@automapper/classes';

export class Participant implements Pick<UserDto, 'username'> {
    @AutoMap()
        username!: string;

    @AutoMap()
        answered: Answered = Answered.PENDING;
}
