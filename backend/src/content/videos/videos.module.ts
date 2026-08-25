import { Module } from '@nestjs/common';
import { ContentModule } from '../content.module';
import { StatsModule } from '../../stats/stats.module';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

@Module({
  imports: [ContentModule, StatsModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
