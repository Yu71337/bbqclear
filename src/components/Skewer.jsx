/* e:\AIgame\src\components\Skewer.jsx */
import React from 'react';
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

const Skewer = ({ type, id, onDragStart }) => {
  if (!type) return null;

  return (
    <div 
      className="skewer"
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      style={{ '--food-color': FOOD_COLORS[type] }}
    >
      <div className="icon">{FOOD_ICONS[type]}</div>
      <div className="stick"></div>
    </div>
  );
};

export default Skewer;
