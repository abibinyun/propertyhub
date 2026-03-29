import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { getConfig } from '../common/config';
import { Prisma } from '@prisma/client';

export interface LeadQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const PROPERTY_SELECT = {
  title: true,
  slug: true,
  city: true,
  district: true,
};

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  async create(userId: string, dto: CreateLeadDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');

    // Cegah kirim ke properti milik sendiri
    if (property.userId === userId) {
      throw new ConflictException('Tidak dapat mengirim lead ke properti sendiri');
    }

    // Cek duplikat: user sudah pernah kirim lead ke properti ini dalam 24 jam
    const recentDuplicate = await this.prisma.lead.findFirst({
      where: {
        userId,
        propertyId: dto.propertyId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentDuplicate) {
      throw new ConflictException('Anda sudah mengirim pesan ke properti ini dalam 24 jam terakhir');
    }

    // Cek daily limit
    const dailyLimit = getConfig(this.configService).leadDailyLimit;
    const todayCount = await this.prisma.lead.count({
      where: {
        userId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    if (todayCount >= dailyLimit) {
      throw new HttpException(`Batas pengiriman pesan harian (${dailyLimit}) telah tercapai`, HttpStatus.TOO_MANY_REQUESTS);
    }

    const lead = await this.prisma.lead.create({
      data: {
        propertyId: dto.propertyId,
        userId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        source: dto.source || 'website',
      },
      include: { property: { select: { ...PROPERTY_SELECT, userId: true } } },
    });

    await this.prisma.property.update({
      where: { id: dto.propertyId },
      data: { leadsCount: { increment: 1 } },
    });

    // Email notification ke pemilik properti
    const owner = await this.prisma.user.findUnique({
      where: { id: (lead.property as any).userId },
      select: { email: true, name: true },
    });
    if (owner) {
      await this.emailService.sendLeadNotificationEmail(owner.email, owner.name, lead.property.title, {
        name: lead.name, phone: lead.phone, email: lead.email, message: lead.message,
      });
      this.notificationsService.create(
        (lead.property as any).userId,
        'lead_received',
        'Pesan baru masuk',
        `${lead.name} mengirim pesan untuk "${lead.property.title}"`,
        '/dashboard/leads',
      ).catch(() => {});
    }

    return lead;
  }

  private buildPaginated(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.lead.count({
      where: { property: { userId }, status: 'NEW' },
    });
    return { count };
  }

  async findReceivedLeads(userId: string, query: LeadQuery = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, query.limit || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      property: { userId },
      ...(query.status && { status: query.status as any }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
          { message: { contains: query.search, mode: 'insensitive' } },
          { property: { title: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: { property: { select: PROPERTY_SELECT } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, meta: this.buildPaginated(total, page, limit) };
  }

  async findMyLeads(userId: string, query: LeadQuery = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, query.limit || 10);
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      userId,
      ...(query.status && { status: query.status as any }),
      ...(query.search && {
        OR: [
          { message: { contains: query.search, mode: 'insensitive' } },
          { property: { title: { contains: query.search, mode: 'insensitive' } } },
          { property: { city: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: { property: { select: PROPERTY_SELECT } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, meta: this.buildPaginated(total, page, limit) };
  }

  async findPropertyLeads(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.userId !== userId) throw new NotFoundException('Property not found');

    return this.prisma.lead.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(userId: string, leadId: string, status: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { property: true },
    });

    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.property.userId !== userId) throw new NotFoundException('Lead not found');

    return this.prisma.lead.update({
      where: { id: leadId },
      data: { status: status as any },
    });
  }
}
