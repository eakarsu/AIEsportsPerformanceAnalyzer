// Custom Views routes for Esports Performance Analytics
// 4 endpoints: 2 VIZ (player KDA/objective bars, player x map heatmap)
//              2 NON-VIZ (match scouting report PDF, meta/strategy rules CRUD)

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

// In-memory meta/strategy rules store (champion/agent picks + comps)
let metaRules = [
  {
    id: 1,
    name: 'Dive Comp vs Squishy Backline',
    game: 'League of Legends',
    pick_type: 'composition',
    picks: ['Lee Sin', 'Akali', 'Vi', 'Kai\'Sa', 'Rakan'],
    counters: ['Yasuo', 'Malphite', 'Janna'],
    win_rate: 64.2,
    notes: 'Strong early-mid game pressure, vulnerable to peel comps.',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Default Defensive Setup - Haven',
    game: 'Valorant',
    pick_type: 'agent_pick',
    picks: ['Killjoy', 'Cypher', 'Viper', 'Sova', 'Jett'],
    counters: ['Raze', 'Breach', 'Skye'],
    win_rate: 58.7,
    notes: 'Strong post-plant lineups; vulnerable to coordinated executes.',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Bunker Comp - Push Maps',
    game: 'Overwatch 2',
    pick_type: 'composition',
    picks: ['Sigma', 'Bastion', 'Mercy', 'Baptiste', 'Ashe'],
    counters: ['D.Va dive', 'Sombra', 'Genji'],
    win_rate: 55.4,
    notes: 'High ult economy. Falls off versus mobile dive comps.',
    created_at: new Date().toISOString(),
  },
];
let metaRulesNextId = 4;

// -----------------------------------------------------------------------------
// VIZ 1: GET /api/custom-views/player-kda-objectives
// Returns player KDA + derived objective contribution score (bar chart data)
// -----------------------------------------------------------------------------
router.get('/player-kda-objectives', async (req, res) => {
  try {
    const game = req.query.game || null;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    const params = [];
    let where = '';
    if (game) {
      params.push(game);
      where = `WHERE p.game = $1`;
    }
    params.push(limit);
    const limitIdx = params.length;

    const sql = `
      SELECT p.id, p.username, p.real_name, p.game, p.role, p.kda,
             p.winrate, p.accuracy, p.positioning_score, p.apm,
             t.name AS team_name
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        ${where}
       ORDER BY p.kda DESC NULLS LAST
       LIMIT $${limitIdx}
    `;
    const result = await pool.query(sql, params);

    const data = result.rows.map((r) => {
      const kda = Number(r.kda) || 0;
      const winrate = Number(r.winrate) || 0;
      const positioning = Number(r.positioning_score) || 0;
      const accuracy = Number(r.accuracy) || 0;
      // Composite objective contribution proxy: weighted blend of stats
      const objective_score = Number(
        (winrate * 0.4 + positioning * 0.35 + accuracy * 0.25).toFixed(2)
      );
      return {
        player_id: r.id,
        username: r.username,
        real_name: r.real_name,
        team: r.team_name,
        game: r.game,
        role: r.role,
        kda,
        winrate,
        accuracy,
        positioning_score: positioning,
        apm: Number(r.apm) || 0,
        objective_score,
      };
    });

    res.json({
      chart_type: 'grouped_bar',
      metric_keys: ['kda', 'objective_score'],
      filters: { game, limit },
      generated_at: new Date().toISOString(),
      data,
    });
  } catch (err) {
    console.error('player-kda-objectives error:', err);
    res.status(500).json({ error: 'Failed to load player KDA/objective data' });
  }
});

// -----------------------------------------------------------------------------
// VIZ 2: GET /api/custom-views/map-performance-heatmap
// Returns a player x map performance matrix (heatmap data)
// -----------------------------------------------------------------------------
router.get('/map-performance-heatmap', async (req, res) => {
  try {
    const game = req.query.game || null;
    const topPlayers = Math.min(15, Math.max(3, parseInt(req.query.players) || 8));

    // Pull distinct maps from matches
    const mapsResult = await pool.query(
      `SELECT map, COUNT(*) AS games
         FROM matches
        WHERE map IS NOT NULL AND map <> 'N/A'
        GROUP BY map
        ORDER BY games DESC
        LIMIT 10`
    );
    const maps = mapsResult.rows.map((r) => r.map);

    // Pull top players (by KDA) optionally filtered by game
    const params = [];
    let where = '';
    if (game) {
      params.push(game);
      where = `WHERE p.game = $1`;
    }
    params.push(topPlayers);
    const limitIdx = params.length;

    const playersResult = await pool.query(
      `SELECT p.id, p.username, p.game, p.kda, p.winrate, p.accuracy,
              p.positioning_score, t.name AS team_name
         FROM players p
         LEFT JOIN teams t ON p.team_id = t.id
         ${where}
         ORDER BY p.kda DESC NULLS LAST
         LIMIT $${limitIdx}`,
      params
    );

    // Deterministic per-cell synthetic performance value from existing stats
    const matrix = playersResult.rows.map((p) => {
      const baseKda = Number(p.kda) || 0;
      const baseWr = Number(p.winrate) || 0;
      const basePos = Number(p.positioning_score) || 0;
      const cells = maps.map((m, idx) => {
        const seed = (p.id * 31 + idx * 17 + m.length) % 25;
        const score = Math.max(
          0,
          Math.min(
            100,
            Number((baseWr * 0.5 + basePos * 0.3 + baseKda * 4 + seed).toFixed(1))
          )
        );
        return { map: m, score };
      });
      return {
        player_id: p.id,
        username: p.username,
        team: p.team_name,
        game: p.game,
        cells,
      };
    });

    res.json({
      chart_type: 'heatmap',
      axes: { x: 'map', y: 'player', value: 'score' },
      maps,
      players: matrix,
      filters: { game, players: topPlayers },
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('map-performance-heatmap error:', err);
    res.status(500).json({ error: 'Failed to load map performance heatmap' });
  }
});

// -----------------------------------------------------------------------------
// NON-VIZ 1: GET /api/custom-views/scouting-report
// Returns a printable scouting/match review report (PDF-shaped JSON document)
// -----------------------------------------------------------------------------
router.get('/scouting-report', async (req, res) => {
  try {
    const teamId = req.query.team_id ? parseInt(req.query.team_id) : null;

    let team = null;
    if (teamId) {
      const tRes = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
      team = tRes.rows[0] || null;
    } else {
      const tRes = await pool.query('SELECT * FROM teams ORDER BY ranking ASC LIMIT 1');
      team = tRes.rows[0] || null;
    }
    if (!team) {
      return res.status(404).json({ error: 'No team found for scouting report' });
    }

    const rosterRes = await pool.query(
      `SELECT id, username, real_name, role, kda, winrate, accuracy, positioning_score, apm
         FROM players
        WHERE team_id = $1
        ORDER BY kda DESC NULLS LAST`,
      [team.id]
    );

    const matchesRes = await pool.query(
      `SELECT m.id, m.match_date, m.map, m.duration_minutes,
              m.score_team1, m.score_team2,
              t1.name AS team1_name, t2.name AS team2_name,
              CASE WHEN m.winner_id = $1 THEN 'W' ELSE 'L' END AS result
         FROM matches m
         LEFT JOIN teams t1 ON m.team1_id = t1.id
         LEFT JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.team1_id = $1 OR m.team2_id = $1
        ORDER BY m.match_date DESC NULLS LAST
        LIMIT 10`,
      [team.id]
    );

    const wins = team.wins || 0;
    const losses = team.losses || 0;
    const totalGames = wins + losses;
    const overallWinrate = totalGames > 0 ? Number(((wins / totalGames) * 100).toFixed(1)) : 0;

    const avgKda =
      rosterRes.rows.length > 0
        ? Number(
            (
              rosterRes.rows.reduce((s, r) => s + (Number(r.kda) || 0), 0) /
              rosterRes.rows.length
            ).toFixed(2)
          )
        : 0;

    const report = {
      report_type: 'scouting_match_review',
      generated_at: new Date().toISOString(),
      pdf_ready: true,
      team: {
        id: team.id,
        name: team.name,
        game: team.game,
        region: team.region,
        ranking: team.ranking,
        coach: team.coach,
        wins,
        losses,
        overall_winrate: overallWinrate,
      },
      summary: {
        roster_size: rosterRes.rows.length,
        recent_matches: matchesRes.rows.length,
        avg_player_kda: avgKda,
        headline: `${team.name} (${team.region}) — Rank #${team.ranking || 'N/A'} | ${overallWinrate}% win rate`,
      },
      roster: rosterRes.rows,
      recent_matches: matchesRes.rows,
      strengths: [
        `Average roster KDA of ${avgKda}`,
        `Recent record across ${matchesRes.rows.length} tracked games`,
        team.description || 'No descriptive notes on play style.',
      ],
      weaknesses: [
        overallWinrate < 55 ? 'Below 55% overall winrate' : 'Consistent macro execution needed',
        rosterRes.rows.length < 5 ? 'Thin roster depth' : 'Maintain rotation discipline',
      ],
      recommendations: [
        'Drill objective control timings around 20m mark.',
        'Review last 3 losses for repeated draft mistakes.',
        'Schedule scrim block vs higher-ranked opponent.',
      ],
    };

    res.json(report);
  } catch (err) {
    console.error('scouting-report error:', err);
    res.status(500).json({ error: 'Failed to generate scouting report' });
  }
});

// -----------------------------------------------------------------------------
// NON-VIZ 2: /api/custom-views/meta-rules  — CRUD for champion/agent picks + comps
// GET (list+create combined endpoint), POST creates, PUT/:id, DELETE/:id
// -----------------------------------------------------------------------------
router.get('/meta-rules', (req, res) => {
  const game = req.query.game;
  const pickType = req.query.pick_type;
  let rows = metaRules.slice();
  if (game) rows = rows.filter((r) => r.game === game);
  if (pickType) rows = rows.filter((r) => r.pick_type === pickType);
  res.json({
    count: rows.length,
    data: rows,
    generated_at: new Date().toISOString(),
  });
});

router.post('/meta-rules', (req, res) => {
  const { name, game, pick_type, picks, counters, win_rate, notes } = req.body || {};
  if (!name || !game || !pick_type || !Array.isArray(picks)) {
    return res.status(400).json({
      error: 'name, game, pick_type and picks[] are required',
    });
  }
  const rule = {
    id: metaRulesNextId++,
    name,
    game,
    pick_type,
    picks,
    counters: Array.isArray(counters) ? counters : [],
    win_rate: typeof win_rate === 'number' ? win_rate : Number(win_rate) || 0,
    notes: notes || '',
    created_at: new Date().toISOString(),
  };
  metaRules.push(rule);
  res.status(201).json(rule);
});

router.put('/meta-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = metaRules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Meta rule not found' });
  const cur = metaRules[idx];
  const patch = req.body || {};
  const updated = {
    ...cur,
    ...patch,
    id: cur.id,
    created_at: cur.created_at,
  };
  if (patch.picks && !Array.isArray(patch.picks)) updated.picks = cur.picks;
  if (patch.counters && !Array.isArray(patch.counters)) updated.counters = cur.counters;
  metaRules[idx] = updated;
  res.json(updated);
});

router.delete('/meta-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = metaRules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Meta rule not found' });
  const removed = metaRules.splice(idx, 1)[0];
  res.json({ deleted: true, rule: removed });
});

module.exports = router;
