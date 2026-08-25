---
name: nestjs-backend-builder
description: >-
  从零构建本项目的 NestJS 后端服务。当用户要求搭建/编写后端、创建 API 接口、初始化 NestJS 项目、生成 Swagger 文档、导出 Apifox 可导入的 OpenAPI 规范、或涉及 docs/ 下的数据契约时激活。强制遵循 docs/ 四份契约文档（LEARNING_API_SPEC.md / HOBBY_API_SPEC.md / BOOK_API_SPEC.md / CONTENT_MANAGEMENT.md）。
---

# Skill: NestJS 后端构建约定（从零搭建 + Swagger + Apifox）

## 0. 触发时机 (Trigger)

激活本技能的场景：
1. 用户要求「搭建后端」「写接口」「初始化 NestJS 项目」。
2. 要求「生成/暴露 Swagger 文档」或「导出 Apifox 可导入的 OpenAPI 文件」。
3. 需要新增/修改学习文章、视频、书籍、评论等任意 API 时。

**开始前必须先阅读**（位于项目根目录 `docs/`，它们是唯一契约来源）：

| 文档 | 对应模块 | 状态 |
| --- | --- | --- |
| `docs/LEARNING_API_SPEC.md` | 学习文章 posts（article/quiz/coding） | 契约 |
| `docs/HOBBY_API_SPEC.md` | 兴趣视频 videos | 契约 |
| `docs/BOOK_API_SPEC.md` | 书籍 books（含 bookPages） | 契约 |
| `docs/CONTENT_MANAGEMENT.md` | 内容目录结构 + 数据库选型 + 部署 | 架构 |

---

## 1. 设计基线（不可违背）

1. **内容走文件，行为走数据库**：文章/视频/书籍/项目/时间线的正文数据全部来自 `content/` 目录下的 `.md` + frontmatter + 侧文件（JSON）；只有 `Comment`、浏览量/点赞增量才进数据库。
2. **统一响应包**：所有接口返回 `{ code, message, data }`；`code: 0` 表示成功；出错时 `code` 与 HTTP 状态码一致。
3. **只读为主**：posts/videos/books/projects/timeline 为只读接口；仅 comments 与 stats 是写接口。
4. **字段名严格对齐契约**：后端 JSON 字段名、类型、可选必填必须与三份 `*_API_SPEC.md` 完全一致，前端不做任何适配。
5. **一切经 Swagger 暴露**：每个 Controller/DTO/枚举都要写 Swagger 装饰器，保证可一键生成文档并导入 Apifox。

---

## 2. 技术栈 (Stack)

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | NestJS（最新稳定版） | 官方 CLI `nest new` 初始化 |
| 语言 | TypeScript strict | 与前端 `src/types` 对齐 |
| 内容解析 | `gray-matter` + `fast-glob` | frontmatter + Markdown 正文 + 扫描目录 |
| ORM | TypeORM + `better-sqlite3` | SQLite 单文件，`synchronize: true`（开发期） |
| 校验 | `class-validator` + `class-transformer` | 全局 ValidationPipe |
| Swagger | `@nestjs/swagger`（配套 CLI plugin） | 自动从 DTO 生成 `@ApiProperty` |
| 静态资源 | `@nestjs/serve-static` 或 `express.static` | `/static` 托管封面/视频 |

安装：`npm i @nestjs/swagger gray-matter fast-glob typeorm better-sqlite3 @nestjs/serve-static class-validator class-transformer`

---

## 3. 项目结构（后端仓库，独立于前端）

```text
backend/
├── content/                       # 📁 内容仓库（唯一数据源，见 CONTENT_MANAGEMENT.md §3）
│   ├── posts/<id>/
│   │   ├── index.md               # frontmatter + 正文
│   │   ├── coding.json            # type=coding 时必填（CodingChallenge）
│   │   └── quizzes.json           # type=quiz 时必填（QuizItem[]）
│   ├── videos/<id>.md
│   ├── books/<id>/{index.md,pages.json}
│   ├── projects.json
│   └── timeline.json
├── scripts/
│   └── export-openapi.ts          # Apifox 一键导出脚本
├── src/
│   ├── main.ts                    # Swagger 挂载 + 全局管道/过滤器/拦截器
│   ├── app.module.ts              # 汇总模块 + 静态资源
│   ├── common/
│   │   ├── interceptors/transform.interceptor.ts   # { code, message, data }
│   │   ├── filters/http-exception.filter.ts        # { code, message, data:null }
│   │   └── dto/pagination.dto.ts                   # page/pageSize/list/total
│   ├── content/
│   │   ├── content-reader.service.ts               # 扫描 + frontmatter 解析
│   │   ├── posts/{posts.service.ts,posts.controller.ts,post.dto.ts}
│   │   ├── videos/...
│   │   ├── books/...
│   │   ├── projects/...
│   │   └── timeline/...
│   ├── comments/{comment.entity.ts,comments.module.ts,...}
│   └── stats/{post-stats.entity.ts,stats.module.ts,...}
├── openapi.json                   # api:export 生成，提交可被 Apifox 导入
└── .env / .env.example            # PORT、DB 路径、静态目录
```

---

## 4. 强制约定 (Conventions)

### 4.1 统一响应（全局拦截器）

`src/common/interceptors/transform.interceptor.ts`：

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(map((data) => ({ code: 0, message: 'ok', data })))
  }
}
```

### 4.2 统一错误（全局异常过滤器）

`src/common/filters/http-exception.filter.ts`：

```ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse()
    const status = exception.getStatus()
    const body = exception.getResponse()
    const message = typeof body === 'string' ? body : (body as any).message
    res.status(status).json({
      code: status,
      message: Array.isArray(message) ? message.join('; ') : message,
      data: null,
    })
  }
}
```

- 校验失败（ValidationPipe）抛出的 `BadRequestException` 会自动进入此过滤器，`code: 400`。
- 未捕获异常在 `app.useGlobalFilters(new HttpExceptionFilter())` 基础上再补一个兜底 `Catch(Error)` → `code: 500`。

### 4.3 分页与过滤（严格按契约）

- `?page=1&pageSize=20` → `data` 为 `{ list, total, page, pageSize }`。
- 过滤：posts 支持 `type` / `category` / `keyword`（title/summary/tags/content 模糊）；videos 支持 `category` / `keyword`；books 支持 `status` / `category` / `keyword`。
- 用 `@Query()` + 一个 `PaginationQueryDto`（`@IsOptional() @Type(() => Number) page?`、`pageSize?`）承载，Swagger 自动生成参数文档。

### 4.4 校验与 DTO

- 写接口（`POST /api/comments`）必须用 DTO + `class-validator`（如 `@IsString() @Length(1, 500)`、`@IsOptional() @IsUrl()`）。
- 读接口的响应用 DTO 类型标注 Swagger，**DTO 字段必须与契约文档逐字一致**。

---

## 5. 内容即数据（读取 content/）

实现 `ContentReaderService`（一个扫描器 + 解析器）：

```ts
// 解析 index.md → frontmatter + body
import matter from 'gray-matter'

const parsed = matter(fileContent)
// parsed.data  = frontmatter（Post 顶层字段）
// parsed.content = 正文（映射 Post.content）
```

合并规则（对应 CONTENT_MANAGEMENT.md §4）：

```ts
const post = {
  ...fm,                                    // frontmatter
  content: body,                            // Markdown 正文
  ...(fm.type === 'coding' && { codingChallenge: readJson(dir, 'coding.json') }),
  ...(fm.type === 'quiz' && { quizzes: readJson(dir, 'quizzes.json') }),
  ...(fm.type === 'book' && { bookPages: readJson(dir, 'pages.json') }), // books 场景同理
}
```

要点：
- `views`/`likes` 文件里存**初始值**，响应时与 stats 表的累计增量合并（`file + db`），不要直接改文件。
- `content/` 路径与 `.env` 配置，禁止硬编码。
- 列表接口可省略大字段（content/quizzes/codingChallenge/bookPages），详情接口必须完整（见契约 §1.1）。

---

## 6. 数据库（SQLite + TypeORM）

表结构（CONTENT_MANAGEMENT.md §7 约定的最小集）：

| 实体 | 字段 |
| --- | --- |
| `Comment` | id, author, avatar, content, date, likes |
| `PostStats` | id, postId(unique), views, likes |

- `TypeOrmModule.forRootAsync({ useFactory: () => ({ type: 'better-sqlite3', database: process.env.DB_PATH, synchronize: true, autoLoadEntities: true }) })`。
- 只有 `comments` 与 `stats` 两个写模块；其余全部只读文件。
- 换 Postgres 时仅改 driver + `type`，schema 不动。

### 6.1 数据库怎么创建（SQLite 无需手动建库）

SQLite 是**单文件数据库，由 TypeORM 首次连接时自动创建**，不需要手动建库/建表：

1. **配好路径**：`.env` 里 `DB_PATH=./data/blog.db`（代码里给默认值 `process.env.DB_PATH || './data/blog.db'`）。
2. **写好实体**：`Comment`、`PostStats` 用 TypeORM 装饰器定义（见 §6.2）。
3. **启动即建库**：首次 `npm run start:dev`（或执行一次 `npm run db:init`），TypeORM 连接时自动创建 `data/blog.db` 文件，并按实体 + `synchronize: true` 自动生成 `comments`、`post_stats` 两张表。
4. **注意**：`better-sqlite3` 会自动建文件，但**不会自动建父目录**——`data/` 目录要预先存在（`mkdir` 或用 Node `fs.mkdirSync(..., { recursive: true })`）。
5. **预览**：用 SQLiteStudio / DB Browser for SQLite 打开 `data/blog.db` 查看；或 CLI `sqlite3 data/blog.db .tables`。
6. **生产**：关闭 `synchronize`，改用 `npm run typeorm migration:generate/run`（migration 同样会自动建库建表）。

### 6.2 实体示例（可直接运行的骨架）

```ts
// src/comments/comment.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  author: string

  @Column({ default: '' })
  avatar: string

  @Column('text')
  content: string

  @Column({ default: () => "datetime('now', 'localtime')" })
  date: string

  @Column({ default: 0 })
  likes: number
}
```

```ts
// src/stats/post-stats.entity.ts
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('post_stats')
export class PostStats {
  @PrimaryColumn()
  postId: string

  @Column({ default: 0 })
  views: number

  @Column({ default: 0 })
  likes: number
}
```

### 6.3 一键初始化脚本（`npm run db:init`）

```ts
// src/database/init.ts
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { AppModule } from '../app.module'

async function init() {
  const app = await NestFactory.createApplicationContext(AppModule) // 触发 TypeORM 连接 → 自动建库建表
  const ds = app.get(DataSource)
  const tables: { name: string }[] = await ds.query(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
  )
  console.log('✅ 已创建表:', tables.map((t) => t.name).join(', '))
  console.log('📦 SQLite 数据库就绪:', process.env.DB_PATH || './data/blog.db')
  await app.close()
}
init()
```

`package.json`: `"db:init": "ts-node --transpile-only -r tsconfig-paths/register src/database/init.ts"`。

---

## 7. Swagger 一键生成

### 7.1 挂载（`main.ts`）

```ts
const swaggerConfig = new DocumentBuilder()
  .setTitle('个人博客 API')
  .setDescription('覆盖学习文章(posts) / 兴趣视频(videos) / 书籍(books) / 项目 / 时间线 / 评论 / 统计，统一响应 { code, message, data }')
  .setVersion('1.0')
  .addServer(process.env.PUBLIC_BASE_URL || 'http://localhost:3000')
  .addTag('posts', '学习文章（article/quiz/coding）')
  .addTag('videos', '兴趣视频')
  .addTag('books', '书籍（3D 阅读器）')
  .addTag('comments', '留言')
  .build()

const document = SwaggerModule.createDocument(app, swaggerConfig)
SwaggerModule.setup('/api', app, document)
```

- Swagger UI：`GET /api`；OpenAPI JSON：`GET /api-json`。
- **开启 CLI plugin**（`nest-cli.json` → `plugins: [{ name: '@nestjs/swagger' }]`），自动为 DTO 生成 `@ApiProperty`，避免手写重复。

### 7.2 装饰器约定

- 每个 Controller 加 `@ApiTags('...')`，与上述 tag 对应。
- 每个端点至少 `@ApiOperation({ summary })` + `@ApiOkResponse({ type })`；写接口加 `@ApiCreatedResponse`、`@ApiBody({ type: XxxDto })`。
- 枚举值（`PostType`、`Difficulty`、`BookStatus`、`VideoCategory`）定义成 TS enum 或 union + `@ApiProperty({ enum })`，Apifox 才能生成下拉选项。
- 分页参数 DTO 自动成为 query 参数文档。

### 7.3 统一响应在 Swagger 中的表达

拦截器让运行时返回 `{ code, message, data }`，而 Swagger 默认按 DTO 直接生成 `data` 本体。两种策略二选一：

- **推荐（简单可靠）**：`@ApiOkResponse({ type: PostDto })` 标注 `data` 载荷本身；在 doc 描述里说明信封结构；Apifox 导入后手动为 `data` 加一层包裹，或用 Apifox 的「响应参数覆盖」。
- **进阶（schema 级完整）**：定义 `class ApiEnvelope<T> { code: number; message: string; data: T }`，用 `@ApiOkResponse({ schema: { allOf: [ { $ref: ... }, { properties: { data: { $ref: ... } } } ] } })` 拼装。若泛型展开不完整，回退到推荐策略。

> 保证运行时与文档一致比追求 100% schema 完整更重要——Apifox 导入失败的风险来自 schema 结构错误，而非缺少信封。

---

## 8. Apifox 一键导入

### 8.1 导入 Apifox（推荐：直接用运行时 Swagger）

Swagger 挂载后 `GET /api-json` 本身就是标准 OpenAPI 3.0 规范，**Apifox 可直接识别，无需额外生成文件**。一键导入方式：

1. **URL 直连（首选）**：启动后端 → Apifox → 「导入数据」→ 选 `OpenAPI URL` → 填 `http://host:3000/api-json` → 导入即得完整接口集合，并可开启**定时同步**，后端更新后 Apifox 自动拉取。
2. **文件导入**：若不方便访问运行中的服务，再走 §8.2 的导出脚本生成 `openapi.json` 后上传。

> 无需为导入而额外开发任何东西——`SwaggerModule.createDocument` + `/api-json` 端点即是 Apifox 的导入源。

### 8.2 导出 openapi.json（备用：离线文件）

`scripts/export-openapi.ts`：

```ts
import 'reflect-metadata'
import { writeFileSync } from 'fs'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from '../src/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false })
  const config = new DocumentBuilder()
    .setTitle('个人博客 API')
    .setDescription('...')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  writeFileSync('openapi.json', JSON.stringify(document, null, 2))
  await app.close()
  console.log('✅ openapi.json 已导出，可直接导入 Apifox')
}
bootstrap()
```

`package.json` 脚本：

```json
{
  "scripts": {
    "api:export": "ts-node --transpile-only -r tsconfig-paths/register scripts/export-openapi.ts"
  }
}
```

> 脚本不调用 `listen`，导完即退出，可在 CI 中一键生成。用于：后端未启动时离线导入、把规范提交到 git 存档。日常直接导入时，优先用 §8.1 的 `/api-json` URL 方式。

---

## 9. 构建工作流（按序执行，每步验证）

1. **初始化**：`nest new backend` → 装依赖 → 配置 `.env`。
2. **全局基建**：TransformInterceptor + HttpExceptionFilter + ValidationPipe + 静态资源 → `npm run build` 通过。
3. **ContentReaderService**：扫描 `content/`，解析 frontmatter + 正文 + 侧文件。
4. **只读模块**：依次实现 posts → videos → books → projects → timeline（Controller + Service + DTO），每模块 `npm run build` 验证。
5. **数据库模块**：TypeORM 配置 + `Comment` / `PostStats` 实体 + comments/stats 模块。
6. **Swagger**：挂载 DocumentBuilder + CLI plugin，逐端点补装饰器。
7. **导出**：写 `scripts/export-openapi.ts`，跑 `npm run api:export` 生成 `openapi.json`。
8. **自测**：启动服务，`GET /api-json` 能返回完整 spec；`npm run build`、`npm run lint` 通过。

---

## 10. 验收清单 (Done 定义)

- [ ] `npm run build`（`nest build`）退出码 0，无 TS 报错
- [ ] `GET /api/posts`、`/api/videos`、`/api/books`、`/api/projects`、`/api/timeline` 返回 `{ code:0, message:'ok', data }` 且字段与契约文档一致
- [ ] 分页 `?page=1&pageSize=20` 返回 `{ list, total, page, pageSize }`
- [ ] `POST /api/comments` 带 DTO 校验，非法输入返回 `{ code:400, message, data:null }`
- [ ] `GET /api-json` 返回 OpenAPI 3.0 规范，所有端点有 summary/参数/响应
- [ ] 用 Apifox「导入数据 → OpenAPI URL → `/api-json`」导入成功、接口集合完整；`npm run api:export` 生成的 `openapi.json` 亦能导入（备用）
- [ ] 评论/浏览量的写数据落到 `data/*.db`，重启不丢

---

## 11. 常见陷阱 (Pitfalls)

- **字段名不一致**：契约里的 `readTime`、`coverUrl`、`posterUrl`、`bookPages` 等务必逐字使用，前端零适配。
- **枚举写死字符串**：`type`、`difficulty`、`status`、`category` 必须与契约枚举一致（如 quiz 必须携带 `quizzes`，coding 必须携带 `codingChallenge`）。
- **Swagger 泛型不展开**：`ApiResponse<T>` 泛型在 CLI plugin 下可能不完整，按 §7.3 回退策略处理，别让文档缺失端点。
- **SQLite 文件丢失**：`DB_PATH` 指向持久化路径；Docker 部署必须挂卷（见 CONTENT_MANAGEMENT.md §8）。
- **`synchronize: true` 仅限开发**：生产切换 Postgres 前关闭或改用 migration。
- **导出脚本连接 DB**：若 AppModule 连 DB 失败会中断导出，可让 export 脚本使用不含 DB 模块的独立模块，或确保 DB 可连。
- **Node 20 版本兼容（实测踩坑）**：`better-sqlite3` 最新 12.x 无 Node 20 预编译二进制（会触发 node-gyp 编译，需 Python），且 `typeorm` 1.x 强制要求它。需固定：`better-sqlite3@^11` + `typeorm@^0.3` + `typescript@^5`（TS v6 移除了 `baseUrl` 且要求显式 `rootDir`）。
