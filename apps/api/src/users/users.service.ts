import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        company: true,
        license: true,
        verified: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        company: true,
        license: true,
        verified: true,
        emailVerified: true,
      },
    });

    return user;
  }

  async getPublicProfile(handle: string, query: any = {}) {
    const isUuid = /^[0-9a-f-]{36}$/.test(handle);
    const user = await this.prisma.user.findFirst({
      where: isUuid ? { id: handle } : { username: handle },
      select: {
        id: true, name: true, username: true, avatar: true, bio: true,
        company: true, license: true, verified: true, phone: true, email: true,
        createdAt: true, _count: { select: { properties: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const { page = 1, limit = 12, propertyType, listingType, sort = 'rank' } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: user.id, status: 'ACTIVE', moderationStatus: 'APPROVED' };
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;

    const orderBy: any =
      sort === 'price_asc'  ? [{ price: 'asc' }] :
      sort === 'price_desc' ? [{ price: 'desc' }] :
      sort === 'newest'     ? [{ createdAt: 'desc' }] :
      [{ featured: 'desc' }, { rankScore: 'desc' }];

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where, orderBy, skip, take: Number(limit),
        include: { images: { where: { isPrimary: true }, take: 1 } },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      user,
      properties,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    };
  }

  async getDashboardStats(userId: string) {
    const [propertyCount, receivedLeads, favorites, viewsAgg, receivedFavorites] = await Promise.all([
      this.prisma.property.count({ where: { userId, status: 'ACTIVE' } }),
      this.prisma.lead.count({ where: { property: { userId } } }),
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.property.aggregate({
        where: { userId },
        _sum: { viewsCount: true },
      }),
      this.prisma.favorite.count({ where: { property: { userId } } }),
    ]);

    return {
      properties: propertyCount,
      leads: receivedLeads,
      favorites,
      views: viewsAgg._sum.viewsCount ?? 0,
      receivedFavorites,
    };
  }
}
