// Esports betting insights: quantified team strength for prediction markets.
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

// GET /api/betting-insights/h2h?team_a=&team_b=
router.get('/h2h', authenticateToken, async (req, res) => {
  try {
    const { team_a, team_b } = req.query;
    if (!team_a || !team_b) return res.status(400).json({ error: 'team_a + team_b required' });
    const wlA = await pool.query(`SELECT COUNT(*) FILTER (WHERE outcome='win') AS w, COUNT(*) AS n FROM matches WHERE team_id = $1`, [team_a]).catch(() => ({ rows: [{ w: 0, n: 0 }] }));
    const wlB = await pool.query(`SELECT COUNT(*) FILTER (WHERE outcome='win') AS w, COUNT(*) AS n FROM matches WHERE team_id = $1`, [team_b]).catch(() => ({ rows: [{ w: 0, n: 0 }] }));
    const h2h = await pool.query(`SELECT team_id, COUNT(*) FILTER (WHERE outcome='win') AS w, COUNT(*) AS n FROM matches WHERE opponent_id = $1 AND team_id IN ($2,$3) GROUP BY team_id`, [team_b, team_a, team_b]).catch(() => ({ rows: [] }));

    const a_wr = (Number(wlA.rows[0].n) || 0) ? Number(wlA.rows[0].w) / Number(wlA.rows[0].n) : 0.5;
    const b_wr = (Number(wlB.rows[0].n) || 0) ? Number(wlB.rows[0].w) / Number(wlB.rows[0].n) : 0.5;
    // Bradley–Terry-style prob
    const p_a = a_wr / (a_wr + b_wr || 1);
    return res.json({
      team_a: { id: team_a, win_rate: Math.round(a_wr * 1000) / 1000, n_matches: Number(wlA.rows[0].n) },
      team_b: { id: team_b, win_rate: Math.round(b_wr * 1000) / 1000, n_matches: Number(wlB.rows[0].n) },
      head_to_head: h2h.rows,
      prob_team_a_wins: Math.round(p_a * 1000) / 1000,
    });
  } catch (e) {
    return res.status(500).json({ error: 'h2h failed' });
  }
});

module.exports = router;
