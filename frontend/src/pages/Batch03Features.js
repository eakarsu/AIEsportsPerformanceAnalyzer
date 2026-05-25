// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated frontend page (lean v0). Wires Custom Feature Suggestions
// and Gap endpoints (AI counterparts + non-AI features) to backend routes.
import React, { useState } from 'react';

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:4000/api';

const FEATURES = [
  { kind: 'cfs', slug: 'cf-agentic-coach', label: 'Agentic coach', desc: '"We keep losing to comp A — what should we practice?" → agent analyzes opponents, suggests counters, generates daily practice plans', endpoint: '/cf-agentic-coach' },
  { kind: 'cfs', slug: 'cf-in-game-real-time-analytics', label: 'In-game real-time analytics', desc: 'Live stats, heatmaps, decision tree recommendations during matches', endpoint: '/cf-in-game-real-time-analytics' },
  { kind: 'cfs', slug: 'cf-video-analysis-with-annotations', label: 'Video analysis with annotations', desc: 'Coach marks plays, AI extracts similar patterns from tournament footage', endpoint: '/cf-video-analysis-with-annotations' },
  { kind: 'cfs', slug: 'cf-injury-burn-out-prevention', label: 'Injury/burn-out prevention', desc: 'Monitor practice intensity, recommend recovery days', endpoint: '/cf-injury-burn-out-prevention' },
  { kind: 'cfs', slug: 'cf-sponsorship-optimization', label: 'Sponsorship optimization', desc: 'Match teams with brands based on audience demographics', endpoint: '/cf-sponsorship-optimization' },
  { kind: 'cfs', slug: 'cf-esports-betting-insights', label: 'Esports betting insights', desc: 'Quantified team strength for prediction markets (CSGO, LoL, Valorant)', endpoint: '/cf-esports-betting-insights' },
  { kind: 'cfs', slug: 'cf-content-creation', label: 'Content creation', desc: 'Auto-generate highlight reels, stat cards, social media posts', endpoint: '/cf-content-creation' },
  { kind: 'gap-ai', slug: 'gap-ai-no-highlight-clip-generator-video-aware', label: 'No highlight-clip generator (video-aware)', desc: 'No highlight-clip generator (video-aware)', endpoint: '/gap-no-highlight-clip-generator-video-aware' },
  { kind: 'gap-ai', slug: 'gap-ai-no-game-meta-scanner-auto-pull-pick-ban-rates', label: 'No game-meta scanner (auto-pull pick/ban rates)', desc: 'No game-meta scanner (auto-pull pick/ban rates)', endpoint: '/gap-no-game-meta-scanner-auto-pull-pick-ban-rates' },
  { kind: 'gap-ai', slug: 'gap-ai-no-injury-burn-out-predictor', label: 'No injury / burn-out predictor', desc: 'No injury / burn-out predictor', endpoint: '/gap-no-injury-burn-out-predictor' },
  { kind: 'gap-non', slug: 'gap-non-no-notifications-subsystem', label: 'No notifications subsystem', desc: 'No notifications subsystem', endpoint: '/gap-no-notifications-subsystem' },
  { kind: 'gap-non', slug: 'gap-non-no-webhooks', label: 'No webhooks', desc: 'No webhooks', endpoint: '/gap-no-webhooks' },
  { kind: 'gap-non', slug: 'gap-non-no-audit-logs', label: 'No audit logs', desc: 'No audit logs', endpoint: '/gap-no-audit-logs' },
  { kind: 'gap-non', slug: 'gap-non-no-search-across-players-matches', label: 'No search across players/matches', desc: 'No search across players/matches', endpoint: '/gap-no-search-across-players-matches' },
  { kind: 'gap-non', slug: 'gap-non-no-live-streaming-scoreboard-endpoint', label: 'No live streaming / scoreboard endpoint', desc: 'No live streaming / scoreboard endpoint', endpoint: '/gap-no-live-streaming-scoreboard-endpoint' },
  { kind: 'gap-non', slug: 'gap-non-no-sponsorship-contract-management', label: 'No sponsorship / contract management', desc: 'No sponsorship / contract management', endpoint: '/gap-no-sponsorship-contract-management' },
  { kind: 'gap-non', slug: 'gap-non-no-prize-pool-ledger', label: 'No prize-pool ledger', desc: 'No prize-pool ledger', endpoint: '/gap-no-prize-pool-ledger' },
  { kind: 'gap-non', slug: 'gap-non-no-fan-engagement-voting-module', label: 'No fan-engagement / voting module', desc: 'No fan-engagement / voting module', endpoint: '/gap-no-fan-engagement-voting-module' },
];

function authHeaders() {
  const t = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

export default function Batch03Features() {
  const [active, setActive] = useState(FEATURES[0]?.slug);
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleRequests = [
      {
          "label": "Scenario",
          "value": "Run Batch03 Features for a realistic customer case.\nContext: a team needs a practical recommendation based on incomplete operating data.\nGoal: identify the best action, key risks, missing information, and expected business impact.\nReturn: summary, prioritized action plan, assumptions, and follow-up questions."
      },
      {
          "label": "Data sample",
          "value": "Analyze this Batch03 Features data sample.\nInput records:\n- Record 1: urgent, customer impact high, owner unassigned\n- Record 2: medium priority, blocked by missing data\n- Record 3: recurring issue, automation opportunity\nReturn structured findings, anomalies, recommendations, and confidence."
      },
      {
          "label": "Executive review",
          "value": "Prepare an executive review for Batch03 Features.\nAudience: business owner, operations lead, and implementation team.\nInclude impact, risk, estimated effort, decision points, and a concise next-step plan."
      }
  ];

  const applySampleRequest = (value) => {
    setInput(value);
    setError(null);
  };
  const current = FEATURES.find(f => f.slug === active) || FEATURES[0];

  async function run() {
    if (!current) return;
    setLoading(true); setError(null);
    try {
      let parsed;
      try { parsed = input ? JSON.parse(input) : {}; } catch { parsed = { input }; }
      const r = await fetch(`${API_BASE}${current.endpoint}`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(parsed)
      });
      let body; try { body = await r.json(); } catch { body = { raw: await r.text() }; }
      if (!r.ok) setError(body.error || `HTTP ${r.status}`);
      setResults(prev => ({ ...prev, [current.slug]: body }));
    } catch (e) {
      setError(String(e.message || e));
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Batch 03 Features <small style={{ color: '#64748b', fontWeight: 400 }}>(AIEsportsPerformanceAnalyzer)</small></h2>
      <p style={{ color: '#475569', maxWidth: 720 }}>
        Audit-driven AI counterparts, non-AI feature gaps, and custom feature suggestions.
        Backend endpoints prefixed <code>/api/cf-*</code> (custom features) and <code>/api/gap-*</code> (gap fills).
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        {FEATURES.map(f => (
          <button key={f.slug} onClick={() => setActive(f.slug)}
            style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1',
                     background: active === f.slug ? '#1e40af' : '#f8fafc',
                     color: active === f.slug ? 'white' : '#0f172a', cursor: 'pointer', fontSize: 12 }}>
            <span style={{ opacity: 0.7, marginRight: 4 }}>[{f.kind}]</span>{f.label}
          </button>
        ))}
      </div>
      {current && (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{current.label}</strong>
            <div style={{ color: '#475569', fontSize: 13 }}>{current.desc}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>POST <code>{current.endpoint}</code></div>
          </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {sampleRequests.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => applySampleRequest(sample.value)}
              style={{ padding: '6px 10px', background: '#eef2ff', color: '#1e3a8a', border: '1px solid #c7d2fe', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              {sample.label}
            </button>
          ))}
        </div>

          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder='Optional JSON input (e.g. {"query":"..."})'
            style={{ width: '100%', minHeight: 80, padding: 8, fontFamily: 'monospace', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={run} disabled={loading}
              style={{ padding: '8px 16px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Running…' : 'Run'}
            </button>
          </div>
          {error && (<div style={{ marginTop: 12, padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: 13 }}>{error}</div>)}
          {results[current.slug] && (
            <pre style={{ marginTop: 12, padding: 10, background: '#0b1020', color: '#cbd5e1', borderRadius: 4, overflow: 'auto', maxHeight: 360, fontSize: 12 }}>
              {typeof results[current.slug] === 'string' ? results[current.slug] : JSON.stringify(results[current.slug], null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
