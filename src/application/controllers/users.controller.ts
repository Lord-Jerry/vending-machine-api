import {
  Put,
  Post,
  Body,
  Request,
  Controller,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import { Roles } from 'src/infrastructure/auth/role.guard';
import { AuthGuard, IRequestUser } from 'src/infrastructure/auth/jwt.guard';

import {
  LoginUserDto,
  CreateUserDto,
  DepositUserDto,
} from 'src/application/dtos/user.dto';
import { UserService } from 'src/domain/services/user.service';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const token = await this.userService.login(
      loginUserDto.username,
      loginUserDto.password,
    );

    return {
      token,
    };
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    await this.userService.create(
      createUserDto.username,
      createUserDto.password,
      createUserDto.type,
    );

    return {
      message: 'user created',
    };
  }

  @UseGuards(AuthGuard)
  @Roles('buyer')
  @Post('deposit')
  async deposit(
    @Request() req: IRequestUser,
    @Body() depositUserDto: DepositUserDto,
  ) {
    await this.userService.deposit(req.user.userId, depositUserDto.amount);

    return {
      message: 'deposit success',
    };
  }

  @UseGuards(AuthGuard)
  @Roles('buyer')
  @Put('reset-deposit')
  async resetDeposit(@Request() req: IRequestUser) {
    await this.userService.resetDeposit(req.user.userId);

    return {
      message: 'reset deposit success',
    };
  }
}
