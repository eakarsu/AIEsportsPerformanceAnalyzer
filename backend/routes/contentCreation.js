// Content creation: auto-generate highlight reels, stat cards, social posts.
const express = require('express');
const fetch = require('node-fetch');
const { Pool } = require('pg');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

// POST /api/content-creation/social { match_id, platform:'twitter'|'instagram', tone? }
router.post('/social', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { match_id, platform = 'twitter', tone = 'hype' } = req.body || {};
    if (!match_id) return res.status(400).json({ error: 'match_id required' });
    const m = await pool.query(`SELECT * FROM matches WHERE id = $1`, [match_id]).catch(() => ({ rows: [] }));
    if (!m.rows[0]) return res.status(404).json({ error: 'match not found' });

    const key = process.env.OPENROUTER_API_KEY; // TODO: configure credentials
    if (!key) return res.status(503).json({ error: 'OPENROUTER_API_KEY missing' });
    const limit = platform === 'twitter' ? 280 : 2200;
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: `Write a ${platform} post (<=${limit} chars) in ${tone} tone for the supplied match. Include 1-3 emojis and 2-3 hashtags.` },
          { role: 'user', content: JSON.stringify(m.rows[0]) },
        ],
      }),
    });
    const j = await r.json();
    const post = (j.choices?.[0]?.message?.content || '').slice(0, limit);
    return res.json({ match_id, platform, tone, post });
  } catch (e) {
    return res.status(500).json({ error: 'content failed' });
  }
});

module.exports = router;
