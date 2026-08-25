import { ApiProperty } from '@nestjs/swagger';

export class TimelineItemDto {
  @ApiProperty({ description: '年份', example: '2026' })
  year: string;

  @ApiProperty({ description: '标题', example: '前端工程师' })
  title: string;

  @ApiProperty({ description: '公司/场景', example: '某公司' })
  companyOrContext: string;

  @ApiProperty({ description: '描述' })
  description: string;

  @ApiProperty({ description: '图标名', example: 'Briefcase' })
  icon: string;
}
