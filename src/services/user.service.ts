import { type UserRepository, userRepository } from '../repositories/user.repository';
import { type ReqQueryUserDto, type UserDto, type UserRegisterDto, type UserUpdateDto } from '../dtos/user.dto';
import { toUserDto, toUserRegisterDto } from '../mappers/user.mapper';
import { toHash, verifyHash } from '../utils/bcrypt.util';
import createHttpError from 'http-errors';
import { type UserEntity } from '../entities/user.entity';
import { validateUpdateUser } from '../handlers/validate-user.handler';

export class UserService {
    constructor (private readonly userRepository: UserRepository) {}

    async register (dto: UserRegisterDto): Promise<UserDto> {
        const { username, password, confirmPassword } = dto;

        // Check if passwords match!
        if (password !== confirmPassword) {
            throw createHttpError.BadRequest('Passwords do not match!');
        }

        // Check if username is taken!
        const existing = await this.userRepository.findByUsername(username);
        if (existing) {
            throw createHttpError.BadRequest('Username already taken!');
        }

        dto.password = await toHash(password);
        const entity = await this.userRepository.create(dto);
        return toUserRegisterDto(entity);
    }

    async login (dto: UserDto): Promise<UserDto> {
        const { username, password } = dto;

        // Check if user with such username exists in DB
        const userEntity = await this.userRepository.findByUsername(username);
        if (!userEntity) {
            throw createHttpError.BadRequest('Invalid login credentials!');
        }

        // Check if passwords match
        const passMatch = await verifyHash(password, userEntity.password);
        if (!passMatch) {
            throw createHttpError.BadRequest('Invalid login credentials!');
        }
        return toUserDto(userEntity);
    }

    async getAll (dto: ReqQueryUserDto): Promise<UserDto[]> {
        const { company } = dto;
        let users: UserEntity[];
        if (company !== undefined) {
            users = await this.userRepository.findAllByCompany({ company });
        } else {
            users = await this.userRepository.findAll();
        }
        return users.map(toUserDto);
    }

    async update (id: string, userDto: UserUpdateDto): Promise<UserDto> {
        const [existing, all] = await Promise.all([this.userRepository.findById(id), this.userRepository.findAll()]);

        // Validate specific meeting requirements
        validateUpdateUser(existing, userDto, all);

        const updated = await this.userRepository.updateById(id, userDto);
        if (updated == null) {
            throw createHttpError.BadRequest('Invalid input!');
        }
        return toUserDto(updated);
    }

    async findByUsername (username: string): Promise<UserDto> {
        const found = await this.userRepository.findByUsername(username);
        if (!found) {
            throw createHttpError.NotFound('No such user found!');
        }
        return toUserDto(found);
    }

    async findById (id: string): Promise<UserDto> {
        const found = await this.userRepository.findById(id);
        if (!found) {
            throw createHttpError.NotFound('No such user found!');
        }
        return toUserDto(found);
    }
}

export const userService = new UserService(userRepository);
