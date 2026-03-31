# BBQ Clear 实施计划

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 构建一个基于 Vite + React + GSAP 的“烧烤”主题三消除游戏，具有深色质感 UI 和丝滑动画。

**Architecture:** 
- 使用 React Context 或单一状态管理游戏状态（烧烤架、格子、补位队列）。
- 使用 GSAP 处理所有的平移、缩放和微交互动画。
- 使用 HTML5 Drag and Drop API 或自定义指针监听实现拖拽。

**Tech Stack:** React, Vite, GSAP, CSS Modules / Vanilla CSS.

---

### Task 1: 项目初始化
**Files:**
- Create: `package.json` (通过 vite 初始化)
- Create: `index.html`
- Create: `src/main.jsx`, `src/App.jsx`, `src/App.css`

**Step 1: 初始化项目**
Run: `npm create vite@latest ./ -- --template react` (自动运行)

**Step 2: 安装 GSAP**
Run: `npm install gsap`

**Step 3: 提交初始环境**
```bash
git add .
git commit -m "chore: initialize vite react project with gsap"
```

### Task 2: 设计系统与全局样式 (Warm Dark Palette)
**Files:**
- Modify: `src/App.css`
- Create: `src/styles/variables.css`

**Step 1: 定义色彩变量**
在 `variables.css` 中定义深色调、金属色和琥珀色。

**Step 2: 应用基础背景**
在 `App.css` 中应用深焦糖色背景和全局字体。

### Task 3: 核心数据模型与游戏状态
**Files:**
- Create: `src/hooks/useGameState.js`
- Modify: `src/App.jsx`

**Step 1: 定义初始状态**
实现包含 12 个烧烤架、每个烤架 3 个槽位的初始数据结构，以及每个烤架的待处理队列。

**Step 2: 实现随机化函数**
编写函数生成 5 种不同食材的随机组合。

### Task 4: 烧烤架与肉串组件 (UI)
**Files:**
- Create: `src/components/Grill.jsx`
- Create: `src/components/Skewer.jsx`

**Step 1: 构建 Grill 组件**
渲染包含 3 个槽位的容器。

**Step 2: 构建 Skewer 组件**
渲染具体的肉串图标（使用占位图形或简单 SVG 模拟设计文档中的质感）。

### Task 5: 拖拽逻辑实现
**Files:**
- Modify: `src/components/Skewer.jsx`, `src/components/Grill.jsx`

**Step 1: 实现 Drag Start**
记录被拖拽肉串的 ID 和来源位置。

**Step 2: 实现 Drop 逻辑**
处理将肉串移入新烤架的动作，并验证目标烤架是否已满。

### Task 6: 匹配逻辑与“上菜”动画 (GSAP)
**Files:**
- Modify: `src/hooks/useGameState.js`
- Create: `src/animations/gameAnimations.js`

**Step 1: 检测三连匹配**
当任一烤架占满 3 个相同食材时，将其标记为“已清理”。

**Step 2: 触发 GSAP 上菜动画**
肉串缩小并滑出屏幕，随后触发补位逻辑。

### Task 7: 倒计时、计分与排行榜
**Files:**
- Modify: `src/App.jsx`

**Step 1: 实现倒计时定时器**
实现 2 分钟倒计时，剩余 10 秒时 UI 变红跳动。

**Step 2: 本地持久化**
使用 `localStorage` 存储并读取 Top 10 得分数据。
