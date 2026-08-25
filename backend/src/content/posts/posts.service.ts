import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { ContentReaderService } from '../content-reader.service';
import { PostType } from '../enums';
import { PostDto, PostsQueryDto } from './post.dto';
import { StatsService } from '../../stats/stats.service';

interface PostFrontmatter {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
  type?: PostType;
  coverImage?: string;
  views?: number;
  likes?: number;
}

@Injectable()
export class PostsService {
  constructor(
    private readonly reader: ContentReaderService,
    private readonly statsService: StatsService,
  ) {}

  async findAll(
    query: PostsQueryDto,
  ): Promise<PostDto[] | PaginatedResult<PostDto>> {
    const posts = await this.readPosts(false);
    let filtered = posts;
    if (query.type) filtered = filtered.filter((p) => p.type === query.type);
    if (query.category)
      filtered = filtered.filter((p) => p.category === query.category);
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      filtered = filtered.filter((p) =>
        [p.title, p.summary, ...(p.tags ?? []), p.content]
          .join(' ')
          .toLowerCase()
          .includes(kw),
      );
    }
    return paginate(filtered, query.page, query.pageSize);
  }

  async findOne(id: string): Promise<PostDto> {
    const posts = await this.readPosts(true);
    const post = posts.find((p) => p.id === id);
    if (!post) throw new NotFoundException('资源不存在');
    return post;
  }

  /** 读取全部 post（full=false 省略大字段），并与 DB 增量合并 views/likes */
  private async readPosts(full: boolean): Promise<PostDto[]> {
    const ids = this.reader.listSubdirIds('posts');
    const deltas = await this.statsService.incrementMap(ids);
    const posts: PostDto[] = [];

    for (const id of ids) {
      const { data, body } = this.reader.readMarkdown<PostFrontmatter>(
        `posts/${id}/index.md`,
      );
      const fm = data ?? ({} as PostFrontmatter);
      const delta = deltas[id] ?? { views: 0, likes: 0 };
      const type = fm.type ?? PostType.Article;

      const post: PostDto = {
        id: fm.id ?? id,
        title: fm.title ?? '',
        summary: fm.summary ?? '',
        category: fm.category ?? '',
        date: fm.date ?? '',
        readTime: fm.readTime ?? '',
        tags: fm.tags ?? [],
        content: full ? body : '',
        type,
        views: (fm.views ?? 0) + delta.views,
        likes: (fm.likes ?? 0) + delta.likes,
      };
      if (fm.coverImage) post.coverImage = fm.coverImage;

      if (!full) {
        delete (post as Partial<PostDto>).content;
      }

      if (full) {
        if (
          type === PostType.Quiz &&
          this.reader.exists(`posts/${id}/quizzes.json`)
        ) {
          post.quizzes = this.reader.readJson(`posts/${id}/quizzes.json`);
        }
        if (
          type === PostType.Coding &&
          this.reader.exists(`posts/${id}/coding.json`)
        ) {
          post.codingChallenge = this.reader.readJson(
            `posts/${id}/coding.json`,
          );
        }
      }
      posts.push(post);
    }
    return posts;
  }
}
