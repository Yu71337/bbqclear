/* e:\AIgame\src\components\Grill.jsx */
import React, { useEffect, useRef } from 'react';
import Skewer from './Skewer';
import { playServeAnimation, playPopScore } from '../animations/gameAnimations';
import './Grill.css';

const Grill = ({ grill, onDragStart, onDragOver, onDrop, onServeComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (grill.isServing) {
      const skewerEls = containerRef.current.querySelectorAll('.skewer');
      playPopScore(containerRef.current, 100);
      playServeAnimation(skewerEls, () => {
        onServeComplete(grill.id);
      });
    }
  }, [grill.isServing, grill.id, onServeComplete]);

  return (
    <div 
      ref={containerRef}
      className={`grill ${grill.isLocked ? 'locked' : ''} ${grill.isServing ? 'serving' : ''}`}
      onDragOver={(e) => onDragOver(e, grill.id)}
      onDrop={(e) => onDrop(e, grill.id)}
    >
      <div className="grill-grid">
        {grill.slots.map((item, idx) => (
          <div key={`${grill.id}-slot-${idx}`} className="slot">
            {item && (
              <Skewer 
                type={item} 
                id={{ grillId: grill.id, slotIdx: idx }} 
                onDragStart={onDragStart} 
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
