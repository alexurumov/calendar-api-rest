import createHttpError from 'http-errors';
import { type UserEntity } from '../entities/user.entity';
import { type UserUpdateDto } from '../dtos/user.dto';

export function validateUpdateUser (existing: UserEntity | null, dto: UserUpdateDto, all: UserEntity[]): void {
    // Does user exist?
    if (!existing) {
        throw createHttpError.NotFound('No such User found!');
    }

    // Is username unique?
    if (dto.username) {
        // Exclude current user from check
        const filtered = all.filter(u => u.username !== existing.username);
        // Check if there is a user with the same username
        if (filtered.some(u => u.username === dto.username)) {
            throw createHttpError.Conflict('Username is already taken!');
        }
    }
}
