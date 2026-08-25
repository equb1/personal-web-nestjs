# 📚 书籍数据接口规范（Book JSON API Spec）

> 适用于通过接口向后端传入书籍数据的场景。前端阅读器**并不真正解析 `.epub` / `.pdf` 文件**，而是渲染 `bookPages` 数组中结构化页面的 Markdown 内容。接口只需返回符合本规范的 JSON 即可。

## 1. 数据来源与接入方式

当前书籍数据由静态文件引入：

```tsx
// src/App.tsx
import { SAMPLE_BOOKS } from './data/mockData'
const [books] = useState<Book[]>(SAMPLE_BOOKS)
```

改为接口后：

```tsx
const [books, setBooks] = useState<Book[]>([])
useEffect(() => {
  fetch('/api/books')
    .then((r) => r.json())
    .then((data) => setBooks(data))
}, [])
```

接口返回 `Book[]` 数组即可（若包裹在 `{ data: Book[] }` 中，需自行解包取 `data`）。

---

## 1.1 接口契约（后端约定）

| 项目 | 约定 |
| --- | --- |
| 端点 | `GET /api/books` |
| 响应格式 | 统一 JSON 包：`{ "code": 0, "message": "ok", "data": Book[] }`（`code: 0` 表示成功） |
| 错误格式 | `{ "code": 404, "message": "资源不存在", "data": null }`，HTTP 状态码与 `code` 一致 |
| 分页 | `GET /api/books?page=1&pageSize=20` → `data` 为 `{ "list": Book[], "total": 100, "page": 1, "pageSize": 20 }` |
| 过滤 | `?status=reading`、`?category=计算机`、`?keyword=CSS`（按 `title`/`author`/`tags` 模糊匹配） |
| 详情 | `GET /api/books/{id}` → 返回单个 `Book` |
| 静态文件 | `pdfUrl` / `epubUrl` / `coverUrl` / `image` 指向真实可访问的静态资源 URL（浏览器直接 `<img>`/下载） |
| 内容来源 | `bookPages[].content` 为 Markdown 文本；后端可存储 markdown 内容并在响应中拼装 `bookPages` 数组，或存富文本后服务端转 Markdown |
| CORS | 若前后端分离，需开放跨域（`Access-Control-Allow-Origin`） |

---

## 2. Book 顶层字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | 唯一 ID |
| `title` | `string` | ✅ | 书名 |
| `author` | `string` | ✅ | 作者 |
| `coverUrl` | `string` | ✅ | 封面图 URL |
| `category` | `string` | ✅ | 分类 |
| `rating` | `number` | ✅ | 0–5 整数 |
| `status` | `string` | ✅ | `reading` \| `completed` \| `want-to-read` |
| `progress` | `number` | ✅ | 阅读进度 0–100 |
| `summary` | `string` | ✅ | 简介 |
| `excerpt` | `string` | 否 | 原文章节节选（Markdown） |
| `thoughts` | `string` | 否 | 深度读书笔记（Markdown） |
| `tags` | `string[]` | ✅ | 标签 |
| `publishYear` | `string` | 否 | 出版年份 |
| `pages` | `number` | 否 | 纸质页数 |
| `spineColor` | `string` | 否 | 3D 书脊渐变色（tailwind 类，如 `from-amber-600 to-orange-700`） |
| `formats` | `string[]` | 否 | 支持格式：`markdown` \| `pdf` \| `epub` \| `txt` \| `mixed` |
| `pdfUrl` | `string` | 否 | 真实 PDF 文件链接 |
| `epubUrl` | `string` | 否 | 真实 EPUB 文件链接 |
| `bookPages` | `BookPageItem[]` | 否 | 阅读器渲染页（不传则自动生成 8 页默认结构） |

---

## 3. bookPages 页面字段（BookPageItem）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pageNumber` | `number` | ✅ | 页码，从 1 开始 |
| `title` | `string` | 否 | 页面标题 |
| `chapter` | `string` | 否 | 章节名 |
| `type` | `string` | ✅ | 页面类型（见下表） |
| `content` | `string` | 否 | 正文（**Markdown 字符串**，非 EPUB XML/HTML） |
| `format` | `string` | 否 | `markdown` \| `pdf` \| `epub` \| `txt` \| `code`，决定顶部格式筛选 |
| `image` | `string` | 否 | 图片 URL |
| `pdfPageNumber` | `number` | 否 | PDF 影印原页号 |
| `pdfUrl` | `string` | 否 | PDF 页源文件 |
| `codeLanguage` | `string` | 否 | 代码页语言 |
| `codeSnippet` | `string` | 否 | 代码内容 |
| `quote` | `string` | 否 | 引言/金句 |

### type 可选值

`cover` \| `copyright` \| `content` \| `illustration` \| `notes` \| `back-cover` \| `pdf-page` \| `code-page` \| `epub-section`

---

## 4. 关键约定

- **`content` 为 Markdown 字符串**，由 `MarkdownRenderer` 渲染，不是 EPUB 的 XML/HTML。
- **`bookPages` 必须是偶数页**：翻页插件按双开页（spread）排版。规范结构为：
  - 第 1 页：`cover`
  - 中间页：`copyright` / `content` / `epub-section` / `pdf-page` / `code-page` / `notes`
  - 最后 1 页：`back-cover`
- **`bookPages` 可不传**：`Interactive3DBook.tsx` 会自动用 `excerpt` / `thoughts` 拼接出 8 页默认结构。
- `format` 决定阅读器顶部格式视图（全格式混排 / Markdown / PDF / EPUB / 代码附录）；EPUB 页统一写 `"format": "epub"`。
- 若一页同时满足某格式筛选，`findIndex` 匹配 `p.format === fmt.id || p.type === \`${fmt.id}-page\``。

---

## 5. 完整示例：一本 EPUB 格式的书

```jsonc
{
  "id": "b-101",
  "title": "流式排版的技术书",
  "author": "某作者",
  "coverUrl": "https://example.com/covers/book.jpg",
  "category": "计算机",
  "rating": 5,
  "status": "reading",
  "progress": 42,
  "summary": "一本讲解 EPUB3 流式排版与自适应阅读的前端书籍。",
  "excerpt": "## 原文章节节选\nMarkdown 内容……",
  "thoughts": "## 读书笔记\nMarkdown 内容……",
  "tags": ["EPUB", "前端"],
  "publishYear": "2024",
  "pages": 268,
  "spineColor": "from-teal-500 to-cyan-600",
  "formats": ["epub"],
  "epubUrl": "https://example.com/files/book.epub",
  "bookPages": [
    {
      "pageNumber": 1,
      "title": "封面",
      "type": "cover",
      "image": "https://example.com/covers/book.jpg"
    },
    {
      "pageNumber": 2,
      "title": "版权与元数据",
      "chapter": "Front Matter",
      "type": "copyright",
      "format": "epub",
      "content": "# 流式排版的技术书\n\n**著者**：某作者\n**出版**：某某出版社\n\n> EPUB3 标准 · 自适应视口排版"
    },
    {
      "pageNumber": 3,
      "title": "第一章（EPUB 流式排版）",
      "chapter": "Chapter 1",
      "type": "epub-section",
      "format": "epub",
      "content": "### 1.1 自适应排版\n\n文字随设备视口动态调整行高与字阶。\n\n- 语义化排版，符合 EPUB3 规范\n- 支持书签与章节双向引用"
    },
    {
      "pageNumber": 4,
      "title": "第二章（EPUB 流式排版）",
      "chapter": "Chapter 2",
      "type": "epub-section",
      "format": "epub",
      "content": "### 2.2 知识图谱\n\n章节间通过链接互通……"
    },
    {
      "pageNumber": 5,
      "title": "深度读书笔记",
      "chapter": "Engineer Notes",
      "type": "notes",
      "format": "markdown",
      "content": "## 关于本书的核心沉淀\n\n……"
    },
    {
      "pageNumber": 6,
      "title": "封底",
      "type": "back-cover",
      "content": "### 结束语\n\n**ISBN**：xxx\n**支持格式**：EPUB"
    }
  ]
}
```

---

## 6. 其他格式示例要点

- **PDF 页**：`{ "type": "pdf-page", "format": "pdf", "pdfPageNumber": 42, "image": "...", "content": "..." }`
- **代码页**：`{ "type": "code-page", "format": "code", "codeLanguage": "TypeScript", "codeSnippet": "……", "content": "……" }`
- **纯 Markdown**：`{ "type": "content", "format": "markdown", "content": "……" }`
- **插图页**：`{ "type": "illustration", "image": "...", "quote": "……", "content": "……" }`
