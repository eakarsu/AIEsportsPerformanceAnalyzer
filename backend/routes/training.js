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

// GET /api/training - list all training schedules with player name
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ts.*, p.username AS player_username, p.real_name AS player_name, p.game AS player_game
       FROM training_schedules ts
       LEFT JOIN players p ON ts.player_id = p.id
       ORDER BY ts.scheduled_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get training schedules error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/training/:id - get training schedule by id with player info
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ts.*, p.username AS player_username, p.real_name AS player_name, p.game AS player_game, p.role AS player_role
       FROM training_schedules ts
       LEFT JOIN players p ON ts.player_id = p.id
       WHERE ts.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training schedule not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get training schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/training - create training schedule
router.post('/', async (req, res) => {
  try {
    const {
      player_id, title, description, scheduled_date,
      duration_minutes, focus_area, intensity, status, coach_notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO training_schedules (player_id, title, description, scheduled_date, duration_minutes, focus_area, intensity, status, coach_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [player_id, title, description, scheduled_date, duration_minutes, focus_area, intensity, status, coach_notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create training schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/training/:id - update training schedule
router.put('/:id', async (req, res) => {
  try {
    const {
      player_id, title, description, scheduled_date,
      duration_minutes, focus_area, intensity, status, coach_notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE training_schedules
       SET player_id = $1, title = $2, description = $3, scheduled_date = $4,
           duration_minutes = $5, focus_area = $6, intensity = $7, status = $8, coach_notes = $9
       WHERE id = $10
       RETURNING *`,
      [player_id, title, description, scheduled_date, duration_minutes, focus_area, intensity, status, coach_notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training schedule not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update training schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/training/:id - delete training schedule
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM training_schedules WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training schedule not found.' });
    }

    res.json({ message: 'Training schedule deleted successfully.', schedule: result.rows[0] });
  } catch (err) {
    console.error('Delete training schedule error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
