/* e:\AIgame\src\App.jsx */
import React from 'react';
import { useGameState } from './hooks/useGameState';
import Grill from './components/Grill';
import './App.css';

function App() {
  const { 
    grills, 
    score, 
    timeLeft, 
    gameStatus, 
    initGame,
    moveSkewer,
    completeServe
  } = useGameState();

  const [selectedSkewer, setSelectedSkewer] = React.useState(null);
  const lastPlayTime = React.useRef({ click: 0, serve: 0 });

  // 音效触发器 (带防抖)
  const playSound = (type) => {
    const now = Date.now();
    if (now - lastPlayTime.current[type] < 50) return;
    lastPlayTime.current[type] = now;

    const audios = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      serve: 'https://assets.mixkit.co/active_storage/sfx/2802/2802-preview.mp3'
    };
    if (audios[type]) {
      const audio = new Audio(audios[type]);
      audio.volume = 0.5;
      audio.play().catch(() => {}); // 忽略自动播放限制导致的错误
    }
  };

  const handleSkewerClick = (skewerInfo) => {
    if (gameStatus !== 'playing') return;
    playSound('click');
    if (selectedSkewer && selectedSkewer.grillId === skewerInfo.grillId && selectedSkewer.slotIdx === skewerInfo.slotIdx) {
      setSelectedSkewer(null);
    } else {
      setSelectedSkewer(skewerInfo);
    }
  };

  const handleSlotClick = (grillId, slotIdx) => {
    if (selectedSkewer) {
      moveSkewer(selectedSkewer, grillId, slotIdx);
      setSelectedSkewer(null);
    }
  };

  const handleDragStart = (e, skewerInfo) => {
    e.dataTransfer.setData('skewer-info', JSON.stringify(skewerInfo));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, grillId) => {
    e.preventDefault();
    const info = JSON.parse(e.dataTransfer.getData('skewer-info'));
    if (info.grillId === grillId) return; // 不处理移动到同一个烤架的情况
    moveSkewer(info, grillId);
  };

  // 格式化时间 00:00
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="score-panel">Score: {score}</div>
        <div className="timer-wrapper">
          <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="game-grid">
        {grills.map((grill) => (
          <Grill 
            key={grill.id} 
            grill={grill} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={(e, gid, sid) => {
              e.preventDefault();
              const info = JSON.parse(e.dataTransfer.getData('skewer-info'));
              moveSkewer(info, gid, sid);
            }}
            onServeComplete={(gid) => {
              playSound('serve');
              completeServe(gid);
            }}
            onSlotClick={handleSlotClick}
            onSkewerClick={handleSkewerClick}
            selectedSkewer={selectedSkewer}
          />
        ))}
      </div>

      {gameStatus !== 'playing' && (
        <div className="modal-overlay">
          <div className="game-modal">
            <h2>{gameStatus === 'won' ? '🍖 完满上菜!' : '⏰ 时间到!'}</h2>
            <p style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
               最终得分: <span style={{color: 'var(--text-gold)', fontWeight: 'bold'}}>{score}</span>
            </p>
            
            <div className="high-scores">
                <div className="score-row header">
                    <span>日期</span>
                    <span>高分榜 Top 10</span>
                </div>
                {(JSON.parse(localStorage.getItem('bbqclear-scores') || '[]')).map((s, idx) => (
                    <div key={idx} className="score-row">
                        <span>{s.date}</span>
                        <span>{s.score} pts</span>
                    </div>
                ))}
            </div>

            <button onClick={initGame}>再烤一轮!</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
