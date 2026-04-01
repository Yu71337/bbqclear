const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const SCORES_FILE = path.join(__dirname, 'scores.json');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms - IP: ${req.ip}`);
    });
    next();
});

// 获取分数
app.get('/api/scores', (req, res) => {
    try {
        if (!fs.existsSync(SCORES_FILE)) fs.writeFileSync(SCORES_FILE, '[]');
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        const top10 = scores.sort((a, b) => b.score - a.score).slice(0, 10);
        res.json(top10);
    } catch (err) {
        console.error('[Read Error]', err);
        res.status(500).json({ error: 'Failed to read scores' });
    }
});

// 提交新分数
app.post('/api/scores', (req, res) => {
    const { name, score } = req.body;
    if (!name || score === undefined) {
        console.warn('[Validation Failed] Missing name or score', req.body);
        return res.status(400).json({ error: 'Name and score are required' });
    }

    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        const newEntry = {
            name,
            score,
            date: new Date().toLocaleString('zh-CN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
        };
        scores.push(newEntry);
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
        console.log(`[Score Saved] ${name}: ${score} pts`);
        res.json({ success: true, entry: newEntry });
    } catch (err) {
        console.error('[Write Error]', err);
        res.status(500).json({ error: 'Internal Server Error while saving' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`BBQ Leaderboard Backend running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT} or your LAN IP`);
});
