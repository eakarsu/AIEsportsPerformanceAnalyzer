import React, { useEffect, useState } from 'react';
import axios from 'axios';

const blank = {
  name: '',
  game: 'League of Legends',
  pick_type: 'composition',
  picks: '',
  counters: '',
  win_rate: 0,
  notes: '',
};

function MetaRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    axios
      .get('/api/custom-views/meta-rules')
      .then((r) => setRules(r.data?.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (rule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      game: rule.game,
      pick_type: rule.pick_type,
      picks: (rule.picks || []).join(', '),
      counters: (rule.counters || []).join(', '),
      win_rate: rule.win_rate,
      notes: rule.notes,
    });
  };

  const resetForm = () => {
    setForm(blank);
    setEditingId(null);
  };

  const submit = (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      game: form.game,
      pick_type: form.pick_type,
      picks: form.picks.split(',').map((s) => s.trim()).filter(Boolean),
      counters: form.counters.split(',').map((s) => s.trim()).filter(Boolean),
      win_rate: Number(form.win_rate) || 0,
      notes: form.notes,
    };
    const req = editingId
      ? axios.put(`/api/custom-views/meta-rules/${editingId}`, payload)
      : axios.post('/api/custom-views/meta-rules', payload);
    req
      .then(() => {
        resetForm();
        load();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  };

  const remove = (id) => {
    if (!window.confirm('Delete this meta rule?')) return;
    axios.delete(`/api/custom-views/meta-rules/${id}`).then(load).catch((e) => setError(e.message));
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Meta / Strategy Rules Editor</h3>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 13 }}>
          Manage champion/agent picks &amp; compositions used by the analytics engine.
        </p>
      </div>

      <form onSubmit={submit} style={{ background: '#f9fafb', padding: 12, borderRadius: 6, marginBottom: 16 }} data-testid="meta-rules-form">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8, marginBottom: 8 }}>
          <input className="form-input" placeholder="Rule name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="form-input" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}>
            <option>League of Legends</option>
            <option>CS2</option>
            <option>Valorant</option>
            <option>Dota 2</option>
            <option>Overwatch 2</option>
          </select>
          <select className="form-input" value={form.pick_type} onChange={(e) => setForm({ ...form, pick_type: e.target.value })}>
            <option value="composition">composition</option>
            <option value="champion_pick">champion_pick</option>
            <option value="agent_pick">agent_pick</option>
            <option value="ban">ban</option>
          </select>
          <input className="form-input" type="number" step="0.1" placeholder="Win rate %" value={form.win_rate} onChange={(e) => setForm({ ...form, win_rate: e.target.value })} />
        </div>
        <input className="form-input" style={{ marginBottom: 8 }} placeholder="Picks (comma separated, e.g. Lee Sin, Akali, Vi)" value={form.picks} onChange={(e) => setForm({ ...form, picks: e.target.value })} />
        <input className="form-input" style={{ marginBottom: 8 }} placeholder="Counters (comma separated)" value={form.counters} onChange={(e) => setForm({ ...form, counters: e.target.value })} />
        <textarea className="form-input" style={{ marginBottom: 8, minHeight: 60 }} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Rule' : 'Add Rule'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      {loading && <p>Loading rules...</p>}
      {error && <p style={{ color: '#e53e3e' }}>Error: {error}</p>}
      {!loading && !error && (
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }} data-testid="meta-rules-table">
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={th}>Name</th>
              <th style={th}>Game</th>
              <th style={th}>Type</th>
              <th style={th}>Picks</th>
              <th style={th}>Win%</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td style={td}><strong>{r.name}</strong><div style={{ color: '#888', fontSize: 11 }}>{r.notes}</div></td>
                <td style={td}>{r.game}</td>
                <td style={td}>{r.pick_type}</td>
                <td style={td}>{(r.picks || []).join(', ')}</td>
                <td style={td}>{r.win_rate}</td>
                <td style={td}>
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(r)} style={{ marginRight: 6 }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && <tr><td colSpan={6} style={{ padding: 12, color: '#888' }}>No rules yet.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { textAlign: 'left', padding: 6, borderBottom: '1px solid #ddd' };
const td = { padding: 6, borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' };

export default MetaRulesEditor;
