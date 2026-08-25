import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Difficulty, PostType } from '../enums';

export class PostsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '按文章类型过滤', enum: PostType })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional({ description: '按分类精确过滤', example: '手撕代码' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '关键词模糊匹配 title/summary/tags/content',
    example: 'Promise',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class QuizOptionDto {
  @ApiProperty({ description: '选项 ID（如 a/b/c/d）', example: 'a' })
  id: string;

  @ApiProperty({ description: '选项文本' })
  text: string;

  @ApiProperty({ description: '是否为正确答案（每题有且仅有 1 个为 true）' })
  @IsBoolean()
  isCorrect: boolean;
}

export class QuizItemDto {
  @ApiProperty({ description: '题目 ID（同一文章内唯一）', example: 'q1' })
  id: string;

  @ApiProperty({ description: '题干（Markdown，可含代码块）' })
  question: string;

  @ApiProperty({ description: '选项数组', type: [QuizOptionDto] })
  @IsArray()
  options: QuizOptionDto[];

  @ApiProperty({ description: '考点剖析解析（Markdown）' })
  explanation: string;

  @ApiProperty({ description: '难度', enum: Difficulty })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiPropertyOptional({ description: '题目标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class TestCaseDto {
  @ApiProperty({ description: '用例 ID', example: 't1' })
  id: string;

  @ApiProperty({ description: '用例名称/描述' })
  name: string;

  @ApiProperty({ description: '测试执行代码片段' })
  code: string;

  @ApiProperty({ description: '期望输出（字符串化比较）' })
  expectedOutput: string;
}

export class LanguageTemplateDto {
  @ApiProperty({ description: '语言标识', example: 'javascript' })
  language: string;

  @ApiProperty({ description: '界面显示名', example: 'TypeScript (v5.7)' })
  label: string;

  @ApiProperty({ description: '文件扩展名', example: 'js' })
  extension: string;

  @ApiProperty({ description: '该语言的初始代码' })
  starterCode: string;

  @ApiProperty({ description: '该语言的参考答案' })
  solutionCode: string;
}

export class CodingChallengeDto {
  @ApiProperty({ description: '挑战 ID（唯一）', example: 'cc-promise-all' })
  id: string;

  @ApiProperty({ description: '挑战标题' })
  title: string;

  @ApiProperty({ description: '难度', enum: Difficulty })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({ description: '题目描述（Markdown）' })
  description: string;

  @ApiProperty({ description: '默认语言（JS）初始代码模板' })
  starterCode: string;

  @ApiProperty({ description: '默认语言（JS）参考答案' })
  solutionCode: string;

  @ApiProperty({ description: '测试用例（至少 1 个）', type: [TestCaseDto] })
  @IsArray()
  testCases: TestCaseDto[];

  @ApiPropertyOptional({ description: '解题提示', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hints?: string[];

  @ApiPropertyOptional({
    description: '各语言语法模板（不传则仅支持默认语言）',
    type: [LanguageTemplateDto],
  })
  @IsOptional()
  @IsArray()
  languageTemplates?: LanguageTemplateDto[];
}

export class PostDto {
  @ApiProperty({ description: '唯一 ID', example: 'react-hooks-study' })
  id: string;

  @ApiProperty({ description: '文章标题' })
  title: string;

  @ApiProperty({ description: '摘要（列表卡片展示）' })
  summary: string;

  @ApiProperty({ description: '分类', example: '手撕代码' })
  category: string;

  @ApiProperty({ description: '发布时间（YYYY-MM-DD）', example: '2026-08-10' })
  date: string;

  @ApiProperty({ description: '预计阅读时长', example: '15 分钟' })
  readTime: string;

  @ApiProperty({ description: '标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ description: '正文（Markdown 字符串）' })
  content: string;

  @ApiPropertyOptional({ description: '文章类型', enum: PostType })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional({
    description: '选择题集（type=quiz 时必填）',
    type: [QuizItemDto],
  })
  @IsOptional()
  @IsArray()
  quizzes?: QuizItemDto[];

  @ApiPropertyOptional({
    description: '代码沙箱挑战（type=coding 时必填）',
    type: CodingChallengeDto,
  })
  @IsOptional()
  codingChallenge?: CodingChallengeDto;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '阅读量（文件初始值 + DB 增量）' })
  @IsNumber()
  views: number;

  @ApiProperty({ description: '点赞数（文件初始值 + DB 增量）' })
  @IsNumber()
  likes: number;
}

export class PostListResultDto {
  @ApiProperty({
    description: '当前页数据（列表精简，省略 content/quizzes/codingChallenge）',
    type: [PostDto],
  })
  list: PostDto[];

  @ApiProperty({ description: '总条数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}
