import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import fg from 'fast-glob';
import matter from 'gray-matter';

export interface ParsedMarkdown<T = Record<string, unknown>> {
  data: T;
  body: string;
}

/**
 * 内容即数据：读取 content/ 目录下的 .md（frontmatter + 正文）与 .json 侧文件。
 * 路径由 .env 的 CONTENT_DIR 配置，禁止硬编码。
 */
@Injectable()
export class ContentReaderService {
  private readonly root: string;

  constructor() {
    this.root = join(process.cwd(), process.env.CONTENT_DIR ?? 'content');
  }

  /** 解析 <subdir>/<id>/index.md → frontmatter + Markdown 正文 */
  readMarkdown<T = Record<string, unknown>>(
    relativePath: string,
  ): ParsedMarkdown<T> {
    const parsed = matter(readFileSync(join(this.root, relativePath), 'utf-8'));
    return {
      data: (parsed.data as T) ?? ({} as T),
      body: parsed.content ?? '',
    };
  }

  /** 读取 JSON 侧文件（coding.json / quizzes.json / pages.json / projects.json / timeline.json） */
  readJson<T>(relativePath: string): T {
    return JSON.parse(
      readFileSync(join(this.root, relativePath), 'utf-8'),
    ) as T;
  }

  /** 目录型内容（posts/books）：扫描 <subdir>/{id}/index.md → id 列表 */
  listSubdirIds(subdir: string): string[] {
    const files = fg.sync(`${subdir}/*/index.md`, {
      cwd: this.root,
      onlyFiles: true,
      unique: true,
    });
    return files.map((f) => f.split('/')[1]);
  }

  /** 单文件型内容（videos）：扫描 <subdir>/{id}.md → id 列表 */
  listFileIds(subdir: string): string[] {
    const files = fg.sync(`${subdir}/*.md`, {
      cwd: this.root,
      onlyFiles: true,
      unique: true,
    });
    return files.map((f) =>
      f.replace(/\\/g, '/').split('/').pop()!.replace(/\.md$/, ''),
    );
  }

  exists(relativePath: string): boolean {
    try {
      readFileSync(join(this.root, relativePath));
      return true;
    } catch {
      return false;
    }
  }
}
