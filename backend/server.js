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
const aiNewRoutes = require('./routes/aiNew');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai', aiNewRoutes);
app.use('/api/agentic-coach', require('./routes/agenticCoach'));
app.use('/api/live-analytics', require('./routes/liveAnalytics'));
app.use('/api/video-analysis', require('./routes/videoAnalysis'));
app.use('/api/burnout-prevention', require('./routes/burnoutPrevention'));
app.use('/api/sponsorship-match', require('./routes/sponsorshipMatch'));
app.use('/api/betting-insights', require('./routes/bettingInsights'));
app.use('/api/content-creation', require('./routes/contentCreation'));
app.use('/api/scrim-tilt-recovery', require('./routes/scrimTiltRecovery'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Custom Views (4 endpoints) — mounted BEFORE 404 / error handler
app.use('/api/custom-views', require('./routes/customViews'));

// 404 for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});


// === Batch 03 Gaps & Frontend Mounts ===
try {
  const _batch03 = require('./routes/batch03Gaps');
  if (typeof authenticateToken === 'function') app.use('/api', authenticateToken, _batch03);
  else app.use('/api', _batch03);
} catch (_e) { /* batch03 gap routes optional */ }

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

module.exports = app;
