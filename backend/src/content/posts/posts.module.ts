import { Module } from '@nestjs/common';
import { ContentModule } from '../content.module';
import { StatsModule } from '../../stats/stats.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [ContentModule, StatsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
