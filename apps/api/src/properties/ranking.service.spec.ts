import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RankingService (TDD)', () => {
  let service: RankingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      property: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RankingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<RankingService>(RankingService);
  });

  describe('Scoring Algorithms', () => {
    it('should calculate QualityScore correctly based on description, images, specs, coords, and video', () => {
      const fullProperty = {
        title: 'Rumah Mewah Pondok Indah 2 Lantai Siap Huni',
        description: 'a'.repeat(250), // >= 200 chars -> 20 pts
        images: Array(8).fill({}), // >= 5 -> 25 pts
        floorPlanUrl: 'http://example.com/plan.jpg',
        videoUrl: 'http://youtube.com/watch?v=123',
        postalCode: '12310',
        pricePerSqm: 15000000,
        bedrooms: 4,
        bathrooms: 3,
        landArea: 200,
        buildingArea: 180,
        certificateType: 'SHM',
        yearBuilt: 2022,
        furnishing: 'FULLY_FURNISHED',
        latitude: -6.2,
        longitude: 106.8,
        features: Array(6).fill({}),
      };

      const score = service.calculateQualityScore(fullProperty);
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('should decay FreshnessScore as days elapse', () => {
      const now = new Date();
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      expect(service.calculateFreshnessScore(now)).toBe(100);
      expect(service.calculateFreshnessScore(threeDaysAgo)).toBe(95);
      expect(Math.round(service.calculateFreshnessScore(twentyDaysAgo))).toBe(
        67,
      );
      expect(service.calculateFreshnessScore(sixtyDaysAgo)).toBe(25);
    });

    it('should apply higher boost multiplier for ULTIMATE tier (2.0x) vs BASIC tier (1.3x)', () => {
      const baseQuality = 80;
      const baseFreshness = 80;
      const baseEngagement = 50;
      const baseReputation = 70;

      const basicScore = service.calculateRankScore(
        baseQuality,
        baseFreshness,
        baseEngagement,
        baseReputation,
        true,
        'BASIC',
      );

      const ultimateScore = service.calculateRankScore(
        baseQuality,
        baseFreshness,
        baseEngagement,
        baseReputation,
        true,
        'ULTIMATE',
      );

      expect(ultimateScore).toBeGreaterThan(basicScore);
      expect(ultimateScore).toBeCloseTo(basicScore * (2.0 / 1.3), 0);
    });
  });

  describe('updateAllRankings (Batch Processing & Non-blocking Chunking)', () => {
    it('should process active properties in chunks without failing on individual errors', async () => {
      prisma.property.findMany.mockResolvedValue([
        { id: 'p1' },
        { id: 'p2' },
        { id: 'p3' },
      ]);

      prisma.property.findUnique.mockResolvedValue({
        id: 'p1',
        userId: 'u1',
        lastBoostedAt: new Date(),
        images: [],
        features: [],
        favorites: [],
      });

      prisma.property.aggregate.mockResolvedValue({
        _avg: { qualityScore: 50 },
        _count: 1,
      });

      await service.updateAllRankings();

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE', deletedAt: null }),
        }),
      );
      expect(prisma.property.update).toHaveBeenCalled();
    });
  });
});
