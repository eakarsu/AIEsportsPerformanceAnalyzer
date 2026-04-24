import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIResultDisplay from '../components/AIResultDisplay';

function OpponentScouting() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams', { headers });
        setTeams(response.data);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handleScout = async () => {
    if (!teamId) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/opponent-scouting',
        { teamId },
        { headers }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate scouting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Opponent Scouting</h1>
        <p>AI-generated comprehensive scouting reports</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="team-select">Select Team to Scout</label>
          <select
            id="team-select"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">-- Select a Team --</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleScout}
          disabled={!teamId || loading}
        >
          {loading ? 'Generating Report...' : 'Generate Scouting Report'}
        </button>
      </div>

      <AIResultDisplay result={result} loading={loading} error={error} />
    </div>
  );
}

export default OpponentScouting;
