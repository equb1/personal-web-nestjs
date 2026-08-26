import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { BookProgress } from './book-progress.entity';
import { BookDto, BookListResultDto, BooksQueryDto } from './book.dto';
import { BooksService } from './books.service';
import { UpdateBookProgressDto } from './update-book-progress.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({
    summary: '书籍列表',
    description:
      '支持 ?page&pageSize 分页（data 为 { list,total,page,pageSize }）；默认返回数组。支持 status/category/keyword 过滤。',
  })
  @ApiOkResponse({
    type: BookListResultDto,
    description:
      '统一信封 { code:0, message:"ok", data }；data 为 BookListResultDto（分页时）或 BookDto[]（未分页时）',
  })
  findAll(
    @Query() query: BooksQueryDto,
  ): Promise<BookDto[] | PaginatedResult<BookDto>> {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '书籍详情',
    description: '返回单个 Book（含 bookPages）',
  })
  @ApiParam({
    name: 'id',
    description: '书籍 ID',
    example: 'design-psychology',
  })
  @ApiOkResponse({
    type: BookDto,
    description: '统一信封 { code:0, message:"ok", data }；data 为 BookDto',
  })
  findOne(@Param('id') id: string): Promise<BookDto> {
    return this.booksService.findOne(id);
  }

  @Post(':id/progress')
  @HttpCode(200)
  @ApiOperation({
    summary: '上报阅读进度',
    description:
      '前端翻页/离开阅读器时上报，后端 upsert 到 SQLite；列表/详情接口返回时用 DB 实时值覆盖文件 frontmatter 的初始 progress。',
  })
  @ApiParam({
    name: 'id',
    description: '书籍 ID',
    example: 'java-in-action-2e',
  })
  @ApiBody({ type: UpdateBookProgressDto })
  @ApiOkResponse({
    type: BookProgress,
    description:
      '统一信封 { code:0, message:"ok", data }；data 为保存后的 BookProgress',
  })
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateBookProgressDto,
  ): Promise<BookProgress> {
    return this.booksService.updateProgress(id, dto);
  }
}
