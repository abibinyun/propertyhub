import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHealth() {
    const start = performance.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;
      const mem = process.memoryUsage();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
        checks: {
          database: { status: 'up', latencyMs },
          memory: {
            heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
            rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
          },
        },
      };
    } catch (err: unknown) {
      throw new ServiceUnavailableException({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: 'down',
            error: err instanceof Error ? err.message : 'Database ping failure',
          },
        },
      });
    }
  }

  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (err: unknown) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        error:
          err instanceof Error ? err.message : 'Database readiness failure',
      });
    }
  }

  async getStats() {
    const [userCount, propertyCount, leadCount, agentCount] = await Promise.all(
      [
        this.prisma.user.count(),
        this.prisma.property.count({
          where: { status: 'ACTIVE', moderationStatus: 'APPROVED' },
        }),
        this.prisma.lead.count(),
        this.prisma.user.count({
          where: { properties: { some: { status: 'ACTIVE' } } },
        }),
      ],
    );
    return {
      users: userCount,
      properties: propertyCount,
      leads: leadCount,
      agents: agentCount,
    };
  }
}
