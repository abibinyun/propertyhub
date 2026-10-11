import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('AppController (TDD SRE & Health Probes)', () => {
  let appController: AppController;
  let appService: any;

  beforeEach(async () => {
    appService = {
      getStats: jest.fn().mockResolvedValue({ users: 10, properties: 50 }),
      getHealth: jest.fn(),
      getReadiness: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /health (Liveness Probe)', () => {
    it('should return healthy status with database ping and memory metrics', async () => {
      appService.getHealth.mockResolvedValue({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: 120,
        checks: {
          database: { status: 'up', latencyMs: 2.5 },
          memory: { heapUsedMb: 50, rssMb: 100 },
        },
      });

      const result = await appController.health();
      expect(result.status).toBe('healthy');
      expect(result.checks.database.status).toBe('up');
      expect(result.checks.database.latencyMs).toBeDefined();
    });

    it('should throw ServiceUnavailableException if database ping fails', async () => {
      appService.getHealth.mockRejectedValue(
        new ServiceUnavailableException('Database ping timeout'),
      );

      await expect(appController.health()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('GET /health/ready (Readiness Probe)', () => {
    it('should return ready status when all backing services are connected', async () => {
      appService.getReadiness.mockResolvedValue({ status: 'ready' });

      const result = await appController.readiness();
      expect(result.status).toBe('ready');
    });
  });
});
