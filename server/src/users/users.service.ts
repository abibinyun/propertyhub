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
      },
    });

    return user;
  }

  async getStats(userId: string) {
    const [propertyCount, leadCount] = await Promise.all([
      this.prisma.property.count({ where: { userId } }),
      this.prisma.lead.count({ where: { userId } }),
    ]);

    return {
      properties: propertyCount,
      leads: leadCount,
    };
  }
}
