import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedSearchesService {
  constructor(private prisma: PrismaService) {}

  getAll(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, name: string, url: string) {
    return this.prisma.savedSearch.create({ data: { userId, name, url } });
  }

  async delete(userId: string, id: string) {
    const s = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!s || s.userId !== userId) throw new NotFoundException();
    return this.prisma.savedSearch.delete({ where: { id } });
  }
}
