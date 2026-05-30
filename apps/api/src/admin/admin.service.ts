import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Users Management
  async getAllUsers(query: any) {
    const { role, verified, search, page = 1, limit = 20 } = query;
    const where: any = {};

    if (role) where.role = role;
    if (verified !== undefined) where.verified = verified === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          verified: true,
          company: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
              leads: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUser(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verified: true,
      },
    });
  }

  // Properties Management
  async getAllProperties(query: any) {
    const { status, userId, search, page = 1, limit = 20 } = query;
    const where: any = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePropertyStatus(propertyId: string, status: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) throw new NotFoundException('Property not found');

    return this.prisma.property.update({
      where: { id: propertyId },
      data: { status: status as any },
    });
  }

  async deleteProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) throw new NotFoundException('Property not found');

    await this.prisma.property.delete({ where: { id: propertyId } });
    return { message: 'Property deleted successfully' };
  }

  // Dashboard Stats
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      totalProperties,
      totalLeads,
      activeProperties,
      draftProperties,
      pendingModeration,
      newUsersToday,
      newLeadsToday,
      recentUsers,
      recentProperties,
      propertiesByType,
      propertiesByCity,
      dailyListings,
      dailyLeads,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count(),
      this.prisma.lead.count(),
      this.prisma.property.count({ where: { status: 'ACTIVE' } }),
      this.prisma.property.count({ where: { status: 'DRAFT' } }),
      this.prisma.property.count({ where: { moderationStatus: 'PENDING' } }),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, emailVerified: true },
      }),
      this.prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, status: true, price: true, city: true, createdAt: true,
          user: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      // Distribusi per tipe
      this.prisma.property.groupBy({
        by: ['propertyType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      // Top 8 kota
      this.prisma.property.groupBy({
        by: ['city'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
      // Listing per hari 30 hari terakhir
      this.prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
        FROM properties
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      // Leads per hari 30 hari terakhir
      this.prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt")::text as date, COUNT(*)::bigint as count
        FROM leads
        WHERE "createdAt" >= ${sevenDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    return {
      stats: {
        totalUsers, totalProperties, totalLeads, activeProperties,
        draftProperties, pendingModeration, newUsersToday, newLeadsToday,
      },
      recentUsers,
      recentProperties,
      charts: {
        propertiesByType: propertiesByType.map((p) => ({ type: p.propertyType, count: p._count.id })),
        propertiesByCity: propertiesByCity.map((p) => ({ city: p.city, count: p._count.id })),
        dailyListings: dailyListings.map((d) => ({ date: d.date, count: Number(d.count) })),
        dailyLeads: dailyLeads.map((d) => ({ date: d.date, count: Number(d.count) })),
      },
    };
  }

  // Moderation System
  async getModerationQueue(query: any) {
    const { status = 'PENDING', page = 1, limit = 20 } = query;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { moderationStatus: status },
        include: {
          user: { select: { id: true, name: true, email: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { images: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
      this.prisma.property.count({ where: { moderationStatus: status } }),
    ]);

    return {
      data: properties,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveProperty(propertyId: string, moderatorId: string, notes?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    await this.prisma.$transaction([
      this.prisma.property.update({
        where: { id: propertyId },
        data: {
          moderationStatus: 'APPROVED',
          status: 'ACTIVE',
          moderatedBy: moderatorId,
          moderatedAt: new Date(),
          moderationNotes: notes,
        },
      }),
      this.prisma.moderationLog.create({
        data: {
          propertyId,
          moderatorId,
          action: 'APPROVED',
          notes,
        },
      }),
    ]);

    this.notifications.create(
      property.userId, 'property_approved',
      'Listing disetujui ✅',
      `"${property.title}" telah disetujui dan sekarang aktif`,
      `/dashboard/properties`,
    ).catch(() => {});

    return { message: 'Property approved' };
  }

  async rejectProperty(propertyId: string, moderatorId: string, reason: string, notes?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    await this.prisma.$transaction([
      this.prisma.property.update({
        where: { id: propertyId },
        data: {
          moderationStatus: 'REJECTED',
          status: 'INACTIVE',
          moderatedBy: moderatorId,
          moderatedAt: new Date(),
          moderationNotes: notes,
          flagReason: reason,
        },
      }),
      this.prisma.moderationLog.create({
        data: { propertyId, moderatorId, action: 'REJECTED', reason, notes },
      }),
    ]);

    this.notifications.create(
      property.userId, 'property_rejected',
      'Listing ditolak ❌',
      `"${property.title}" ditolak: ${reason}`,
      `/dashboard/properties`,
    ).catch(() => {});

    return { message: 'Property rejected' };
  }

  async flagProperty(propertyId: string, moderatorId: string, reason: string, notes?: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    await this.prisma.$transaction([
      this.prisma.property.update({
        where: { id: propertyId },
        data: {
          moderationStatus: 'FLAGGED',
          moderatedBy: moderatorId,
          flagReason: reason,
          flaggedAt: new Date(),
          moderationNotes: notes,
        },
      }),
      this.prisma.moderationLog.create({
        data: { propertyId, moderatorId, action: 'FLAGGED', reason, notes },
      }),
    ]);

    this.notifications.create(
      property.userId, 'property_flagged',
      'Listing ditandai ⚠️',
      `"${property.title}" ditandai untuk ditinjau: ${reason}`,
      `/dashboard/properties`,
    ).catch(() => {});

    return { message: 'Property flagged' };
  }

  async getModerationLogs(query: any) {
    const { propertyId, moderatorId, page = 1, limit = 50 } = query;
    const where: any = {};

    if (propertyId) where.propertyId = propertyId;
    if (moderatorId) where.moderatorId = moderatorId;

    const [logs, total] = await Promise.all([
      this.prisma.moderationLog.findMany({
        where,
        include: {
          property: { select: { title: true, slug: true } },
          moderator: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
      this.prisma.moderationLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllLeads(query: any) {
    const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'LOST'];
    const { status, page = 1, limit = 20 } = query;
    const where: any = {};
    if (status && VALID_STATUSES.includes(status)) where.status = status;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          property: { select: { title: true, slug: true, city: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    };
  }

  async banUser(userId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Deactivate all user's properties
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { isBanned: true, banReason: reason },
      }),
      this.prisma.property.updateMany({
        where: { userId },
        data: {
          status: 'INACTIVE',
          moderationStatus: 'REJECTED',
          flagReason: `User banned: ${reason}`,
        },
      }),
    ]);

    return { message: 'User banned and all properties deactivated' };
  }
}
