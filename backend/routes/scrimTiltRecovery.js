const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({
  summary: { scrims_analyzed: 28, tilt_risk_players: 4, recovery_windows: 6, coach_actions: 9 },
  players: [
    { player: 'NOVA', trigger: 'early deaths after objective loss', risk: 'high', action: 'short review and reset block' },
    { player: 'KITE', trigger: 'comms drop after round 8', risk: 'medium', action: 'paired VOD review' },
    { player: 'AXIS', trigger: 'stable', risk: 'low', action: 'normal practice' },
  ],
}));

module.exports = router;
