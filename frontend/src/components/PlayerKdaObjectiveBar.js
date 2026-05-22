import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PlayerKdaObjectiveBar() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [game, setGame] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = '/api/custom-views/player-kda-objectives' + (game ? `?game=${encodeURIComponent(game)}` : '');
    axios
      .get(url)
      .then((r) => {
        if (cancelled) return;
        setData(r.data.data || []);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [game]);

  const maxKda = Math.max(1, ...data.map((d) => d.kda));
  const maxObj = Math.max(1, ...data.map((d) => d.objective_score));

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Player KDA &amp; Objective Score</h3>
        <select
          className="form-input"
          style={{ maxWidth: 220 }}
          value={game}
          onChange={(e) => setGame(e.target.value)}
        >
          <option value="">All Games</option>
          <option value="League of Legends">League of Legends</option>
          <option value="CS2">CS2</option>
          <option value="Valorant">Valorant</option>
          <option value="Dota 2">Dota 2</option>
          <option value="Overwatch 2">Overwatch 2</option>
        </select>
      </div>
      {loading && <p>Loading chart...</p>}
      {error && <p style={{ color: '#e53e3e' }}>Error: {error}</p>}
      {!loading && !error && (
        <div data-testid="kda-bar-chart">
          {data.map((p) => (
            <div key={p.player_id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <strong>{p.username}</strong>
                <span style={{ color: '#888' }}>{p.team || '—'} · {p.role}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 60, fontSize: 12 }}>KDA</span>
                <div style={{ flex: 1, background: '#eee', borderRadius: 4, height: 14, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(p.kda / maxKda) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg,#3b82f6,#60a5fa)',
                    }}
                  />
                </div>
                <span style={{ width: 40, fontSize: 12, textAlign: 'right' }}>{p.kda.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 60, fontSize: 12 }}>Objective</span>
                <div style={{ flex: 1, background: '#eee', borderRadius: 4, height: 14, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(p.objective_score / maxObj) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg,#10b981,#34d399)',
                    }}
                  />
                </div>
                <span style={{ width: 40, fontSize: 12, textAlign: 'right' }}>{p.objective_score.toFixed(1)}</span>
              </div>
            </div>
          ))}
          {data.length === 0 && <p style={{ color: '#888' }}>No data for selected game.</p>}
        </div>
      )}
    </div>
  );
}

export default PlayerKdaObjectiveBar;
