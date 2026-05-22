import React, { useEffect, useState } from 'react';
import axios from 'axios';

function colorFor(score) {
  // 0 -> light blue, 100 -> deep red
  const t = Math.max(0, Math.min(100, score)) / 100;
  const r = Math.round(80 + t * 175);
  const g = Math.round(150 - t * 130);
  const b = Math.round(220 - t * 200);
  return `rgb(${r},${g},${b})`;
}

function MapPerformanceHeatmap() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [game, setGame] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = '/api/custom-views/map-performance-heatmap' + (game ? `?game=${encodeURIComponent(game)}` : '');
    axios
      .get(url)
      .then((r) => !cancelled && setPayload(r.data))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [game]);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Player x Map Performance Heatmap</h3>
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
      {loading && <p>Loading heatmap...</p>}
      {error && <p style={{ color: '#e53e3e' }}>Error: {error}</p>}
      {!loading && !error && payload && (
        <div style={{ overflowX: 'auto' }} data-testid="map-heatmap">
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #ddd' }}>Player</th>
                {payload.maps.map((m) => (
                  <th key={m} style={{ textAlign: 'center', padding: 6, borderBottom: '1px solid #ddd' }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.players.map((p) => (
                <tr key={p.player_id}>
                  <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>
                    <strong>{p.username}</strong>
                    <div style={{ color: '#888', fontSize: 11 }}>{p.team || '—'}</div>
                  </td>
                  {p.cells.map((c) => (
                    <td
                      key={c.map}
                      title={`${p.username} on ${c.map}: ${c.score}`}
                      style={{
                        padding: 6,
                        borderBottom: '1px solid #f0f0f0',
                        background: colorFor(c.score),
                        color: c.score > 60 ? '#fff' : '#222',
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      {c.score.toFixed(0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {payload.players.length === 0 && <p style={{ color: '#888' }}>No players found.</p>}
        </div>
      )}
    </div>
  );
}

export default MapPerformanceHeatmap;
