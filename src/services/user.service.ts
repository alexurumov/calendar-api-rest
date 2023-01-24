import { type UserRepository, userRepository } from '../repositories/user.repository'
import { type UserDto, type UserLoginDto, type UserRegisterDto } from '../dtos/user.dto'
import { toUserDto } from '../mappers/user.mapper'
import { toHash, verifyHash } from '../utils/bcrypt.util'
import createHttpError from 'http-errors'

export class UserService {
  constructor (private readonly userRepository: UserRepository) {
  }

  async register (dto: UserRegisterDto): Promise<UserDto> {
    const { username, password, confirmPassword } = dto

    // Check if passwords match!
    if (password !== confirmPassword) {
      throw createHttpError.BadRequest('Passwords do not match!')
    }

    // Check if username is taken!
    const existing = await this.userRepository.findByUsername(username)
    if (existing) {
      throw createHttpError.BadRequest('Username already taken!')
    }

    dto.password = await toHash(password)
    const entity = await this.userRepository.create(dto)
    return toUserDto(entity)
  }

  async login (dto: UserLoginDto): Promise<UserDto> {
    const { username, password } = dto

    // Check if user with such username exists in DB
    const userEntity = await this.userRepository.findByUsername(username)
    if (!userEntity) {
      throw createHttpError.BadRequest('Invalid login credentials!')
    }

    // Check if passwords match
    const passMatch = await verifyHash(password, userEntity.password)
    if (!passMatch) {
      throw createHttpError.BadRequest('Invalid login credentials!')
    }
    return toUserDto(userEntity)
  }
}

export const userService = new UserService(userRepository)
