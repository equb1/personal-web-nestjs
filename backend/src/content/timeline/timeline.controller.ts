import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimelineItemDto } from './timeline-item.dto';
import { TimelineService } from './timeline.service';

@ApiTags('timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiOperation({
    summary: '时间线列表',
    description: '返回 TimelineItemDto[]（只读，来源于 content/timeline.json）',
  })
  @ApiOkResponse({
    type: TimelineItemDto,
    isArray: true,
    description:
      '统一信封 { code:0, message:"ok", data }；data 为 TimelineItemDto[]',
  })
  findAll(): TimelineItemDto[] {
    return this.timelineService.findAll();
  }
}
