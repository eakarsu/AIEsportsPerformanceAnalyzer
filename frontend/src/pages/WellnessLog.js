import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WellnessLog() {
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [mood, setMood] = useState('neutral');
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
        '/api/ai/wellness-log',
        {
          player_id: playerId,
          sleep_hours: parseFloat(sleepHours),
          stress_level: parseInt(stressLevel, 10),
          mood,
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
        setError(msg || 'Failed to submit wellness log. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Wellness Log &amp; Risk Assessment</h1>
        <p>Log player wellness data and get AI burnout / overtraining risk insight.</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="player-select">Player</label>
          <select
            id="player-select"
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
          <label htmlFor="sleep-hours">Sleep Hours</label>
          <input
            id="sleep-hours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="stress-level">Stress Level (1-10)</label>
          <input
            id="stress-level"
            type="number"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mood">Mood</label>
          <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="great">great</option>
            <option value="good">good</option>
            <option value="neutral">neutral</option>
            <option value="tired">tired</option>
            <option value="stressed">stressed</option>
            <option value="burnt-out">burnt-out</option>
          </select>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!playerId || loading}
        >
          {loading ? 'Submitting...' : 'Log &amp; Analyze'}
        </button>
      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <div className="ai-loading-text">AI is analyzing wellness trend...</div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-header">
              <div className="ai-badge">
                <div className="ai-badge-dot"></div>
                AI Wellness Assessment
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

export default WellnessLog;
