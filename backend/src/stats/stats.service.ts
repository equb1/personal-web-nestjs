import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PostStats } from './post-stats.entity';

export interface StatsDelta {
  views: number;
  likes: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(PostStats)
    private readonly repo: Repository<PostStats>,
  ) {}

  /** 批量取若干 postId 的累计增量（用于与文件初始 views/likes 合并） */
  async incrementMap(ids: string[]): Promise<Record<string, StatsDelta>> {
    if (ids.length === 0) return {};
    const rows = await this.repo.find({ where: { postId: In(ids) } });
    const map: Record<string, StatsDelta> = {};
    for (const row of rows) {
      map[row.postId] = { views: row.views, likes: row.likes };
    }
    return map;
  }

  async incrementViews(postId: string): Promise<PostStats> {
    return this.upsertIncrement(postId, 'views');
  }

  async incrementLikes(postId: string): Promise<PostStats> {
    return this.upsertIncrement(postId, 'likes');
  }

  private async upsertIncrement(
    postId: string,
    field: 'views' | 'likes',
  ): Promise<PostStats> {
    const existing = await this.repo.findOne({ where: { postId } });
    if (existing) {
      existing[field] += 1;
      return this.repo.save(existing);
    }
    const created = this.repo.create({
      postId,
      [field]: 1,
    } as Partial<PostStats>);
    return this.repo.save(created);
  }
}
