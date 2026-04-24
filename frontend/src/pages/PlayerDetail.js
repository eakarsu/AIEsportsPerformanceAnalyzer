import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const GAME_OPTIONS = [
  'League of Legends',
  'CS2',
  'Valorant',
  'Dota 2',
  'Overwatch 2',
];

function getBarColor(percentage) {
  if (percentage > 70) return 'success';
  if (percentage >= 40) return 'warning';
  return 'danger';
}

function StatBar({ label, value, max }) {
  const percentage = value != null ? Math.min((value / max) * 100, 100) : 0;
  const colorClass = getBarColor(percentage);

  return (
    <div className="stat-bar-container">
      <div className="stat-bar-label">
        <span>{label}</span>
        <span>
          {value != null ? value : '—'} / {max}
        </span>
      </div>
      <div className="stat-bar-track">
        <div
          className={`stat-bar-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PlayerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchPlayer = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/players/${id}`, { headers });
      setPlayer(res.data);
      setForm(res.data);
    } catch (err) {
      setError('Failed to load player details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get('/api/teams', { headers });
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  useEffect(() => {
    fetchPlayer();
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        team_id: form.team_id ? Number(form.team_id) : null,
        apm: form.apm ? Number(form.apm) : null,
        accuracy: form.accuracy ? Number(form.accuracy) : null,
        positioning_score: form.positioning_score ? Number(form.positioning_score) : null,
        kda: form.kda ? Number(form.kda) : null,
        winrate: form.winrate ? Number(form.winrate) : null,
      };
      const res = await axios.put(`/api/players/${id}`, payload, { headers });
      setPlayer(res.data);
      setForm(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update player:', err);
      alert('Failed to update player. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`/api/players/${id}`, { headers });
      navigate('/players');
    } catch (err) {
      console.error('Failed to delete player:', err);
      alert('Failed to delete player. Please try again.');
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : '—';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={fetchPlayer}>
          Retry
        </button>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <h1>{player.username}</h1>
          <div className="detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setForm(player);
                setEditing(!editing);
              }}
            >
              {editing ? 'Cancel Edit' : 'Edit'}
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Real Name</span>
            <span className="detail-value">{player.real_name || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Game</span>
            <span className="detail-value">{player.game || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Role</span>
            <span className="detail-value">{player.role || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Team</span>
            <span className="detail-value">{getTeamName(player.team_id)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Country</span>
            <span className="detail-value">{player.country || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Bio</span>
            <span className="detail-value">{player.bio || '—'}</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Performance Stats</h2>
        <StatBar label="APM" value={player.apm} max={500} />
        <StatBar label="Accuracy" value={player.accuracy} max={100} />
        <StatBar label="Positioning" value={player.positioning_score} max={100} />
        <StatBar label="KDA" value={player.kda} max={10} />
        <StatBar label="Win Rate" value={player.winrate} max={100} />
      </div>

      {editing && (
        <div className="inline-edit-section">
          <h2>Edit Player</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Real Name</label>
              <input
                type="text"
                name="real_name"
                value={form.real_name || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Game</label>
              <select name="game" value={form.game || ''} onChange={handleChange} required>
                <option value="">Select a game</option>
                {GAME_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                name="role"
                value={form.role || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Team</label>
              <select
                name="team_id"
                value={form.team_id || ''}
                onChange={handleChange}
              >
                <option value="">No Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={form.country || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>APM</label>
              <input
                type="number"
                name="apm"
                value={form.apm || ''}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Accuracy (%)</label>
              <input
                type="number"
                name="accuracy"
                value={form.accuracy || ''}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Positioning Score</label>
              <input
                type="number"
                name="positioning_score"
                value={form.positioning_score || ''}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>KDA</label>
              <input
                type="number"
                name="kda"
                value={form.kda || ''}
                onChange={handleChange}
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Win Rate (%)</label>
              <input
                type="number"
                name="winrate"
                value={form.winrate || ''}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio || ''}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
