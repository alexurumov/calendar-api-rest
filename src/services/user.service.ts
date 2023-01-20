import {UserRepository, userRepository} from "../repositories/user.repository";
import {UserDto} from "../dtos/user.dto";
import {toUserDto} from "../mappers/user.mapper";
import {toHash, verifyHash} from "../utils/bcrypt.util";

export class UserService {
    constructor(private userRepository: UserRepository) {
    }

    async register(dto: UserDto): Promise<UserDto> {
        const {username, password, confirmPassword} = dto;

        if (!username || !password || !confirmPassword || !username.trim() || !password.trim() || !confirmPassword.trim()) {
            //TODO: HTTP ERRORS
            //TODO: Move validation to controller!
            throw new Error('Invalid user input');
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