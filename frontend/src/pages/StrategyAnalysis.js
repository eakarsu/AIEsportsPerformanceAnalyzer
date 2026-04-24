import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIResultDisplay from '../components/AIResultDisplay';

function StrategyAnalysis() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [opponentTeamId, setOpponentTeamId] = useState('');
  const [game, setGame] = useState('');
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

  const handleAnalyze = async () => {
    if (!teamId || !opponentTeamId) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/strategy-analysis',
        { teamId, opponentTeamId, game },
        { headers }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Strategy Analysis</h1>
        <p>AI strategic insights and tactical recommendations</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="team-select">Your Team</label>
          <select
            id="team-select"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">-- Select Your Team --</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="opponent-select">Opponent Team</label>
          <select
            id="opponent-select"
            value={opponentTeamId}
            onChange={(e) => setOpponentTeamId(e.target.value)}
          >
            <option value="">-- Select Opponent Team --</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="game-input">Game</label>
          <input
            id="game-input"
            type="text"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="e.g., League of Legends, CS2, Valorant"
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleAnalyze}
          disabled={!teamId || !opponentTeamId || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Strategy'}
        </button>
      </div>

      <AIResultDisplay result={result} loading={loading} error={error} />
    </div>
  );
}

export default StrategyAnalysis;
