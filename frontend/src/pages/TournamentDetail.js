import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function TournamentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const res = await axios.get(`/api/tournaments/${id}`, { headers: headers() });
      setTournament(res.data);
      setForm({
        name: res.data.name || '',
        game: res.data.game || '',
        start_date: res.data.start_date ? res.data.start_date.slice(0, 10) : '',
        end_date: res.data.end_date ? res.data.end_date.slice(0, 10) : '',
        prize_pool: res.data.prize_pool ?? '',
        location: res.data.location || '',
        status: res.data.status || 'upcoming',
        organizer: res.data.organizer || '',
        format: res.data.format || '',
        max_teams: res.data.max_teams ?? '',
        description: res.data.description || '',
      });
    } catch (err) {
      setError('Failed to load tournament');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        prize_pool: form.prize_pool !== '' ? Number(form.prize_pool) : null,
        max_teams: form.max_teams !== '' ? Number(form.max_teams) : null,
      };
      await axios.put(`/api/tournaments/${id}`, payload, { headers: headers() });
      setEditing(false);
      fetchTournament();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update tournament');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await axios.delete(`/api/tournaments/${id}`, { headers: headers() });
      navigate('/tournaments');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tournament');
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

  if (!tournament) {
    return <div className="error-message">Tournament not found</div>;
  }

  return (
    <div>
      <button className="btn-back" onClick={() => navigate('/tournaments')}>
        ← Back to Tournaments
      </button>

      {error && <div className="error-message">{error}</div>}

      {editing ? (
        <div className="inline-edit-section">
          <h3>Edit Tournament</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Game</label>
                <input type="text" name="game" className="form-input" value={form.game} onChange={handleChange} />
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
                <input type="number" name="prize_pool" className="form-input" value={form.prize_pool} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Teams</label>
                <input type="number" name="max_teams" className="form-input" value={form.max_teams} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" name="location" className="form-input" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Organizer</label>
                <input type="text" name="organizer" className="form-input" value={form.organizer} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <input type="text" name="format" className="form-input" value={form.format} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="page-header">
            <h1 className="page-title">{tournament.name}</h1>
            <span className={getStatusBadge(tournament.status)}>
              {tournament.status || 'N/A'}
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Game</div>
              <div className="detail-value">{tournament.game || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Start Date</div>
              <div className="detail-value">{tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">End Date</div>
              <div className="detail-value">{tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Prize Pool</div>
              <div className="detail-value highlight">{formatCurrency(tournament.prize_pool)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Location</div>
              <div className="detail-value">{tournament.location || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Organizer</div>
              <div className="detail-value">{tournament.organizer || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Format</div>
              <div className="detail-value">{tournament.format || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Max Teams</div>
              <div className="detail-value">{tournament.max_teams ?? 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Description</div>
              <div className="detail-value">{tournament.description || 'N/A'}</div>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default TournamentDetail;
