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

    // const roles = this.reflector.get<string[]>('roles', context.getHandler());
    // if (!roles) {
    //   return true;
    // }

    // const request = context.switchToHttp().getRequest();
    // const user = request.user;
    // return roles.includes(user.role);

    return super.canActivate(context);
  }
}
