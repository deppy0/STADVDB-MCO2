require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { pools, current_node } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    async function checkNode(pools, node) {
        try {
            await pools[node].query('SELECT 1');
            return [node, { reached: true, }];
        } catch (e) {
            return [node, {
                reached: false,
                error: `${e.code} - ${e.message}`,
            }];
        }
    }
    const health_checks = [];
    for (const node in pools)
        health_checks.push(checkNode(pools, node));
    const node_status = Object.fromEntries(await Promise.all(health_checks));
    res.json({ current_node, node_status, });
});

app.get('/api/records', async(req, res) => {
    const target_node = Number(req.query.node) || current_node;
    const target_page = Math.max(1, Math.floor(Number(req.query.page) || 1));
    const PER_PAGE = 50;
    const OFFSET = PER_PAGE * (target_page - 1);
    if (!pools[target_node])
        return res.status(400).json({ error: `node not found` });
    try {
        const [rows] = await pools[target_node].query(
            'SELECT * FROM ? ORDER BY ? LIMIT ?, ?',
            [
                `"${req.query.table}"`,
                `${`"${req.query.order_column}"` || 'NULL'}`,
                OFFSET,
                PER_PAGE
            ]
        );
        res.json({ node: target_node, count: rows.length, data: rows, });
    } catch (e) {
        res.status(500).json({ error: `${e.code} - ${e.message}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Node #${current_node} running on PORT ${PORT}`);
});
