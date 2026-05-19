import React, { useState } from 'react';
import axios from 'axios';

function MetaAnalysis() {
  const [game, setGame] = useState('');
  const [region, setRegion] = useState('global');
  const [days, setDays] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const handleSubmit = async () => {
    if (!game) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/meta-analysis',
        {
          game,
          region,
          days: parseInt(days, 10),
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
        setError(msg || 'Failed to generate meta analysis. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Meta Analysis</h1>
        <p>Summarize the current competitive meta for a game / region.</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="meta-game">Game</label>
          <input
            id="meta-game"
            type="text"
            placeholder="e.g. League of Legends"
            value={game}
            onChange={(e) => setGame(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="meta-region">Region</label>
          <input
            id="meta-region"
            type="text"
            placeholder="global / NA / EU / KR / CN"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="meta-days">Lookback Days</label>
          <input
            id="meta-days"
            type="number"
            min="1"
            max="180"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!game || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Meta'}
        </button>
      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <div className="ai-loading-text">AI is reviewing the current meta...</div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-header">
              <div className="ai-badge">
                <div className="ai-badge-dot"></div>
                AI Meta Analysis
              </div>
              {result.generatedAt && (
                <span className="ai-result-timestamp">
                  Generated: {new Date(result.generatedAt).toLocaleString()}
                </span>
              )}
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

export default MetaAnalysis;
