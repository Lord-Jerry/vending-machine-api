import { IsIn, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class CreateUserDto extends LoginUserDto {
  @IsString()
  @IsIn(['SELLER', 'BUYER'])
  type: 'SELLER' | 'BUYER';
}

export class DepositUserDto {
  @IsIn([5, 10, 20, 50, 100])
  amount: number;
}
