import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StatsActionDto {
  @ApiProperty({
    description: '内容 ID（post 或 video 的 id）',
    example: 'react-hooks-study',
  })
  @IsString()
  @IsNotEmpty()
  postId: string;
}
