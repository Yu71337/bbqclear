import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            // 从 KV 中获取排行榜数据
            let scores = await kv.get('bbqclear_leaderboard');
            if (!Array.isArray(scores)) {
                scores = [];
            }
            return res.status(200).json(scores.slice(0, 10)); // 只返回前10名给前端
        } catch (error) {
            console.error('KV 获取数据失败:', error);
            // 若数据库尚未配置，返回空数组作为后备，以免阻塞前端
            return res.status(200).json([]);
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, score } = req.body || {};
            
            if (!name || typeof score !== 'number') {
                return res.status(400).json({ error: '无效的数据格式' });
            }

            const newEntry = {
                name: String(name).slice(0, 20), // 防止名字过长
                score: Number(score),
                date: new Date().toISOString().split('T')[0]
            };

            // 获取现有分数列表
            let scores = await kv.get('bbqclear_leaderboard');
            if (!Array.isArray(scores)) {
                scores = [];
            }
            
            scores.push(newEntry);
            
            // 按分数倒序排列
            scores.sort((a, b) => b.score - a.score);
            
            // 只保留前 100 名节省空间
            scores = scores.slice(0, 100);
            
            // 写回数据至 KV
            await kv.set('bbqclear_leaderboard', scores);

            return res.status(200).json({ success: true, message: "存入 Vercel KV 成功！" });
        } catch (error) {
            console.error('KV 保存数据失败:', error);
            return res.status(500).json({ error: '数据保存到服务器失败' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}