import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const focusAreas = [
  'Aim Training',
  'Map Knowledge',
  'Game Sense',
  'Team Communication',
  'Mechanical Skills',
  'Mental Fortitude',
  'VOD Review',
  'Positioning',
];

function TrainingSchedules() {
  const navigate = useNavigate();
  const [training, setTraining] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    player_id: '',
    description: '',
    scheduled_date: '',
    duration_minutes: '',
    focus_area: '',
    intensity: 'medium',
    status: 'planned',
    coach_notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trainingRes, playersRes] = await Promise.all([
        axios.get('/api/training', { headers: headers() }),
        axios.get('/api/players', { headers: headers() }),
      ]);
      setTraining(Array.isArray(trainingRes.data) ? trainingRes.data : []);
      setPlayers(Array.isArray(playersRes.data) ? playersRes.data : []);
    } catch (err) {
      setError('Failed to load data');
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
        player_id: form.player_id ? Number(form.player_id) : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      };
      await axios.post('/api/training', payload, { headers: headers() });
      setShowModal(false);
      setForm({
        title: '',
        player_id: '',
        description: '',
        scheduled_date: '',
        duration_minutes: '',
        focus_area: '',
        intensity: 'medium',
        status: 'planned',
        coach_notes: '',
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create training schedule');
    }
  };

  const getIntensityBadge = (intensity) => {
    const map = {
      high: 'badge badge-danger',
      medium: 'badge badge-warning',
      low: 'badge badge-success',
    };
    return map[intensity] || 'badge badge-info';
  };

  const getStatusBadge = (status) => {
    const map = {
      planned: 'badge badge-info',
      in_progress: 'badge badge-warning',
      completed: 'badge badge-success',
    };
    return map[status] || 'badge badge-info';
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
        <h1 className="page-title">Training Schedules</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add New Schedule
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {training.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No training schedules found. Add your first schedule!</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Player</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Focus Area</th>
                <th>Intensity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {training.map((t) => (
                <tr
                  key={t.id}
                  className="clickable-row"
                  onClick={() => navigate(`/training/${t.id}`)}
                >
                  <td>{t.title || 'N/A'}</td>
                  <td>{t.player_name || 'N/A'}</td>
                  <td>{t.scheduled_date ? new Date(t.scheduled_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{t.duration_minutes ? `${t.duration_minutes} min` : 'N/A'}</td>
                  <td>{t.focus_area || 'N/A'}</td>
                  <td>
                    <span className={getIntensityBadge(t.intensity)}>
                      {t.intensity || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(t.status)}>
                      {t.status ? t.status.replace('_', ' ') : 'N/A'}
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
              <h2 className="modal-title">Add New Training Schedule</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Training session title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Player</label>
                <select name="player_id" className="form-select" value={form.player_id} onChange={handleChange}>
                  <option value="">Select Player (optional)</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.ign || p.first_name + ' ' + p.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Session description..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input type="datetime-local" name="scheduled_date" className="form-input" value={form.scheduled_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input type="number" name="duration_minutes" className="form-input" value={form.duration_minutes} onChange={handleChange} min="0" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Focus Area</label>
                <select name="focus_area" className="form-select" value={form.focus_area} onChange={handleChange}>
                  <option value="">Select Focus Area</option>
                  {focusAreas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Intensity</label>
                  <select name="intensity" className="form-select" value={form.intensity} onChange={handleChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Coach Notes</label>
                <textarea
                  name="coach_notes"
                  className="form-textarea"
                  value={form.coach_notes}
                  onChange={handleChange}
                  placeholder="Notes from coach..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainingSchedules;
