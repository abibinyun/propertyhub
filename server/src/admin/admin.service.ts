import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Users Management
  async getAllUsers(query: any) {
    const { role, verified, page = 1, limit = 20 } = query;
    const where: any = {};

    if (role) where.role = role;
    if (verified !== undefined) where.verified = verified === 'true';

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
    const { status, userId, page = 1, limit = 20 } = query;
    const where: any = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;

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
    const [
      totalUsers,
      totalProperties,
      totalLeads,
      activeProperties,
      draftProperties,
      featuredProperties,
      recentUsers,
      recentProperties,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count(),
      this.prisma.lead.count(),
      this.prisma.property.count({ where: { status: 'ACTIVE' } }),
      this.prisma.property.count({ where: { status: 'DRAFT' } }),
      this.prisma.property.count({ where: { featured: true } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
          city: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalProperties,
        totalLeads,
        activeProperties,
        draftProperties,
        featuredProperties,
      },
      recentUsers,
      recentProperties,
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
        data: {
          propertyId,
          moderatorId,
          action: 'REJECTED',
          reason,
          notes,
        },
      }),
    ]);

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
        data: {
          propertyId,
          moderatorId,
          action: 'FLAGGED',
          reason,
          notes,
        },
      }),
    ]);

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

  async banUser(userId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Deactivate all user's properties
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { verified: false },
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
