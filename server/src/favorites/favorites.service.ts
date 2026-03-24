import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    if (existing) {
      throw new ConflictException('Property already in favorites');
    }

    return this.prisma.favorite.create({
      data: { userId, propertyId },
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });
  }

  async removeFavorite(userId: string, propertyId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    return { message: 'Removed from favorites' };
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            user: { select: { name: true, phone: true, company: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isFavorite(userId: string, propertyId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    return { isFavorite: !!favorite };
  }
}
