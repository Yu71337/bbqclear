/* e:\AIgame\src\components\Skewer.jsx */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Skewer.css';

// 模拟设计图中的食材图标
const FOOD_ICONS = {
  meat: '🍖',
  corn: '🌽',
  mushroom: '🍄',
  shrimp: '🦐',
  chicken: '🍗'
};

const FOOD_COLORS = {
  meat: '#8B4513',
  corn: '#FFD700',
  mushroom: '#CD853F',
  shrimp: '#FF7F50',
  chicken: '#DEB887'
};

const Skewer = ({ type, id, onDragStart, onClick, isSelected, level = 0, isBurnt = false }) => {
  const skewerRef = useRef(null);
  if (!type) return null;

  useEffect(() => {
    if (skewerRef.current) {
        // 设置初始 pointer-events 为 none，防止入场动画干扰交互
        gsap.set(skewerRef.current, { pointerEvents: "none" });
        gsap.fromTo(skewerRef.current, 
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.4, 
              ease: "back.out(1.5)",
              onComplete: () => {
                 if (skewerRef.current) skewerRef.current.style.pointerEvents = "auto";
              }
            }
        );
    }
  }, []);

  return (
    <div 
      ref={skewerRef}
      className={`skewer ${isSelected ? 'selected' : ''} ${isBurnt ? 'burnt' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, id);
      }}
      onClick={onClick}
      style={{ 
        '--food-color': isBurnt ? '#222' : FOOD_COLORS[type],
        '--doneness-opacity': Math.min(level / 10, 0.8)
      }}
    >
      <div className="doneness-overlay"></div>
      <div className="smoke-container">
        {[...Array(isBurnt ? 5 : Math.max(0, level - 2))].map((_, i) => (
          <div key={i} className={`smoke-particle ${isBurnt ? 'black' : 'white'}`} 
               style={{ 
                 left: `${Math.random() * 40 + 10}px`,
                 animationDelay: `${Math.random() * 2}s`,
                 opacity: 0.3 + (level / 20)
               }}></div>
        ))}
      </div>
      <div className="icon">{FOOD_ICONS[type]}</div>
      <div className="stick"></div>
    </div>
  );
};

export default Skewer;
