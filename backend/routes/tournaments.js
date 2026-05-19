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

// GET /api/tournaments - list all tournaments (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        'SELECT * FROM tournaments ORDER BY start_date DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM tournaments'),
    ]);

    const total = parseInt(countResult.rows[0].count);
    res.json({
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get tournaments error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/tournaments/:id - get tournament by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tournaments WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get tournament error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/tournaments - create tournament
router.post('/', async (req, res) => {
  try {
    const {
      name, game, start_date, end_date, prize_pool,
      location, status, organizer, format, max_teams, description,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tournaments (name, game, start_date, end_date, prize_pool, location, status, organizer, format, max_teams, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, game, start_date, end_date, prize_pool, location, status, organizer, format, max_teams, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create tournament error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/tournaments/:id - update tournament
router.put('/:id', async (req, res) => {
  try {
    const {
      name, game, start_date, end_date, prize_pool,
      location, status, organizer, format, max_teams, description,
    } = req.body;

    const result = await pool.query(
      `UPDATE tournaments
       SET name = $1, game = $2, start_date = $3, end_date = $4, prize_pool = $5,
           location = $6, status = $7, organizer = $8, format = $9, max_teams = $10, description = $11
       WHERE id = $12
       RETURNING *`,
      [name, game, start_date, end_date, prize_pool, location, status, organizer, format, max_teams, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update tournament error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/tournaments/:id - delete tournament
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tournaments WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }

    res.json({ message: 'Tournament deleted successfully.', tournament: result.rows[0] });
  } catch (err) {
    console.error('Delete tournament error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
