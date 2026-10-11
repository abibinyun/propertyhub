import { Module } from '@nestjs/common';
import { UsersController, UsersPublicController } from './users.controller';
import { UsersService } from './users.service';
import { VerificationService } from './verification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, NotificationsModule],
  controllers: [UsersController, UsersPublicController],
  providers: [UsersService, VerificationService],
  exports: [UsersService, VerificationService],
})
export class UsersModule {}
