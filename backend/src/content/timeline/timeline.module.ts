import { Module } from '@nestjs/common';
import { ContentModule } from '../content.module';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [ContentModule],
  controllers: [TimelineController],
  providers: [TimelineService],
})
export class TimelineModule {}
