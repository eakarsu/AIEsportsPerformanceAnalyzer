import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    team1_id: '',
    team2_id: '',
    tournament_id: '',
    match_date: '',
    score_team1: '',
    score_team2: '',
    map: '',
    duration_minutes: '',
    winner_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes, tournamentsRes] = await Promise.all([
        axios.get('/api/matches', { headers: headers() }),
        axios.get('/api/teams', { headers: headers() }),
        axios.get('/api/tournaments', { headers: headers() }),
      ]);
      setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
      setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      setTournaments(Array.isArray(tournamentsRes.data) ? tournamentsRes.data : []);
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
        team1_id: Number(form.team1_id),
        team2_id: Number(form.team2_id),
        tournament_id: form.tournament_id ? Number(form.tournament_id) : null,
        score_team1: form.score_team1 ? Number(form.score_team1) : null,
        score_team2: form.score_team2 ? Number(form.score_team2) : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        winner_id: form.winner_id ? Number(form.winner_id) : null,
      };
      await axios.post('/api/matches', payload, { headers: headers() });
      setShowModal(false);
      setForm({
        team1_id: '',
        team2_id: '',
        tournament_id: '',
        match_date: '',
        score_team1: '',
        score_team2: '',
        map: '',
        duration_minutes: '',
        winner_id: '',
        notes: '',
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    }
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
        <h1 className="page-title">Match History</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add New Match
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚔️</div>
          <div className="empty-state-text">No matches found. Add your first match!</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team 1</th>
                <th>Team 2</th>
                <th>Score</th>
                <th>Tournament</th>
                <th>Map</th>
                <th>Date</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr
                  key={match.id}
                  className="clickable-row"
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  <td>{match.team1_name || 'N/A'}</td>
                  <td>{match.team2_name || 'N/A'}</td>
                  <td>
                    {match.score_team1 != null && match.score_team2 != null
                      ? `${match.score_team1} - ${match.score_team2}`
                      : 'N/A'}
                  </td>
                  <td>{match.tournament_name || 'N/A'}</td>
                  <td>{match.map || 'N/A'}</td>
                  <td>{match.match_date ? new Date(match.match_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{match.winner_name || 'N/A'}</td>
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
              <h2 className="modal-title">Add New Match</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Team 1</label>
                  <select
                    name="team1_id"
                    className="form-select"
                    value={form.team1_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Team 1</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Team 2</label>
                  <select
                    name="team2_id"
                    className="form-select"
                    value={form.team2_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Team 2</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tournament</label>
                <select
                  name="tournament_id"
                  className="form-select"
                  value={form.tournament_id}
                  onChange={handleChange}
                >
                  <option value="">Select Tournament (optional)</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Match Date</label>
                <input
                  type="datetime-local"
                  name="match_date"
                  className="form-input"
                  value={form.match_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Score Team 1</label>
                  <input
                    type="number"
                    name="score_team1"
                    className="form-input"
                    value={form.score_team1}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Score Team 2</label>
                  <input
                    type="number"
                    name="score_team2"
                    className="form-input"
                    value={form.score_team2}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Map</label>
                  <input
                    type="text"
                    name="map"
                    className="form-input"
                    value={form.map}
                    onChange={handleChange}
                    placeholder="e.g. Dust2, Inferno"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    className="form-input"
                    value={form.duration_minutes}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Winner</label>
                <select
                  name="winner_id"
                  className="form-select"
                  value={form.winner_id}
                  onChange={handleChange}
                >
                  <option value="">Select Winner (optional)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Match notes..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matches;
