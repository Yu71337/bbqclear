# BBQ Clear 游戏迭代第 2 版设计文档 (2026-04-01)

## 1. 概述
针对上一版本遗留的交互缺陷、视觉生硬以及 UI 状态残留进行修复与升级。

## 2. 视觉表现与动画 (第 2, 4 点)
### 2.1 补位放大动画
*   **动作**：在 `Skewer.jsx` 组件加载时，挂载一个 GSAP 动画：`scale: 0 -> 1.2 -> 1`，持续 0.4s。
*   **目的**：使菜品补位显得更有动感，仿若“弹跳”而出。

### 2.3 “上菜”动画层级提升
*   **动作**：在 `gameAnimations.js` 的 `playServeAnimation` 逻辑中，强制设置正在飞行的 `elements` 的 `zIndex: 1000`。
*   **效果**：飞行轨迹始终显示在顶部。

## 3. 业务逻辑与 UI 修复 (第 1, 3 点)
### 3.1 榜单实时刷新
*   **逻辑**：在 `App.jsx` 的 `handleSubmitScore` 完成后，除了开启 `isLeaderboardOpen`，还要触发 `LeaderboardDrawer` 内部重新拉取接口逻辑。
*   **实现**：给 `LeaderboardDrawer` 增加一个 `onRefresh` 属性，或者利用 `key` 重建该组件触发 `useEffect`。更优方式是直接通过 props 触发内部刷新。

### 3.3 默认状态排除
*   **逻辑**：显式设置 `App.jsx` 中的 `isLeaderboardOpen` 初始值为 `false`。
*   **机制**：检查是否有任何地方在 `useEffect` 中根据 `gameStatus` 状态自动开启了该抽屉（如上一版本提交成功后的自动开启逻辑）。

## 4. 疑难 Bug 修复 (第 5 点)
### 4.1 拖拽“虚影” (Ghosting)
*   **现象描述**：在按住菜品拖拽时，原本应只捕获单个组件的快照，却附带了临近组件的轮廓。
*   **根源分析**：原生拖拽对包含 `margin`, `padding` 或重叠 `z-index` 的大容器进行快照时，若捕获范围计算偏移，会包含周围内容。
*   **解决方案**：
    *   在 `Skewer.css` 中添加 `user-select: none;` 和 `pointer-events: auto;`。
    *   在 `App.jsx` 的 `handleDragStart` 中设置 `e.dataTransfer.effectAllowed = 'move';`。
    *   确保 `skewer` 的容器层彻底解耦。

## 5. 开发步骤
1.  **环境准备**：新建 `feature/bbqclear-iteration-2` 分支及工作区。
2.  **视觉补丁**：实现 `Skewer` 入场动画与 `serve` 动画的层级调整。
3.  **UI 纠偏**：修正榜单初始开启状态，增加即时刷新能力。
4.  **Bug 修复**：治理系统级的拖拽虚影。
5.  **验证**：全流程功能合规性测试。
