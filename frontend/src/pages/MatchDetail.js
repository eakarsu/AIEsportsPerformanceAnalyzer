import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function MatchDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const [matchRes, teamsRes, tournamentsRes] = await Promise.all([
        axios.get(`/api/matches/${id}`, { headers: headers() }),
        axios.get('/api/teams', { headers: headers() }),
        axios.get('/api/tournaments', { headers: headers() }),
      ]);
      setMatch(matchRes.data);
      setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      setTournaments(Array.isArray(tournamentsRes.data) ? tournamentsRes.data : []);
      setForm({
        team1_id: matchRes.data.team1_id || '',
        team2_id: matchRes.data.team2_id || '',
        tournament_id: matchRes.data.tournament_id || '',
        match_date: matchRes.data.match_date ? matchRes.data.match_date.slice(0, 16) : '',
        score_team1: matchRes.data.score_team1 ?? '',
        score_team2: matchRes.data.score_team2 ?? '',
        map: matchRes.data.map || '',
        duration_minutes: matchRes.data.duration_minutes ?? '',
        winner_id: matchRes.data.winner_id || '',
        notes: matchRes.data.notes || '',
      });
    } catch (err) {
      setError('Failed to load match');
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
        team1_id: Number(form.team1_id),
        team2_id: Number(form.team2_id),
        tournament_id: form.tournament_id ? Number(form.tournament_id) : null,
        score_team1: form.score_team1 !== '' ? Number(form.score_team1) : null,
        score_team2: form.score_team2 !== '' ? Number(form.score_team2) : null,
        duration_minutes: form.duration_minutes !== '' ? Number(form.duration_minutes) : null,
        winner_id: form.winner_id ? Number(form.winner_id) : null,
      };
      await axios.put(`/api/matches/${id}`, payload, { headers: headers() });
      setEditing(false);
      fetchMatch();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update match');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      await axios.delete(`/api/matches/${id}`, { headers: headers() });
      navigate('/matches');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete match');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!match) {
    return <div className="error-message">Match not found</div>;
  }

  return (
    <div>
      <button className="btn-back" onClick={() => navigate('/matches')}>
        ← Back to Matches
      </button>

      {error && <div className="error-message">{error}</div>}

      {editing ? (
        <div className="inline-edit-section">
          <h3>Edit Match</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Team 1</label>
                <select name="team1_id" className="form-select" value={form.team1_id} onChange={handleChange} required>
                  <option value="">Select Team 1</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Team 2</label>
                <select name="team2_id" className="form-select" value={form.team2_id} onChange={handleChange} required>
                  <option value="">Select Team 2</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tournament</label>
              <select name="tournament_id" className="form-select" value={form.tournament_id} onChange={handleChange}>
                <option value="">Select Tournament (optional)</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Match Date</label>
              <input type="datetime-local" name="match_date" className="form-input" value={form.match_date} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Score Team 1</label>
                <input type="number" name="score_team1" className="form-input" value={form.score_team1} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Score Team 2</label>
                <input type="number" name="score_team2" className="form-input" value={form.score_team2} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Map</label>
                <input type="text" name="map" className="form-input" value={form.map} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" name="duration_minutes" className="form-input" value={form.duration_minutes} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Winner</label>
              <select name="winner_id" className="form-select" value={form.winner_id} onChange={handleChange}>
                <option value="">Select Winner (optional)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-textarea" value={form.notes} onChange={handleChange} />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="score-display">
            <div className="score-team">
              <div className="score-team-name">{match.team1_name || 'Team 1'}</div>
              <div className="score-number">{match.score_team1 ?? '-'}</div>
            </div>
            <div className="score-vs">VS</div>
            <div className="score-team">
              <div className="score-team-name">{match.team2_name || 'Team 2'}</div>
              <div className="score-number">{match.score_team2 ?? '-'}</div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Tournament</div>
              <div className="detail-value">{match.tournament_name || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Map</div>
              <div className="detail-value">{match.map || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Duration</div>
              <div className="detail-value">{match.duration_minutes ? `${match.duration_minutes} min` : 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Date</div>
              <div className="detail-value">{match.match_date ? new Date(match.match_date).toLocaleString() : 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Winner</div>
              <div className="detail-value highlight">{match.winner_name || 'N/A'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Notes</div>
              <div className="detail-value">{match.notes || 'N/A'}</div>
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

export default MatchDetail;
