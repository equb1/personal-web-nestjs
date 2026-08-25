import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { PostDto, PostListResultDto, PostsQueryDto } from './post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({
    summary: '学习文章列表',
    description:
      '支持 ?page&pageSize 分页（此时 data 为 { list,total,page,pageSize }）；默认返回数组。支持 type/category/keyword 过滤。列表精简省略 content/quizzes/codingChallenge。',
  })
  @ApiOkResponse({
    type: PostListResultDto,
    description:
      '统一信封 { code:0, message:"ok", data }；data 为 PostListResultDto（分页时）或 PostDto[]（未分页时）',
  })
  findAll(
    @Query() query: PostsQueryDto,
  ): Promise<PostDto[] | PaginatedResult<PostDto>> {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '文章详情',
    description: '返回单个 Post（含完整 quizzes / codingChallenge）',
  })
  @ApiParam({
    name: 'id',
    description: '文章 ID',
    example: 'react-hooks-study',
  })
  @ApiOkResponse({
    type: PostDto,
    description: '统一信封 { code:0, message:"ok", data }；data 为 PostDto',
  })
  findOne(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.findOne(id);
  }
}
