# 🎬 兴趣影音数据接口规范（Hobby Video JSON API Spec）

> 适用于通过接口向后端传入「兴趣」板块视频数据的场景。前端通过 `<video>` 原生播放器渲染真实视频，接口只需返回符合本规范的 JSON 即可。

---

## 1. 数据来源与接入方式

当前兴趣视频数据由静态文件引入：

```tsx
// src/App.tsx
import { SAMPLE_VIDEOS } from './data/mockData'
const [videos] = useState<HobbyVideo[]>(SAMPLE_VIDEOS)
```

改为接口后：

```tsx
const [videos, setVideos] = useState<HobbyVideo[]>([])
useEffect(() => {
  fetch('/api/videos')
    .then((r) => r.json())
    .then((data) => setVideos(data))
}, [])
```

接口返回 `HobbyVideo[]` 数组即可（若包裹在 `{ data: HobbyVideo[] }` 中，需自行解包取 `data`）。

---

## 1.1 接口契约（后端约定）

| 项目 | 约定 |
| --- | --- |
| 端点 | `GET /api/videos` |
| 响应格式 | 统一 JSON 包：`{ "code": 0, "message": "ok", "data": HobbyVideo[] }`（`code: 0` 表示成功） |
| 错误格式 | `{ "code": 404, "message": "资源不存在", "data": null }`，HTTP 状态码与 `code` 一致 |
| 分页 | `GET /api/videos?page=1&pageSize=20` → `data` 为 `{ "list": HobbyVideo[], "total": 100, "page": 1, "pageSize": 20 }` |
| 过滤 | `?category=music`、`?keyword=航拍`（按 `title`/`description` 模糊匹配） |
| 详情 | `GET /api/videos/{id}` → 返回单个 `HobbyVideo` |
| 静态文件 | `videoUrl` / `posterUrl` 指向真实可访问的静态资源 URL（浏览器 `<video>` / `<img>` 直接引用） |
| 播放器 | 前端用原生 `<video controls src={videoUrl} poster={posterUrl}>` 播放，支持 `mp4` / `webm` / `mov` 等浏览器可直接播放的格式 |
| CORS | 若前后端分离，需开放跨域（`Access-Control-Allow-Origin`），且视频流需支持 Range 请求以支持进度条拖动 |

---

## 2. HobbyVideo 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | 唯一 ID |
| `title` | `string` | ✅ | 视频标题 |
| `description` | `string` | ✅ | 简介（卡片展示） |
| `category` | `string` | ✅ | 分类：`vlog` \| `tech` \| `music` \| `gaming` |
| `videoUrl` | `string` | ✅ | 真实视频文件 URL（mp4/webm/mov 等） |
| `posterUrl` | `string` | ✅ | 视频封面/海报图 URL |
| `duration` | `string` | ✅ | 时长（如 `0:15`、`12:30`，`MM:SS` 格式字符串） |
| `date` | `string` | ✅ | 发布日期（`YYYY-MM-DD`） |
| `views` | `number` | ✅ | 播放量 |

### category 可选值

`vlog`（城市 Vlog & 航拍）\| `tech`（桌面 Setup & 硬件）\| `music`（指弹吉他 & 音乐）\| `gaming`（游戏娱乐）

> 前端分类 Tab 固定为 `vlog` / `tech` / `music`，`gaming` 预留但当前未展示对应 Tab，传入的 `gaming` 视频不会出现在任何 Tab 下。

---

## 3. 完整示例

```jsonc
{
  "id": "v1",
  "title": "赛博夜色 - 4K 城市流光航拍剪辑",
  "description": "使用无人机记录下的科技都市夜景，配合 Ambient Synthwave 音乐，感受极小与极大的视觉冲击。",
  "category": "vlog",
  "videoUrl": "https://example.com/videos/city-night.mp4",
  "posterUrl": "https://example.com/posters/city-night.jpg",
  "duration": "0:15",
  "date": "2026-08-10",
  "views": 3420
}
```

---

## 4. 关键约定

- **`videoUrl` 必须是浏览器可直接播放的真实视频文件**，前端不解析任何播放列表/流媒体协议（如 m3u8），需为 mp4/webm/mov 直链。
- **`posterUrl` 为视频封面**，在未播放时展示，建议 16:9 比例（卡片为 `aspect-video`）。
- **`duration` 为字符串**，格式 `MM:SS`（如 `0:15`、`12:30`），直接展示在卡片角标，不是秒数数字。
- **`category` 决定卡片顶部分类徽标与 Tab 筛选**，前端按 `v.category === selectedCategory` 精确匹配。
