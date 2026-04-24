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

// GET /api/teams - list all teams
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY ranking ASC NULLS LAST');
    res.json(result.rows);
  } catch (err) {
    console.error('Get teams error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/teams/:id - get team by id with player roster
router.get('/:id', async (req, res) => {
  try {
    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [req.params.id]);

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const playersResult = await pool.query(
      'SELECT * FROM players WHERE team_id = $1 ORDER BY id',
      [req.params.id]
    );

    const team = teamResult.rows[0];
    team.players = playersResult.rows;

    res.json(team);
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/teams - create team
router.post('/', async (req, res) => {
  try {
    const {
      name, game, region, ranking, wins, losses,
      coach, founded_year, logo_url, description,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO teams (name, game, region, ranking, wins, losses, coach, founded_year, logo_url, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, game, region, ranking, wins, losses, coach, founded_year, logo_url, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/teams/:id - update team
router.put('/:id', async (req, res) => {
  try {
    const {
      name, game, region, ranking, wins, losses,
      coach, founded_year, logo_url, description,
    } = req.body;

    const result = await pool.query(
      `UPDATE teams
       SET name = $1, game = $2, region = $3, ranking = $4, wins = $5, losses = $6,
           coach = $7, founded_year = $8, logo_url = $9, description = $10
       WHERE id = $11
       RETURNING *`,
      [name, game, region, ranking, wins, losses, coach, founded_year, logo_url, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update team error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/teams/:id - delete team
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM teams WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json({ message: 'Team deleted successfully.', team: result.rows[0] });
  } catch (err) {
    console.error('Delete team error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
