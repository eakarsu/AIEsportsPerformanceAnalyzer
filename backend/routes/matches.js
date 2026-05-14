const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// GET /api/matches - list all matches with team names (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT m.*,
                t1.name AS team1_name, t1.game AS team1_game,
                t2.name AS team2_name, t2.game AS team2_game,
                w.name AS winner_name,
                tr.name AS tournament_name
         FROM matches m
         LEFT JOIN teams t1 ON m.team1_id = t1.id
         LEFT JOIN teams t2 ON m.team2_id = t2.id
         LEFT JOIN teams w ON m.winner_id = w.id
         LEFT JOIN tournaments tr ON m.tournament_id = tr.id
         ORDER BY m.match_date DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM matches'),
    ]);

    const total = parseInt(countResult.rows[0].count);
    res.json({
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get matches error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/matches/:id - get match by id with team details
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*,
              t1.name AS team1_name, t1.game AS team1_game, t1.region AS team1_region,
              t2.name AS team2_name, t2.game AS team2_game, t2.region AS team2_region,
              w.name AS winner_name,
              tr.name AS tournament_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN teams w ON m.winner_id = w.id
       LEFT JOIN tournaments tr ON m.tournament_id = tr.id
       WHERE m.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get match error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/matches - create match
router.post('/', async (req, res) => {
  try {
    const {
      team1_id, team2_id, tournament_id, match_date,
      score_team1, score_team2, map, duration_minutes,
      winner_id, vod_url, notes,
    } = req.body;

    if (!team1_id || !team2_id || !match_date) {
      return res.status(400).json({ error: 'team1_id, team2_id, and match_date are required.' });
    }

    const result = await pool.query(
      `INSERT INTO matches (team1_id, team2_id, tournament_id, match_date, score_team1, score_team2, map, duration_minutes, winner_id, vod_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [team1_id, team2_id, tournament_id, match_date, score_team1, score_team2, map, duration_minutes, winner_id, vod_url, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create match error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/matches/:id - update match
router.put('/:id', async (req, res) => {
  try {
    const {
      team1_id, team2_id, tournament_id, match_date,
      score_team1, score_team2, map, duration_minutes,
      winner_id, vod_url, notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE matches
       SET team1_id = $1, team2_id = $2, tournament_id = $3, match_date = $4,
           score_team1 = $5, score_team2 = $6, map = $7, duration_minutes = $8,
           winner_id = $9, vod_url = $10, notes = $11
       WHERE id = $12
       RETURNING *`,
      [team1_id, team2_id, tournament_id, match_date, score_team1, score_team2, map, duration_minutes, winner_id, vod_url, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update match error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/matches/:id - delete match
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM matches WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    res.json({ message: 'Match deleted successfully.', match: result.rows[0] });
  } catch (err) {
    console.error('Delete match error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
