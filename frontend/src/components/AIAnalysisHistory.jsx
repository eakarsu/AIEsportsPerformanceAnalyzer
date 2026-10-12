import React, { useState } from 'react';
import axios from 'axios';
import FormattedAIReport from './FormattedAIReport';

export default function AIAnalysisHistory({ entityType, entityId }) {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const load = async () => {
    if (!entityId) return;
    setLoading(true); setError(''); setSelected(null);
    try {
      const { data } = await axios.post('/api/ai/analysis-history',
        { entity_type: entityType, entity_id: entityId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setHistory(Array.isArray(data.history) ? data.history : []);
    } catch (err) { setError(err.response?.data?.message || 'Could not load saved analyses.'); }
    finally { setLoading(false); }
  };
  return <section className="ai-history">
    <h2>Saved analyses</h2>
    <button type="button" className="btn btn-secondary" disabled={!entityId || loading} onClick={load}>{loading ? 'Loading...' : 'Load saved analyses'}</button>
    {!entityId && <p>Select a real record to see its saved analyses.</p>}
    {error && <p role="alert">{error}</p>}
    {history.map((row) => <button type="button" className="ai-history-row" key={row.id} onClick={() => setSelected(row)}>
      <span>{row.analysis_type?.replace(/_/g, ' ') || 'Analysis'}</span><time>{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</time>
    </button>)}
    {selected && <FormattedAIReport response={selected.content} title={selected.analysis_type?.replace(/_/g, ' ') || 'Saved analysis'} />}
  </section>;
}
