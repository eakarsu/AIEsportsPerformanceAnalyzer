// Sponsorship optimization: match teams with brands by audience demographics.
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

const BRANDS = [
  { id: 'br-1', name: 'EnergyCo', target_age: [18, 30], categories: ['fps', 'moba'], budget_usd: 250000 },
  { id: 'br-2', name: 'PeripheralsX', target_age: [16, 35], categories: ['fps', 'rts'], budget_usd: 120000 },
  { id: 'br-3', name: 'ApparelHub', target_age: [18, 45], categories: ['any'], budget_usd: 80000 },
];

// GET /api/sponsorship-match/:team_id
router.get('/:team_id', authenticateToken, async (req, res) => {
  try {
    const t = await pool.query(`SELECT * FROM teams WHERE id = $1`, [req.params.team_id]).catch(() => ({ rows: [] }));
    if (!t.rows[0]) return res.status(404).json({ error: 'team not found' });
    const team = t.rows[0];
    const audAge = Number(team.median_audience_age) || 22;
    const cat = (team.primary_category || '').toLowerCase();
    const matches = BRANDS.map(b => {
      const ageScore = (audAge >= b.target_age[0] && audAge <= b.target_age[1]) ? 1 : 0.3;
      const catScore = b.categories.includes(cat) || b.categories.includes('any') ? 1 : 0.4;
      return { brand: b, score: ageScore * catScore };
    }).sort((a, b) => b.score - a.score);
    return res.json({ team_id: team.id, audience_age: audAge, primary_category: cat, suggestions: matches });
  } catch (e) {
    return res.status(500).json({ error: 'match failed' });
  }
});

module.exports = router;
