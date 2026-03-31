/* e:\AIgame\src\hooks\useGameState.js */
import { useState, useCallback, useEffect } from 'react';

const FOOD_TYPES = ['meat', 'corn', 'mushroom', 'shrimp', 'chicken'];
const GRILL_COUNT = 12;
const SLOT_PER_GRILL = 3;

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
      pending: Array.from({ length: 5 }, () => FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)]),
      isLocked: false,
    }));
    
    // 初始前排填充（每个架子放 1-2 个基础食材）
    newGrills.forEach(grill => {
      const fillCount = Math.floor(Math.random() * 2) + 1; // 1-2
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
  const refillSpecificGrill = (grill) => {
    const newSlots = [...grill.slots];
    let newPending = [...grill.pending];
    for(let i = 0; i < SLOT_PER_GRILL; i++) {
        if (newSlots[i] === null && newPending.length > 0) {
            newSlots[i] = newPending.shift();
        }
    }
    return { ...grill, slots: newSlots, pending: newPending };
  };

  const moveSkewer = useCallback((source, targetGrillId) => {
    setGrills(prevGrills => {
      const sourceGrill = prevGrills.find(g => g.id === source.grillId);
      const targetGrill = prevGrills.find(g => g.id === targetGrillId);
      
      // 1. 验证目标是否有空位
      const targetEmptySlotIdx = targetGrill.slots.indexOf(null);
      if (targetEmptySlotIdx === -1) return prevGrills; // 目标已满

      // 2. 执行移动
      const itemToMove = sourceGrill.slots[source.slotIdx];
      
      return prevGrills.map(g => {
        if (g.id === source.grillId) {
          const newSlots = [...g.slots];
          newSlots[source.slotIdx] = null;
          // 源烤架在此刻腾空，立即补位
          return refillSpecificGrill({ ...g, slots: newSlots });
        }
        if (g.id === targetGrillId) {
          const newSlots = [...g.slots];
          newSlots[targetEmptySlotIdx] = itemToMove;
          return { ...g, slots: newSlots };
        }
        return g;
      });
    });
  }, []);

  const completeServe = useCallback((grillId) => {
    setGrills(prev => prev.map(g => {
        if (g.id === grillId) {
            return refillSpecificGrill({ ...g, slots: [null, null, null], isServing: false });
        }
        return g;
    }));
  }, []);

  const checkMatches = useCallback(() => {
    setGrills(prevGrills => {
      let anyRemaining = false;
      const nextGrills = prevGrills.map(grill => {
        if (grill.slots.some(s => s !== null) || grill.pending.length > 0) anyRemaining = true;
        
        if (grill.isServing) return grill;
        const slots = grill.slots;
        if (slots[0] && slots[0] === slots[1] && slots[0] === slots[2]) {
          setScore(s => s + 100);
          return { ...grill, isServing: true };
        }
        return grill;
      });

      // 检查胜利条件
      if (!anyRemaining && gameStatus === 'playing') {
          const bonus = timeLeft * 10;
          setScore(s => s + bonus);
          setGameStatus('won');
          saveHighScore(score + bonus);
      }
      return nextGrills;
    });
  }, [setScore, gameStatus, timeLeft, score]);

  const saveHighScore = (finalScore) => {
    const scores = JSON.parse(localStorage.getItem('bbqclear-scores') || '[]');
    scores.push({ score: finalScore, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('bbqclear-scores', JSON.stringify(scores.slice(0, 10)));
  };

  // 每当网格变化（移动或补位）后检测匹配
  useEffect(() => {
    checkMatches();
  }, [grills, checkMatches]);

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
