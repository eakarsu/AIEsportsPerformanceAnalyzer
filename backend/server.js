const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const playersRoutes = require('./routes/players');
const teamsRoutes = require('./routes/teams');
const matchesRoutes = require('./routes/matches');
const tournamentsRoutes = require('./routes/tournaments');
const trainingRoutes = require('./routes/training');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

module.exports = app;
