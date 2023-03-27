import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigMangerService } from 'src/infrastructure/config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(config: ConfigMangerService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  validate<T>(payload: T) {
    return payload;
  }
}
