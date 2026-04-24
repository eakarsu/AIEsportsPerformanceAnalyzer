import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function Tournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    game: '',
    start_date: '',
    end_date: '',
    prize_pool: '',
    location: '',
    status: 'upcoming',
    organizer: '',
    format: '',
    max_teams: '',
    description: '',
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get('/api/tournaments', { headers: headers() });
      setTournaments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load tournaments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        prize_pool: form.prize_pool ? Number(form.prize_pool) : null,
        max_teams: form.max_teams ? Number(form.max_teams) : null,
      };
      await axios.post('/api/tournaments', payload, { headers: headers() });
      setShowModal(false);
      setForm({
        name: '',
        game: '',
        start_date: '',
        end_date: '',
        prize_pool: '',
        location: '',
        status: 'upcoming',
        organizer: '',
        format: '',
        max_teams: '',
        description: '',
      });
      fetchTournaments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tournament');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      completed: 'badge badge-success',
      ongoing: 'badge badge-warning',
      upcoming: 'badge badge-info',
    };
    return map[status] || 'badge badge-info';
  };

  const formatCurrency = (amount) => {
    if (amount == null) return 'N/A';
    return `$${Number(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tournament Tracker</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add New Tournament
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {tournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-text">No tournaments found. Add your first tournament!</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Game</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Prize Pool</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr
                  key={t.id}
                  className="clickable-row"
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                >
                  <td>{t.name}</td>
                  <td>{t.game || 'N/A'}</td>
                  <td>{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{t.end_date ? new Date(t.end_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{formatCurrency(t.prize_pool)}</td>
                  <td>{t.location || 'N/A'}</td>
                  <td>
                    <span className={getStatusBadge(t.status)}>
                      {t.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Tournament</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Tournament name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Game</label>
                  <input
                    type="text"
                    name="game"
                    className="form-input"
                    value={form.game}
                    onChange={handleChange}
                    placeholder="e.g. CS2, Valorant"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" name="start_date" className="form-input" value={form.start_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" name="end_date" className="form-input" value={form.end_date} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prize Pool ($)</label>
                  <input type="number" name="prize_pool" className="form-input" value={form.prize_pool} onChange={handleChange} min="0" placeholder="e.g. 100000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Teams</label>
                  <input type="number" name="max_teams" className="form-input" value={form.max_teams} onChange={handleChange} min="0" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="e.g. Los Angeles, CA" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Organizer</label>
                  <input type="text" name="organizer" className="form-input" value={form.organizer} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Format</label>
                  <input type="text" name="format" className="form-input" value={form.format} onChange={handleChange} placeholder="e.g. Double Elimination" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Tournament description..." />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Tournament</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tournaments;
