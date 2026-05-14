// Injury / burn-out prevention: monitor practice intensity, recommend
// recovery days.
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

// GET /api/burnout-prevention/:player_id
router.get('/:player_id', authenticateToken, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT date_trunc('day', practiced_at) AS day, SUM(duration_minutes) as minutes
       FROM training WHERE player_id = $1 AND practiced_at > NOW() - INTERVAL '14 days'
       GROUP BY 1 ORDER BY 1`,
      [req.params.player_id]
    ).catch(() => ({ rows: [] }));
    const days = r.rows.map(x => Number(x.minutes));
    const total = days.reduce((a, b) => a + b, 0);
    const avg = days.length ? total / days.length : 0;
    let recommendation = 'maintain';
    if (avg > 360) recommendation = 'reduce_intensity';
    if (avg > 480) recommendation = 'mandatory_rest_day';
    return res.json({
      player_id: req.params.player_id,
      days: r.rows,
      avg_daily_minutes: Math.round(avg),
      total_minutes_14d: Math.round(total),
      recommendation,
    });
  } catch (e) {
    return res.status(500).json({ error: 'analysis failed' });
  }
});

module.exports = router;
