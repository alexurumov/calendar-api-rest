import {UserRepository, userRepository} from "../repositories/user.repository";
import {UserDto} from "../dtos/user.dto";
import {toUserDto} from "../mappers/user.mapper";
import {toHash, verifyHash} from "../utils/bcrypt.util";

export class UserService {
    constructor(private userRepository: UserRepository) {
    }

    // async getAll(dto: ReqQueryUserDto): Promise<UserDto[]> {
    //     const {username} = dto;
    //     let users: UserEntity[];
    //     if (username) {
    //         users = await this.userRepository.findAllByUsername({username});
    //     } else {
    //         users = await this.userRepository.findAll();
    //     }
    //     return users.map(toUserDto);
    // }
    //
    // async create(dto: UserDto): Promise<UserDto> {
    //     dto.password = await toHash(dto.password);
    //     // Only for testing purposes! Move to Manager layer!
    //     // const test = await this.testRepository.create({name: "userTest2", message: "test for User!"});
    //     // if (!dto.tests) {
    //     //     dto.tests = new Array<TestDto>;
    //     // }
    //     // dto.tests.push(toTestDto(test));
    //     const entity = await this.userRepository.create(dto);
    //     return toUserDto(entity);
    // }
    //
    // async findById(id: string): Promise<UserDto> {
    //     const users = await this.userRepository.findById(id);
    //     return toUserDto(users);
    // }
    //
    // async update(id: string, dto: Partial<UserDto>): Promise<UserDto> {
    //     return toUserDto(await this.userRepository.updateById(id, dto));
    // }
    //
    // async delete(id: string): Promise<UserDto | null> {
    //     const deleted = await this.userRepository.delete(id);
    //     if (!deleted) {
    //         return null
    //     }
    //     return toUserDto(deleted);
    // }

    async register(dto: UserDto): Promise<UserDto> {
        const {username, password, confirmPassword} = dto;

        if (!username || !password || !confirmPassword || !username.trim() || !password.trim() || !confirmPassword?.trim()) {
            //TODO: HTTP ERRORS
            throw new Error('Invalid input');
        }
        if (password !== confirmPassword) {
            //TODO: HTTP ERRORS
            throw new Error('Passwords do not match!');
        }
        dto.password = await toHash(password);
        const entity = await this.userRepository.create(dto);
        return toUserDto(entity);
    }

    async login(dto: UserDto): Promise<UserDto> {
        const {username, password} = dto;
        if (!username || !password || !username.trim() || !password.trim()) {
            //TODO: HTTP ERRORS
            throw new Error('Invalid input');
        }
        const userEntity = await this.userRepository.findByUsername(username);
        if (!userEntity) {
            //TODO: HTTP ERRORS
            throw new Error('Invalid login credentials!');
        }

        const passMatch = await verifyHash(password, userEntity.password);
        if (!passMatch) {
            //TODO: HTTP ERRORS
            throw new Error('Invalid login credentials!');
        }
        return toUserDto(userEntity);
    }
}

export const userService = new UserService(userRepository);