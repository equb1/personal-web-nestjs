import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('book_progress')
export class BookProgress {
  @ApiProperty({ description: '书籍 ID', example: 'java-in-action-2e' })
  @PrimaryColumn()
  bookId: string;

  @ApiProperty({ description: '阅读进度 0–100', example: 45 })
  @Column({ default: 0 })
  progress: number;

  @ApiProperty({ description: '最近阅读的 bookPages 页码', example: 38 })
  @Column({ type: 'integer', nullable: true })
  lastPage: number | null;

  @ApiProperty({ description: '最近上报时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
