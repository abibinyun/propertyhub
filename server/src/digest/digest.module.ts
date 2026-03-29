import { Module } from '@nestjs/common';
import { DigestService } from './digest.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [DigestService],
})
export class DigestModule {}
