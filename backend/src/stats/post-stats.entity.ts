import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_stats')
export class PostStats {
  @ApiProperty({ description: '统计 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '内容 ID（post 或 video）',
    example: 'react-hooks-study',
  })
  @Column({ unique: true })
  postId: string;

  @ApiProperty({ description: '浏览量累计增量', default: 0 })
  @Column({ default: 0 })
  views: number;

  @ApiProperty({ description: '点赞累计增量', default: 0 })
  @Column({ default: 0 })
  likes: number;
}
