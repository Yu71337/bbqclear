# BBQ Clear 迭代第 5 版设计文档 (2026-04-01)

## 概述
本次迭代将烤熟度显示从【容易被遮挡、颜色淡的烟雾粒子特效】替换为【清晰的 SVG 圆形进度环】，
同时在食材烧焦时主动触发死锁检测，让游戏能立即结束并给出明确提示。

## 1. 进度环视觉设计
### 结构
每个 Skewer 的 emoji 外层包裹一个相对定位容器，内嵌 SVG circle 组件：
- 底层：灰色背景圆环（始终可见）
- 上层：随熟度变化颜色+弧长的进度圆环

### 颜色规则
| 熟度 | 颜色 | 含义 |
|------|------|------|
| 0 | 透明（仅底环灰色） | 未熟 |
| 1-3 | #4CAF50 绿色 | 可上菜 |
| 4-6 | #FFC107 黄色 | 偏熟 |
| 7-9 | #FF5722 橙红 | 非常烫 |
| 10 | #212121 黑色 | 烧焦 |

### 实现方式
- 圆环半径 r=22, 周长 ≈ 138
- `stroke-dasharray="138"`, `stroke-dashoffset = 138 * (1 - level/10)`
- 颜色用 JS 函数根据 level 返回对应 hex 值
- 删除旧的 `.smoke-container`, `.doneness-overlay` 等代码

## 2. 烧焦终局检测
### 触发时机
在 `useGameState.js` 的熟度计时器 effect 内，每次更新后扫描：
- 若有 **新增** 的烧焦食材（level 刚从 9 变 10）
- 立即统计场上 `isBurnt===false` 的食材各品种数量
- 若没有任何品种 count ≥ 3 → 设置 `gameStatus='lost'` + `gameOverReason`

### 提示文案
> "🔥 烤焦了太多！已经没有可上的菜了，游戏结束。"

## 3. 清理原有代码
- 移除 Skewer.jsx 中的 `smoke-container` JSX
- 移除 Skewer.css 中的 `.smoke-container`, `.smoke-particle`, `@keyframes smokeUp`, `.doneness-overlay` 规则
- 移除 Skewer.jsx 中的 `--doneness-opacity` CSS 变量
