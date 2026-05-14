# Audit Notes — AIEsportsPerformanceAnalyzer

Audit source: `_AUDIT/reports/batch_03.md` § 18 (partial-build, 5 AI endpoints).

## Original audit recommendations

### Missing AI counterparts
- `/highlight-clip-suggest` — identify key moments for highlight reels.
- `/meta-analysis` — analyze current game meta.
- `/injury-risk-assess` — overtraining / burnout risk.

### Missing non-AI features
- Video upload / clip management.
- Live match streaming.
- Sponsorship / contract management.
- Prize-pool tracking.
- Fan engagement / voting.

### Custom feature suggestions
- Agentic coach.
- In-game real-time analytics.
- Video analysis with annotations.
- Injury / burnout prevention.
- Sponsorship matching.
- Esports betting insights.
- Highlight / social-content auto-generation.

## Implementations applied this pass

1. **`POST /api/ai/highlight-clip-suggest`** in `aiNew.js` — given a match,
   returns ranked highlight moments (timestamp, type, players, reason).
   Reuses existing `callOpenRouter` + `persistAnalysis` helpers.

The `aiNew.js` file already contains `/wellness-log` (which addresses the
`/injury-risk-assess` recommendation in spirit) and `/tournament-brief`. Core
`ai.js` covers performance, strategy, opponent-scouting, training, prediction.

## Prioritized backlog

1. **MECHANICAL** — Add `/api/ai/meta-analysis` taking `{ game, region, days }`
   and returning the current meta summary (popular picks, dominant strategies,
   counters). Schema exists.
2. **MECHANICAL** — Add `/api/ai/injury-risk-assess` reading recent
   `wellness_logs` per player and outputting a risk tier. Pattern matches
   existing wellness-log handler.
3. **NEEDS-CREDS** — Live streaming integration (Twitch / YouTube live)
   needs API keys.
4. **NEEDS-PRODUCT-DECISION** — Sponsorship matching needs a brand-side
   onboarding flow.
5. **TOO-RISKY** — Esports betting market integration is heavily regulated
   (jurisdictional licensing) — out of mechanical scope.

## Apply pass 3 (frontend)

- **Action:** UPDATED-FE — 2 missing pages added.
- **Stack:** Express backend + Create-React-App frontend (React Router).
- **Found:** 8 user-facing AI POST endpoints across `ai.js` (5) and `aiNew.js` (3 — wellness-log, tournament-brief, highlight-clip-suggest). 6 pages existed (performance, strategy, scouting, training-plan, prediction, highlight-clip-suggest); 2 endpoints had no FE.
- **Added:**
  - `frontend/src/pages/WellnessLog.js` — form for `/api/ai/wellness-log` (player, sleep_hours, stress_level, mood) with explicit 503-no-key handling.
  - `frontend/src/pages/TournamentBrief.js` — form for `/api/ai/tournament-brief` (tournament_id, round) with same 503 handling.
  - `frontend/src/App.js` — imports + routes `/ai/wellness-log` and `/ai/tournament-brief`.
- **Reuses:** existing CSS classes (`ai-page`, `ai-controls`, `ai-result-card`, `ai-loading`), Bearer token via `localStorage.getItem('token')`, no new deps.
- **Verified:** `aiNew.js` is registered in `backend/server.js` (existing). No `npm install` performed.

## Apply pass 4 (mechanical backlog)

- **Action:** IMPLEMENTED — 2 mechanical features.
- **Features added:**
  1. `POST /api/ai/meta-analysis` (`backend/routes/aiNew.js`) + `frontend/src/pages/MetaAnalysis.js` route `/ai/meta-analysis`. Inputs: `{ game, region?, days? }`; pulls recent matches as grounding.
  2. `POST /api/ai/injury-risk-assess` (`backend/routes/aiNew.js`) + `frontend/src/pages/InjuryRiskAssess.js` route `/ai/injury-risk-assess`. Inputs: `{ player_id, lookback_days? }`; pulls `wellness_logs` window.
- **503 handling:** updated `callOpenRouter` in `aiNew.js` to throw `err.statusCode = 503` when `OPENROUTER_API_KEY` is missing or equals `your_openrouter_key_here`; both new handlers translate that to a 503 response. FE pages render an explicit "AI service unavailable" message on 503.
- **Files modified:** `backend/routes/aiNew.js`, `frontend/src/App.js`, plus the two new FE pages.
- **Smoke test:** PASS — backend started on :3001, login worked, both endpoints returned HTTP 503 with the expected error body when the key was the placeholder. Backend cleaned up.
- **Backlog still deferred:** live streaming integration (NEEDS-CREDS), sponsorship matching (NEEDS-PRODUCT-DECISION), esports betting integration (TOO-RISKY).

## Apply pass 5 (all backlog)

- **Action:** IMPLEMENTED — 3 backlog items (additive only).
- **Backend (`backend/routes/aiNew.js`):**
  1. `POST /api/ai/sponsorship-match` (NEEDS-PRODUCT-DECISION) — fixed scoring rubric `audience-fit/brand-safety/activation-fit/geographic-fit/budget-fit` with weights `0.30/0.25/0.20/0.15/0.10`. Returns brand archetypes only (never real brand names) + activation ideas + outreach sequencing.
  2. `POST /api/ai/live-stream-status` (NEEDS-CREDS) — gates on `TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET` and/or `YOUTUBE_API_KEY`; if neither present returns 503 with `missing: TWITCH_CLIENT_ID,TWITCH_CLIENT_SECRET,YOUTUBE_API_KEY`. With creds returns a configured-providers stub (no live SDK call).
  3. `POST /api/ai/betting-insights` (TOO-RISKY mitigation) — informational ONLY: probability commentary, no odds, no sportsbook, no wager recommendation; includes a fixed disclaimer field.
- **FE (`frontend/src/pages/`):** added `SponsorshipMatch.js`, `LiveStreamStatus.js`, `BettingInsights.js` (with on-page disclaimer banner). Routes registered in `frontend/src/App.js` at `/ai/sponsorship-match`, `/ai/live-stream-status`, `/ai/betting-insights`. All explicitly handle 503 with a clear "AI service unavailable" / missing-credentials message.
- **503 handling:** both AI endpoints reuse existing `callOpenRouter` 503 path; live-stream-status implements its own credential gate.
- **Smoke test:** PASS — backend started on :3001, login as `admin@esports.gg` succeeded; sponsorship-match (no params) returned 400, with team_id=1 returned 503 (`missing: OPENROUTER_API_KEY`); live-stream-status returned 503 (`missing: TWITCH_CLIENT_ID,TWITCH_CLIENT_SECRET,YOUTUBE_API_KEY`); betting-insights returned 503. Backend cleaned up.
