import { createClient } from 'redis';

export default async function handler(req, res) {
    // 关键点：改用 REDIS_URL
    const url = process.env.REDIS_URL;

    if (!url) {
        return res.status(500).json({ error: "Cloud Redis URL not found" });
    }

    const client = createClient({ url });

    client.on('error', err => console.log('Redis Connection Error', err));

    try {
        await client.connect();

        // 获取排行榜 (GET /api/scores)
        if (req.method === 'GET') {
            const data = await client.get('bbq_scores');
            const scores = data ? JSON.parse(data) : [];
            // 排序并取前10 [cite: 4]
            const top10 = scores.sort((a, b) => b.score - a.score).slice(0, 10);
            return res.status(200).json(top10);
        }

        // 提交分数 (POST /api/scores)
        if (req.method === 'POST') {
            const { name, score } = req.body;

            // 基础校验 [cite: 5]
            if (!name || score === undefined) {
                return res.status(400).json({ error: 'Name and score are required' });
            }

            const data = await client.get('bbq_scores');
            const scores = data ? JSON.parse(data) : [];

            const newEntry = {
                name,
                score: Number(score),
                date: new Date().toISOString()
            };

            scores.push(newEntry);
            await client.set('bbq_scores', JSON.stringify(scores));

            return res.status(200).json({ success: true, entry: newEntry });
        }
    } catch (err) {
        console.error('Redis Operation Error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        // Serverless 环境中必须主动关闭连接，否则会耗尽 Redis 连接数
        if (client.isOpen) await client.disconnect();
    }
}