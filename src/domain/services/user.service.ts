import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { UserRepository } from 'src/infrastructure/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  public async create(
    username: string,
    password: string,
    type: 'SELLER' | 'BUYER',
  ) {
    await this.findByUsernameOrFail(username);

    const hashedPassword = await argon2.hash(password);
    return this.userRepository.create({
      username,
      role: type,
      deposit: 0,
      password: hashedPassword,
    });
  }

  public async login(username: string, password: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new UnauthorizedException('invalid username or password');

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid)
      throw new UnauthorizedException('invalid username or password');

    return this.jwtService.sign({
      role: user.role,
      userId: user.id,
      username: user.username,
    });
  }

  public async deposit(userId: string, amount: number) {
    await this.findByUserIdOrFail(userId);

    return this.userRepository.deposit(userId, amount);
  }

  public async resetDeposit(userId: string) {
    await this.findByUserIdOrFail(userId);

    return this.userRepository.resetDeposit(userId);
  }

  private async findByUsernameOrFail(username: string) {
    const user = await this.userRepository.findByUsername(username);
    if (user) throw new ConflictException('username already exists');

    return user;
  }

  private async findByUserIdOrFail(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('user not found');

    return user;
  }
}
