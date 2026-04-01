/* e:\AIgame\src\hooks\useGameState.js */
import { useState, useCallback, useEffect } from 'react';

const FOOD_TYPES = ['meat', 'corn', 'mushroom', 'shrimp', 'chicken'];
const GRILL_COUNT = 12;
const SLOT_PER_GRILL = 3;
let _idCounter = 0;
const generateFood = (type) => ({ type, id: `food-${_idCounter++}` });

export const useGameState = () => {
  const [grills, setGrills] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2分钟
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost

  // 初始化游戏
  const initGame = useCallback(() => {
    const newGrills = Array.from({ length: GRILL_COUNT }, (_, i) => ({
      id: `grill-${i}`,
      slots: [null, null, null],
      pending: Array.from({ length: 15 }, () => generateFood(FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)])),
      isLocked: false,
    }));
    
    // 初始前排填充 (至少 2 个)
    newGrills.forEach(grill => {
      const fillCount = 2; 
      for(let j = 0; j < fillCount; j++) {
        grill.slots[j] = grill.pending.shift();
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
    if (gameStatus !== 'playing') return;
    
    if (timeLeft <= 0) {
      setGameStatus('lost');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStatus]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 提取补位逻辑以便内部调用
  // 提取补位逻辑以便内部调用
  const refillSpecificGrill = (grill) => {
    const newSlots = [...grill.slots];
    let newPending = [...grill.pending];
    
    // 动态探测补位：确保盘中总数补齐到 2 个为止，始终保留 1 个空位
    for (let i = 0; i < SLOT_PER_GRILL; i++) {
        const currentCount = newSlots.filter(s => s !== null).length;
        if (currentCount >= 2 || newPending.length === 0) break;
        
        if (newSlots[i] === null) {
            newSlots[i] = newPending.shift();
        }
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
          newSlots[actualTargetSlotIdx] = itemToMove;
          return { ...g, slots: newSlots };
        }
        return g;
      });
    });
  }, []);

  const completeServe = useCallback((grillId) => {
    setGrills(prev => {
        // 先检查是否有还在 serving 的盘子，如果没有且全局扫描成功，增加分数（在此处触发分数更新更安全）
        const anyServing = prev.find(g => g.id === grillId && g.isServing);
        if (anyServing) {
            setScore(s => s + 100);
        }

        return prev.map(g => {
            if (g.id === grillId) {
                if (!g.isServing) return g;
                // 原子化操作：清除 serving 状态的同时立刻补齐，防止被后续扫描再次触发
                return refillSpecificGrill({ ...g, slots: [null, null, null], isServing: false });
            }
            
            // 被动补位扫描：仅针对完全空置且未锁定的盘子
            if (!g.isServing && g.slots.every(s => s === null) && g.pending.length > 0) {
                return refillSpecificGrill(g);
            }
            
            return g;
        });
    });
  }, []);

  const saveHighScore = useCallback((finalScore) => {
    const scores = JSON.parse(localStorage.getItem('bbqclear-scores') || '[]');
    scores.push({ score: finalScore, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('bbqclear-scores', JSON.stringify(scores.slice(0, 10)));
  }, []);

  // 监控胜利与匹配检测
  useEffect(() => {
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
            // 检查三连
            if (slots[0] && slots[1] && slots[2] && 
                slots[0].type === slots[1].type && slots[0].type === slots[2].type) {
              needsUpdate = true;
              return { ...grill, isServing: true };
            }
            return grill;
        });

        if (!anyRemaining && gameStatus === 'playing') {
            const bonus = timeLeft * 10;
            setScore(s => s + bonus);
            setGameStatus('won');
            saveHighScore(score + bonus);
        }
        
        if (gameStatus === 'lost') {
            saveHighScore(score);
        }

        return needsUpdate || (!anyRemaining && gameStatus === 'playing') ? nextGrills : prevGrills;
      });
    }, 100);

    return () => clearTimeout(checkId);
  }, [grills, gameStatus, setScore, timeLeft, score, saveHighScore]); 

  return {
    grills,
    setGrills,
    score,
    setScore,
    timeLeft,
    gameStatus,
    initGame,
    refillGrills,
    moveSkewer,
    completeServe
  };
};
