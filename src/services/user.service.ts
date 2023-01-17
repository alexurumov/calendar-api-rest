import {UserRepository, userRepository} from "../repositories/user.repository";
import {ReqQueryUserDto, UserDto} from "../dtos/user.dto";
import {TestDto} from "../dtos/base-test.dto";
import {toUserDto} from "../mappers/user.mapper";
import {UserEntity} from "../entities/user.entity";
import {toHash} from "../utils/bcrypt.util";
import {testRepository, TestRepository} from "../repositories/test.repository";
import {toTestDto} from "../mappers/test.mapper";

export class UserService {
    constructor(private userRepository: UserRepository, private testRepository: TestRepository) {
    }

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
        dto.password = await toHash(dto.password);
        // TODO: Only for testing purposes! Move to Manager layer!
        const test = await this.testRepository.create({name: "userTest2", message: "test for User!"});
        if (!dto.tests) {
            dto.tests = new Array<TestDto>;
        }
        dto.tests.push(toTestDto(test));
        return toUserDto(await this.userRepository.create(dto));
    }

    async findById(id: string): Promise<UserDto> {
        const users = await this.userRepository.findById(id);
        return toUserDto(users);
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

export const userService = new UserService(userRepository, testRepository);