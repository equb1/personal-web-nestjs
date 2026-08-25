# 个人博客后端构建任务清单

> 契约来源：`docs/LEARNING_API_SPEC.md` / `docs/HOBBY_API_SPEC.md` / `docs/BOOK_API_SPEC.md` / `docs/CONTENT_MANAGEMENT.md`
> 技能规范：`.agents/skills/nestjs-backend-builder/SKILL.md`

- [x] [初始化] `nest new backend` + 安装依赖 + `.env`/`.env.example`
- [x] [全局基建] TransformInterceptor + HttpExceptionFilter + ValidationPipe + 静态资源
- [x] [内容扫描] ContentReaderService（frontmatter + 正文 + 侧文件）
- [x] [种子内容] content/posts|videos|books + projects.json + timeline.json + static/ 占位资源
- [x] [posts] PostsController + PostsService + PostDto（list/detail/分页/过滤）
- [x] [videos] VideosController + VideosService + VideoDto
- [x] [books] BooksController + BooksService + BookDto
- [x] [projects] ProjectsController + ProjectsService + ProjectDto
- [x] [timeline] TimelineController + TimelineService + TimelineDto
- [x] [数据库] TypeORM(better-sqlite3) + Comment/PostStats 实体 + comments/stats 模块
- [x] [Swagger] DocumentBuilder + CLI plugin + 逐端点装饰器
- [x] [导出] scripts/export-openapi.ts → openapi.json
- [x] [自测] npm run build / lint / test / test:e2e / 启动 / GET /api-json / 重启持久化
