import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { ContentReaderService } from '../content-reader.service';
import { BookProgress } from './book-progress.entity';
import {
  BookDto,
  BookPageItemDto,
  BookTocItemDto,
  BooksQueryDto,
} from './book.dto';
import { UpdateBookProgressDto } from './update-book-progress.dto';

interface BookFrontmatter {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  rating?: number;
  status?: string;
  progress?: number;
  summary: string;
  excerpt?: string;
  thoughts?: string;
  tags?: string[];
  publishYear?: string;
  pages?: number;
  spineColor?: string;
  formats?: string[];
  pdfUrl?: string;
  epubUrl?: string;
}

@Injectable()
export class BooksService {
  constructor(
    private readonly reader: ContentReaderService,
    @InjectRepository(BookProgress)
    private readonly progressRepo: Repository<BookProgress>,
  ) {}

  async findAll(query: BooksQueryDto): Promise<BookDto[] | PaginatedResult<BookDto>> {
    const books = await this.readBooks(false);
    let filtered = books;
    if (query.status)
      filtered = filtered.filter((b) => b.status === query.status);
    if (query.category)
      filtered = filtered.filter((b) => b.category === query.category);
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      filtered = filtered.filter((b) =>
        [b.title, b.author, ...(b.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(kw),
      );
    }
    return paginate(filtered, query.page, query.pageSize);
  }

  async findOne(id: string): Promise<BookDto> {
    const book = (await this.readBooks(true)).find((b) => b.id === id);
    if (!book) throw new NotFoundException('资源不存在');
    return book;
  }

  /** 上报阅读进度：upsert 到 SQLite，实时值覆盖文件 frontmatter 的初始值 */
  async updateProgress(
    id: string,
    dto: UpdateBookProgressDto,
  ): Promise<BookProgress> {
    const books = await this.readBooks(false);
    if (!books.some((b) => b.id === id))
      throw new NotFoundException('资源不存在');

    const existing = await this.progressRepo.findOne({ where: { bookId: id } });
    if (existing) {
      existing.progress = dto.progress;
      if (dto.lastPage != null) existing.lastPage = dto.lastPage;
      return this.progressRepo.save(existing);
    }
    const created = this.progressRepo.create({
      bookId: id,
      progress: dto.progress,
      lastPage: dto.lastPage ?? null,
    } as Partial<BookProgress>);
    return this.progressRepo.save(created);
  }

  /** includePages=false 时列表精简，省略 bookPages 大字段 */
  private async readBooks(includePages: boolean): Promise<BookDto[]> {
    const ids = this.reader.listSubdirIds('books');
    const books = ids.map((id) => {
      const { data } = this.reader.readMarkdown<BookFrontmatter>(
        `books/${id}/index.md`,
      );
      const fm = data ?? ({} as BookFrontmatter);
      const book: BookDto = {
        id: fm.id ?? id,
        title: fm.title ?? '',
        author: fm.author ?? '',
        coverUrl: fm.coverUrl ?? '',
        category: fm.category ?? '',
        rating: fm.rating ?? 0,
        status: (fm.status as BookDto['status']) ?? 'reading',
        progress: fm.progress ?? 0,
        summary: fm.summary ?? '',
        tags: fm.tags ?? [],
      };
      const optionals: Array<keyof BookDto> = [
        'excerpt',
        'thoughts',
        'publishYear',
        'pages',
        'spineColor',
        'formats',
        'pdfUrl',
        'epubUrl',
      ];
      const record = book as unknown as Record<string, unknown>;
      for (const key of optionals) {
        const value = fm[key as keyof BookFrontmatter];
        if (value != null) record[key] = value;
      }
      if (includePages && this.reader.exists(`books/${id}/pages.json`)) {
        book.bookPages = this.reader.readJson<BookPageItemDto[]>(
          `books/${id}/pages.json`,
        );
      }
      if (includePages && this.reader.exists(`books/${id}/toc.json`)) {
        book.toc = this.reader.readJson<BookTocItemDto[]>(
          `books/${id}/toc.json`,
        );
      }
      return book;
    });
    await this.mergeProgress(books);
    return books;
  }

  /** 用 DB 实时进度覆盖文件初始值（progress + lastPage） */
  private async mergeProgress(books: BookDto[]): Promise<void> {
    if (books.length === 0) return;
    const rows = await this.progressRepo.find({
      where: { bookId: In(books.map((b) => b.id)) },
    });
    const map = new Map(rows.map((r) => [r.bookId, r]));
    for (const book of books) {
      const row = map.get(book.id);
      if (!row) continue;
      book.progress = row.progress;
      if (row.lastPage != null) book.lastPage = row.lastPage;
    }
  }
}
