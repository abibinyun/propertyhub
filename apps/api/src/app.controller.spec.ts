import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: { getStats: () => ({}) } }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return health status', () => {
    const result = appController.health();
    expect(result.status).toBe('ok');
  });
});
