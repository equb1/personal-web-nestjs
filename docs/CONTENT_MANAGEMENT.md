# 📦 内容管理方案：文件即数据（Content as Files）

> 针对本项目的个人博客定位，推荐采用 **「文件编写 → 后端转换 → 前端渲染」** 的数据管理方式，**不开发完整管理后台**。
>
> 核心思路：所有内容以 Markdown + YAML frontmatter 文件形式存放在后端仓库的 `content/` 目录下，NestJS 后端启动时读取并转换为 `docs/*_API_SPEC.md` 中定义的 JSON 结构对外提供。**改内容 = 改文件 = git commit = 发布。**

---

## 1. 为什么要这样做

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| **文件即数据（本方案）** | 零后台开发成本；Markdown 写作体验最佳；天然 git 版本历史；字段与前端 spec 直接对齐 | 需要可视化实时预览时不便 |
| 管理后台（Admin SPA） | 可视化表单编辑 | 要开发增删改查 + 上传 + 鉴权，成本高，个人博客杀鸡用牛刀 |
| 直接操作数据库 | 无需额外代码 | Markdown 长文本 / JSON 嵌套字段（题目、测试用例）在 SQL 客户端极难编辑，易错 |

**结论**：内容形态决定了方案。本项目的正文/解析/代码都是 Markdown，用文件编辑最自然。

---

## 2. 总体架构

```text
后端仓库（NestJS）
│
├── content/                    # 📁 内容仓库（唯一数据源）
│   ├── posts/                  #   学习文章
│   │   ├── react-hooks-study/
│   │   │   ├── index.md        #     frontmatter + 正文
│   │   │   └── quizzes.json    #     交互式题目（可选）
│   │   └── ...
│   ├── videos/                 #   兴趣视频
│   ├── books/                  #   书籍（含 bookPages）
│   ├── projects.json           #   项目展示
│   └── timeline.json           #   时间线
│
├── src/
│   ├── content/                # 读取 + 解析 content/ 目录
│   │   ├── posts.service.ts    #   文件 → Post JSON
│   │   ├── videos.service.ts   #   文件 → HobbyVideo JSON
│   │   └── ...
│   └── modules/                # 标准 NestJS 模块暴露接口
│       ├── posts/              #   GET /api/posts（按 LEARNING_API_SPEC）
│       ├── videos/             #   GET /api/videos（按 HOBBY_API_SPEC）
│       └── books/              #   GET /api/books（按 BOOK_API_SPEC）
│
└── 前端（现有 React 项目）
    └── fetch('/api/posts')     # 按三份 spec 直接渲染，不改任何组件
```

- **内容目录归属**：`content/` 放**后端仓库**（而非前端 `src/`），这样前端构建不打包内容、后端可直接读文件系统。
- **只读原则**：前端只能 GET，写操作全部走 git（本地改文件 → push）。唯一例外是动态数据（见 §6）。

---

## 3. 目录结构与 frontmatter 规范

### 3.1 学习文章 `content/posts/<id>/`

每个文章一个文件夹，`index.md` 为正文，复杂结构化数据拆到同名 JSON 侧文件：

```
content/posts/handwritten-promise-all/
├── index.md            # frontmatter + 正文（映射 Post.content）
├── coding.json         # CodingChallenge（type=coding 时必填）
└── cover.jpg           # 封面图（可选，经 /static 暴露）
```

**`index.md` 示例（type=article）**：

```markdown
---
id: react-hooks-study
title: React Hooks 全面梳理：useState 到 useTransition
summary: 从基础到进阶，梳理 React Hooks 的常见用法与性能优化要点。
category: 学习笔记
date: 2026-08-10
readTime: 12 分钟
type: article            # article | quiz | coding，省略默认为 article
tags:
  - React
  - Hooks
coverImage: /static/posts/react-hooks-study/cover.jpg
views: 1560
likes: 128
---
# React Hooks 全面梳理

## 1. useState
...正文 Markdown...
```

> frontmatter 中除 `content`（正文）以外的所有字段，与 `LEARNING_API_SPEC.md` §2 的 `Post` 顶层字段一一对应。后端解析时 `frontmatter + 正文 + 侧文件` 三部分合并为一个 `Post` JSON。

**`coding.json` 示例（type=coding）**：

```json
{
  "id": "cc-promise-all",
  "title": "手写实现 myPromiseAll 函数",
  "difficulty": "medium",
  "description": "编写一个 myPromiseAll(promises) 函数…",
  "starterCode": "function myPromiseAll(promises) { ... }",
  "solutionCode": "function myPromiseAll(promises) { ... }",
  "languageTemplates": [
    { "language": "typescript", "label": "TypeScript (v5.7)", "extension": "ts", "starterCode": "...", "solutionCode": "..." }
  ],
  "hints": ["使用 Array.from 处理 Iterable 输入..."],
  "testCases": [
    { "id": "t1", "name": "空数组应立即 resolve 空数组", "code": "await myPromiseAll([])", "expectedOutput": "[]" }
  ]
}
```

**`quizzes.json` 示例（type=quiz）**：

```json
[
  {
    "id": "q1",
    "question": "关于事件循环，以下输出顺序正确的是？",
    "difficulty": "easy",
    "options": [
      { "id": "a", "text": "1, 4, 2, 3", "isCorrect": false },
      { "id": "b", "text": "1, 4, 3, 2", "isCorrect": true }
    ],
    "explanation": "### 考点剖析\n同步任务 > 微任务 > 宏任务…"
  }
]
```

> `coding.json` 字段严格对照 `LEARNING_API_SPEC.md` §4，`quizzes.json` 对照 §3，后端只做透传与兜底合并。

---

### 3.2 兴趣视频 `content/videos/<id>.md`

视频字段简单，一个单文件 md 即可：

```markdown
---
id: city-night-vlog
title: 赛博夜色 - 4K 城市流光航拍剪辑
description: 使用无人机记录下的科技都市夜景…
category: vlog            # vlog | tech | music | gaming
videoUrl: /static/videos/city-night.mp4
posterUrl: /static/videos/city-night.jpg
duration: "0:15"          # MM:SS 字符串
date: 2026-08-10
views: 3420
---
```

> 字段对照 `HOBBY_API_SPEC.md` §2，无正文。视频/封面文件放同级目录，经 `/static` 静态托管。

---

### 3.3 书籍 `content/books/<id>/`

```markdown
# index.md
---
id: design-psychology
title: 设计心理学
author: 唐·诺曼
coverUrl: /static/books/design-psychology/cover.jpg
category: UI/UX & 设计
rating: 5
status: completed        # reading | completed | want-to-read
progress: 100
summary: 阐述产品设计的核心原则…
tags: [UX设计, 认知心理学]
publishYear: "2015"
pages: 368
spineColor: from-amber-600 to-orange-700
formats: [markdown, pdf]
---
```

> `pages.json`（可选）存放 `bookPages` 数组，结构对照 `BOOK_API_SPEC.md` §3。若不提供，前端 `Interactive3DBook` 会自动用 `excerpt`/`thoughts` 生成默认页。

---

### 3.4 小型静态配置 `content/projects.json` / `content/timeline.json`

项目与时间线数据量小、无长文本，直接用 JSON 文件：

```json
{
  "projects": [
    {
      "id": "personal-web",
      "title": "个人网站",
      "description": "3D 书籍动画 + 代码沙箱博客",
      "tags": ["React", "NestJS"],
      "githubUrl": "https://github.com/...",
      "icon": "Code",
      "stars": 12
    }
  ],
  "timeline": [
    { "year": "2026", "title": "前端工程师", "companyOrContext": "某公司", "description": "...", "icon": "Briefcase" }
  ]
}
```

---

## 4. 后端转换规则（文件 → JSON）

后端 `content/posts.service.ts` 负责把文件夹解析成 spec 要求的 `Post`：

```ts
// 伪代码：解析逻辑示意
const post = {
  ...parseFrontmatter(index.md),       // frontmatter 各字段
  content: readMarkdownBody(index.md), // 正文 → Post.content
  // 按 type 合并侧文件
  ...(fm.type === 'coding' && { codingChallenge: readJson('coding.json') }),
  ...(fm.type === 'quiz' && { quizzes: readJson('quizzes.json') }),
}
```

配套工具（Node 生态现成）：
- `gray-matter` — 解析 YAML frontmatter + Markdown 正文
- `unified` / `remark` — 如需把 Markdown 二次加工（如转 HTML、代码高亮）
- `fast-glob` — 递归扫描 content 目录

---

## 5. 发布流程（写 → 上线的完整闭环）

```text
本地编辑 .md / .json 文件
        │
        ▼
git commit + git push
        │
        ▼
后端（服务器）自动拉取 or CI/CD 触发重启
        │
        ▼
NestJS 启动时重新读取 content/ → 接口即时生效
```

- 改动即上线，无需后台页面、无需连数据库。
- 天然版本历史：任何内容改动可 `git log` 追溯、可回滚。
- 可选增强：后端监听 `content/` 目录变化（`chokidar`）热重载，甚至不需要重启进程。

---

## 6. 动态数据怎么处理（例外）

只有**用户产生的数据**才需要数据库，文件方案不适用于这些：

| 数据 | 存储 | 说明 |
| --- | --- | --- |
| 文章/视频的 `views` `likes` | ✅ 存数据库 | 文件里存的是**初始值**，后端读取后与 DB 累计值合并（`file 初始值 + db 增量`） |
| 留言 `comments` | ✅ 存数据库 | 真正的写接口 `POST /api/comments`，前端提交，NestJS 用 DTO + Class-Validator 校验入库 |
| 静态文件（封面/视频/md） | ✅ 文件系统 | `/static` 静态托管即可，无需数据库 |

> 一句话原则：**内容走文件，行为走数据库。** 这样你依然需要 NestJS 的 Comments 模块做动态接口，其余模块都是"读文件出 JSON"的只读服务。

---

## 7. 数据库选型

### 7.1 结论：首选 SQLite，暂不上云端数据库

本项目数据库只承载**动态小数据**（评论、浏览量/点赞增量），内容本身在文件里。因此：

| 方案 | 适合场景 | 说明 |
| --- | --- | --- |
| **SQLite（首选）** | 个人博客默认 | 单文件、零运维、无独立数据库服务；NestJS 官方示例即 SQLite，开发期零配置 |
| PostgreSQL | 上云托管 / 多实例 / 需要 Auth 生态 | 托管服务省心（Supabase / Railway / Vercel Postgres） |
| MySQL | 团队既有习惯 | 个人项目无额外优势 |

**为什么 SQLite 够用**：
- 评论 + 浏览+1，个人博客一天可能就几条写入，单写锁毫无压力。
- 备份 = `cp` 一个 `.db` 文件，随 git 之外的冷备即可。
- 未来真要换 Postgres，`TypeORM`/`Prisma` 只换 driver，schema 几乎不动。

### 7.2 何时必须上云端数据库

只有部署到**无持久磁盘**的环境时才必须上云：

| 部署环境 | 是否需要云端 DB |
| --- | --- |
| VPS / Docker（挂持久卷） | ❌ 不需要，本地 SQLite 即可 |
| PaaS（Railway / Render / Fly，带持久卷） | ❌ 不需要（挂持久卷后同上） |
| Serverless（Vercel Functions / 边缘函数） | ✅ 需要，函数无状态 + 存储瞬态 |

云端选型推荐顺序：`Supabase`（Postgres，自带 Auth/Storage，将来做后台登录直接可用）→ `Turso`（serverless SQLite，兼容 SQLite 语法）→ `Vercel Postgres` / `Railway Postgres`。

> 建议 schema 起步就两张表：`Comment`（留言）+ `PostStats`（`postId` / `views` / `likes`）。

---

## 8. 部署方案

### 8.1 总体判断

本项目是 React SPA + NestJS 后端，**必须有一台能跑 Node 的服务器**，纯静态托管（GitHub Pages / Vercel Static）跑不了后端，不在考虑范围。

### 8.2 推荐部署拓扑（VPS + Docker，SQLite 本地文件）

```text
┌─────────────── VPS（如阿里云/腾讯云轻量 1C1G 起步）───────────────┐
│                                                                     │
│   Nginx / Caddy (443, 反代)                                         │
│        │                                                           │
│   Docker                                                           │
│   ├── web 容器（NestJS 后端 + /static 静态 + content/ 读取）        │
│   │      └─ 挂载持久卷：                                            │
│   │          ├─ /data/app.db        ← SQLite 数据库（必须持久化）  │
│   │          ├─ /data/static        ← 封面/视频文件                │
│   │          └─ /data/content       ← 内容文件（git clone 更新）    │
│   └── （可选）前端静态可并入 web 容器或单独 nginx 托管              │
└─────────────────────────────────────────────────────────────────────┘
```

**关键点（Docker 部署时最容易踩坑）**：
- SQLite 文件必须挂载到宿主机**持久卷**（`-v /data:/data`），**不要**放容器可写层，否则每次重建容器数据丢失。
- `content/` 目录同样挂持久卷，或启动时从 git clone/pull 到持久卷，保证 `git push` 后拉取即生效。

### 8.3 部署路径对比

| 路径 | 成本 | 说明 |
| --- | --- | --- |
| **VPS + Docker（推荐）** | 学生机级即可 | 完全自主可控，SQLite 本地文件天然持久，最省心 |
| PaaS（Railway / Render） | 有免费额度 | 需确认提供持久卷（Volumes），否则 SQLite 会丢 |
| Serverless（Vercel Functions） | 免费 | 必须换云端 DB（Turso/Supabase），且 NestJS 需做 Serverless 适配 |

### 8.4 上线 Checklist

- [ ] VPS 装 Docker，`docker-compose.yml` 编排 web 容器
- [ ] 持久卷挂载 `/data/app.db`、`/data/static`、`/data/content`
- [ ] CI/CD：`git push` → 服务器 pull `content/` → 重启/热重载服务
- [ ] Nginx/Caddy 配置 HTTPS 反向代理到 NestJS
- [ ] 域名解析 + 备案（若用国内服务器）

---

## 9. 未来升级路径（可视化管理后台）

如果日后觉得"改文件"也不够方便，可平滑升级，**不需要重构内容数据**：

1. **低代码后台**：用 `Strapi` / `Directus` 这类 headless CMS 直接接管 `content/` 结构，你已有的接口契约不变。
2. **Git 管理型 CMS**：接入 `Decap CMS`（GitHub 鉴权，界面化编辑 Markdown 文件），改动仍然走 git commit。
3. **自研后台**：在现有前端加 `/admin` 隐藏路由，表单编辑 → 内部仍是写文件/写库。

无论哪种，`docs/*_API_SPEC.md` 的 JSON 契约都保持稳定，前端零改动。

---

## 10. 落地清单

- [ ] 初始化 NestJS 项目，建立 `content/` 目录骨架（`posts/` `videos/` `books/` + 两个 JSON 文件）
- [ ] 接入 `gray-matter` + `fast-glob`，实现 `posts/videos/books/projects/timeline` 五个只读 Service
- [ ] 实现全局 `{ code, message, data }` Interceptor、分页/过滤 Query、DTO 校验
- [ ] 迁移现有 `src/data/mockData.ts` 数据到 `content/` 文件（首批各 2-3 篇做种子）
- [ ] 评论模块（动态数据）落库，暴露 `GET/POST /api/comments`
- [ ] `/static` 静态托管封面与视频，前端 mock 数据替换为 fetch 接口
