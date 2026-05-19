// Agentic coach: NL "we keep losing to comp A — what should we practice?"
const express = require('express');
const fetch = require('node-fetch');
const { Pool } = require('pg');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

// POST /api/agentic-coach/ask { question, team_id }
router.post('/ask', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { question, team_id } = req.body || {};
    if (!question || !team_id) return res.status(400).json({ error: 'question + team_id required' });
    const matches = await pool.query(`SELECT * FROM matches WHERE team_id = $1 ORDER BY played_at DESC LIMIT 25`, [team_id]).catch(() => ({ rows: [] }));
    const players = await pool.query(`SELECT * FROM players WHERE team_id = $1`, [team_id]).catch(() => ({ rows: [] }));
    const key = process.env.OPENROUTER_API_KEY; // TODO: configure credentials
    if (!key) return res.status(503).json({ error: 'OPENROUTER_API_KEY missing' });
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: 'You are an esports head coach. Analyse data and produce a 7-day practice plan. JSON {"answer":"...","practice_plan":[{"day":int,"focus":"...","drills":["..."]}]}.' },
          { role: 'user', content: `Question: ${question}\nRecent matches: ${JSON.stringify(matches.rows).slice(0, 3500)}\nPlayers: ${JSON.stringify(players.rows).slice(0, 2000)}` },
        ],
      }),
    });
    const j = await r.json();
    const out = j.choices?.[0]?.message?.content;
    let parsed;
    try { parsed = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] || out); } catch { parsed = { raw: out }; }
    return res.json({ team_id, question, plan: parsed });
  } catch (e) {
    return res.status(500).json({ error: 'ask failed' });
  }
});

module.exports = router;
