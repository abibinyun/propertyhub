import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../properties/ranking.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('PackagesService (TDD)', () => {
  let service: PackagesService;
  let prisma: any;
  let rankingService: any;

  beforeEach(async () => {
    prisma = {
      siteSettings: { findUnique: jest.fn() },
      adPackage: { findMany: jest.fn(), findUnique: jest.fn() },
      userSubscription: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      property: {
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      propertyBumpLog: { create: jest.fn() },
      $transaction: jest.fn(async (cbOrArr) => {
        if (Array.isArray(cbOrArr)) return Promise.all(cbOrArr);
        return cbOrArr(prisma);
      }),
    };

    rankingService = {
      updatePropertyRanking: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        { provide: PrismaService, useValue: prisma },
        { provide: RankingService, useValue: rankingService },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  describe('Listing Quota Verification', () => {
    it('should allow free listing when user has fewer listings than freeListingQuota', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue({ freeListingQuota: 3 });
      prisma.property.count.mockResolvedValue(1); // User only has 1 property

      const quotaAllowed = await service.checkAndDeductListingQuota('user-1');
      expect(quotaAllowed.isFree).toBe(true);
      expect(prisma.userSubscription.update).not.toHaveBeenCalled();
    });

    it('should deduct quota from active subscription when free quota is exceeded', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue({ freeListingQuota: 3 });
      prisma.property.count.mockResolvedValue(3); // Free limit reached

      prisma.userSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        listingQuotaRemaining: 10,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 1000000),
      });

      const quotaAllowed = await service.checkAndDeductListingQuota('user-1');
      expect(quotaAllowed.isFree).toBe(false);
      expect(prisma.userSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: { listingQuotaRemaining: { decrement: 1 } },
        }),
      );
    });

    it('should throw ForbiddenException when free quota exceeded and no active subscription', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue({ freeListingQuota: 3 });
      prisma.property.count.mockResolvedValue(5);
      prisma.userSubscription.findFirst.mockResolvedValue(null); // No subscription

      await expect(service.checkAndDeductListingQuota('user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Sundul / Bump Listing Logic (Pilar 3)', () => {
    it('should enforce cooldown if property was bumped recently', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue({ bumpCooldownHours: 6 });
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-1',
        lastBoostedAt: new Date(Date.now() - 1 * 3600 * 1000), // Only 1 hour ago
        status: 'ACTIVE',
        deletedAt: null,
      });

      await expect(service.bumpProperty('user-1', 'prop-1')).rejects.toThrow(BadRequestException);
    });

    it('should deduct bump quota, update lastBoostedAt, and trigger ranking update on valid bump', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue({ bumpCooldownHours: 6 });
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        userId: 'user-1',
        lastBoostedAt: new Date(Date.now() - 10 * 3600 * 1000), // 10 hours ago (outside cooldown)
        status: 'ACTIVE',
        deletedAt: null,
      });

      prisma.userSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-1',
        bumpQuotaRemaining: 5,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 1000000),
      });

      const result = await service.bumpProperty('user-1', 'prop-1');

      expect(prisma.userSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: { bumpQuotaRemaining: { decrement: 1 } },
        }),
      );
      expect(prisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prop-1' },
          data: expect.objectContaining({ freshnessScore: 100 }),
        }),
      );
      expect(rankingService.updatePropertyRanking).toHaveBeenCalledWith('prop-1');
      expect(result.message).toContain('berhasil disundul');
    });
  });
});
