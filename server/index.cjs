const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const SCORES_FILE = path.join(__dirname, 'scores.json');

app.use(cors());
app.use(express.json());

// 确保分数文件存在
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

// 获取前 10 名
app.get('/api/scores', (req, res) => {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        const top10 = scores.sort((a, b) => b.score - a.score).slice(0, 10);
        res.json(top10);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read scores' });
    }
});

// 提交新分数
app.post('/api/scores', (req, res) => {
    const { name, score } = req.body;
    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Name and score are required' });
    }

    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        scores.push({
            name,
            score,
            date: new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        });
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.listen(PORT, () => {
    console.log(`BBQ Leaderboard Backend running on http://localhost:${PORT}`);
});
