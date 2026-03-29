import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, propertyId: string, reason: string, notes?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Properti tidak ditemukan');

    const existing = await this.prisma.report.findUnique({ where: { userId_propertyId: { userId, propertyId } } });
    if (existing) throw new ConflictException('Anda sudah melaporkan properti ini');

    return this.prisma.report.create({
      data: { userId, propertyId, reason, notes },
    });
  }

  async getAll(resolved?: boolean) {
    return this.prisma.report.findMany({
      where: resolved !== undefined ? { resolved } : {},
      include: {
        property: { select: { title: true, slug: true, city: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(reportId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Laporan tidak ditemukan');
    return this.prisma.report.update({ where: { id: reportId }, data: { resolved: true } });
  }
}
