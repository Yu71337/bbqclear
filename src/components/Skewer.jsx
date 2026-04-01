/* e:\AIgame\src\components\Skewer.jsx */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Skewer.css';

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

const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 138.2

const getDoneColor = (level, isBurnt) => {
  if (isBurnt || level >= 10) return '#212121';
  if (level <= 0) return 'transparent';
  if (level <= 3) return '#4CAF50';
  if (level <= 6) return '#FFC107';
  return '#FF5722';
};

const Skewer = ({ type, id, onDragStart, onClick, isSelected, level = 0, isBurnt = false }) => {
  const skewerRef = useRef(null);
  if (!type) return null;

  useEffect(() => {
    if (skewerRef.current) {
      gsap.set(skewerRef.current, { pointerEvents: 'none' });
      gsap.fromTo(
        skewerRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'back.out(1.5)',
          onComplete: () => {
            if (skewerRef.current) skewerRef.current.style.pointerEvents = 'auto';
          }
        }
      );
    }
  }, []);

  const ringColor = getDoneColor(level, isBurnt);
  const dashOffset = RING_CIRCUMFERENCE * (1 - Math.min(level, 10) / 10);

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
      style={{ '--food-color': isBurnt ? '#222' : FOOD_COLORS[type] }}
    >
      <div className="icon-ring-wrapper">
        <svg className="progress-ring" width="60" height="60" viewBox="0 0 60 60">
          {/* 底层灰环 */}
          <circle
            cx="30" cy="30" r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
          />
          {/* 进度环 */}
          {level > 0 && (
            <circle
              cx="30" cy="30" r={RING_RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 30 30)"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
            />
          )}
        </svg>
        <div className="icon">{FOOD_ICONS[type]}</div>
      </div>
      <div className="stick"></div>
    </div>
  );
};

export default Skewer;
