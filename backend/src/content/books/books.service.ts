import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { ContentReaderService } from '../content-reader.service';
import {
  BookDto,
  BookPageItemDto,
  BookTocItemDto,
  BooksQueryDto,
} from './book.dto';

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
  constructor(private readonly reader: ContentReaderService) {}

  findAll(query: BooksQueryDto): BookDto[] | PaginatedResult<BookDto> {
    const books = this.readBooks(false);
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

  findOne(id: string): BookDto {
    const book = this.readBooks(true).find((b) => b.id === id);
    if (!book) throw new NotFoundException('资源不存在');
    return book;
  }

  /** includePages=false 时列表精简，省略 bookPages 大字段 */
  private readBooks(includePages: boolean): BookDto[] {
    const ids = this.reader.listSubdirIds('books');
    return ids.map((id) => {
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
  }
}
