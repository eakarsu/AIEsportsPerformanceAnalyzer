const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { Pool } = require('pg');
const authenticateToken = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Ensure wellness_logs table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS wellness_logs (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    sleep_hours NUMERIC(4,1),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    mood VARCHAR(50),
    burnout_risk_analysis TEXT,
    logged_at TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.error('Failed to create wellness_logs table:', err.message));

// Ensure ai_analyses table exists (may already be created by ai.js)
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    analysis_type VARCHAR(100),
    entity_id INTEGER,
    entity_type VARCHAR(50),
    content TEXT,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.error('Failed to create ai_analyses table:', err.message));

async function callOpenRouter(systemPrompt, userPrompt) {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_key_here') {
    const err = new Error('OPENROUTER_API_KEY is not configured on the server.');
    err.statusCode = 503;
    throw err;
  }
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'OpenRouter API error');
  }
  return { content: data.choices[0].message.content, model };
}

async function persistAnalysis(analysisType, entityId, entityType, content, model) {
  const result = await pool.query(
    `INSERT INTO ai_analyses (analysis_type, entity_id, entity_type, content, model)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [analysisType, entityId, entityType, content, model]
  );
  return result.rows[0].id;
}

// Apply auth + rate limiter to all routes in this file
router.use(authenticateToken);
router.use(aiRateLimiter);

// POST /api/ai/analysis-history — fetch AI analysis history for an entity
router.post('/analysis-history', async (req, res) => {
  try {
    const { entity_type, entity_id } = req.body;

    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'entity_type and entity_id are required.' });
    }

    const result = await pool.query(
      `SELECT * FROM ai_analyses
       WHERE entity_type = $1 AND entity_id = $2
       ORDER BY created_at DESC`,
      [entity_type, entity_id]
    );

    res.json({ history: result.rows });
  } catch (err) {
    console.error('Analysis history error:', err);
    res.status(500).json({ error: 'Failed to fetch analysis history.', message: err.message });
  }
});

// POST /api/ai/wellness-log — log player wellness + AI burnout assessment
router.post('/wellness-log', async (req, res) => {
  try {
    const { player_id, sleep_hours, stress_level, mood } = req.body;

    if (!player_id) {
      return res.status(400).json({ error: 'player_id is required.' });
    }
    if (sleep_hours === undefined || stress_level === undefined || !mood) {
      return res.status(400).json({ error: 'sleep_hours, stress_level, and mood are required.' });
    }

    // Fetch player info
    const playerResult = await pool.query(
      'SELECT username, game, role FROM players WHERE id = $1',
      [player_id]
    );
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }
    const player = playerResult.rows[0];

    // Fetch recent wellness history
    const recentLogs = await pool.query(
      `SELECT sleep_hours, stress_level, mood, logged_at
       FROM wellness_logs WHERE player_id = $1
       ORDER BY logged_at DESC LIMIT 7`,
      [player_id]
    );

    const historyText = recentLogs.rows.length > 0
      ? recentLogs.rows.map(l => `  - Sleep: ${l.sleep_hours}h, Stress: ${l.stress_level}/10, Mood: ${l.mood} (${new Date(l.logged_at).toLocaleDateString()})`).join('\n')
      : '  No previous logs.';

    const systemPrompt = `You are an esports sports psychologist and wellness expert. Assess player burnout risk based on wellness metrics and provide actionable recommendations. Use markdown formatting.`;

    const userPrompt = `Assess burnout risk for this esports player:

Player: ${player.username}
Game: ${player.game} | Role: ${player.role}

Today's Metrics:
- Sleep Hours: ${sleep_hours}
- Stress Level: ${stress_level}/10
- Mood: ${mood}

Recent 7-Day History:
${historyText}

Please provide:
1. **Burnout Risk Level** - Low / Medium / High / Critical with percentage estimate
2. **Key Risk Factors** - What's driving the risk
3. **Positive Indicators** - What's going well
4. **Immediate Actions** - 3 things to do today
5. **Weekly Recovery Plan** - Structured approach for the next 7 days
6. **Long-term Recommendations** - Sustainable wellness practices`;

    const { content: analysis, model } = await callOpenRouter(systemPrompt, userPrompt);

    // Save wellness log
    const logResult = await pool.query(
      `INSERT INTO wellness_logs (player_id, sleep_hours, stress_level, mood, burnout_risk_analysis)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [player_id, sleep_hours, stress_level, mood, analysis]
    );

    const analysis_id = await persistAnalysis('wellness_burnout', player_id, 'player', analysis, model);

    res.json({
      wellness_log: logResult.rows[0],
      burnout_analysis: analysis,
      analysis_id,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Wellness log error:', err);
    res.status(500).json({ error: 'Failed to process wellness log.', message: err.message });
  }
});

// POST /api/ai/tournament-brief — pre-round strategic brief for all matches in a tournament round
router.post('/tournament-brief', async (req, res) => {
  try {
    const { tournament_id, round } = req.body;

    if (!tournament_id || !round) {
      return res.status(400).json({ error: 'tournament_id and round are required.' });
    }

    // Fetch tournament
    const tournamentResult = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournament_id]
    );
    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }
    const tournament = tournamentResult.rows[0];

    // Fetch scheduled matches for this round
    const matchesResult = await pool.query(
      `SELECT m.*,
              t1.name AS team1_name, t1.wins AS team1_wins, t1.losses AS team1_losses, t1.ranking AS team1_ranking,
              t2.name AS team2_name, t2.wins AS team2_wins, t2.losses AS team2_losses, t2.ranking AS team2_ranking
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       WHERE m.tournament_id = $1
       ORDER BY m.match_date ASC`,
      [tournament_id]
    );

    if (matchesResult.rows.length === 0) {
      return res.status(404).json({ error: 'No matches found for this tournament.' });
    }

    // Fetch rosters for all involved teams
    const teamIds = [...new Set(matchesResult.rows.flatMap(m => [m.team1_id, m.team2_id]).filter(Boolean))];
    const rostersResult = await pool.query(
      `SELECT player_id, p.username, p.role, p.apm, p.accuracy, p.positioning_score, p.kda, p.winrate, p.team_id
       FROM players p
       WHERE p.team_id = ANY($1)`,
      [teamIds]
    );

    const rosterByTeam = {};
    rostersResult.rows.forEach(p => {
      if (!rosterByTeam[p.team_id]) rosterByTeam[p.team_id] = [];
      rosterByTeam[p.team_id].push(p);
    });

    const matchSummaries = matchesResult.rows.map(m => {
      const t1Roster = (rosterByTeam[m.team1_id] || []).map(p =>
        `    * ${p.username} (${p.role}) - KDA: ${p.kda}, WR: ${p.winrate}%, APM: ${p.apm}`
      ).join('\n');
      const t2Roster = (rosterByTeam[m.team2_id] || []).map(p =>
        `    * ${p.username} (${p.role}) - KDA: ${p.kda}, WR: ${p.winrate}%, APM: ${p.apm}`
      ).join('\n');

      return `**Match: ${m.team1_name} vs ${m.team2_name}**
  - ${m.team1_name}: Rank #${m.team1_ranking}, ${m.team1_wins}W-${m.team1_losses}L
    Roster:\n${t1Roster || '    (no roster data)'}
  - ${m.team2_name}: Rank #${m.team2_ranking}, ${m.team2_wins}W-${m.team2_losses}L
    Roster:\n${t2Roster || '    (no roster data)'}`;
    }).join('\n\n');

    const systemPrompt = `You are an elite esports tournament analyst. Generate comprehensive pre-round strategic briefs for tournament matches. Your briefs help coaching staff, analysts, and spectators understand the competitive landscape. Use structured markdown formatting.`;

    const userPrompt = `Generate a pre-round strategic brief for:

Tournament: ${tournament.name}
Game: ${tournament.game}
Round: ${round}
Format: ${tournament.format || 'N/A'}
Prize Pool: $${tournament.prize_pool || 0}
Status: ${tournament.status}

Scheduled Matches (${matchesResult.rows.length} total):
${matchSummaries}

Please provide:
1. **Round Overview** - What's at stake in this round
2. **Match-by-Match Breakdown** - For each match: predicted winner, key storylines, and watch points
3. **Star Players to Watch** - Top performers across all matches
4. **Biggest Upsets** - Which matches could surprise
5. **Tournament Trajectory** - How results could shape the bracket
6. **Coaching Insights** - Strategic adjustments teams should consider
7. **Viewer's Agenda** - Which match to prioritize watching and why`;

    const { content: brief, model } = await callOpenRouter(systemPrompt, userPrompt);
    const analysis_id = await persistAnalysis('tournament_brief', tournament_id, 'tournament', brief, model);

    res.json({
      brief,
      analysis_id,
      tournament,
      round,
      match_count: matchesResult.rows.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Tournament brief error:', err);
    res.status(500).json({ error: 'Failed to generate tournament brief.', message: err.message });
  }
});

// POST /api/ai/highlight-clip-suggest
// Accepts { match_id, max_clips? }
// Returns AI-suggested highlight moments (timestamps + reasons) from match notes
router.post('/highlight-clip-suggest', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { match_id, max_clips } = req.body;
    if (!match_id) return res.status(400).json({ error: 'match_id is required' });

    const matchResult = await pool.query('SELECT * FROM matches WHERE id = $1', [match_id]);
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const match = matchResult.rows[0];
    const cap = Math.min(Math.max(parseInt(max_clips, 10) || 8, 1), 20);

    const systemPrompt = 'You are a senior esports broadcast producer. Identify the most highlight-worthy moments from a match summary and return only valid JSON.';
    const userPrompt = `Suggest up to ${cap} highlight clips for this match.

Match:
- ID: ${match.id}
- Game: ${match.game || 'unknown'}
- Date: ${match.match_date || match.scheduled_at || 'unknown'}
- Teams: ${match.team_a_name || match.team_a_id || 'A'} vs ${match.team_b_name || match.team_b_id || 'B'}
- Result: ${match.result || match.winner || 'unknown'}
- Notes: ${match.notes || 'none'}
- Key events: ${match.key_events || 'not provided'}

Return JSON only with this exact shape:
{
  "clips": [
    {
      "rank": <integer 1-based>,
      "timestamp_estimate": "<MM:SS or HH:MM:SS>",
      "title": "<short title>",
      "type": "<teamfight|clutch|outplay|comeback|opener|finish|other>",
      "players_involved": ["..."],
      "reason": "<why this matters>"
    }
  ],
  "overall_storyline": "<1-2 sentences>"
}`;

    const { content: aiContent, model } = await callOpenRouter(systemPrompt, userPrompt);
    let parsed;
    try { parsed = JSON.parse(aiContent); } catch {
      const m = aiContent.match(/\{[\s\S]*\}/);
      parsed = m ? (() => { try { return JSON.parse(m[0]); } catch { return { raw: aiContent }; } })() : { raw: aiContent };
    }

    const analysis_id = await persistAnalysis('highlight_clips', match_id, 'match', JSON.stringify(parsed), model);

    res.json({
      match_id,
      analysis_id,
      max_clips: cap,
      suggestions: parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('highlight-clip-suggest error:', err);
    res.status(500).json({ error: 'Failed to suggest highlight clips.', message: err.message });
  }
});

// POST /api/ai/meta-analysis — analyze the current game meta
// Accepts { game, region?, days? }
router.post('/meta-analysis', async (req, res) => {
  try {
    const { game, region, days } = req.body || {};
    if (!game) return res.status(400).json({ error: 'game is required.' });

    const windowDays = Math.min(Math.max(parseInt(days, 10) || 30, 1), 180);

    // Pull recent matches for the game to ground the analysis
    const matchesResult = await pool.query(
      `SELECT m.id, m.match_date, m.result, m.notes,
              t1.name AS team1_name, t2.name AS team2_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       WHERE COALESCE(m.game, t1.game, t2.game) = $1
         AND COALESCE(m.match_date, NOW()) >= NOW() - ($2 || ' days')::interval
       ORDER BY COALESCE(m.match_date, NOW()) DESC
       LIMIT 50`,
      [game, String(windowDays)]
    ).catch(() => ({ rows: [] }));

    const matchSummary = matchesResult.rows.length > 0
      ? matchesResult.rows.map(m => `  - ${m.team1_name || '?'} vs ${m.team2_name || '?'} | result: ${m.result || 'n/a'} | notes: ${m.notes || 'none'}`).join('\n')
      : '  (no recent match data)';

    const systemPrompt = 'You are an esports meta analyst. Summarize the current competitive meta for the requested game using the provided recent matches as grounding. Use markdown.';
    const userPrompt = `Analyze the current meta for:

Game: ${game}
Region: ${region || 'global'}
Window: last ${windowDays} days

Recent matches sample (${matchesResult.rows.length}):
${matchSummary}

Please provide:
1. **Meta Overview** - Dominant playstyles / archetypes / strategies
2. **Top Picks / Compositions** - What is being played most successfully
3. **Counters & Weaknesses** - How to break the meta picks
4. **Trending Up / Down** - What is rising or falling
5. **Patch / Balance Notes (if any)** - Likely drivers of current meta
6. **Recommendations** - For coaches and players adapting to this meta`;

    const { content: analysis, model } = await callOpenRouter(systemPrompt, userPrompt);
    const analysis_id = await persistAnalysis('meta_analysis', null, 'game', analysis, model);

    res.json({
      game,
      region: region || 'global',
      days: windowDays,
      analysis,
      analysis_id,
      sample_matches: matchesResult.rows.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: err.message });
    }
    console.error('meta-analysis error:', err);
    res.status(500).json({ error: 'Failed to generate meta analysis.', message: err.message });
  }
});

// POST /api/ai/injury-risk-assess — analyze recent wellness logs to estimate
// overtraining / burnout / injury risk per player.
// Accepts { player_id, lookback_days? }
router.post('/injury-risk-assess', async (req, res) => {
  try {
    const { player_id, lookback_days } = req.body || {};
    if (!player_id) return res.status(400).json({ error: 'player_id is required.' });

    const window = Math.min(Math.max(parseInt(lookback_days, 10) || 14, 3), 90);

    const playerResult = await pool.query(
      'SELECT id, username, game, role FROM players WHERE id = $1',
      [player_id]
    );
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }
    const player = playerResult.rows[0];

    const logsResult = await pool.query(
      `SELECT sleep_hours, stress_level, mood, logged_at
       FROM wellness_logs
       WHERE player_id = $1
         AND logged_at >= NOW() - ($2 || ' days')::interval
       ORDER BY logged_at DESC`,
      [player_id, String(window)]
    );

    const logsText = logsResult.rows.length > 0
      ? logsResult.rows.map(l => `  - ${new Date(l.logged_at).toISOString().slice(0,10)} | sleep: ${l.sleep_hours}h | stress: ${l.stress_level}/10 | mood: ${l.mood}`).join('\n')
      : '  (no wellness logs in the lookback window)';

    const systemPrompt = 'You are an esports performance physician. Assess injury / overtraining / burnout risk based on recent wellness logs. Be specific and actionable. Use markdown.';
    const userPrompt = `Assess injury and overtraining risk for this player:

Player: ${player.username}
Game: ${player.game} | Role: ${player.role}
Lookback: ${window} days
Logs (${logsResult.rows.length}):
${logsText}

Please provide:
1. **Risk Tier** - Low / Moderate / High / Critical with a 0-100 risk score
2. **Drivers** - Which signals are pushing risk up
3. **Protective Factors** - Which signals are keeping risk down
4. **Body / Mind Specific Concerns** - e.g. wrist/RSI, eye strain, sleep debt, anxiety
5. **Immediate Mitigations (24-72h)** - Concrete, actionable steps
6. **Two-Week Plan** - Training-load and rest schedule adjustments
7. **Escalation Triggers** - When to involve a clinician`;

    const { content: assessment, model } = await callOpenRouter(systemPrompt, userPrompt);
    const analysis_id = await persistAnalysis('injury_risk', player_id, 'player', assessment, model);

    res.json({
      player,
      lookback_days: window,
      log_count: logsResult.rows.length,
      assessment,
      analysis_id,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: err.message });
    }
    console.error('injury-risk-assess error:', err);
    res.status(500).json({ error: 'Failed to assess injury risk.', message: err.message });
  }
});

// =====================================================================
// Apply pass 5 — additive endpoints (sponsorship matching, live streaming
// gate, esports betting insights). All read-only, additive only.
// ENV VARS: OPENROUTER_API_KEY (required for AI), TWITCH_CLIENT_ID +
// TWITCH_CLIENT_SECRET and/or YOUTUBE_API_KEY (live streaming gate).
// =====================================================================

// POST /api/ai/sponsorship-match — match a team or player to brand archetypes.
// PRODUCT-DECISION: scoring axes are fixed (audience-fit, brand-safety,
// activation-fit, geographic-fit, budget-fit, weights = 0.3/0.25/0.2/0.15/0.1).
// We never hand back a brand contact list — only archetype + suggested outreach.
router.post('/sponsorship-match', async (req, res) => {
  try {
    const { team_id, player_id, target_industries, audience_demographics, region } = req.body || {};
    if (!team_id && !player_id) {
      return res.status(400).json({ error: 'team_id or player_id is required.' });
    }
    let entity = null;
    let entity_type = null;
    if (player_id) {
      const r = await pool.query('SELECT id, username, game, role FROM players WHERE id = $1', [player_id]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Player not found.' });
      entity = r.rows[0];
      entity_type = 'player';
    } else {
      const r = await pool.query('SELECT id, name, game, region FROM teams WHERE id = $1', [team_id]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Team not found.' });
      entity = r.rows[0];
      entity_type = 'team';
    }
    const systemPrompt = 'You are a sponsorship strategist for esports orgs. Match the entity to brand archetypes (NOT real brands). Use markdown.';
    const userPrompt = `Recommend brand-archetype sponsorship matches for this ${entity_type}.

${entity_type}: ${JSON.stringify(entity)}
Target industries (optional): ${JSON.stringify(target_industries || [])}
Audience demographics (optional): ${JSON.stringify(audience_demographics || {})}
Region (optional): ${region || 'global'}

Use this fixed scoring rubric (weights):
- audience-fit (0.30)
- brand-safety (0.25)
- activation-fit (0.20)
- geographic-fit (0.15)
- budget-fit (0.10)

Please provide:
1. **Top 3 Brand Archetypes** (e.g. "energy-drink-challenger", "premium-peripherals", "gaming-chair-niche") with sub-scores per axis and a final 0-100 score
2. **Activation Ideas** for each archetype
3. **Audience Strengths** to highlight in pitch decks
4. **Risk / Brand-safety Flags** for the entity
5. **Suggested Outreach Sequencing** (which archetype to pursue first and why)

Do NOT invent real brand names; archetypes only.`;
    const { content: analysis, model } = await callOpenRouter(systemPrompt, userPrompt);
    const analysis_id = await persistAnalysis('sponsorship_match', entity.id, entity_type, analysis, model);
    res.json({ entity_type, entity, analysis, analysis_id, generatedAt: new Date().toISOString() });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ error: err.message, missing: 'OPENROUTER_API_KEY' });
    console.error('sponsorship-match error:', err);
    res.status(500).json({ error: 'Failed to generate sponsorship match.', message: err.message });
  }
});

// POST /api/ai/live-stream-status — Twitch/YouTube live stream status check.
// NEEDS-CREDS: gates on TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET (preferred)
// or YOUTUBE_API_KEY. Returns 503 with `missing: <ENV>` if neither configured.
// PRODUCT-DECISION: this is a stub — when creds are present we return a
// "configured providers" payload without making a live HTTP call (no SDK
// dependency added in this pass). The schema is ready for live wiring.
router.post('/live-stream-status', async (req, res) => {
  const hasTwitch = !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
  const hasYoutube = !!process.env.YOUTUBE_API_KEY;
  if (!hasTwitch && !hasYoutube) {
    return res.status(503).json({
      error: 'Live streaming integration unavailable. No streaming provider credentials configured.',
      missing: 'TWITCH_CLIENT_ID,TWITCH_CLIENT_SECRET,YOUTUBE_API_KEY',
    });
  }
  const { channel_handles } = req.body || {};
  const handles = Array.isArray(channel_handles) ? channel_handles : [];
  res.json({
    success: true,
    providers: {
      twitch: hasTwitch,
      youtube: hasYoutube,
    },
    queried_handles: handles,
    streams: [],
    note: 'Streaming provider stub — credentials present but live SDK calls are not wired in this pass.',
    generatedAt: new Date().toISOString(),
  });
});

// POST /api/ai/betting-insights — informational only, NOT a betting platform.
// PRODUCT-DECISION (TOO-RISKY mitigation): output is explicitly informational
// (probability + uncertainty + key drivers); never returns odds, never names
// a sportsbook, never executes a wager. Includes a fixed disclaimer field.
router.post('/betting-insights', async (req, res) => {
  try {
    const { match_id, market } = req.body || {};
    if (!match_id) return res.status(400).json({ error: 'match_id is required.' });
    const matchResult = await pool.query(
      `SELECT m.*, t1.name AS team1_name, t2.name AS team2_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       WHERE m.id = $1`,
      [match_id]
    );
    if (matchResult.rows.length === 0) return res.status(404).json({ error: 'Match not found.' });
    const match = matchResult.rows[0];
    const systemPrompt = 'You are an esports analyst. Provide INFORMATIONAL probability assessments only. NEVER return odds, NEVER suggest a sportsbook, NEVER recommend a wager. Use markdown.';
    const userPrompt = `Provide informational insight for the following match. Market focus: ${market || 'match-winner'}.

Match: ${match.team1_name || '?'} vs ${match.team2_name || '?'}
Date: ${match.match_date || 'n/a'}
Notes: ${match.notes || 'n/a'}

Please provide:
1. **Win Probability (informational)** - team1_win_pct, team2_win_pct, draw_pct (if applicable). Show uncertainty band.
2. **Key Drivers** - which factors push probability each way
3. **Uncertainty Sources** - what could materially change the read
4. **What This Is NOT** - explicit statement that this is not betting advice and no sportsbook is recommended`;
    const { content: analysis, model } = await callOpenRouter(systemPrompt, userPrompt);
    const analysis_id = await persistAnalysis('betting_insights', match_id, 'match', analysis, model);
    res.json({
      match_id,
      market: market || 'match-winner',
      analysis,
      analysis_id,
      disclaimer: 'INFORMATIONAL ONLY. This is not betting advice. No odds. No sportsbook. No wager recommendation. Esports betting may be regulated or prohibited in your jurisdiction.',
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err.statusCode === 503) return res.status(503).json({ error: err.message, missing: 'OPENROUTER_API_KEY' });
    console.error('betting-insights error:', err);
    res.status(500).json({ error: 'Failed to generate betting insights.', message: err.message });
  }
});

module.exports = router;
