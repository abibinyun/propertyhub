import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { LeadsModule } from './leads/leads.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './email/email.module';
import { PaymentModule } from './payment/payment.module';
import { ReportsModule } from './reports/reports.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DigestModule } from './digest/digest.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },       // 10 req/detik
      { name: 'medium', ttl: 60000, limit: 100 },     // 100 req/menit
      { name: 'long', ttl: 3600000, limit: 500 },     // 500 req/jam
    ]),
    PrismaModule,
    CloudinaryModule,
    EmailModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    LeadsModule,
    FavoritesModule,
    AdminModule,
    PaymentModule,
    ReportsModule,
    SavedSearchesModule,
    NotificationsModule,
    ReviewsModule,
    DigestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // global rate limit
  ],
})
export class AppModule {}
