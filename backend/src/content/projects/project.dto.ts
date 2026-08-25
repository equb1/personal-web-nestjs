import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectDto {
  @ApiProperty({ description: '唯一 ID', example: 'personal-web' })
  id: string;

  @ApiProperty({ description: '项目名称' })
  title: string;

  @ApiProperty({ description: '项目描述' })
  description: string;

  @ApiProperty({ description: '标签', type: [String] })
  tags: string[];

  @ApiPropertyOptional({ description: 'GitHub 链接' })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @ApiPropertyOptional({ description: '图标名', example: 'Code' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Star 数' })
  @IsInt()
  stars: number;
}

export class ProjectsResultDto {
  @ApiProperty({ description: '项目列表', type: [ProjectDto] })
  projects: ProjectDto[];
}
