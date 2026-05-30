import { ConfigService } from '@nestjs/config';

export function getConfig(config: ConfigService) {
  return {
    bcryptRounds:                  config.get<number>('BCRYPT_ROUNDS', 10),
    jwtCookieMaxAge:               config.get<number>('JWT_COOKIE_MAX_AGE_DAYS', 7) * 24 * 60 * 60 * 1000,
    accessTokenExpirySeconds:      config.get<number>('ACCESS_TOKEN_EXPIRY_SECONDS', 900), // 15 menit
    refreshTokenExpiryDays:        config.get<number>('REFRESH_TOKEN_EXPIRY_DAYS', 7),
    verificationTokenExpiryHours:  config.get<number>('VERIFICATION_TOKEN_EXPIRY_HOURS', 24),
    verificationResendCooldownMin: config.get<number>('VERIFICATION_RESEND_COOLDOWN_MINUTES', 5),
    resetTokenExpiryHours:         config.get<number>('RESET_TOKEN_EXPIRY_HOURS', 1),
    leadDailyLimit:                config.get<number>('LEAD_DAILY_LIMIT', 10),
    imageMaxSizeBytes:             config.get<number>('IMAGE_MAX_SIZE_MB', 5) * 1024 * 1024,
    featuredPrices: {
      BASIC:    config.get<number>('FEATURED_PRICE_BASIC', 50000),
      PREMIUM:  config.get<number>('FEATURED_PRICE_PREMIUM', 100000),
      ULTIMATE: config.get<number>('FEATURED_PRICE_ULTIMATE', 200000),
    },
    featuredDurationDays: {
      BASIC:    config.get<number>('FEATURED_DURATION_BASIC_DAYS', 7),
      PREMIUM:  config.get<number>('FEATURED_DURATION_PREMIUM_DAYS', 7),
      ULTIMATE: config.get<number>('FEATURED_DURATION_ULTIMATE_DAYS', 30),
    },
  };
}
