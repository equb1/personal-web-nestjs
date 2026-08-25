import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './create-comment.dto';

class CommentsQueryDto {
  @ApiPropertyOptional({
    description: '页码，从 1 开始',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({
    summary: '留言列表',
    description:
      '支持 ?page&pageSize 分页（data 为 { list,total,page,pageSize }）；默认返回数组（按最新在前）',
  })
  @ApiOkResponse({
    description:
      '统一信封 { code:0, message:"ok", data }；data 为 Comment[] 或分页结构',
    type: Comment,
    isArray: true,
  })
  findAll(
    @Query() query: CommentsQueryDto,
  ): Promise<Comment[] | PaginatedResult<Comment>> {
    return this.commentsService.findAll(query.page, query.pageSize);
  }

  @Post()
  @ApiOperation({
    summary: '提交留言',
    description:
      'DTO 校验：author 1-50 字符，content 1-500 字符，avatar 可选且为合法 URL',
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({
    description:
      '统一信封 { code:0, message:"ok", data }；data 为创建后的 Comment',
    type: Comment,
  })
  create(@Body() dto: CreateCommentDto): Promise<Comment> {
    return this.commentsService.create(dto);
  }
}
