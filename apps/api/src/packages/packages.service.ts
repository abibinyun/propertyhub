import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../properties/ranking.service';

@Injectable()
export class PackagesService {
  constructor(
    private prisma: PrismaService,
    private rankingService: RankingService,
  ) {}

  async getAvailablePackages() {
    return this.prisma.adPackage.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async getUserActiveSubscription(userId: string) {
    return this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: { package: true },
    });
  }

  async checkAndDeductListingQuota(userId: string): Promise<{ isFree: boolean }> {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const freeQuota = settings?.freeListingQuota ?? 3;

    const userActiveCount = await this.prisma.property.count({
      where: { userId, status: 'ACTIVE', deletedAt: null },
    });

    if (userActiveCount < freeQuota) {
      return { isFree: true };
    }

    // Must have active subscription with remaining listing quota
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
        listingQuotaRemaining: { gt: 0 },
      },
    });

    if (!subscription) {
      throw new ForbiddenException(
        `Batas listing gratis telah tercapai (maks ${freeQuota}). Silakan beli Paket Iklan Agen untuk menambah listing.`,
      );
    }

    await this.prisma.userSubscription.update({
      where: { id: subscription.id },
      data: { listingQuotaRemaining: { decrement: 1 } },
    });

    return { isFree: false };
  }

  async bumpProperty(userId: string, propertyId: string): Promise<{ message: string }> {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.deletedAt) {
      throw new NotFoundException('Properti tidak ditemukan');
    }
    if (property.userId !== userId) {
      throw new ForbiddenException('Anda hanya dapat menyundul properti milik Anda sendiri');
    }

    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const cooldownHours = settings?.bumpCooldownHours ?? 6;

    if (property.lastBoostedAt) {
      const cooldownMs = cooldownHours * 3600 * 1000;
      const elapsedMs = Date.now() - new Date(property.lastBoostedAt).getTime();
      if (elapsedMs < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - elapsedMs) / (60 * 1000));
        throw new BadRequestException(
          `Listing baru saja disundul. Cooldown tersisa ${remainingMinutes} menit.`,
        );
      }
    }

    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
        bumpQuotaRemaining: { gt: 0 },
      },
    });

    if (!subscription) {
      throw new ForbiddenException(
        'Kuota sundul Anda sudah habis atau tidak memiliki paket aktif. Silakan beli paket sundul.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.userSubscription.update({
        where: { id: subscription.id },
        data: { bumpQuotaRemaining: { decrement: 1 } },
      }),
      this.prisma.property.update({
        where: { id: propertyId },
        data: {
          lastBoostedAt: new Date(),
          freshnessScore: 100,
        },
      }),
      this.prisma.propertyBumpLog.create({
        data: {
          propertyId,
          userId,
        },
      }),
    ]);

    await this.rankingService.updatePropertyRanking(propertyId);

    return { message: 'Listing properti berhasil disundul ke posisi teratas!' };
  }
}
