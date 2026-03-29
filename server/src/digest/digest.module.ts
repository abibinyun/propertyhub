import { Module } from '@nestjs/common';
import { DigestService } from './digest.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule, PropertiesModule],
  providers: [DigestService],
})
export class DigestModule {}
