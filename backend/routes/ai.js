const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function callOpenRouter(systemPrompt, userPrompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
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

  return data.choices[0].message.content;
}

// POST /api/ai/performance-analysis
router.post('/performance-analysis', async (req, res) => {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required.' });
    }

    const playerResult = await pool.query(
      `SELECT p.*, t.name AS team_name
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       WHERE p.id = $1`,
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    const player = playerResult.rows[0];

    const systemPrompt = `You are an elite esports performance analyst with deep expertise across all major competitive games including League of Legends, CS2, Valorant, Dota 2, and Overwatch 2. You provide data-driven, actionable performance analyses for professional esports players. Your analysis should be structured, detailed, and include specific recommendations for improvement. Use markdown formatting for readability.`;

    const userPrompt = `Analyze the performance of this esports player and provide a comprehensive assessment:

Player: ${player.username} (${player.real_name})
Game: ${player.game}
Role: ${player.role}
Team: ${player.team_name || 'Free Agent'}
Country: ${player.country}

Performance Metrics:
- APM (Actions Per Minute): ${player.apm}
- Accuracy: ${player.accuracy}%
- Positioning Score: ${player.positioning_score}/100
- KDA Ratio: ${player.kda}
- Win Rate: ${player.winrate}%

Player Bio: ${player.bio || 'N/A'}

Please provide:
1. **Overall Performance Rating** - Rate the player out of 10 with justification
2. **APM Analysis** - How does their APM compare to their role and game expectations? Is it optimal?
3. **Accuracy Assessment** - Evaluate their accuracy relative to their role
4. **Positioning Evaluation** - Analyze their positioning score and what it means for their playstyle
5. **KDA & Win Rate Analysis** - Break down what these numbers tell us
6. **Key Strengths** - Identify 3-4 standout strengths
7. **Areas for Improvement** - Identify 3-4 specific areas to work on
8. **Personalized Recommendations** - 5 actionable steps to improve performance
9. **Competitive Outlook** - How does this player stack up at the pro level?`;

    const analysis = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      analysis,
      player,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Performance analysis error:', err);
    res.status(500).json({ error: 'Failed to generate performance analysis.', message: err.message });
  }
});

// POST /api/ai/strategy-analysis
router.post('/strategy-analysis', async (req, res) => {
  try {
    const { teamId, opponentTeamId, game } = req.body;

    if (!teamId || !opponentTeamId) {
      return res.status(400).json({ error: 'teamId and opponentTeamId are required.' });
    }

    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    const opponentResult = await pool.query('SELECT * FROM teams WHERE id = $1', [opponentTeamId]);

    if (teamResult.rows.length === 0 || opponentResult.rows.length === 0) {
      return res.status(404).json({ error: 'One or both teams not found.' });
    }

    const team = teamResult.rows[0];
    const opponent = opponentResult.rows[0];

    // Fetch recent matches for both teams
    const teamMatchesResult = await pool.query(
      `SELECT m.*, t1.name AS team1_name, t2.name AS team2_name, w.name AS winner_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN teams w ON m.winner_id = w.id
       WHERE m.team1_id = $1 OR m.team2_id = $1
       ORDER BY m.match_date DESC LIMIT 5`,
      [teamId]
    );

    const opponentMatchesResult = await pool.query(
      `SELECT m.*, t1.name AS team1_name, t2.name AS team2_name, w.name AS winner_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN teams w ON m.winner_id = w.id
       WHERE m.team1_id = $1 OR m.team2_id = $1
       ORDER BY m.match_date DESC LIMIT 5`,
      [opponentTeamId]
    );

    const formatMatches = (matches) =>
      matches.map(m => `  - ${m.team1_name} vs ${m.team2_name}: ${m.score_team1}-${m.score_team2} (Winner: ${m.winner_name || 'TBD'}, Map: ${m.map || 'N/A'})`).join('\n');

    const systemPrompt = `You are a top-tier esports strategy analyst and coach. You specialize in competitive ${game || team.game || 'esports'} strategy, meta analysis, and match preparation. Provide detailed strategic analysis with actionable tactical recommendations. Use markdown formatting.`;

    const userPrompt = `Provide a strategic analysis for an upcoming match between these two teams:

YOUR TEAM: ${team.name}
- Game: ${team.game}
- Region: ${team.region}
- Ranking: #${team.ranking}
- Record: ${team.wins}W - ${team.losses}L (${((team.wins / (team.wins + team.losses)) * 100).toFixed(1)}% win rate)
- Coach: ${team.coach}
- Description: ${team.description}
Recent Matches:
${formatMatches(teamMatchesResult.rows) || '  No recent matches found.'}

OPPONENT TEAM: ${opponent.name}
- Game: ${opponent.game}
- Region: ${opponent.region}
- Ranking: #${opponent.ranking}
- Record: ${opponent.wins}W - ${opponent.losses}L (${((opponent.wins / (opponent.wins + opponent.losses)) * 100).toFixed(1)}% win rate)
- Coach: ${opponent.coach}
- Description: ${opponent.description}
Recent Matches:
${formatMatches(opponentMatchesResult.rows) || '  No recent matches found.'}

Please provide:
1. **Matchup Overview** - Overall assessment of the matchup
2. **Your Team's Strengths** - Key advantages to exploit
3. **Your Team's Weaknesses** - Vulnerabilities to mitigate
4. **Opponent's Strengths** - Threats to watch for
5. **Opponent's Weaknesses** - Exploitable weaknesses
6. **Recommended Strategy** - Overall game plan and approach
7. **Ban/Pick Strategy** (if applicable) - Draft recommendations
8. **Key Tactical Adjustments** - Specific in-game tactics
9. **Win Conditions** - What needs to happen to win
10. **Risk Assessment** - Potential pitfalls and how to avoid them`;

    const analysis = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      analysis,
      team,
      opponent,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Strategy analysis error:', err);
    res.status(500).json({ error: 'Failed to generate strategy analysis.', message: err.message });
  }
});

// POST /api/ai/opponent-scouting
router.post('/opponent-scouting', async (req, res) => {
  try {
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required.' });
    }

    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const team = teamResult.rows[0];

    const playersResult = await pool.query(
      'SELECT * FROM players WHERE team_id = $1 ORDER BY id',
      [teamId]
    );

    const matchesResult = await pool.query(
      `SELECT m.*, t1.name AS team1_name, t2.name AS team2_name, w.name AS winner_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN teams w ON m.winner_id = w.id
       WHERE m.team1_id = $1 OR m.team2_id = $1
       ORDER BY m.match_date DESC LIMIT 10`,
      [teamId]
    );

    const players = playersResult.rows;

    const playerDetails = players.map(p =>
      `  - ${p.username} (${p.real_name}) | Role: ${p.role} | APM: ${p.apm} | Accuracy: ${p.accuracy}% | Positioning: ${p.positioning_score} | KDA: ${p.kda} | Winrate: ${p.winrate}%`
    ).join('\n');

    const matchDetails = matchesResult.rows.map(m =>
      `  - ${m.team1_name} vs ${m.team2_name}: ${m.score_team1}-${m.score_team2} (Winner: ${m.winner_name || 'TBD'}, Map: ${m.map || 'N/A'}, Duration: ${m.duration_minutes || '?'}min)`
    ).join('\n');

    const systemPrompt = `You are a professional esports scouting analyst who creates comprehensive opponent scouting reports. Your reports are used by coaching staff to prepare for matches. Be thorough, data-driven, and highlight actionable intelligence. Use markdown formatting.`;

    const userPrompt = `Generate a comprehensive scouting report for this team:

TEAM: ${team.name}
- Game: ${team.game}
- Region: ${team.region}
- Ranking: #${team.ranking}
- Record: ${team.wins}W - ${team.losses}L
- Coach: ${team.coach}
- Founded: ${team.founded_year}
- Description: ${team.description}

ROSTER (${players.length} players):
${playerDetails || '  No players found.'}

MATCH HISTORY (last 10):
${matchDetails || '  No matches found.'}

Please provide a full scouting report including:
1. **Team Overview** - General playstyle and identity
2. **Individual Player Assessments** - Breakdown of each player's strengths and weaknesses
3. **Star Player(s)** - Who is the most impactful and why
4. **Weak Link(s)** - Which player(s) can be targeted
5. **Team Playstyle Analysis** - Aggressive vs passive, early vs late game, tendencies
6. **Common Strategies & Patterns** - Based on match history
7. **Map/Champion/Agent Preferences** - What they tend to pick
8. **Exploitable Tendencies** - Patterns that can be countered
9. **Danger Zones** - When and where they are most dangerous
10. **Recommended Counter-Strategy** - How to beat this team`;

    const report = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      report,
      team,
      players,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Opponent scouting error:', err);
    res.status(500).json({ error: 'Failed to generate scouting report.', message: err.message });
  }
});

// POST /api/ai/training-plan
router.post('/training-plan', async (req, res) => {
  try {
    const { playerId, focusAreas, duration } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required.' });
    }

    const playerResult = await pool.query(
      `SELECT p.*, t.name AS team_name
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       WHERE p.id = $1`,
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }

    const player = playerResult.rows[0];

    const schedulesResult = await pool.query(
      'SELECT * FROM training_schedules WHERE player_id = $1 ORDER BY scheduled_date DESC LIMIT 10',
      [playerId]
    );

    const currentSchedules = schedulesResult.rows.map(s =>
      `  - ${s.title} | Focus: ${s.focus_area} | Intensity: ${s.intensity} | Status: ${s.status} | Date: ${s.scheduled_date}`
    ).join('\n');

    const systemPrompt = `You are an expert esports performance coach and training plan designer. You create personalized, periodized training plans for professional gamers that balance skill development, strategic understanding, physical health, and mental wellness. Your plans are specific, measurable, and progressive. Use markdown formatting.`;

    const userPrompt = `Create a personalized training plan for this esports player:

PLAYER: ${player.username} (${player.real_name})
- Game: ${player.game}
- Role: ${player.role}
- Team: ${player.team_name || 'Free Agent'}
- Country: ${player.country}

Current Performance:
- APM: ${player.apm}
- Accuracy: ${player.accuracy}%
- Positioning Score: ${player.positioning_score}/100
- KDA: ${player.kda}
- Win Rate: ${player.winrate}%

Focus Areas Requested: ${focusAreas && focusAreas.length > 0 ? focusAreas.join(', ') : 'General improvement across all areas'}
Training Duration: ${duration || '4 weeks'}

Current/Recent Training Schedule:
${currentSchedules || '  No existing training schedules found.'}

Player Bio: ${player.bio || 'N/A'}

Please create a detailed training plan including:
1. **Training Plan Overview** - Goals and philosophy
2. **Weekly Schedule** - Day-by-day breakdown with specific activities
3. **Mechanical Drills** - Specific exercises for aim/mechanics improvement
4. **Strategic Training** - Game knowledge and decision-making exercises
5. **VOD Review Plan** - What to watch and analyze
6. **Scrim Schedule** - Team practice recommendations
7. **Physical Health Routine** - Exercise, ergonomics, eye care
8. **Mental Performance** - Focus, tilt management, mindset training
9. **Progress Metrics** - How to measure improvement
10. **Milestones & Goals** - Specific targets to hit during the plan`;

    const plan = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      plan,
      player,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Training plan error:', err);
    res.status(500).json({ error: 'Failed to generate training plan.', message: err.message });
  }
});

// POST /api/ai/match-prediction
router.post('/match-prediction', async (req, res) => {
  try {
    const { team1Id, team2Id, tournamentId } = req.body;

    if (!team1Id || !team2Id) {
      return res.status(400).json({ error: 'team1Id and team2Id are required.' });
    }

    // Fetch teams with rosters
    const team1Result = await pool.query('SELECT * FROM teams WHERE id = $1', [team1Id]);
    const team2Result = await pool.query('SELECT * FROM teams WHERE id = $1', [team2Id]);

    if (team1Result.rows.length === 0 || team2Result.rows.length === 0) {
      return res.status(404).json({ error: 'One or both teams not found.' });
    }

    const team1 = team1Result.rows[0];
    const team2 = team2Result.rows[0];

    const team1PlayersResult = await pool.query(
      'SELECT * FROM players WHERE team_id = $1',
      [team1Id]
    );
    const team2PlayersResult = await pool.query(
      'SELECT * FROM players WHERE team_id = $1',
      [team2Id]
    );

    const team1MatchesResult = await pool.query(
      `SELECT m.*, t1.name AS team1_name, t2.name AS team2_name, w.name AS winner_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN teams w ON m.winner_id = w.id
       WHERE m.team1_id = $1 OR m.team2_id = $1
       ORDER BY m.match_date DESC LIMIT 5`,
      [team1Id]
    );

    const team2MatchesResult = await pool.query(
      `SELECT m.*, t1.name AS team1_name, t2.name AS team2_name, w.name AS winner_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       LEFT JOIN teams w ON m.winner_id = w.id
       WHERE m.team1_id = $1 OR m.team2_id = $1
       ORDER BY m.match_date DESC LIMIT 5`,
      [team2Id]
    );

    let tournamentInfo = '';
    if (tournamentId) {
      const tournamentResult = await pool.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
      if (tournamentResult.rows.length > 0) {
        const t = tournamentResult.rows[0];
        tournamentInfo = `\nTournament Context: ${t.name} (${t.game}) | Prize Pool: $${t.prize_pool} | Format: ${t.format} | Status: ${t.status}`;
      }
    }

    const formatPlayers = (players) =>
      players.map(p => `  - ${p.username} (${p.role}) | APM: ${p.apm} | Acc: ${p.accuracy}% | Pos: ${p.positioning_score} | KDA: ${p.kda} | WR: ${p.winrate}%`).join('\n');

    const formatMatches = (matches) =>
      matches.map(m => `  - ${m.team1_name} vs ${m.team2_name}: ${m.score_team1}-${m.score_team2} (Winner: ${m.winner_name || 'TBD'})`).join('\n');

    const systemPrompt = `You are a renowned esports match analyst and predictor. You use statistical analysis, team composition evaluation, historical performance data, and meta knowledge to make informed match predictions. Your predictions include confidence levels and detailed reasoning. Use markdown formatting.`;

    const userPrompt = `Predict the outcome of this esports match:
${tournamentInfo}

TEAM 1: ${team1.name}
- Game: ${team1.game} | Region: ${team1.region} | Ranking: #${team1.ranking}
- Record: ${team1.wins}W - ${team1.losses}L (${((team1.wins / (team1.wins + team1.losses)) * 100).toFixed(1)}% WR)
- Coach: ${team1.coach}
- Description: ${team1.description}
Roster:
${formatPlayers(team1PlayersResult.rows) || '  No roster data available.'}
Recent Matches:
${formatMatches(team1MatchesResult.rows) || '  No recent matches.'}

TEAM 2: ${team2.name}
- Game: ${team2.game} | Region: ${team2.region} | Ranking: #${team2.ranking}
- Record: ${team2.wins}W - ${team2.losses}L (${((team2.wins / (team2.wins + team2.losses)) * 100).toFixed(1)}% WR)
- Coach: ${team2.coach}
- Description: ${team2.description}
Roster:
${formatPlayers(team2PlayersResult.rows) || '  No roster data available.'}
Recent Matches:
${formatMatches(team2MatchesResult.rows) || '  No recent matches.'}

Please provide:
1. **Prediction** - Who wins and predicted score line
2. **Confidence Level** - Your confidence percentage with justification
3. **Key Matchup Factors** - What will decide this match
4. **Player Matchups** - Key individual battles to watch
5. **Team Strengths Comparison** - Side-by-side analysis
6. **Pace & Style Clash** - How their playstyles interact
7. **X-Factor** - The wild card that could swing the match
8. **Upset Scenario** - How the underdog could win
9. **Map/Draft Predictions** - Expected picks and bans
10. **Viewer's Guide** - What to watch for as a spectator`;

    const prediction = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      prediction,
      team1,
      team2,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Match prediction error:', err);
    res.status(500).json({ error: 'Failed to generate match prediction.', message: err.message });
  }
});

module.exports = router;
