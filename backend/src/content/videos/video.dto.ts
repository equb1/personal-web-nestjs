import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { VideoCategory } from '../enums';

export class VideoDto {
  @ApiProperty({ description: '唯一 ID', example: 'v1' })
  id: string;

  @ApiProperty({ description: '视频标题' })
  title: string;

  @ApiProperty({ description: '简介（卡片展示）' })
  description: string;

  @ApiProperty({ description: '分类', enum: VideoCategory })
  @IsEnum(VideoCategory)
  category: VideoCategory;

  @ApiProperty({ description: '真实视频文件 URL（mp4/webm/mov 直链）' })
  videoUrl: string;

  @ApiProperty({ description: '视频封面/海报图 URL' })
  posterUrl: string;

  @ApiProperty({ description: '时长（MM:SS 字符串）', example: '0:15' })
  duration: string;

  @ApiProperty({ description: '发布日期（YYYY-MM-DD）', example: '2026-08-10' })
  date: string;

  @ApiProperty({ description: '播放量（文件初始值 + DB 增量）' })
  @IsNumber()
  views: number;
}

export class VideosQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '按分类过滤', enum: VideoCategory })
  @IsOptional()
  @IsEnum(VideoCategory)
  category?: VideoCategory;

  @ApiPropertyOptional({
    description: '关键词模糊匹配 title/description',
    example: '航拍',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class VideoListResultDto {
  @ApiProperty({ description: '当前页数据', type: [VideoDto] })
  list: VideoDto[];

  @ApiProperty({ description: '总条数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}
