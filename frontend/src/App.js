import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import TrainingSchedules from './pages/TrainingSchedules';
import TrainingDetail from './pages/TrainingDetail';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import StrategyAnalysis from './pages/StrategyAnalysis';
import OpponentScouting from './pages/OpponentScouting';
import TrainingPlanGenerator from './pages/TrainingPlanGenerator';
import MatchPrediction from './pages/MatchPrediction';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />
      <div className="main-content">{children}</div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
        <Route path="/players/:id" element={<ProtectedRoute><PlayerDetail /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/teams/:id" element={<ProtectedRoute><TeamDetail /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/matches/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
        <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
        <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetail /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><TrainingSchedules /></ProtectedRoute>} />
        <Route path="/training/:id" element={<ProtectedRoute><TrainingDetail /></ProtectedRoute>} />
        <Route path="/ai/performance" element={<ProtectedRoute><PerformanceAnalysis /></ProtectedRoute>} />
        <Route path="/ai/strategy" element={<ProtectedRoute><StrategyAnalysis /></ProtectedRoute>} />
        <Route path="/ai/scouting" element={<ProtectedRoute><OpponentScouting /></ProtectedRoute>} />
        <Route path="/ai/training-plan" element={<ProtectedRoute><TrainingPlanGenerator /></ProtectedRoute>} />
        <Route path="/ai/prediction" element={<ProtectedRoute><MatchPrediction /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
