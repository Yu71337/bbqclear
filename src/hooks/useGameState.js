/* e:\AIgame\src\hooks\useGameState.js */
import { useState, useCallback, useEffect } from 'react';

const FOOD_TYPES = ['meat', 'corn', 'mushroom', 'shrimp', 'chicken'];
const GRILL_COUNT = 12;
const SLOT_PER_GRILL = 3;
let _idCounter = 0;
const generateFood = (type) => ({ type, id: `food-${_idCounter++}` });

export const useGameState = (isPaused = false) => {
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
    
    // 初始前排随机填充 (填中 2 个)
    newGrills.forEach(grill => {
      const emptyIndices = [0, 1, 2];
      const fillCount = 2; 
      for(let j = 0; j < fillCount; j++) {
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        const slotIdx = emptyIndices.splice(randomIndex, 1)[0];
        grill.slots[slotIdx] = grill.pending.shift();
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
  }, [timeLeft, gameStatus]);

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
          newSlots[actualTargetSlotIdx] = itemToMove;
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

        return prev.map(g => {
            if (g.id === grillId) {
                if (!g.isServing) return g;
                return refillSpecificGrill({ ...g, slots: [null, null, null], isServing: false }, refillCount);
            }
            
            if (!g.isServing && g.slots.every(s => s === null) && g.pending.length > 0) {
                // 如果场上少于 20 个，其他空盘也享受爆发补给
                return refillSpecificGrill(g, totalVisibleCount < 20 ? refillCount : 1);
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
