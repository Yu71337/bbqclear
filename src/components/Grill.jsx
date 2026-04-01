/* e:\AIgame\src\components\Grill.jsx */
import React, { useEffect, useRef } from 'react';
import Skewer from './Skewer';
import { playServeAnimation, playPopScore } from '../animations/gameAnimations';
import './Grill.css';

const Grill = ({ grill, onDragStart, onDragOver, onDrop, onServeComplete, onSlotClick, onSkewerClick, selectedSkewer, serveTarget }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (grill.isServing) {
      const skewerEls = containerRef.current.querySelectorAll('.skewer');
      playPopScore(containerRef.current, 100);
      playServeAnimation(skewerEls, serveTarget, () => {
        onServeComplete(grill.id);
      });
    }
  }, [grill.isServing, grill.id, onServeComplete, serveTarget]);

  return (
    <div 
      ref={containerRef}
      className={`grill ${grill.isLocked ? 'locked' : ''} ${grill.isServing ? 'serving' : ''}`}
    >
      <div className="grill-grid">
        {grill.slots.map((item, idx) => (
          <div 
            key={`${grill.id}-slot-${idx}`} 
            className="slot"
            onDragOver={(e) => onDragOver(e, grill.id)}
            onDrop={(e) => onDrop(e, grill.id, idx)}
            onClick={(e) => {
                e.stopPropagation();
                onSlotClick(grill.id, idx);
            }}
          >
            {item && (
              <Skewer 
                key={item.id}
                type={item.type} 
                id={{ grillId: grill.id, slotIdx: idx }} 
                onDragStart={onDragStart} 
                onClick={(e) => {
                  e.stopPropagation();
                  onSkewerClick({ grillId: grill.id, slotIdx: idx });
                }}
                isSelected={selectedSkewer && selectedSkewer.grillId === grill.id && selectedSkewer.slotIdx === idx}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* 炭火层 */}
      <div className="embers"></div>
      
      {/* 待处理显示（如果需要可视化） */}
      {grill.pending.length > 0 && (
        <div className="pending-indicator">
          待烤: {grill.pending.length}
        </div>
      )}
    </div>
  );
};

export default Grill;
