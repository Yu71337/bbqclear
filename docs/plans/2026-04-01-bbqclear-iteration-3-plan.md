# BBQ Clear 迭代第 3 版开发计划

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 修复倒计时、拖拽、动画等 Bug，新增熟度系统与烧焦惩罚机制，确保场上始终至少有一组可匹配食材。

**Architecture:** 前端 React + GSAP 进阶烟雾动画，后端 Node.js 日志监控。

**Tech Stack:** React, GSAP, CSS Animations, Express API.

---

### Task 1: 基础 Bug 修正
**Files:**
- Modify: `src/hooks/useGameState.js`
- Modify: `src/animations/gameAnimations.js`
- Modify: `src/components/Skewer.jsx`
- Modify: `src/components/Skewer.css`

**Step 1: 修复计时器恢复 Bug**
修改 `useGameState` 中的 `useEffect` 计时器 Effect，确保正确监听 `isPaused`。

**Step 2: 动画回归最初版本 (固定方向飞走)**
还原 `playServeAnimation` 的位移逻辑。不再动态计算位置，而是直接飞向右上角。

**Step 3: 解决拖放交互卡死 (Ghosting 之后遗留问题)**
优化 `Skewer` 入场动画与 `pointer-events` 的同步。

---

### Task 2: 烤熟度与烧焦系统 (Doneness System)
**Files:**
- Modify: `src/hooks/useGameState.js`
- Modify: `src/components/Skewer.jsx`
- Modify: `src/components/Skewer.css`

**Step 1: 熟度状态与随时间推移的自增**
在 `useGameState` 中新增一个全局 5s 周期。
遍历所有盘子上的可见食材，使 `level` 加 1（封顶 10）。

**Step 2: 熟度约束与移动降级**
只有 `level >= 1` 且无烧焦的 3 连才能执行上菜逻辑。
移动 `level > 5` 的食材时，自动将其重置为 `level = 3`。

**Step 3: 烧焦视觉与黑烟特效**
当 `level === 10` 时，食材变黑，动画显示黑烟（CSS/GSAP 循环播放粒子）。

---

### Task 3: 智能保底匹配与终局逻辑 (方案 B)
**Files:**
- Modify: `src/hooks/useGameState.js`

**Step 1: 数据扫描与匹配可能性推导**
每轮补位前统计全场正常食材品种及其对应的最高计数。

**Step 2: 强制补齐策略**
若场上已无法凑出 3 连，在最近的一个空位强制补齐所需品种。

**Step 3: 特殊失败弹框**
检测死锁情况（全是烤焦且已无食材），提前终止并在 App.jsx 展示对应提示框。

---

### Task 4: 服务端监控与日志优化
**Files:**
- Modify: `server/index.cjs`

**Step 1: 增加访问与存储日志**
记录每次 API 的状态码与存储写入成功的具体记录。
向客户端返回更明确的错误 Code。
