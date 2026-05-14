import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InjuryRiskAssess() {
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [lookbackDays, setLookbackDays] = useState(14);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players', { headers: headers() });
        setPlayers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      }
    };
    fetchPlayers();
  }, []);

  const handleSubmit = async () => {
    if (!playerId) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/injury-risk-assess',
        {
          player_id: playerId,
          lookback_days: parseInt(lookbackDays, 10),
        },
        { headers: headers() }
      );
      setResult(response.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (status === 503) {
        setError('AI service unavailable. The OPENROUTER_API_KEY is not configured on the server.');
      } else {
        setError(msg || 'Failed to assess injury risk. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Injury / Burnout Risk Assessment</h1>
        <p>Estimate overtraining and burnout risk from recent wellness logs.</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="ira-player">Player</label>
          <select
            id="ira-player"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          >
            <option value="">-- Select Player --</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.username || p.name || `Player ${p.id}`}
                {p.game ? ` (${p.game})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ira-lookback">Lookback Days</label>
          <input
            id="ira-lookback"
            type="number"
            min="3"
            max="90"
            value={lookbackDays}
            onChange={(e) => setLookbackDays(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!playerId || loading}
        >
          {loading ? 'Assessing...' : 'Assess Risk'}
        </button>
      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <div className="ai-loading-text">AI is evaluating risk signals...</div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-header">
              <div className="ai-badge">
                <div className="ai-badge-dot"></div>
                AI Injury Risk Assessment
              </div>
              {result.generatedAt && (
                <span className="ai-result-timestamp">
                  Generated: {new Date(result.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="ai-result-body">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {result.assessment || JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InjuryRiskAssess;
