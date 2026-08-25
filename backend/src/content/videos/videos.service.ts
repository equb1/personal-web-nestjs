import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { StatsService } from '../../stats/stats.service';
import { ContentReaderService } from '../content-reader.service';
import { VideoCategory } from '../enums';
import { VideoDto, VideosQueryDto } from './video.dto';

interface VideoFrontmatter {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
  date: string;
  views?: number;
}

@Injectable()
export class VideosService {
  constructor(
    private readonly reader: ContentReaderService,
    private readonly statsService: StatsService,
  ) {}

  async findAll(
    query: VideosQueryDto,
  ): Promise<VideoDto[] | PaginatedResult<VideoDto>> {
    const videos = await this.readVideos();
    let filtered = videos;
    if (query.category)
      filtered = filtered.filter((v) => v.category === query.category);
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      filtered = filtered.filter((v) =>
        [v.title, v.description].join(' ').toLowerCase().includes(kw),
      );
    }
    return paginate(filtered, query.page, query.pageSize);
  }

  async findOne(id: string): Promise<VideoDto> {
    const videos = await this.readVideos();
    const video = videos.find((v) => v.id === id);
    if (!video) throw new NotFoundException('资源不存在');
    return video;
  }

  private async readVideos(): Promise<VideoDto[]> {
    const ids = this.reader.listFileIds('videos');
    const deltas = await this.statsService.incrementMap(ids);
    return ids.map((id) => {
      const { data } = this.reader.readMarkdown<VideoFrontmatter>(
        `videos/${id}.md`,
      );
      const fm = data ?? ({} as VideoFrontmatter);
      const delta = deltas[id] ?? { views: 0, likes: 0 };
      return {
        id: fm.id ?? id,
        title: fm.title ?? '',
        description: fm.description ?? '',
        category: fm.category as VideoCategory,
        videoUrl: fm.videoUrl ?? '',
        posterUrl: fm.posterUrl ?? '',
        duration: fm.duration ?? '',
        date: fm.date ?? '',
        views: (fm.views ?? 0) + delta.views,
      };
    });
  }
}
