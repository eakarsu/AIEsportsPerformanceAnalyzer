import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

function TrainingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [training, setTraining] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [trainingRes, playersRes] = await Promise.all([
        axios.get(`/api/training/${id}`, { headers: headers() }),
        axios.get('/api/players', { headers: headers() }),
      ]);
      setTraining(trainingRes.data);
      setPlayers(Array.isArray(playersRes.data) ? playersRes.data : []);
      setForm({
        title: trainingRes.data.title || '',
        player_id: trainingRes.data.player_id || '',
        description: trainingRes.data.description || '',
        scheduled_date: trainingRes.data.scheduled_date ? trainingRes.data.scheduled_date.slice(0, 16) : '',
        duration_minutes: trainingRes.data.duration_minutes ?? '',
        focus_area: trainingRes.data.focus_area || '',
        intensity: trainingRes.data.intensity || 'medium',
        status: trainingRes.data.status || 'planned',
        coach_notes: trainingRes.data.coach_notes || '',
      });
    } catch (err) {
      setError('Failed to load training schedule');
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
        player_id: form.player_id ? Number(form.player_id) : null,
        duration_minutes: form.duration_minutes !== '' ? Number(form.duration_minutes) : null,
      };
      await axios.put(`/api/training/${id}`, payload, { headers: headers() });
      setEditing(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update training schedule');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this training schedule?')) return;
    try {
      await axios.delete(`/api/training/${id}`, { headers: headers() });
      navigate('/training');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete training schedule');
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

  if (!training) {
    return <div className="error-message">Training schedule not found</div>;
  }

  return (
    <div>
      <button className="btn-back" onClick={() => navigate('/training')}>
        ← Back to Training Schedules
      </button>

      {error && <div className="error-message">{error}</div>}

      {editing ? (
        <div className="inline-edit-section">
          <h3>Edit Training Schedule</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-input" value={form.title} onChange={handleChange} required />
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
              <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} />
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
              <textarea name="coach_notes" className="form-textarea" value={form.coach_notes} onChange={handleChange} />
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
            <h1 className="page-title">{training.title || 'Training Schedule'}</h1>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Title</div>
              <div className="detail-value">{training.title || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Player</div>
              <div className="detail-value">{training.player_name || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Date</div>
              <div className="detail-value">{training.scheduled_date ? new Date(training.scheduled_date).toLocaleString() : 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Duration</div>
              <div className="detail-value">{training.duration_minutes ? `${training.duration_minutes} min` : 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Focus Area</div>
              <div className="detail-value">{training.focus_area || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Intensity</div>
              <div className="detail-value">
                <span className={getIntensityBadge(training.intensity)}>
                  {training.intensity || 'N/A'}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <span className={getStatusBadge(training.status)}>
                  {training.status ? training.status.replace('_', ' ') : 'N/A'}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Description</div>
              <div className="detail-value">{training.description || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Coach Notes</div>
              <div className="detail-value">{training.coach_notes || 'N/A'}</div>
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

export default TrainingDetail;
