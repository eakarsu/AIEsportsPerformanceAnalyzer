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
        setMatches(Array.isArray(response.data) ? response.data : []);
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

  const clips = result?.suggestions?.clips || [];
  const storyline = result?.suggestions?.overall_storyline;

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Highlight Clip Suggest</h1>
        <p>AI-suggested highlight moments from match notes and key events</p>
      </div>

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
            <div className="ai-result-body">
              {storyline && (
                <>
                  <h3>Overall Storyline</h3>
                  <p>{storyline}</p>
                </>
              )}
              {clips.length > 0 ? (
                <>
                  <h3>Suggested Clips ({clips.length})</h3>
                  <ul>
                    {clips.map((clip, idx) => (
                      <li key={idx} style={{ marginBottom: '12px' }}>
                        <strong>
                          #{clip.rank ?? idx + 1} — {clip.timestamp_estimate || 'time TBD'}
                        </strong>
                        {clip.title ? `: ${clip.title}` : ''}
                        {clip.type ? <em> [{clip.type}]</em> : null}
                        {Array.isArray(clip.players_involved) && clip.players_involved.length > 0 && (
                          <div>Players: {clip.players_involved.join(', ')}</div>
                        )}
                        {clip.reason && <div>Why: {clip.reason}</div>}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                result.suggestions?.raw && (
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{result.suggestions.raw}</pre>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HighlightClipSuggest;
