import { Answered } from '../types/enums';
import { type UserDto } from '../dtos/user.dto';

export class Creator implements Pick<UserDto, 'username'> {
    username!: string;
    answered: Answered = Answered.YES;
}
