import React from 'react';
import './TutorialOverlay.css';
import serveImg from '../assets/tutorial_serve.png';
import burntImg from '../assets/tutorial_burnt.png';

const TutorialOverlay = ({ onClose }) => {
  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-card" onClick={e => e.stopPropagation()}>
        <h2>🔥 大厨修行指引</h2>

        <div className="tutorial-content">
          <div className="tutorial-item">
            <div className="img-wrapper">
              <img src={serveImg} alt="Serve Guide" />
            </div>
            <div className="text-desc">
              <h3>1. 烤熟上菜</h3>
              <p>相同 3 个物品放一盘，需<strong>有一定火候</strong>（熟度≥1）方可自动上菜成交！</p>
            </div>
          </div>

          <div className="tutorial-item">
            <div className="img-wrapper">
              <img src={burntImg} alt="Burnt Guide" />
              <div className="red-x">❌</div>
            </div>
            <div className="text-desc">
              <h3>2. 严防烤焦</h3>
              <p>物品<strong>烤得太久</strong>（熟度=10）即为烤焦。烤焦物品<strong>无法上菜</strong>，会占用宝贵盘位，请及时移动或规避！</p>
            </div>
          </div>
        </div>

        <button className="confirm-btn" onClick={onClose}>
          我准备好了！
        </button>
      </div>
    </div>
  );
};

export default TutorialOverlay;
