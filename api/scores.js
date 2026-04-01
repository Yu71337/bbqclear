const { createClient } = require('redis');

module.exports = async (req, res) => {
    const client = createClient({
        url: process.env.KV_URL
    });

    client.on('error', err => console.log('Redis Error', err));
    await client.connect();

    if (req.method === 'GET') {
        const data = await client.get('bbq_scores');
        const scores = data ? JSON.parse(data) : [];
        const top10 = scores.sort((a, b) => b.score - a.score).slice(0, 10);
        await client.disconnect();
        return res.status(200).json(top10);
    }

    if (req.method === 'POST') {
        const { name, score } = req.body;
        const data = await client.get('bbq_scores');
        const scores = data ? JSON.parse(data) : [];
        const newEntry = { name, score: Number(score), date: new Date().toISOString() };
        scores.push(newEntry);
        await client.set('bbq_scores', JSON.stringify(scores));
        await client.disconnect();
        return res.status(200).json({ success: true, entry: newEntry });
    }
};