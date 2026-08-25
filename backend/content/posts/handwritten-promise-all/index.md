---
id: handwritten-promise-all
title: 手写 Promise.all 核心实现与边界测试
summary: 前端高频手撕面试题：支持 JS/TS/Python 多语言切换与本地测试文件一键导出下载。
category: 手撕代码
date: 2026-08-20
readTime: 15 分钟
type: coding
tags:
  - 手撕代码
  - Promise
  - 异步编程
coverImage: /static/posts/handwritten-promise-all/cover.svg
views: 3120
likes: 245
---
# 手写实现 Promise.all

`Promise.all` 接收一个可迭代对象，返回一个新的 Promise。当所有输入都 resolve 时，输出结果数组（保持输入顺序）；任意一个 reject 则整体 reject。

## 需要支持的边界

- 输入可以是任意 Iterable（数组、Set 等）。
- 空数组应立即 resolve 空数组。
- 普通值可直接作为结果。
- 采用「计数器」方案统计完成数量，避免依赖结果数组长度导致提前 resolve。
