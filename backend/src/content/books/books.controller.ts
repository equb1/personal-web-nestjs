import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { BookDto, BookListResultDto, BooksQueryDto } from './book.dto';
import { BooksService } from './books.service';

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
  findAll(@Query() query: BooksQueryDto): BookDto[] | PaginatedResult<BookDto> {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '书籍详情',
    description: '返回单个 Book（含 bookPages）',
  })
  @ApiParam({ name: 'id', description: '书籍 ID', example: 'b-101' })
  @ApiOkResponse({
    type: BookDto,
    description: '统一信封 { code:0, message:"ok", data }；data 为 BookDto',
  })
  findOne(@Param('id') id: string): BookDto {
    return this.booksService.findOne(id);
  }
}
