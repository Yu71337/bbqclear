# BBQ Clear 游戏迭代第 4 版设计文档 (2026-04-01)

## 1. 概述
本次迭代专注于手感调优、视觉细节提升以及引导机制（Tutorial）的引入，以解决 V3 带来的操作迟钝与新规则复杂性。

## 2. 交互与手感升级 (Interaction Fix)
### 2.1 拖动手感恢复 (Native Ghosting)
*   **动作**：移除现有的 `-webkit-user-drag: element` 样式。
*   **优化**：在 `Skewer.jsx` 的 `onDragStart` 时，使用 `e.dataTransfer.setDragImage` 设置特定的拖拽源图像。确保虚影（Ghosting）包含视觉全貌但排除邻居区域。
*   **灵敏度**：通过 `user-select: none` 强化捕获，并确保 CSS 变换不会导致原生快照计算偏移。

### 2.2 视觉反馈修复 (Click/Selection)
*   **动作**：修正 `Skewer.css` 中的 `.selected` 和 `:active` 伪类样式。确保其缩放效果高于 GSAP 入场动画的残留属性。
*   **实现**：设置更高级别的权重，并确保 GSAP `clearProps` 动作执行后点击反馈依然生效。

## 3. 视觉与策略平衡 (Visuals & Period)
### 3.1 青烟视觉优化
*   **动作**：将 `smoke-container` 设置为相对于盘子或屏幕的 `absolute` 定位，提升 `zIndex` 至 `2000`。
*   **修补**：确保 `Grill` 容器的 `overflow` 为 `visible`，防止烟雾被裁剪。

### 3.2 熟度步进步调
*   **调整**：全局熟度刷新周期从 `5s` 增加至 `10s`。
*   **目的**：为新手大厨提供更合理的容错反应时间。

## 4. 新手指引系统 (Tutorial Overlay)
### 4.1 逻辑与状态
*   **触发条件**：
    1. 首次打开网页。
    2. 点击“再来一轮”重启游戏时。
*   **暂停约束**：`TutorialOverlay` 开启期间，`useGameState` 传入 `isPaused: true`，倒计时冻结，场景交互锁定。

### 4.2 视觉引导素材
*   **配图 1**：`tutorial_serve_hint.png`（3 个冒烟食材 -> 上菜箭头）。
*   **配图 2**：`tutorial_burnt_hint.png`（黑色食材 -> 红色 X 禁手）。
*   **指引卡片**：采用简约白色背景，展示扁平化简笔画风格图标，清晰明了。

## 5. 开发步骤
1.  **Task 1**: 治理手感 Bug（恢复原生拖拽虚影与点击缩放）。
2.  **Task 2**: 调整数值步进步调 (5s -> 10s) 与 烟雾 Z 轴。
3.  **Task 3**: 开发 `TutorialOverlay` 组件。
4.  **Task 4**: 最终接入与全场景测试。
