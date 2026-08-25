import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @ApiProperty({ description: '留言 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '昵称', example: '小明' })
  @Column()
  author: string;

  @ApiPropertyOptional({ description: '头像 URL' })
  @Column({ type: 'text', nullable: true })
  avatar?: string | null;

  @ApiProperty({ description: '留言内容' })
  @Column()
  content: string;

  @ApiProperty({ description: '发布日期（YYYY-MM-DD）' })
  @Column()
  date: string;

  @ApiProperty({ description: '点赞数', default: 0 })
  @Column({ default: 0 })
  likes: number;
}
