import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GAME_OPTIONS = [
  'League of Legends',
  'CS2',
  'Valorant',
  'Dota 2',
  'Overwatch 2',
];

const initialForm = {
  username: '',
  real_name: '',
  game: '',
  role: '',
  team_id: '',
  country: '',
  apm: '',
  accuracy: '',
  positioning_score: '',
  kda: '',
  winrate: '',
  bio: '',
};

function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/players', { headers });
      setPlayers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load players. Please try again.');
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
    fetchPlayers();
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
      await axios.post('/api/players', payload, { headers });
      setForm(initialForm);
      setShowModal(false);
      fetchPlayers();
    } catch (err) {
      console.error('Failed to create player:', err);
      alert('Failed to create player. Please check your input and try again.');
    } finally {
      setSubmitting(false);
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
        <button className="btn btn-primary" onClick={fetchPlayers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Player Profiles</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add New Player
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Real Name</th>
            <th>Game</th>
            <th>Role</th>
            <th>Team</th>
            <th>APM</th>
            <th>Accuracy</th>
            <th>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr
              key={player.id}
              className="clickable-row"
              onClick={() => navigate(`/players/${player.id}`)}
            >
              <td>{player.username}</td>
              <td>{player.real_name || '—'}</td>
              <td>{player.game || '—'}</td>
              <td>{player.role || '—'}</td>
              <td>{getTeamName(player.team_id)}</td>
              <td>{player.apm != null ? player.apm : '—'}</td>
              <td>{player.accuracy != null ? `${player.accuracy}%` : '—'}</td>
              <td>{player.winrate != null ? `${player.winrate}%` : '—'}</td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                No players found. Add your first player!
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Player</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Real Name</label>
                <input
                  type="text"
                  name="real_name"
                  value={form.real_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Game</label>
                <select name="game" value={form.game} onChange={handleChange} required>
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
                  value={form.role}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Team</label>
                <select name="team_id" value={form.team_id} onChange={handleChange}>
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
                  value={form.country}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>APM</label>
                <input
                  type="number"
                  name="apm"
                  value={form.apm}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Accuracy (%)</label>
                <input
                  type="number"
                  name="accuracy"
                  value={form.accuracy}
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
                  value={form.positioning_score}
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
                  value={form.kda}
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
                  value={form.winrate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Players;
