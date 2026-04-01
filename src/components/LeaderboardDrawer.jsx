import React, { useEffect, useState } from 'react';
import './LeaderboardDrawer.css';

const LeaderboardDrawer = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchScores();
    }
  }, [isOpen]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scores');
      const data = await response.json();
      setScores(data);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`leaderboard-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="leaderboard-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>🔥 烧烤大厨榜</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="drawer-content">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="score-list">
              {scores.map((s, idx) => (
                <div key={idx} className={`score-item rank-${idx + 1}`}>
                  <div className="rank">{idx + 1}</div>
                  <div className="info">
                    <span className="name">{s.name}</span>
                    <span className="date">{s.date}</span>
                  </div>
                  <div className="score">{s.score}</div>
                </div>
              ))}
              {scores.length === 0 && <div className="empty">暂无数据，快去烤一串！</div>}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          提示：快烤焦的食材，通过移动到另一个盘子，可以适当降低温度~
        </div>
      </div>
    </div>
  );
};

export default LeaderboardDrawer;
