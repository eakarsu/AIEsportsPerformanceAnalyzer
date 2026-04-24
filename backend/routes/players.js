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

// GET /api/players - list all players with team name
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, t.name AS team_name
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       ORDER BY p.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get players error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/players/:id - get player by id with team info
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, t.name AS team_name, t.game AS team_game, t.region AS team_region
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get player error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/players - create player
router.post('/', async (req, res) => {
  try {
    const {
      username, real_name, team_id, game, role, country,
      apm, accuracy, positioning_score, kda, winrate, avatar_url, bio,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO players (username, real_name, team_id, game, role, country, apm, accuracy, positioning_score, kda, winrate, avatar_url, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [username, real_name, team_id, game, role, country, apm, accuracy, positioning_score, kda, winrate, avatar_url, bio]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create player error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/players/:id - update player
router.put('/:id', async (req, res) => {
  try {
    const {
      username, real_name, team_id, game, role, country,
      apm, accuracy, positioning_score, kda, winrate, avatar_url, bio,
    } = req.body;

    const result = await pool.query(
      `UPDATE players
       SET username = $1, real_name = $2, team_id = $3, game = $4, role = $5, country = $6,
           apm = $7, accuracy = $8, positioning_score = $9, kda = $10, winrate = $11,
           avatar_url = $12, bio = $13
       WHERE id = $14
       RETURNING *`,
      [username, real_name, team_id, game, role, country, apm, accuracy, positioning_score, kda, winrate, avatar_url, bio, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update player error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/players/:id - delete player
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM players WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    res.json({ message: 'Player deleted successfully.', player: result.rows[0] });
  } catch (err) {
    console.error('Delete player error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
