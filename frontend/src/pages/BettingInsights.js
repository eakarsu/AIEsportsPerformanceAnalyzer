import React, { useState } from 'react';
import axios from 'axios';

function BettingInsights() {
  const [matchId, setMatchId] = useState('');
  const [market, setMarket] = useState('match-winner');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const handleSubmit = async () => {
    if (!matchId) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await axios.post(
        '/api/ai/betting-insights',
        { match_id: parseInt(matchId, 10), market },
        { headers: headers() }
      );
      setResult(response.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (status === 503) {
        setError('AI service unavailable. The OPENROUTER_API_KEY is not configured on the server.');
      } else {
        setError(msg || 'Failed to generate insights.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Betting Insights (Informational Only)</h1>
        <p>Probability-only commentary. NOT betting advice. No odds. No sportsbook.</p>
      </div>

      <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '12px', borderRadius: '4px', marginBottom: '16px', color: '#856404' }}>
        Disclaimer: This page is for INFORMATIONAL analysis only. It does not provide odds, does not recommend a sportsbook, and does not recommend wagers. Esports betting may be regulated or prohibited in your jurisdiction.
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="bi-match">Match ID</label>
          <input id="bi-match" type="number" value={matchId} onChange={(e) => setMatchId(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="bi-market">Market</label>
          <select id="bi-market" value={market} onChange={(e) => setMarket(e.target.value)}>
            <option value="match-winner">match-winner</option>
            <option value="map-handicap">map-handicap</option>
            <option value="total-maps">total-maps</option>
          </select>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading || !matchId}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-body">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {result.analysis || JSON.stringify(result, null, 2)}
              </pre>
              {result.disclaimer && (
                <div style={{ marginTop: '12px', fontSize: '0.85em', color: '#856404' }}>{result.disclaimer}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BettingInsights;
