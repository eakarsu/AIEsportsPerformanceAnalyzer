import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIResultDisplay from '../components/AIResultDisplay';

function PerformanceAnalysis() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players', { headers });
        setPlayers(response.data);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      const player = players.find(p => p._id === selectedPlayer);
      setPlayerData(player || null);
    } else {
      setPlayerData(null);
    }
  }, [selectedPlayer, players]);

  const handleAnalyze = async () => {
    if (!selectedPlayer) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/performance-analysis',
        { playerId: selectedPlayer },
        { headers }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze performance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Performance Analysis</h1>
        <p>AI-powered deep dive into player performance metrics</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="player-select">Select Player</label>
          <select
            id="player-select"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="">-- Select a Player --</option>
            {players.map((player) => (
              <option key={player._id} value={player._id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleAnalyze}
          disabled={!selectedPlayer || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Performance'}
        </button>
      </div>

      {playerData && playerData.stats && (
        <div className="detail-grid">
          <div className="stat-bar-item">
            <label>APM</label>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.min((playerData.stats.apm || 0) / 4, 100)}%` }}
              ></div>
            </div>
            <span>{playerData.stats.apm || 0}</span>
          </div>
          <div className="stat-bar-item">
            <label>Accuracy</label>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${playerData.stats.accuracy || 0}%` }}
              ></div>
            </div>
            <span>{playerData.stats.accuracy || 0}%</span>
          </div>
          <div className="stat-bar-item">
            <label>Positioning</label>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${playerData.stats.positioning || 0}%` }}
              ></div>
            </div>
            <span>{playerData.stats.positioning || 0}%</span>
          </div>
          <div className="stat-bar-item">
            <label>KDA</label>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.min((playerData.stats.kda || 0) / 5 * 100, 100)}%` }}
              ></div>
            </div>
            <span>{playerData.stats.kda || 0}</span>
          </div>
          <div className="stat-bar-item">
            <label>Win Rate</label>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${playerData.stats.winrate || 0}%` }}
              ></div>
            </div>
            <span>{playerData.stats.winrate || 0}%</span>
          </div>
        </div>
      )}

      <AIResultDisplay result={result} loading={loading} error={error} />
    </div>
  );
}

export default PerformanceAnalysis;
