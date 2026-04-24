import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function TeamDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/teams/${id}`, { headers });
      setTeam(res.data);
      setForm(res.data);
    } catch (err) {
      setError('Failed to load team details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
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
        ranking: form.ranking ? Number(form.ranking) : null,
        wins: form.wins ? Number(form.wins) : 0,
        losses: form.losses ? Number(form.losses) : 0,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
      };
      const res = await axios.put(`/api/teams/${id}`, payload, { headers });
      setTeam(res.data);
      setForm(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update team:', err);
      alert('Failed to update team. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`/api/teams/${id}`, { headers });
      navigate('/teams');
    } catch (err) {
      console.error('Failed to delete team:', err);
      alert('Failed to delete team. Please try again.');
    }
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
        <button className="btn btn-primary" onClick={fetchTeam}>
          Retry
        </button>
      </div>
    );
  }

  if (!team) return null;

  const players = Array.isArray(team.players) ? team.players : [];

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <h1>{team.name}</h1>
          <div className="detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setForm(team);
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
            <span className="detail-label">Game</span>
            <span className="detail-value">{team.game || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Region</span>
            <span className="detail-value">{team.region || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ranking</span>
            <span className="detail-value">
              {team.ranking != null ? `#${team.ranking}` : '—'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">W/L Record</span>
            <span className="detail-value">
              {team.wins != null && team.losses != null
                ? `${team.wins}W / ${team.losses}L`
                : '—'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Coach</span>
            <span className="detail-value">{team.coach || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Founded</span>
            <span className="detail-value">{team.founded_year || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Description</span>
            <span className="detail-value">{team.description || '—'}</span>
          </div>
        </div>
      </div>

      <div className="roster-section">
        <h2 className="section-title">Team Roster</h2>
        {players.length > 0 ? (
          <div className="roster-grid">
            {players.map((player) => (
              <div
                key={player.id}
                className="roster-card"
                onClick={() => navigate(`/players/${player.id}`)}
              >
                <div className="roster-avatar">
                  {player.username ? player.username.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="roster-info">
                  <span className="roster-name">{player.username}</span>
                  <span className="roster-role">{player.role || 'No role assigned'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No players on this team yet.</p>
        )}
      </div>

      {editing && (
        <div className="inline-edit-section">
          <h2>Edit Team</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Game</label>
              <input
                type="text"
                name="game"
                value={form.game || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input
                type="text"
                name="region"
                value={form.region || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Ranking</label>
              <input
                type="number"
                name="ranking"
                value={form.ranking || ''}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Wins</label>
              <input
                type="number"
                name="wins"
                value={form.wins || ''}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Losses</label>
              <input
                type="number"
                name="losses"
                value={form.losses || ''}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Coach</label>
              <input
                type="text"
                name="coach"
                value={form.coach || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Founded Year</label>
              <input
                type="number"
                name="founded_year"
                value={form.founded_year || ''}
                onChange={handleChange}
                min="1990"
                max="2030"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description || ''}
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

export default TeamDetail;
