import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { VideoDto, VideoListResultDto, VideosQueryDto } from './video.dto';
import { VideosService } from './videos.service';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({
    summary: '兴趣视频列表',
    description:
      '支持 ?page&pageSize 分页（data 为 { list,total,page,pageSize }）；默认返回数组。支持 category/keyword 过滤。',
  })
  @ApiOkResponse({
    type: VideoListResultDto,
    description:
      '统一信封 { code:0, message:"ok", data }；data 为 VideoListResultDto（分页时）或 VideoDto[]（未分页时）',
  })
  findAll(
    @Query() query: VideosQueryDto,
  ): Promise<VideoDto[] | PaginatedResult<VideoDto>> {
    return this.videosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '视频详情', description: '返回单个 HobbyVideo' })
  @ApiParam({ name: 'id', description: '视频 ID', example: 'v1' })
  @ApiOkResponse({
    type: VideoDto,
    description: '统一信封 { code:0, message:"ok", data }；data 为 VideoDto',
  })
  findOne(@Param('id') id: string): Promise<VideoDto> {
    return this.videosService.findOne(id);
  }
}
