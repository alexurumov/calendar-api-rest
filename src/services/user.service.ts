import {UserRepository, userRepository} from "../repositories/user.repository";
import {ReqQueryUserDto, UserDto} from "../dtos/user.dto";
import {toUserDto} from "../mappers/user.mapper";
import {UserEntity} from "../entities/user.entity";

export class UserService {
    constructor(private userRepository: UserRepository) {}

    async getAll(dto: ReqQueryUserDto): Promise<UserDto[]> {
        const {username} = dto;
        let users: UserEntity[];
        if (username) {
            users = await this.userRepository.findAllByUsername({username});
        } else {
            users = await this.userRepository.findAll();
        }
        return users.map(toUserDto);
    }

    async create(dto: UserDto): Promise<UserDto> {
        return toUserDto(await this.userRepository.create(dto));
    }

    async findById(id: string): Promise<UserDto> {
        return toUserDto(await this.userRepository.findById(id));
    }

    async update(id: string, dto: Partial<UserDto>): Promise<UserDto> {
        return toUserDto(await this.userRepository.updateById(id, dto));
    }

    async delete(id: string): Promise<UserDto | null> {
        const deleted = await this.userRepository.delete(id);
        if (!deleted) {
            return null
        }
        return toUserDto(deleted);
    }
}

export const userService = new UserService(userRepository);