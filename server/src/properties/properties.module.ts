import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { RankingService } from './ranking.service';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService, RankingService],
  exports: [PropertiesService, RankingService],
})
export class PropertiesModule {}
