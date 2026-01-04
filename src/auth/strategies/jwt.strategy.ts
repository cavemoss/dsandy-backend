import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/config/config.service';

import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    protected readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.admin.jwt.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    if (payload.isAdmin) {
      const tenant = await this.authService.getTenantByJWTPayload(payload);

      if (!tenant) {
        throw new HttpException('JWT Access Token Invalid', HttpStatus.UNAUTHORIZED);
      }

      return (req['tenant'] = tenant);
    }

    const customer = await this.authService.getCustomerByJWTPayload(payload);

    if (!customer) {
      throw new HttpException('JWT Access Token Invalid', HttpStatus.UNAUTHORIZED);
    }

    return (req['customer'] = customer);
  }
}
