import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TournamentBrief() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState('');
  const [round, setRound] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('/api/tournaments', { headers: headers() });
        setTournaments(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Failed to fetch tournaments:', err);
      }
    };
    fetchTournaments();
  }, []);

  const handleGenerate = async () => {
    if (!tournamentId || !round) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/tournament-brief',
        { tournament_id: tournamentId, round },
        { headers: headers() }
      );
      setResult(response.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (status === 503) {
        setError('AI service unavailable. The OPENROUTER_API_KEY is not configured on the server.');
      } else {
        setError(msg || 'Failed to generate tournament brief. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Tournament Brief</h1>
        <p>AI-generated round-by-round tournament brief.</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="tournament-select">Tournament</label>
          <select
            id="tournament-select"
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
          >
            <option value="">-- Select Tournament --</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || `Tournament ${t.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="round">Round</label>
          <input
            id="round"
            type="text"
            placeholder="e.g. quarterfinals, group-A, day-1"
            value={round}
            onChange={(e) => setRound(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={!tournamentId || !round || loading}
        >
          {loading ? 'Generating...' : 'Generate Brief'}
        </button>
      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <div className="ai-loading-text">AI is preparing the round brief...</div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-header">
              <div className="ai-badge">
                <div className="ai-badge-dot"></div>
                AI Tournament Brief
              </div>
              {result.generatedAt && (
                <span className="ai-result-timestamp">
                  Generated: {new Date(result.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="ai-result-body">
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentBrief;
