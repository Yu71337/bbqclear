# BBQ Clear 迭代开发计划

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 优化游戏交互，修复动画，增加基于局域网的排行榜系统。

**Architecture:** 前端 React + GSAP，后端简单 Node.js/Express 服务，通过 Vite Proxy 同步。

**Tech Stack:** React, GSAP, Express, CORS, FS (JSON storage).

---

### Task 1: 环境与后端基础
**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `server/index.js`
- Create: `server/scores.json`

**Step 1: 安装依赖并配置代理**
在 `package.json` 中添加 `express`, `cors`, `nodemon`。
修改 `vite.config.js` 添加 `/api` 代理。

**Step 2: 编写 Express 后端**
实现 `GET /api/scores` 和 `POST /api/scores`。
数据存储在 `server/scores.json`。

**Step 3: 启动后端并验证**
运行后端，测试接口连通性。

---

### Task 2: 核心游戏逻辑更新
**Files:**
- Modify: `src/hooks/useGameState.js`

**Step 1: 实现随机补位**
修改 `refillSpecificGrill` 和 `initGame`，使用随机逻辑填充 `null` 槽位。

**Step 2: 实现爆发补给 (20个菜品检测)**
在 `completeServe` 中统计场上 `totalVisibleCount`。
若 `< 20`，设置补给数量为 `Math.random() > 0.5 ? 3 : 2`。

---

### Task 3: UI 与排行榜组件
**Files:**
- Create: `src/components/LeaderboardDrawer.jsx`
- Create: `src/components/LeaderboardDrawer.css`
- Modify: `src/App.jsx`
- Modify: `src/App.css`

**Step 1: 创建排行榜侧边栏组件**
实现由右向左滑出的动画效果。
展示从 API 获取的前 10 名数据。

**Step 2: 在 App.jsx 中集成**
添加“排行榜”按钮。
处理 `isLeaderboardOpen` 状态，控制时间暂停和交互禁用。

---

### Task 4: 动画修复与音效清理
**Files:**
- Modify: `src/animations/gameAnimations.js`
- Modify: `src/App.jsx`
- Modify: `src/components/Grill.jsx`

**Step 1: 重构上菜动画**
获取排行榜按钮的位置。
修改 `playServeAnimation` 使其飞向该位置并缩小消失。

**Step 2: 清理音效代码**
从 `App.jsx` 中彻底删除 `playSound` 相关逻辑。

**Step 3: 修复选中态互斥**
在 `handleDragStart` 中添加取消选中逻辑。

---

### Task 5: 游戏结束流程优化
**Files:**
- Modify: `src/App.jsx`

**Step 1: 添加姓名输入框**
在游戏结束模态框中添加姓名输入。

**Step 2: 提交分数至后端**
调用 `POST /api/scores` 接口。

---

### Task 6: 最终验证
**Step 1: 运行全流程测试**
确保动画、随机补位、排行榜、局域网访问均正常。
