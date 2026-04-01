# BBQ Clear 熟度进度环 + 烧焦终局 实现计划

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** 用 SVG 进度环替换难以辨识的烟雾特效以直观显示熟度，并在食材烧焦后立即扫描死锁并结束游戏。

**Architecture:** Skewer 组件内嵌 SVG 圆环，level 驱动 stroke-dashoffset 和颜色；useGameState 熟度计时器内增加烧焦扫描逻辑。

**Tech Stack:** React, CSS, SVG, inline styles.

---

### Task 1: 清理旧代码 + 新增进度环

**Files:**
- Modify: `src/components/Skewer.jsx`
- Modify: `src/components/Skewer.css`

**Step 1: 删除 Skewer.jsx 中的烟雾 JSX**

将以下代码块从 Skewer.jsx 中删除：
```jsx
<div className="doneness-overlay"></div>
<div className="smoke-container">
  {[...Array(isBurnt ? 5 : Math.max(0, level - 2))].map((_, i) => (
    <div key={i} className={`smoke-particle ${isBurnt ? 'black' : 'white'}`} 
         style={{ ... }}></div>
  ))}
</div>
```

同时删除 style 中的 `'--doneness-opacity': ...` 行，以及 SVG 相关的颜色计算函数（需新增）。

**Step 2: 在 Skewer.jsx 中新增进度环 helper 函数和 SVG**

在组件内添加颜色计算函数：
```js
const getDoneColor = (level, isBurnt) => {
  if (isBurnt) return '#212121';
  if (level <= 0) return 'transparent';
  if (level <= 3) return '#4CAF50';
  if (level <= 6) return '#FFC107';
  return '#FF5722';
};
```

将 icon div 替换为 SVG 包裹结构：
```jsx
<div className="icon-ring-wrapper">
  <svg className="progress-ring" width="60" height="60" viewBox="0 0 60 60">
    {/* 底层灰环 */}
    <circle cx="30" cy="30" r="22" fill="none" 
            stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
    {/* 进度环 */}
    {level > 0 && (
      <circle cx="30" cy="30" r="22" fill="none"
              stroke={getDoneColor(level, isBurnt)}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="138"
              strokeDashoffset={138 * (1 - level / 10)}
              transform="rotate(-90 30 30)"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
      />
    )}
  </svg>
  <div className="icon">{FOOD_ICONS[type]}</div>
</div>
```

**Step 3: 删除 Skewer.css 中的旧特效样式**

删除以下规则块：
- `.doneness-overlay { ... }`
- `.smoke-container { ... }`
- `.smoke-particle { ... }`
- `.smoke-particle.black { ... }`
- `@keyframes smokeUp { ... }`

**Step 4: 新增 Skewer.css 进度环布局样式**

```css
.icon-ring-wrapper {
    position: relative;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: -15px;
}

.progress-ring {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    pointer-events: none;
}

.skewer .icon {
    font-size: 2.2rem;
    z-index: 4;
    text-shadow: 0 4px 6px rgba(0,0,0,0.6);
    position: relative;
}
```

注意：将 `.skewer .icon` 的原始规则（末尾有 `margin-bottom: -15px`）合并进这里，避免重复。

---

### Task 2: 烧焦时触发死锁检测

**Files:**
- Modify: `src/hooks/useGameState.js`

**Step 1: 在熟度计时器 useEffect 中，检测新增烧焦后扫描死锁**

在 `setGrills(prevGrills => ...)` 的回调末尾，计算新烧焦状态后添加检测逻辑。

注意：`setGrills` 的回调不能直接调用 `setGameStatus`，需要在 effect 外部用 ref 或额外的 state 变量传递。
推荐方案：用一个 `ref` 来标记"刚刚有食材新烧焦"，然后在计时器的 `setInterval` 回调中（setGrills 之后）检测。

具体实现：

```js
// 在 useEffect 的 setInterval 回调里：
setGrills(prevGrills => {
  let newBurntOccurred = false;
  const nextGrills = prevGrills.map(grill => {
    const newSlots = grill.slots.map(item => {
      if (!item || item.isBurnt) return item;
      const nextLevel = Math.min(item.level + 1, 10);
      const nowBurnt = nextLevel === 10;
      if (nowBurnt && !item.isBurnt) newBurntOccurred = true;
      return { ...item, level: nextLevel, isBurnt: nowBurnt };
    });
    return { ...grill, slots: newSlots };
  });

  // 若有新烧焦，立即检测场上是否还有3连可能
  if (newBurntOccurred) {
    const typeCounts = {};
    nextGrills.forEach(g => {
      g.slots.forEach(s => {
        if (s && !s.isBurnt) {
          typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
        }
      });
    });
    const canStillMatch = Object.values(typeCounts).some(c => c >= 3);
    if (!canStillMatch) {
      // 用 setTimeout 跳出 setState 上下文再调用
      setTimeout(() => {
        setGameStatus('lost');
        setGameOverReason('🔥 烤焦太多！已经没有可上的菜了，游戏结束。');
      }, 0);
    }
  }

  return nextGrills;
});
```

---

### Task 3: 验证视觉与逻辑

**Step 1: 视觉确认**
打开 http://localhost:5173，等待 10 秒观察进度环颜色是否从绿→黄→橙变化。

**Step 2: 烧焦逻辑确认**
若测试嫌等待时间长，可临时将 `10000` 改为 `2000` 快速验证烧焦后游戏是否正确结束。

**Step 3: Commit**
```bash
git add src/components/Skewer.jsx src/components/Skewer.css src/hooks/useGameState.js
git commit -m "feat: replace smoke with progress ring; add burnt deadlock detection"
```
