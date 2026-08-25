---
id: react-hooks-study
title: React Hooks 全面梳理：useState 到 useTransition
summary: 从基础到进阶，梳理 React Hooks 的常见用法、闭包陷阱与性能优化要点。
category: 学习笔记
date: 2026-08-10
readTime: 12 分钟
type: article
tags:
  - React
  - Hooks
  - 前端
coverImage: /static/posts/react-hooks-study/cover.svg
views: 1560
likes: 128
---
# React Hooks 全面梳理

## 1. useState

`useState` 是 React 最基础的 Hook，用于在函数组件内声明响应式状态：

```jsx
const [count, setCount] = useState(0)
```

要点：
- 状态更新是异步批处理的（React 18+ 自动批处理）。
- 更新函数写法 `setCount(c => c + 1)` 可避免闭包过期问题。

## 2. useEffect

`useEffect` 用于处理副作用：数据请求、订阅、DOM 操作等。

```jsx
useEffect(() => {
  // 副作用逻辑
  return () => {
    // 清理逻辑
  }
}, [deps])
```

## 3. 闭包陷阱

在 `useEffect` 或事件回调中引用过期的 state 是常见坑。解决办法是使用依赖数组或 `useRef` 保存最新值。

## 4. useMemo / useCallback / useTransition

- `useMemo`：缓存计算结果，避免昂贵计算重复执行。
- `useCallback`：缓存函数引用，配合 `React.memo` 减少子组件重渲染。
- `useTransition`：把非紧急更新标记为可中断，保持输入框流畅。

> 优化原则：先测性能再优化，避免盲目加 memo 导致代码复杂度上升。
