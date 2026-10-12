import { listData } from '../listData';
import AIAnalysisHistory from '../components/AIAnalysisHistory';
import AIPresetButtons from '../components/AIPresetButtons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIResultDisplay from '../components/AIResultDisplay';

function MatchPrediction() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams', { headers });
        setTeams(listData(response.data));
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handlePredict = async () => {
    if (!team1Id || !team2Id) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/match-prediction',
        { team1Id, team2Id },
        { headers }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to predict match outcome. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Match Prediction</h1>
        <p>AI match outcome predictions with detailed analysis</p>
      </div>

      <AIPresetButtons prerequisite={"Load at least 2 real teams to use all samples."} presets={[{ label: 'First matchup', disabled: teams.length < 2, fill: () => { setTeam1Id(String(teams[0].id)); setTeam2Id(String(teams[1].id)); } }, { label: 'Reverse matchup', disabled: teams.length < 2, fill: () => { setTeam1Id(String(teams[1].id)); setTeam2Id(String(teams[0].id)); } }]} />
      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="team1-select">Team 1</label>
          <select
            id="team1-select"
            value={team1Id}
            onChange={(e) => setTeam1Id(e.target.value)}
          >
            <option value="">-- Select Team 1 --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="team2-select">Team 2</label>
          <select
            id="team2-select"
            value={team2Id}
            onChange={(e) => setTeam2Id(e.target.value)}
          >
            <option value="">-- Select Team 2 --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handlePredict}
          disabled={!team1Id || !team2Id || loading}
        >
          {loading ? 'Predicting...' : 'Predict Match Outcome'}
        </button>
      </div>

      <AIResultDisplay result={result} loading={loading} error={error} />
      <AIAnalysisHistory entityType="team" entityId={team1Id} />
    </div>
  );
}

export default MatchPrediction;
