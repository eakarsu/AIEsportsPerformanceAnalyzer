import React, { useState } from 'react';
import axios from 'axios';

function LiveStreamStatus() {
  const [handles, setHandles] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const channel_handles = handles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const response = await axios.post(
        '/api/ai/live-stream-status',
        { channel_handles },
        { headers: headers() }
      );
      setResult(response.data);
    } catch (err) {
      const status = err.response?.status;
      const missing = err.response?.data?.missing;
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (status === 503) {
        setError(`Live streaming integration unavailable. Set ${missing || 'TWITCH_CLIENT_ID,TWITCH_CLIENT_SECRET,YOUTUBE_API_KEY'} on the server.`);
      } else {
        setError(msg || 'Failed to query live stream status.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Live Stream Status</h1>
        <p>Check live status across configured streaming providers (Twitch / YouTube).</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="ls-handles">Channel Handles (comma-separated)</label>
          <input id="ls-handles" type="text" placeholder="streamer1, streamer2" value={handles} onChange={(e) => setHandles(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && !loading && (
        <div className="ai-result-wrapper">
          <div className="ai-result-card">
            <div className="ai-result-body">
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveStreamStatus;
