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
            onDrop={handleDrop}
            onServeComplete={completeServe}
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
