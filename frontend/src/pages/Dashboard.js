import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const features = [
  {
    icon: '👤',
    title: 'Player Profiles',
    description: 'Manage player data, stats, and performance metrics',
    countKey: 'players',
    route: '/players',
  },
  {
    icon: '🏆',
    title: 'Team Management',
    description: 'Organize teams, rosters, and rankings',
    countKey: 'teams',
    route: '/teams',
  },
  {
    icon: '⚔️',
    title: 'Match History',
    description: 'Track match results and game analysis',
    countKey: 'matches',
    route: '/matches',
  },
  {
    icon: '🎯',
    title: 'Tournament Tracker',
    description: 'Monitor tournaments, schedules, and standings',
    countKey: 'tournaments',
    route: '/tournaments',
  },
  {
    icon: '📋',
    title: 'Training Schedules',
    description: 'Plan and track training sessions',
    countKey: 'training',
    route: '/training',
  },
  {
    icon: '🧠',
    title: 'Performance Analysis',
    description: 'AI-powered player performance deep dive',
    countKey: null,
    route: '/ai/performance',
  },
  {
    icon: '♟️',
    title: 'Strategy Analysis',
    description: 'AI strategic insights and tactical recommendations',
    countKey: null,
    route: '/ai/strategy',
  },
  {
    icon: '🔍',
    title: 'Opponent Scouting',
    description: 'AI-generated comprehensive scouting reports',
    countKey: null,
    route: '/ai/scouting',
  },
  {
    icon: '📊',
    title: 'Training Plan Generator',
    description: 'AI-personalized training programs',
    countKey: null,
    route: '/ai/training-plan',
  },
  {
    icon: '🎮',
    title: 'Match Prediction',
    description: 'AI match outcome predictions with analysis',
    countKey: null,
    route: '/ai/prediction',
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

      try {
        const [players, teams, matches, tournaments, training] = await Promise.all([
          axios.get('/api/players', { headers }),
          axios.get('/api/teams', { headers }),
          axios.get('/api/matches', { headers }),
          axios.get('/api/tournaments', { headers }),
          axios.get('/api/training', { headers }),
        ]);

        setCounts({
          players: Array.isArray(players.data) ? players.data.length : 0,
          teams: Array.isArray(teams.data) ? teams.data.length : 0,
          matches: Array.isArray(matches.data) ? matches.data.length : 0,
          tournaments: Array.isArray(tournaments.data) ? tournaments.data.length : 0,
          training: Array.isArray(training.data) ? training.data.length : 0,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {features.map((feature) => (
        <div
          key={feature.route}
          className="dashboard-card"
          onClick={() => navigate(feature.route)}
        >
          <div className="card-icon">{feature.icon}</div>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
          <div className="card-count">
            {feature.countKey ? counts[feature.countKey] ?? 0 : 'AI Feature'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
