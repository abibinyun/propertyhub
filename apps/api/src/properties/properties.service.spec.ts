import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RankingService } from './ranking.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';

describe('PropertiesService (TDD)', () => {
  let service: PropertiesService;
  let prisma: any;
  let rankingService: any;

  beforeEach(async () => {
    prisma = {
      property: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      propertyView: { create: jest.fn() },
      $queryRaw: jest.fn(),
      $queryRawUnsafe: jest.fn(),
    };

    rankingService = {
      updatePropertyRanking: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: RankingService, useValue: rankingService },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn(), deleteImage: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  describe('findAll Radius Search (SQL Parameterization & Safety)', () => {
    it('should NOT use $queryRawUnsafe and must execute parameterized $queryRaw', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([
        { id: 'p1', title: 'Rumah Radius 1', distance_km: 2.5 },
      ]).mockResolvedValueOnce([{ count: BigInt(1) }]);

      const result = await service.findAll({
        lat: '-6.2088',
        lng: '106.8456',
        radius: '10',
        page: 1,
        limit: 10,
        propertyType: 'HOUSE' as any,
        listingType: 'SALE' as any,
        minPrice: 500000000,
        maxPrice: 2000000000,
      });

      // Must NOT use vulnerable unsafe string query
      expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
      // Must use parameterized $queryRaw
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should clamp radiusKm to maximum 100km to avoid full-table radius scans', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([{ count: BigInt(0) }]);

      await service.findAll({
        lat: '-6.2088',
        lng: '106.8456',
        radius: '999999', // maliciously huge radius
        page: 1,
        limit: 10,
      });

      expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('delete Property (Soft Delete & Audit Protection)', () => {
    it('should soft delete by setting status INACTIVE and deletedAt timestamp instead of hard deleting', async () => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        slug: 'rumah-bagus-1',
        userId: 'user-1',
        status: 'ACTIVE',
        deletedAt: null,
      });

      const result = await service.delete('user-1', 'rumah-bagus-1');

      expect(prisma.property.delete).not.toHaveBeenCalled();
      expect(prisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'rumah-bagus-1' },
          data: expect.objectContaining({
            status: 'INACTIVE',
            deletedAt: expect.any(Date),
          }),
        }),
      );
      expect(result).toEqual({ message: 'Property deleted successfully' });
    });

    it('should reject delete if user is not the owner', async () => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        slug: 'rumah-bagus-1',
        userId: 'user-owner',
      });

      await expect(service.delete('user-stranger', 'rumah-bagus-1')).rejects.toThrow();
      expect(prisma.property.update).not.toHaveBeenCalled();
      expect(prisma.property.delete).not.toHaveBeenCalled();
    });
  });

  describe('findOne (Decoupled View Telemetry)', () => {
    it('should not increment view if viewer is the property owner', async () => {
      prisma.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        slug: 'rumah-bagus-1',
        userId: 'user-owner',
        deletedAt: null,
      });

      const result = await service.findOne('rumah-bagus-1', 'user-owner');

      expect(result.id).toBe('prop-1');
      expect(prisma.propertyView.create).not.toHaveBeenCalled();
      expect(prisma.property.update).not.toHaveBeenCalled();
    });
  });
});
