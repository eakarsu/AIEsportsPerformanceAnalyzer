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
import HighlightClipSuggest from './pages/HighlightClipSuggest';
import WellnessLog from './pages/WellnessLog';
import TournamentBrief from './pages/TournamentBrief';
import MetaAnalysis from './pages/MetaAnalysis';
import InjuryRiskAssess from './pages/InjuryRiskAssess';
import SponsorshipMatch from './pages/SponsorshipMatch';
import LiveStreamStatus from './pages/LiveStreamStatus';
import BettingInsights from './pages/BettingInsights';

import Batch03Features from './pages/Batch03Features';

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
          <Route path="/batch03" element={<Batch03Features />} />
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
        <Route path="/ai/highlight-clip-suggest" element={<ProtectedRoute><HighlightClipSuggest /></ProtectedRoute>} />
        <Route path="/ai/wellness-log" element={<ProtectedRoute><WellnessLog /></ProtectedRoute>} />
        <Route path="/ai/tournament-brief" element={<ProtectedRoute><TournamentBrief /></ProtectedRoute>} />
        <Route path="/ai/meta-analysis" element={<ProtectedRoute><MetaAnalysis /></ProtectedRoute>} />
        <Route path="/ai/injury-risk-assess" element={<ProtectedRoute><InjuryRiskAssess /></ProtectedRoute>} />
        <Route path="/ai/sponsorship-match" element={<ProtectedRoute><SponsorshipMatch /></ProtectedRoute>} />
        <Route path="/ai/live-stream-status" element={<ProtectedRoute><LiveStreamStatus /></ProtectedRoute>} />
        <Route path="/ai/betting-insights" element={<ProtectedRoute><BettingInsights /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
