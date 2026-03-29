import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    const [items, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return { items, unread };
  }

  async markRead(userId: string, id?: string) {
    if (id) {
      await this.prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
    } else {
      await this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    }
    return { ok: true };
  }

  async create(userId: string, type: string, title: string, body: string, url?: string) {
    return this.prisma.notification.create({ data: { userId, type, title, body, url } });
  }
}
