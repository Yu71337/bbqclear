/* e:\AIgame\src\App.jsx */
import React from 'react';
import { useGameState } from './hooks/useGameState';
import Grill from './components/Grill';
import LeaderboardDrawer from './components/LeaderboardDrawer';
import TutorialOverlay from './components/TutorialOverlay';
import './App.css';

function App() {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = React.useState(false);
  const [showTutorial, setShowTutorial] = React.useState(true);
  const [leaderboardKey, setLeaderboardKey] = React.useState(0);
  const { 
    grills, 
    score, 
    timeLeft, 
    gameStatus, 
    gameOverReason,
    initGame,
    moveSkewer,
    completeServe
  } = useGameState(isLeaderboardOpen || showTutorial);

  const [selectedSkewer, setSelectedSkewer] = React.useState(null);
  const leaderboardBtnRef = React.useRef(null);
  const lastPlayTime = React.useRef({ click: 0, serve: 0 });

  const handleSkewerClick = (skewerInfo) => {
    if (gameStatus !== 'playing') return;
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
    setSelectedSkewer(null);
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

  const [playerName, setPlayerName] = React.useState(localStorage.getItem('bbq-player-name') || '');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const handleSubmitScore = async () => {
    if (!playerName.trim()) return;
    setSubmitError('');
    localStorage.setItem('bbq-player-name', playerName);
    
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || '上传失败');
      }

      setIsSubmitted(true);
      setLeaderboardKey(Date.now());
      setIsLeaderboardOpen(true);
    } catch (err) {
      console.error('Failed to submit score:', err);
      setSubmitError(err.message || '网络连接或服务器异常');
    }
  };

  return (
    <div className="app-container">
      {/* ... header ... */}
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
              completeServe(gid);
            }}
            onSlotClick={handleSlotClick}
            onSkewerClick={handleSkewerClick}
            selectedSkewer={selectedSkewer}
            serveTarget={leaderboardBtnRef.current}
          />
        ))}
      </div>

      <div 
        ref={leaderboardBtnRef}
        className="leaderboard-entry" 
        onClick={() => setIsLeaderboardOpen(true)}
        title="查看排行榜"
      >
        🏆
      </div>

      <LeaderboardDrawer 
        key={leaderboardKey}
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />

      {showTutorial && (
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      )}

      {gameStatus !== 'playing' && (
        <div className="modal-overlay">
          <div className="game-modal">
            <h2>{gameStatus === 'won' ? '🍖 完满上菜!' : '⏰ 游戏结束'}</h2>
            {gameOverReason && <div className="game-over-reason">{gameOverReason}</div>}
            <p style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
               最终得分: <span style={{color: 'var(--text-gold)', fontWeight: 'bold'}}>{score}</span>
            </p>
            
            {!isSubmitted ? (
               <div className="name-input-section">
                 <input 
                   type="text" 
                   placeholder="输入你的大厨名号..." 
                   value={playerName}
                   onChange={(e) => setPlayerName(e.target.value)}
                   maxLength={10}
                 />
                 <button onClick={handleSubmitScore} disabled={!playerName.trim()}>
                   留下名号
                 </button>
                 {submitError && <div className="submit-error">❌ {submitError}</div>}
               </div>
            ) : (
               <div className="submission-success">✅ 已成功传送到排行榜</div>
            )}

            <button onClick={() => {
              setIsSubmitted(false);
              initGame();
              setShowTutorial(true); // 重启显示指引
            }} className="restart-btn">再烤一轮!</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
