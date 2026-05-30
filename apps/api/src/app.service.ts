import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [userCount, propertyCount, leadCount, agentCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count({ where: { status: 'ACTIVE', moderationStatus: 'APPROVED' } }),
      this.prisma.lead.count(),
      this.prisma.user.count({ where: { properties: { some: { status: 'ACTIVE' } } } }),
    ]);
    return { users: userCount, properties: propertyCount, leads: leadCount, agents: agentCount };
  }
}
