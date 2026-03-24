import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getStats() {
    const [userCount, propertyCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count(),
    ]);

    return {
      users: userCount,
      properties: propertyCount,
      message: 'PropertyHub API is running!',
    };
  }
}
