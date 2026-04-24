import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIResultDisplay from '../components/AIResultDisplay';

const FOCUS_AREA_OPTIONS = [
  'Aim Training',
  'Map Knowledge',
  'Game Sense',
  'Team Communication',
  'Mechanical Skills',
  'Mental Fortitude',
  'VOD Review',
  'Positioning',
];

const DURATION_OPTIONS = [
  { label: '1 Week', value: '1 Week' },
  { label: '2 Weeks', value: '2 Weeks' },
  { label: '1 Month', value: '1 Month' },
  { label: '3 Months', value: '3 Months' },
];

function TrainingPlanGenerator() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [focusAreas, setFocusAreas] = useState([]);
  const [duration, setDuration] = useState('1 Week');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players', { headers });
        setPlayers(response.data);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      }
    };
    fetchPlayers();
  }, []);

  const handleFocusAreaToggle = (area) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleGenerate = async () => {
    if (!selectedPlayer) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        '/api/ai/training-plan',
        { playerId: selectedPlayer, focusAreas, duration },
        { headers }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate training plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="page-header">
        <h1>Training Plan Generator</h1>
        <p>AI-personalized training programs</p>
      </div>

      <div className="ai-controls">
        <div className="form-group">
          <label htmlFor="player-select">Select Player</label>
          <select
            id="player-select"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="">-- Select a Player --</option>
            {players.map((player) => (
              <option key={player._id} value={player._id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Focus Areas</label>
          <div className="checkbox-group">
            {FOCUS_AREA_OPTIONS.map((area) => (
              <div
                key={area}
                className={`checkbox-item ${focusAreas.includes(area) ? 'checked' : ''}`}
                onClick={() => handleFocusAreaToggle(area)}
              >
                <input
                  type="checkbox"
                  checked={focusAreas.includes(area)}
                  onChange={() => handleFocusAreaToggle(area)}
                />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="duration-select">Duration</label>
          <select
            id="duration-select"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={!selectedPlayer || loading}
        >
          {loading ? 'Generating...' : 'Generate Training Plan'}
        </button>
      </div>

      <AIResultDisplay result={result} loading={loading} error={error} />
    </div>
  );
}

export default TrainingPlanGenerator;
