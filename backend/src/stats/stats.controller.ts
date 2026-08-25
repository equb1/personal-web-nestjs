import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PostStats } from './post-stats.entity';
import { StatsActionDto } from './stats-action.dto';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post('views')
  @HttpCode(200)
  @ApiOperation({ summary: '浏览量 +1' })
  @ApiBody({ type: StatsActionDto })
  @ApiOkResponse({ description: '返回该内容累计增量', type: PostStats })
  incrementViews(@Body() dto: StatsActionDto): Promise<PostStats> {
    return this.statsService.incrementViews(dto.postId);
  }

  @Post('likes')
  @HttpCode(200)
  @ApiOperation({ summary: '点赞 +1' })
  @ApiBody({ type: StatsActionDto })
  @ApiCreatedResponse({ description: '返回该内容累计增量', type: PostStats })
  incrementLikes(@Body() dto: StatsActionDto): Promise<PostStats> {
    return this.statsService.incrementLikes(dto.postId);
  }
}
