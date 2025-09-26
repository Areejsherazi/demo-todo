import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService, 
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || "secret",
    });

    console.log("_________",configService.get<string>('JWT_SECRET'));
  }

  async validate(payload: any) {
    console.log('🔑 JWT Payload received:', payload);

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      console.log('❌ No user found for ID:', payload.sub);
      return null;
    }

    console.log('✅ User validated:', { id: user._id.toString(), email: user.email });
    return { userId: payload.sub, email: payload.email };
  }
}
