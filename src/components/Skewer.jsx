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

const Skewer = ({ type, id, onDragStart, onClick, isSelected }) => {
  const skewerRef = useRef(null);
  if (!type) return null;

  useEffect(() => {
    if (skewerRef.current) {
        gsap.fromTo(skewerRef.current, 
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.4, 
              ease: "back.out(1.5)",
              clearProps: "all"
            }
        );
    }
  }, []);

  return (
    <div 
      ref={skewerRef}
      className={`skewer ${isSelected ? 'selected' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, id);
      }}
      onClick={onClick}
      style={{ '--food-color': FOOD_COLORS[type] }}
    >
      <div className="icon">{FOOD_ICONS[type]}</div>
      <div className="stick"></div>
    </div>
  );
};

export default Skewer;
