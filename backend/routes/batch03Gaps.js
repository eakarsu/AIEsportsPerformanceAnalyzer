// ============================================================
// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated Gap-feature endpoints (lean v0).
// TODO: configure credentials (set OPENROUTER_API_KEY).
// ============================================================
const express = require('express');
const router = express.Router();

let _gfReady = false;
async function ensureGapTable(pool) {
  if (_gfReady || !pool) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS gap_features (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) NOT NULL,
      user_id INT,
      input JSONB,
      output JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    _gfReady = true;
  } catch (_) { /* tolerant of missing DB */ }
}

async function callAI(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, status: 503, error: 'AI service unavailable. Set OPENROUTER_API_KEY (TODO: configure credentials).' };
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
      }),
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return { ok: r.ok, status: r.status, text, raw: data };
  } catch (e) {
    return { ok: false, status: 500, error: String(e.message || e) };
  }
}

function buildHandler(slug, label, hint) {
  return async (req, res) => {
    const body = req.body || {};
    const userId = req.user?.id || null;
    const prompt = `Feature: ${label}\nContext hint: ${hint}\nUser input:\n${JSON.stringify(body, null, 2)}\n\nProduce a concise, actionable response.`;
    const ai = await callAI(prompt);
    try {
      const pool = req.app.locals.pool || req.app.get('pool') || null;
      if (pool) {
        await ensureGapTable(pool);
        await pool.query('INSERT INTO gap_features(slug, user_id, input, output) VALUES ($1,$2,$3,$4)',
          [slug, userId, body, { text: ai.text || ai.error || null }]);
      }
    } catch (_) { /* tolerant */ }
    if (!ai.ok) return res.status(ai.status || 500).json({ error: ai.error || ai.text || `Upstream error (${ai.status})`, slug });
    res.json({ slug, label, result: ai.text });
  };
}

router.post('/gap-no-highlight-clip-generator-video-aware', buildHandler('gap-ai-no-highlight-clip-generator-video-aware', 'No highlight-clip generator (video-aware)', 'No highlight-clip generator (video-aware)'));
router.post('/gap-no-game-meta-scanner-auto-pull-pick-ban-rates', buildHandler('gap-ai-no-game-meta-scanner-auto-pull-pick-ban-rates', 'No game-meta scanner (auto-pull pick/ban rates)', 'No game-meta scanner (auto-pull pick/ban rates)'));
router.post('/gap-no-injury-burn-out-predictor', buildHandler('gap-ai-no-injury-burn-out-predictor', 'No injury / burn-out predictor', 'No injury / burn-out predictor'));
router.post('/gap-no-notifications-subsystem', buildHandler('gap-non-no-notifications-subsystem', 'No notifications subsystem', 'No notifications subsystem'));
router.post('/gap-no-webhooks', buildHandler('gap-non-no-webhooks', 'No webhooks', 'No webhooks'));
router.post('/gap-no-audit-logs', buildHandler('gap-non-no-audit-logs', 'No audit logs', 'No audit logs'));
router.post('/gap-no-search-across-players-matches', buildHandler('gap-non-no-search-across-players-matches', 'No search across players/matches', 'No search across players/matches'));
router.post('/gap-no-live-streaming-scoreboard-endpoint', buildHandler('gap-non-no-live-streaming-scoreboard-endpoint', 'No live streaming / scoreboard endpoint', 'No live streaming / scoreboard endpoint'));
router.post('/gap-no-sponsorship-contract-management', buildHandler('gap-non-no-sponsorship-contract-management', 'No sponsorship / contract management', 'No sponsorship / contract management'));
router.post('/gap-no-prize-pool-ledger', buildHandler('gap-non-no-prize-pool-ledger', 'No prize-pool ledger', 'No prize-pool ledger'));
router.post('/gap-no-fan-engagement-voting-module', buildHandler('gap-non-no-fan-engagement-voting-module', 'No fan-engagement / voting module', 'No fan-engagement / voting module'));

module.exports = router;
