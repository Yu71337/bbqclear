// 使用 import 代替 require
import { createClient } from 'redis';

export default async function handler(req, res) {
    const client = createClient({
        url: process.env.KV_URL
    });

    client.on('error', err => console.log('Redis Error', err));

    try {
        await client.connect();

        if (req.method === 'GET') {
            const data = await client.get('bbq_scores');
            const scores = data ? JSON.parse(data) : [];
            const top10 = scores.sort((a, b) => b.score - a.score).slice(0, 10);
            return res.status(200).json(top10);
        }

        if (req.method === 'POST') {
            const { name, score } = req.body;
            const data = await client.get('bbq_scores');
            const scores = data ? JSON.parse(data) : [];
            const newEntry = { name, score: Number(score), date: new Date().toISOString() };
            scores.push(newEntry);
            await client.set('bbq_scores', JSON.stringify(scores));
            return res.status(200).json({ success: true, entry: newEntry });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    } finally {
        // 确保连接被关闭，防止耗尽 Redis 连接数
        if (client.isOpen) await client.disconnect();
    }
}