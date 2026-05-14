// Video analysis with annotations: coach marks plays, AI extracts similar
// patterns from tournament footage.
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

// POST /api/video-analysis/annotate { match_id, video_url, annotations:[{ts,tag,note}] }
router.post('/annotate', authenticateToken, async (req, res) => {
  try {
    const { match_id, video_url, annotations = [] } = req.body || {};
    if (!match_id || !video_url || !Array.isArray(annotations)) return res.status(400).json({ error: 'match_id, video_url, annotations[] required' });
    try {
      const r = await pool.query(
        `INSERT INTO video_annotations (match_id, video_url, annotations, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id`,
        [match_id, video_url, JSON.stringify(annotations)]
      );
      return res.json({ id: r.rows[0].id, match_id, annotation_count: annotations.length });
    } catch (e) {
      return res.status(500).json({ error: 'video_annotations table missing' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'annotate failed' });
  }
});

// GET /api/video-analysis/similar?tag=teamfight
router.get('/similar', authenticateToken, async (req, res) => {
  try {
    const tag = (req.query.tag || '').toString();
    if (!tag) return res.status(400).json({ error: 'tag required' });
    const r = await pool.query(`SELECT id, match_id, video_url FROM video_annotations WHERE annotations::text ILIKE $1 LIMIT 25`, [`%${tag}%`]).catch(() => ({ rows: [] }));
    return res.json({ tag, count: r.rows.length, matches: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'similar failed' });
  }
});

module.exports = router;
