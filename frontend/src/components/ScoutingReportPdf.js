import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ScoutingReportPdf() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    axios.get('/api/teams?limit=100').then((r) => {
      const list = r.data?.data || r.data || [];
      setTeams(Array.isArray(list) ? list : []);
    }).catch(() => setTeams([]));
  }, []);

  const load = (id) => {
    setLoading(true);
    setError(null);
    const url = '/api/custom-views/scouting-report' + (id ? `?team_id=${id}` : '');
    axios
      .get(url)
      .then((r) => setReport(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(teamId);
  }, [teamId]);

  const printPdf = () => window.print();

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Scouting / Match Review Report</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="form-input"
            style={{ maxWidth: 240 }}
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">Top-ranked team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.game})</option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={printPdf}>Export PDF</button>
        </div>
      </div>
      {loading && <p>Loading report...</p>}
      {error && <p style={{ color: '#e53e3e' }}>Error: {error}</p>}
      {!loading && !error && report && (
        <div data-testid="scouting-report">
          <h2 style={{ marginBottom: 4 }}>{report.team.name}</h2>
          <div style={{ color: '#666', marginBottom: 12 }}>{report.summary.headline}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
            <Stat label="Region" value={report.team.region} />
            <Stat label="Coach" value={report.team.coach || '—'} />
            <Stat label="W / L" value={`${report.team.wins} / ${report.team.losses}`} />
            <Stat label="Win Rate" value={`${report.team.overall_winrate}%`} />
            <Stat label="Avg KDA" value={report.summary.avg_player_kda} />
          </div>

          <h4>Roster ({report.roster.length})</h4>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={th}>Player</th>
                <th style={th}>Role</th>
                <th style={th}>KDA</th>
                <th style={th}>Win%</th>
                <th style={th}>Acc%</th>
                <th style={th}>Pos</th>
              </tr>
            </thead>
            <tbody>
              {report.roster.map((p) => (
                <tr key={p.id}>
                  <td style={td}><strong>{p.username}</strong><div style={{ color: '#888', fontSize: 11 }}>{p.real_name}</div></td>
                  <td style={td}>{p.role}</td>
                  <td style={td}>{p.kda}</td>
                  <td style={td}>{p.winrate}</td>
                  <td style={td}>{p.accuracy}</td>
                  <td style={td}>{p.positioning_score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Recent Matches</h4>
          <ul style={{ marginBottom: 16 }}>
            {report.recent_matches.map((m) => (
              <li key={m.id} style={{ fontSize: 13, marginBottom: 4 }}>
                <strong>{m.result}</strong> · {m.team1_name} {m.score_team1}-{m.score_team2} {m.team2_name} · {m.map || 'N/A'}
              </li>
            ))}
            {report.recent_matches.length === 0 && <li style={{ color: '#888' }}>No matches recorded.</li>}
          </ul>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Section title="Strengths" items={report.strengths} color="#10b981" />
            <Section title="Weaknesses" items={report.weaknesses} color="#ef4444" />
            <Section title="Recommendations" items={report.recommendations} color="#3b82f6" />
          </div>
        </div>
      )}
    </div>
  );
}

const th = { textAlign: 'left', padding: 6, borderBottom: '1px solid #ddd' };
const td = { padding: 6, borderBottom: '1px solid #f0f0f0' };

function Stat({ label, value }) {
  return (
    <div style={{ padding: 10, background: '#f9fafb', borderRadius: 6 }}>
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{value}</div>
    </div>
  );
}

function Section({ title, items, color }) {
  return (
    <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: 10 }}>
      <h5 style={{ margin: '0 0 6px 0', color }}>{title}</h5>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {items.map((s, i) => (
          <li key={i} style={{ fontSize: 12, marginBottom: 4 }}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

export default ScoutingReportPdf;
