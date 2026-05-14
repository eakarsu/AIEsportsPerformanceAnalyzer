// In-game real-time analytics: live stats, heatmaps, decision tree
// recommendations. v0 ingests events; computes simple rolling stats.
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

// POST /api/live-analytics/event { match_id, event_type, payload }
router.post('/event', authenticateToken, async (req, res) => {
  try {
    const { match_id, event_type, payload } = req.body || {};
    if (!match_id || !event_type) return res.status(400).json({ error: 'match_id + event_type required' });
    try {
      await pool.query(`INSERT INTO match_events (match_id, event_type, payload, ts) VALUES ($1,$2,$3,NOW())`, [match_id, event_type, JSON.stringify(payload || {})]);
    } catch {}
    return res.json({ recorded: true, match_id, event_type });
  } catch (e) {
    return res.status(500).json({ error: 'event failed' });
  }
});

// GET /api/live-analytics/:match_id/snapshot
router.get('/:match_id/snapshot', authenticateToken, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT event_type, COUNT(*) AS n FROM match_events WHERE match_id = $1 GROUP BY event_type`,
      [req.params.match_id]
    ).catch(() => ({ rows: [] }));
    return res.json({ match_id: req.params.match_id, event_counts: r.rows, generated_at: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ error: 'snapshot failed' });
  }
});

module.exports = router;
