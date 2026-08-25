# 📖 学习文章数据接口规范（Learning Post JSON API Spec）

> 适用于通过接口向后端传入「学习」板块文章数据的场景。前端渲染的是 `content` 中的 **Markdown 字符串**，并不真正解析富文本/PDF。接口只需返回符合本规范的 JSON 即可。
>
> 学习文章共 **3 种类型**（`Post.type`）：
> - `article` — 普通图文学习笔记（默认，不传 `type` 即为 article）
> - `quiz` — 交互式选择题集（含 `quizzes` 数组）
> - `coding` — 手撕代码沙箱（含 `codingChallenge` 对象）

---

## 1. 数据来源与接入方式

当前学习文章数据由静态文件引入：

```tsx
// src/App.tsx
import { SAMPLE_POSTS } from './data/mockData'
const [posts] = useState<Post[]>(SAMPLE_POSTS)
```

改为接口后：

```tsx
const [posts, setPosts] = useState<Post[]>([])
useEffect(() => {
  fetch('/api/posts')
    .then((r) => r.json())
    .then((data) => setPosts(data))
}, [])
```

接口返回 `Post[]` 数组即可（若包裹在 `{ data: Post[] }` 中，需自行解包取 `data`）。

---

## 1.1 接口契约（后端约定）

| 项目 | 约定 |
| --- | --- |
| 端点 | `GET /api/posts` |
| 响应格式 | 统一 JSON 包：`{ "code": 0, "message": "ok", "data": Post[] }`（`code: 0` 表示成功） |
| 错误格式 | `{ "code": 404, "message": "资源不存在", "data": null }`，HTTP 状态码与 `code` 一致 |
| 分页 | `GET /api/posts?page=1&pageSize=20` → `data` 为 `{ "list": Post[], "total": 100, "page": 1, "pageSize": 20 }` |
| 过滤 | `?type=quiz`、`?category=手撕代码`、`?keyword=Promise`（按 `title`/`summary`/`tags`/`content` 模糊匹配） |
| 详情 | `GET /api/posts/{id}` → 返回单个 `Post`（含完整的 `quizzes` / `codingChallenge`） |
| 列表精简 | 列表接口可省略 `content`、`quizzes`、`codingChallenge` 等大字段；详情接口必须返回完整字段 |
| 静态文件 | `coverImage` 指向真实可访问的静态资源 URL（浏览器直接 `<img>`） |
| 内容来源 | `content` / `explanation` / `description` 均为 **Markdown 字符串**，由 `MarkdownRenderer` 渲染 |
| CORS | 若前后端分离，需开放跨域（`Access-Control-Allow-Origin`） |

---

## 2. Post 顶层字段（3 种类型共用）

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | 唯一 ID |
| `title` | `string` | ✅ | 文章标题 |
| `summary` | `string` | ✅ | 摘要（列表卡片展示） |
| `category` | `string` | ✅ | 分类（如 `手撕代码`、`面试题库`、`学习笔记`） |
| `date` | `string` | ✅ | 发布时间（`YYYY-MM-DD`） |
| `readTime` | `string` | ✅ | 预计阅读时长（如 `15 分钟`） |
| `tags` | `string[]` | ✅ | 标签 |
| `content` | `string` | ✅ | 正文（**Markdown 字符串**） |
| `type` | `string` | 否 | 文章类型：`article`（默认）\| `quiz` \| `coding` |
| `quizzes` | `QuizItem[]` | 否 | 选择题集（`type === 'quiz'` 时必填） |
| `codingChallenge` | `CodingChallenge` | 否 | 代码沙箱挑战（`type === 'coding'` 时必填） |
| `coverImage` | `string` | 否 | 封面图 URL |
| `views` | `number` | ✅ | 阅读量 |
| `likes` | `number` | ✅ | 点赞数 |

> **要点**：`type` 决定前端渲染哪种交互组件。`article` 走纯 Markdown 阅读；`quiz` 额外渲染题目卡片并支持在线作答；`coding` 额外渲染在线代码沙箱（多语言切换 + 测试用例 + 文件下载）。

---

## 3. QuizItem 选择题字段

> 仅 `type === 'quiz'` 时使用，挂在 `Post.quizzes` 数组中。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | 题目 ID（同一文章内唯一） |
| `question` | `string` | ✅ | 题干（Markdown，可含代码块） |
| `options` | `QuizOption[]` | ✅ | 选项数组（通常 4 个） |
| `explanation` | `string` | ✅ | 考点剖析解析（Markdown） |
| `difficulty` | `string` | ✅ | `easy` \| `medium` \| `hard` |
| `tags` | `string[]` | 否 | 题目标签 |

### QuizOption 选项字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | 选项 ID（如 `a` / `b` / `c` / `d`） |
| `text` | `string` | ✅ | 选项文本 |
| `isCorrect` | `boolean` | ✅ | 是否为正确答案（每题**有且仅有 1 个**为 `true`） |

---

## 4. CodingChallenge 代码沙箱字段

> 仅 `type === 'coding'` 时使用，挂在 `Post.codingChallenge` 对象上。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | 挑战 ID（唯一） |
| `title` | `string` | ✅ | 挑战标题 |
| `difficulty` | `string` | ✅ | `easy` \| `medium` \| `hard` |
| `description` | `string` | ✅ | 题目描述（Markdown） |
| `starterCode` | `string` | ✅ | 默认语言（JS）初始代码模板 |
| `solutionCode` | `string` | ✅ | 默认语言（JS）参考答案 |
| `testCases` | `TestCase[]` | ✅ | 测试用例（至少 1 个） |
| `hints` | `string[]` | 否 | 解题提示 |
| `languageTemplates` | `LanguageTemplate[]` | 否 | 各语言语法模板（不传则仅支持默认语言） |

### TestCase 测试用例字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | 用例 ID（如 `t1`） |
| `name` | `string` | ✅ | 用例名称/描述 |
| `code` | `string` | ✅ | 测试执行代码片段 |
| `expectedOutput` | `string` | ✅ | 期望输出（字符串化比较） |

### LanguageTemplate 语言模板字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `language` | `string` | ✅ | `javascript` \| `typescript` \| `python` |
| `label` | `string` | ✅ | 界面显示名（如 `TypeScript (v5.7)`） |
| `extension` | `string` | ✅ | 文件扩展名（`js` \| `ts` \| `py`） |
| `starterCode` | `string` | ✅ | 该语言的初始代码 |
| `solutionCode` | `string` | ✅ | 该语言的参考答案 |

---

## 5. 完整示例

### 5.1 纯文章（article，`type` 可省略）

```jsonc
{
  "id": "react-hooks-study",
  "title": "React Hooks 全面梳理：useState 到 useTransition",
  "summary": "从基础到进阶，梳理 React Hooks 的常见用法、闭包陷阱与性能优化要点。",
  "category": "学习笔记",
  "date": "2026-08-10",
  "readTime": "12 分钟",
  "tags": ["React", "Hooks", "前端"],
  "type": "article",
  "coverImage": "https://example.com/covers/react-hooks.jpg",
  "views": 1560,
  "likes": 128,
  "content": "# React Hooks 全面梳理\n\n## 1. useState\n\n...Markdown 内容..."
}
```

### 5.2 选择题集（quiz）

```jsonc
{
  "id": "frontend-quiz-set",
  "title": "前端高频核心选择题集与深度解析",
  "summary": "精选前端中高级核心面试选择题，点击选项即时判定并查看 Markdown 深度解析。",
  "category": "面试题库",
  "date": "2026-08-18",
  "readTime": "10 分钟",
  "tags": ["面试真题", "选择题", "JavaScript"],
  "type": "quiz",
  "views": 4280,
  "likes": 312,
  "content": "# 前端高频选择题集\n\n本套试题聚焦大厂前端面试高频概念……",
  "quizzes": [
    {
      "id": "q1",
      "question": "关于 JavaScript 事件循环，以下代码的输出顺序正确的是？\n\n```js\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n```",
      "difficulty": "easy",
      "options": [
        { "id": "a", "text": "1, 4, 2, 3", "isCorrect": false },
        { "id": "b", "text": "1, 4, 3, 2", "isCorrect": true },
        { "id": "c", "text": "1, 2, 3, 4", "isCorrect": false },
        { "id": "d", "text": "1, 3, 4, 2", "isCorrect": false }
      ],
      "explanation": "### 考点剖析：同步任务 > 微任务 > 宏任务\n\n1. ...Markdown 解析内容...",
      "tags": ["事件循环"]
    }
  ]
}
```

### 5.3 手撕代码沙箱（coding）

```jsonc
{
  "id": "handwritten-promise-all",
  "title": "手写 Promise.all 核心实现与边界测试",
  "summary": "前端高频手撕面试题：支持 JS/TS/Python 多语言切换与本地测试文件一键导出下载。",
  "category": "手撕代码",
  "date": "2026-08-20",
  "readTime": "15 分钟",
  "tags": ["手撕代码", "Promise", "异步编程"],
  "type": "coding",
  "views": 3120,
  "likes": 245,
  "content": "# 手写实现 Promise.all\n\n`Promise.all` 接收一个可迭代对象……",
  "codingChallenge": {
    "id": "cc-promise-all",
    "title": "手写实现 myPromiseAll 函数",
    "difficulty": "medium",
    "description": "编写一个 `myPromiseAll(promises)` 函数，模拟原生 `Promise.all` 的行为。",
    "starterCode": "function myPromiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    if (!promises || typeof promises[Symbol.iterator] !== \"function\") {\n      return reject(new TypeError(\"promises must be iterable\"));\n    }\n    const promiseArr = Array.from(promises);\n    if (promiseArr.length === 0) return resolve([]);\n    const results = [];\n    let count = 0;\n    // TODO: 实现 Promise 收集逻辑\n  });\n}",
    "solutionCode": "function myPromiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    // ...完整参考答案...\n  });\n}",
    "languageTemplates": [
      {
        "language": "javascript",
        "label": "JavaScript (ES2024)",
        "extension": "js",
        "starterCode": "function myPromiseAll(promises) { ... }",
        "solutionCode": "function myPromiseAll(promises) { ... }"
      },
      {
        "language": "typescript",
        "label": "TypeScript (v5.7)",
        "extension": "ts",
        "starterCode": "function myPromiseAll<T extends readonly unknown[] | []>(...) { ... }",
        "solutionCode": "function myPromiseAll<T extends readonly unknown[] | []>(...) { ... }"
      },
      {
        "language": "python",
        "label": "Python (asyncio.gather)",
        "extension": "py",
        "starterCode": "import asyncio\n\nasync def my_gather(*aws):\n    results = [None] * len(aws)\n    # TODO: 使用 asyncio 收集所有任务结果\n    return results",
        "solutionCode": "import asyncio\n\nasync def my_gather(*aws):\n    tasks = [asyncio.ensure_future(aw) for aw in aws]\n    return [await task for task in tasks]"
      }
    ],
    "hints": [
      "使用 Array.from(promises) 处理所有 Iterable 输入。",
      "用 count 计数器统计完成数量，count === length 时 resolve(results)。"
    ],
    "testCases": [
      {
        "id": "t1",
        "name": "处理普通值与已解决的 Promise 并发",
        "code": "await myPromiseAll([1, Promise.resolve(2), 3])",
        "expectedOutput": "[1, 2, 3]"
      },
      {
        "id": "t2",
        "name": "空数组应立即 resolve 空数组",
        "code": "await myPromiseAll([])",
        "expectedOutput": "[]"
      }
    ]
  }
}
```

---

## 6. 关键约定

- **`content` / `question` / `explanation` / `description` 均为 Markdown 字符串**，由 `MarkdownRenderer` 渲染，不是 HTML。
- **`type` 决定交互组件**：`quiz` 必须有 `quizzes`，`coding` 必须有 `codingChallenge`，否则前端按普通 `article` 渲染。
- **`QuizOption.isCorrect` 每题有且仅有 1 个 `true`**，否则作答判定失效。
- **`testCases` 至少 1 个**，`expectedOutput` 按字符串化结果比对。
- **`languageTemplates` 不传则仅支持默认 JavaScript 语言**；传了则沙箱顶部展示多语言切换。
- 列表接口可省略大字段（`content` / `quizzes` / `codingChallenge`）以减小体积，但详情接口必须返回完整数据。
