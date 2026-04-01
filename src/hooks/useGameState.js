/* e:\AIgame\src\hooks\useGameState.js */
import { useState, useCallback, useEffect } from 'react';

const FOOD_TYPES = ['meat', 'corn', 'mushroom', 'shrimp', 'chicken'];
const GRILL_COUNT = 12;
const SLOT_PER_GRILL = 3;
let _idCounter = 0;
const generateFood = (type) => ({ 
  type, 
  id: `food-${_idCounter++}`, 
  level: 0, 
  isBurnt: false 
});

export const useGameState = (isPaused = false) => {
  const [grills, setGrills] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2分钟
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [gameOverReason, setGameOverReason] = useState('');

  // 初始化游戏
  const initGame = useCallback(() => {
    const newGrills = Array.from({ length: GRILL_COUNT }, (_, i) => ({
      id: `grill-${i}`,
      slots: [null, null, null],
      pending: Array.from({ length: 15 }, () => generateFood(FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)])),
      isLocked: false,
    }));
    
    // 初始前排随机填充 (填中 2 个)，初始熟度随机 0~5
    newGrills.forEach(grill => {
      const emptyIndices = [0, 1, 2];
      const fillCount = 2; 
      for(let j = 0; j < fillCount; j++) {
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        const slotIdx = emptyIndices.splice(randomIndex, 1)[0];
        const food = grill.pending.shift();
        if (food) {
          food.level = Math.floor(Math.random() * 6); // 0~5 随机初始熟度
        }
        grill.slots[slotIdx] = food;
      }
    });

    setGrills(newGrills);
    setScore(0);
    setTimeLeft(120);
    setGameStatus('playing');
  }, []);

  // 补位逻辑（当槽位空出时触发）
  const refillGrills = useCallback(() => {
    setGrills(prevGrills => prevGrills.map(grill => {
      const newSlots = [...grill.slots];
      let newPending = [...grill.pending];
      
      for(let i = 0; i < SLOT_PER_GRILL; i++) {
        if (newSlots[i] === null && newPending.length > 0) {
          newSlots[i] = newPending.shift();
        }
      }
      
      return { ...grill, slots: newSlots, pending: newPending };
    }));
  }, []);

  // 计时器逻辑
  useEffect(() => {
    if (gameStatus !== 'playing' || isPaused) return;
    
    if (timeLeft <= 0) {
      setGameStatus('lost');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStatus, isPaused]);

  // 烤熟度自增逻辑 (随机 5~8 秒 +1)
  useEffect(() => {
    if (gameStatus !== 'playing' || isPaused) return;

    let timerId = null;

    const tick = () => {
      let newBurntOccurred = false;
      let latestGrills = null;

      setGrills(prevGrills => {
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
        latestGrills = nextGrills;
        return nextGrills;
      });

      // 若有新增烧焦，立即扫描是否还能组成3连
      setTimeout(() => {
        if (!newBurntOccurred || !latestGrills) return;
        const typeCounts = {};
        latestGrills.forEach(g => {
          g.slots.forEach(s => {
            if (s && !s.isBurnt) {
              typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
            }
          });
        });
        const canStillMatch = Object.values(typeCounts).some(c => c >= 3);
        if (!canStillMatch) {
          setGameStatus('lost');
          setGameOverReason('🔥 烤焦太多！已经没有可上的菜了，游戏结束。');
        }
      }, 0);

      // 随机 5000~8000ms 后执行下一次
      const nextDelay = 5000 + Math.random() * 3000;
      timerId = setTimeout(tick, nextDelay);
    };

    // 首次随机延迟后开始
    const initialDelay = 5000 + Math.random() * 3000;
    timerId = setTimeout(tick, initialDelay);

    return () => clearTimeout(timerId);
  }, [gameStatus, isPaused]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 提取补位逻辑以便内部调用
  // 提取补位逻辑以便内部调用
  const refillSpecificGrill = (grill, count = 1) => {
    const newSlots = [...grill.slots];
    let newPending = [...grill.pending];
    
    // 动态探测补位：确保盘中空位被补齐至目标数量 (count)
    for (let i = 0; i < count; i++) {
        const emptyIndices = newSlots.map((s, idx) => s === null ? idx : null).filter(idx => idx !== null);
        if (emptyIndices.length === 0 || newPending.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        const targetIdx = emptyIndices[randomIndex];
        newSlots[targetIdx] = newPending.shift();
    }
    return { ...grill, slots: newSlots, pending: newPending };
  };

  const moveSkewer = useCallback((source, targetGrillId, targetSlotIdx = null) => {
    setGrills(prevGrills => {
      const sourceGrill = prevGrills.find(g => g.id === source.grillId);
      const targetGrill = prevGrills.find(g => g.id === targetGrillId);
      
      if (!sourceGrill || !targetGrill || sourceGrill.isServing || targetGrill.isServing) return prevGrills;

      // 如果未指定具体插槽，找第一个空位
      const actualTargetSlotIdx = (targetSlotIdx !== null) ? targetSlotIdx : targetGrill.slots.indexOf(null);
      
      // 目标位置必须是空的
      if (actualTargetSlotIdx === -1 || targetGrill.slots[actualTargetSlotIdx] !== null) return prevGrills;

      const itemToMove = sourceGrill.slots[source.slotIdx];
      
      return prevGrills.map(g => {
        if (g.id === source.grillId && g.id === targetGrillId) {
          // 在同一个盘子内移动
          const newSlots = [...g.slots];
          newSlots[source.slotIdx] = null;
          newSlots[actualTargetSlotIdx] = itemToMove;
          return { ...g, slots: newSlots };
        }
        if (g.id === source.grillId) {
          const newSlots = [...g.slots];
          newSlots[source.slotIdx] = null;
          return { ...g, slots: newSlots };
        }
        if (g.id === targetGrillId) {
          const newSlots = [...g.slots];
          let item = { ...itemToMove };
          // 降级机制：如果食材很烫(level > 5)，移动时重置为 3
          if (item.level > 5 && !item.isBurnt) {
            item.level = 3;
          }
          newSlots[actualTargetSlotIdx] = item;
          return { ...g, slots: newSlots };
        }
        return g;
      });
    });
  }, []);

  const completeServe = useCallback((grillId) => {
    setGrills(prev => {
        const anyServing = prev.find(g => g.id === grillId && g.isServing);
        if (anyServing) {
            setScore(s => s + 100);
        }

        // 计算场上总数
        const totalVisibleCount = prev.reduce((acc, g) => 
            acc + g.slots.filter(s => s !== null).length, 0
        );
        
        // 50% 概率上 3 个菜，如果场上少于 20 个
        const refillCount = (totalVisibleCount < 20 && Math.random() > 0.5) ? 3 : 2;

        let nextGrills = prev.map(g => {
            if (g.id === grillId) {
                if (!g.isServing) return g;
                return refillSpecificGrill({ ...g, slots: [null, null, null], isServing: false }, refillCount);
            }
            if (!g.isServing && g.slots.every(s => s === null) && g.pending.length > 0) {
                return refillSpecificGrill(g, totalVisibleCount < 20 ? refillCount : 1);
            }
            return g;
        });

        // 方案 B：保底匹配逻辑
        // 检查场上是否至少有 1 组 3 个相同的正常物品
        const getFieldStats = (gs) => {
          const stats = {};
          gs.forEach(g => g.slots.forEach(s => {
            if (s && !s.isBurnt) {
              stats[s.type] = (stats[s.type] || 0) + 1;
            }
          }));
          return stats;
        };

        let currentStats = getFieldStats(nextGrills);
        const hasMatch = Object.values(currentStats).some(count => count >= 3);

        if (!hasMatch) {
          // 找一个场上已有的且 pending 中有的，补齐到 3 个
          const candidates = Object.entries(currentStats).filter(([type, count]) => count > 0);
          if (candidates.length > 0) {
             const [type, count] = candidates[0];
             const needed = 3 - count;
             // 寻找一个有空位的盘子
             for (let i = 0; i < needed; i++) {
               const targetG = nextGrills.find(g => g.slots.includes(null) && !g.isServing);
               if (targetG) {
                 nextGrills = nextGrills.map(g => {
                   if (g.id === targetG.id) {
                     const emptyIdx = g.slots.indexOf(null);
                     const newSlots = [...g.slots];
                     newSlots[emptyIdx] = generateFood(type); // 强制生成
                     return { ...g, slots: newSlots };
                   }
                   return g;
                 });
               }
             }
          } else {
             // 场上完全没东西了，随便刷 3 个同种
             const randomType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
             const targetG = nextGrills.find(g => !g.isServing);
             if (targetG) {
               nextGrills = nextGrills.map(g => {
                 if (g.id === targetG.id) {
                   return { ...g, slots: [generateFood(randomType), generateFood(randomType), generateFood(randomType)] };
                 }
                 return g;
               });
             }
          }
        }

        return nextGrills;
    });
  }, []);



  // 监控胜利与匹配检测
  useEffect(() => {
    if (isPaused) return;
    // 异步执行检测，避免阻塞
    const checkId = setTimeout(() => {
      setGrills(prevGrills => {
        let anyRemaining = false;
        let needsUpdate = false;

        const nextGrills = prevGrills.map(grill => {
            // 只要有一个烤肉架还有肉或后台有肉，游戏就还没赢
            if (grill.slots.some(s => s !== null) || grill.pending.length > 0) anyRemaining = true;
            
            if (grill.isServing) return grill;
            const slots = grill.slots;
            // 检查三连：且熟度必须 >= 1，且不能有烤焦的
            if (slots[0] && slots[1] && slots[2] && 
                slots[0].type === slots[1].type && slots[0].type === slots[2].type &&
                slots[0].level >= 1 && slots[1].level >= 1 && slots[2].level >= 1 &&
                !slots[0].isBurnt && !slots[1].isBurnt && !slots[2].isBurnt) {
              needsUpdate = true;
              return { ...grill, isServing: true };
            }
            return grill;
        });

        if (!anyRemaining && gameStatus === 'playing') {
            const bonus = timeLeft * 10;
            setScore(s => s + bonus);
            setGameStatus('won');
        }

        // 死锁检测：如果没有 3 连，且空位不足以补足
        const stats = {};
        let emptyCount = 0;
        let normalCount = 0;
        nextGrills.forEach(g => {
          emptyCount += g.slots.filter(s => s === null).length;
          g.slots.forEach(s => {
            if (s && !s.isBurnt) {
              normalCount++;
              stats[s.type] = (stats[s.type] || 0) + 1;
            }
          });
        });

        const canMatch = Object.values(stats).some(c => c >= 3);
        const canRefillMatch = Object.entries(stats).some(([t, c]) => c + emptyCount >= 3) || emptyCount >= 3;

        if (!canMatch && !canRefillMatch && gameStatus === 'playing') {
           setGameStatus('lost');
           setGameOverReason('已没有更多食材能上菜');
        }
        
        return needsUpdate || (!anyRemaining && gameStatus === 'playing') ? nextGrills : prevGrills;
      });
    }, 100);

    return () => clearTimeout(checkId);
  }, [grills, gameStatus, setScore, timeLeft, score, isPaused]); 

  return {
    grills,
    setGrills,
    score,
    setScore,
    timeLeft,
    gameStatus,
    gameOverReason,
    initGame,
    refillGrills,
    moveSkewer,
    completeServe
  };
};
