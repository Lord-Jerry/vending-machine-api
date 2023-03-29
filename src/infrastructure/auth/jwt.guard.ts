import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Injectable, ExecutionContext } from '@nestjs/common';

export interface IRequestUser {
  user: {
    role: string;
    userId: string;
    username: string;
  };
}

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt-access-token') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
