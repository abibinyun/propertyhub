import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${config.get<string>('APP_URL', 'http://localhost:3001')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { emails, displayName, photos } = profile;
    done(null, {
      email: emails[0].value,
      name: displayName,
      avatar: photos?.[0]?.value ?? null,
    });
  }
}
