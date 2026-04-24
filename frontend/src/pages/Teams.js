import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const initialForm = {
  name: '',
  game: '',
  region: '',
  ranking: '',
  wins: '',
  losses: '',
  coach: '',
  founded_year: '',
  description: '',
};

function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/teams', { headers });
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load teams. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        ranking: form.ranking ? Number(form.ranking) : null,
        wins: form.wins ? Number(form.wins) : 0,
        losses: form.losses ? Number(form.losses) : 0,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
      };
      await axios.post('/api/teams', payload, { headers });
      setForm(initialForm);
      setShowModal(false);
      fetchTeams();
    } catch (err) {
      console.error('Failed to create team:', err);
      alert('Failed to create team. Please check your input and try again.');
    } finally {
      setSubmitting(false);
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
        <button className="btn btn-primary" onClick={fetchTeams}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Team Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add New Team
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Game</th>
            <th>Region</th>
            <th>Ranking</th>
            <th>W/L Record</th>
            <th>Coach</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr
              key={team.id}
              className="clickable-row"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <td>{team.name}</td>
              <td>{team.game || '—'}</td>
              <td>{team.region || '—'}</td>
              <td>{team.ranking != null ? `#${team.ranking}` : '—'}</td>
              <td>
                {team.wins != null && team.losses != null
                  ? `${team.wins}W / ${team.losses}L`
                  : '—'}
              </td>
              <td>{team.coach || '—'}</td>
            </tr>
          ))}
          {teams.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No teams found. Add your first team!
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Team</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Game</label>
                <input
                  type="text"
                  name="game"
                  value={form.game}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Region</label>
                <input
                  type="text"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Ranking</label>
                <input
                  type="number"
                  name="ranking"
                  value={form.ranking}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Wins</label>
                <input
                  type="number"
                  name="wins"
                  value={form.wins}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Losses</label>
                <input
                  type="number"
                  name="losses"
                  value={form.losses}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Coach</label>
                <input
                  type="text"
                  name="coach"
                  value={form.coach}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Founded Year</label>
                <input
                  type="number"
                  name="founded_year"
                  value={form.founded_year}
                  onChange={handleChange}
                  min="1990"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
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
                  {submitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
