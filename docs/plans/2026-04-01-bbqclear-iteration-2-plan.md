# BBQ Clear 迭代第 2 版开发计划

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 修复排行榜刷新、动画生硬、层级显示、初始状态残留以及拖拽虚影。

**Architecture:** 前端 React + GSAP 进阶动画。

**Tech Stack:** React, GSAP, CSS Grid/Flex.

---

### Task 1: 视觉与入场动画升级
**Files:**
- Modify: `src/components/Skewer.jsx`
- Modify: `src/components/Skewer.css`
- Modify: `src/animations/gameAnimations.js`

**Step 1: 为 Skewer 添加弹性入场动画**
在 `Skewer.jsx` 的 `useEffect` 中，当组件挂载时，执行 `scale: 0 -> 1.2 -> 1` 的入场动画。

**Step 2: 修正拖拽虚影 (Ghosting)**
在 `Skewer.css` 的 `.skewer` 类下添加 `user-select: none;` 和 `pointer-events: auto;`。
在 `Skewer.jsx` 的 `onDragStart` 时设置 `e.dataTransfer.effectAllowed = 'move';`。

**Step 3: 上菜动画层级补强**
在 `gameAnimations.js` 的 `playServeAnimation` 内部增加 `zIndex: 1000` 设置。

---

### Task 2: 排行榜状态与即时刷新
**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/LeaderboardDrawer.jsx`

**Step 1: 确保开局不自动弹窗**
修改 `App.jsx` 中的 `isLeaderboardOpen` 初始值为 `false`。
检查 `gameStatus` 可能引发的副作用，确保仅在点击时或提交后打开。

**Step 2: 提交成功后立即刷新榜单**
在 `App.jsx` 的 `handleSubmitScore` 后，显式触发 `LeaderboardDrawer` 刷新。
方案：利用给 `LeaderboardDrawer` 增加 `key={<timestamp>}` 的方式，强制组件销毁并重新初始化，以触发其 `useEffect`。

---

### Task 3: 最终验证
**Step 1: 运行全流程测试**
确保：
1. 菜品出场有弹性动画。
2. 提交分数后立刻能看到自己在榜单。
3. 拖拽时不再有背景虚影。
4. “上菜”动画此时必定在顶部显示。
