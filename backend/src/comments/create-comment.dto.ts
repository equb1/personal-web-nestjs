import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '昵称', example: '小明' })
  @IsString()
  @Length(1, 50)
  author: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiProperty({ description: '留言内容', example: '写得很棒，学到了！' })
  @IsString()
  @Length(1, 500)
  content: string;
}
