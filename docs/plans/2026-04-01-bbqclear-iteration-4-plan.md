# BBQ Clear 迭代第 4 版开发计划

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 恢复点击/拖拽手感，修正烟雾层级，将熟度步进改为 10s，并新增全屏新手指引引导。

**Architecture:** 前端 React + CSS Native Drag + GSAP Overlay.

**Tech Stack:** React, GSAP, CSS Animations.

---

### Task 1: 手感与视觉回归 (Interaction Fix)
**Files:**
- Modify: `src/components/Skewer.jsx`
- Modify: `src/components/Skewer.css`
- Modify: `src/hooks/useGameState.js`

**Step 1: 恢复原生拖拽虚影 (Ghosting)**
移除 `Skewer.css` 中的强制设置，优化 `onDragStart` 以获得更流畅的原生虚影。

**Step 2: 修改熟度增长速度 (5s -> 10s)**
修改 `useGameState` 中的 `interval` 为 `10000`。

**Step 3: 烟雾层级提升与容器裁剪修复**
设置 `smoke-container` 的 `zIndex: 2000`。
确认 `Skewer.css` 的 `.skewer` 以及相关父类层级没有 `overflow: hidden`。

---

### Task 2: 新手指引系统 (Tutorial Overlay)
**Files:**
- New Component: `src/components/TutorialOverlay.jsx`
- New Component Style: `src/components/TutorialOverlay.css`
- Modify: `src/App.jsx`

**Step 1: 开发指引遮罩组件**
渲染背景模糊层，显示生成的 `tutorial_serve_hint.png` 与 `tutorial_burnt_hint.png`。
设置一个“我知道了”按钮来关闭。

**Step 2: 绑定 App.jsx 状态与暂停逻辑**
在 `App.jsx` 中增加 `showTutorial` 状态。
首次挂载和调用 `initGame` 时设置为 `true`。
将 `showTutorial || isLeaderboardOpen` 作为 `isPaused` 传入 `useGameState`。

---

### Task 3: 最终验证
**Step 1: 验证交互灵敏度**
确保拖动时虚影清晰、点击时缩放动画有力且无遮挡。
确认新手引导期间倒计时未跳动。
