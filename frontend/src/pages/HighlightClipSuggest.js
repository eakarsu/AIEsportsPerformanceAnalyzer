import { listData } from '../listData';
import AIAnalysisHistory from '../components/AIAnalysisHistory';
import AIPresetButtons from '../components/AIPresetButtons';
import FormattedAIReport from '../components/FormattedAIReport';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HighlightClipSuggest() {
  const [matches, setMatches] = useState([]);
  const [matchId, setMatchId] = useState('');
  const [maxClips, setMaxClips] = useState(8);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get('/api/matches', { headers: headers() });
        setMatches(listData(response.data));
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      }
    };
    fetchMatches();
  }, []);

  const handleSuggest = async () => {
    if (!matchId) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/highlight-clip-suggest',
        { match_id: matchId, max_clips: parseInt(maxClips, 10) || 8 },
        { headers: headers() }
      );
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to suggest highlight clips. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Highlight Clip Suggest</h1>
        <p>AI-suggested highlight moments from match notes and key events</p>
      </div>

      <AIPresetButtons prerequisite={"Load at least 2 real matches to use all samples."} presets={[{ label: 'Short highlight list', disabled: matches.length < 1, fill: () => { setMatchId(String(matches[0].id)); setMaxClips(5); } }, { label: 'Full highlight list', disabled: matches.length < 2, fill: () => { setMatchId(String(matches[1].id)); setMaxClips(12); } }]} />
      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="match-select">Match</label>
          <select
            id="match-select"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
          >
            <option value="">-- Select Match --</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {(m.team_a_name || m.team_a_id || 'A')} vs {(m.team_b_name || m.team_b_id || 'B')}
                {m.match_date ? ` — ${new Date(m.match_date).toLocaleDateString()}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="max-clips">Max Clips (1-20)</label>
          <input
            id="max-clips"
            type="number"
            min="1"
            max="20"
            value={maxClips}
            onChange={(e) => setMaxClips(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleSuggest}
          disabled={!matchId || loading}
        >
          {loading ? 'Suggesting...' : 'Suggest Highlight Clips'}
        </button>
      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <div className="ai-loading-text">AI is analyzing...</div>
          <div className="ai-loading-sub">Processing match for highlight moments</div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-header">
              <div className="ai-badge">
                <div className="ai-badge-dot"></div>
                AI Generated Highlights
              </div>
              {result.generatedAt && (
                <span className="ai-result-timestamp">
                  Generated: {new Date(result.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="ai-result-body"><FormattedAIReport response={result} title="Suggested highlights" /></div>
          </div>
        </div>
      )}
      <AIAnalysisHistory entityType="match" entityId={matchId} />
    </div>
  );
}

export default HighlightClipSuggest;
