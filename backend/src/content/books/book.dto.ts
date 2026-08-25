import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { BookStatus } from '../enums';

export enum BookPageType {
  Cover = 'cover',
  Copyright = 'copyright',
  Content = 'content',
  Illustration = 'illustration',
  Notes = 'notes',
  BackCover = 'back-cover',
  PdfPage = 'pdf-page',
  CodePage = 'code-page',
  EpubSection = 'epub-section',
}

export class BookPageItemDto {
  @ApiProperty({ description: '页码，从 1 开始' })
  pageNumber: number;

  @ApiPropertyOptional({ description: '页面标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '章节名' })
  @IsOptional()
  @IsString()
  chapter?: string;

  @ApiProperty({ description: '页面类型', enum: BookPageType })
  @IsEnum(BookPageType)
  type: BookPageType;

  @ApiPropertyOptional({ description: '正文（Markdown 字符串）' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '格式', example: 'markdown' })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({ description: '图片 URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'PDF 影印原页号' })
  @IsOptional()
  @IsInt()
  pdfPageNumber?: number;

  @ApiPropertyOptional({ description: 'PDF 页源文件' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: '代码页语言' })
  @IsOptional()
  @IsString()
  codeLanguage?: string;

  @ApiPropertyOptional({ description: '代码内容' })
  @IsOptional()
  @IsString()
  codeSnippet?: string;

  @ApiPropertyOptional({ description: '引言/金句' })
  @IsOptional()
  @IsString()
  quote?: string;
}

export class BookTocItemDto {
  @ApiProperty({ description: '该章节在 bookPages 中的起始页码' })
  pageNumber: number;

  @ApiProperty({
    description: '章节/部分标题',
    example: '第 1 章　Java 8、9、10以及11的变化',
  })
  title: string;
}

export class BookDto {
  @ApiProperty({ description: '唯一 ID', example: 'design-psychology' })
  id: string;

  @ApiProperty({ description: '书名' })
  title: string;

  @ApiProperty({ description: '作者' })
  author: string;

  @ApiProperty({ description: '封面图 URL' })
  coverUrl: string;

  @ApiProperty({ description: '分类', example: '计算机' })
  category: string;

  @ApiProperty({ description: '评分（0–5 整数）' })
  @IsInt()
  rating: number;

  @ApiProperty({ description: '阅读状态', enum: BookStatus })
  @IsEnum(BookStatus)
  status: BookStatus;

  @ApiProperty({ description: '阅读进度 0–100' })
  @IsNumber()
  progress: number;

  @ApiProperty({ description: '简介' })
  summary: string;

  @ApiPropertyOptional({ description: '原文章节节选（Markdown）' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ description: '深度读书笔记（Markdown）' })
  @IsOptional()
  @IsString()
  thoughts?: string;

  @ApiProperty({ description: '标签', type: [String] })
  tags: string[];

  @ApiPropertyOptional({ description: '出版年份', example: '2024' })
  @IsOptional()
  @IsString()
  publishYear?: string;

  @ApiPropertyOptional({ description: '纸质页数' })
  @IsOptional()
  @IsInt()
  pages?: number;

  @ApiPropertyOptional({
    description: '3D 书脊渐变色（tailwind 类）',
    example: 'from-amber-600 to-orange-700',
  })
  @IsOptional()
  @IsString()
  spineColor?: string;

  @ApiPropertyOptional({
    description: '支持格式',
    type: [String],
    example: ['markdown', 'pdf'],
  })
  @IsOptional()
  formats?: string[];

  @ApiPropertyOptional({ description: '真实 PDF 文件链接' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: '真实 EPUB 文件链接' })
  @IsOptional()
  @IsString()
  epubUrl?: string;

  @ApiPropertyOptional({
    description: '阅读器渲染页（不传则前端自动生成 8 页默认结构）',
    type: [BookPageItemDto],
  })
  @IsOptional()
  bookPages?: BookPageItemDto[];

  @ApiPropertyOptional({
    description: '目录（章节 → 起始页码），可用于前端导航',
    type: [BookTocItemDto],
  })
  @IsOptional()
  toc?: BookTocItemDto[];
}

export class BooksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '按阅读状态过滤', enum: BookStatus })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @ApiPropertyOptional({ description: '按分类过滤', example: '计算机' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '关键词模糊匹配 title/author/tags',
    example: 'CSS',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class BookListResultDto {
  @ApiProperty({ description: '当前页数据', type: [BookDto] })
  list: BookDto[];

  @ApiProperty({ description: '总条数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}
