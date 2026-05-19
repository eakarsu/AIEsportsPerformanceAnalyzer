import React, { useState } from 'react';
import axios from 'axios';

function SponsorshipMatch() {
  const [teamId, setTeamId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [industries, setIndustries] = useState('');
  const [region, setRegion] = useState('global');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const handleSubmit = async () => {
    if (!teamId && !playerId) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const target_industries = industries
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const body = {
        team_id: teamId ? parseInt(teamId, 10) : undefined,
        player_id: playerId ? parseInt(playerId, 10) : undefined,
        target_industries,
        region,
      };
      const response = await axios.post('/api/ai/sponsorship-match', body, { headers: headers() });
      setResult(response.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (status === 503) {
        setError('AI service unavailable. The OPENROUTER_API_KEY is not configured on the server.');
      } else {
        setError(msg || 'Failed to generate sponsorship match. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Sponsorship Match</h1>
        <p>Recommend brand archetypes (not real brands) for a team or player.</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="sm-team">Team ID</label>
          <input id="sm-team" type="number" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="sm-player">Player ID</label>
          <input id="sm-player" type="number" value={playerId} onChange={(e) => setPlayerId(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="sm-industries">Target Industries (comma-separated)</label>
          <input id="sm-industries" type="text" placeholder="energy-drinks, peripherals" value={industries} onChange={(e) => setIndustries(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="sm-region">Region</label>
          <input id="sm-region" type="text" value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading || (!teamId && !playerId)}>
          {loading ? 'Matching...' : 'Match'}
        </button>
      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <div className="ai-loading-text">AI is matching brand archetypes...</div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-header">
              <div className="ai-badge">
                <div className="ai-badge-dot"></div>
                AI Sponsorship Match
              </div>
            </div>
            <div className="ai-result-body">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {result.analysis || JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SponsorshipMatch;
