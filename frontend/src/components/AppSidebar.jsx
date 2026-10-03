import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const LINKS = [
  { to: '/insights/timeline', label: 'Timeline View', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/batch03', label: 'Batch03 Features', group: 'Workspace' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/players', label: 'Players', group: 'Workspace' },
  { to: '/teams', label: 'Teams', group: 'Workspace' },
  { to: '/matches', label: 'Matches', group: 'Workspace' },
  { to: '/tournaments', label: 'Tournaments', group: 'Workspace' },
  { to: '/training', label: 'Training Schedules', group: 'Workspace' },
  { to: '/ai/performance', label: 'Performance Analysis', group: 'AI tools' },
  { to: '/ai/strategy', label: 'Strategy Analysis', group: 'AI tools' },
  { to: '/ai/scouting', label: 'Opponent Scouting', group: 'AI tools' },
  { to: '/ai/training-plan', label: 'Training Plan Generator', group: 'AI tools' },
  { to: '/ai/prediction', label: 'Match Prediction', group: 'AI tools' },
  { to: '/ai/highlight-clip-suggest', label: 'Highlight Clip Suggest', group: 'AI tools' },
  { to: '/ai/wellness-log', label: 'Wellness Log', group: 'AI tools' },
  { to: '/ai/tournament-brief', label: 'Tournament Brief', group: 'AI tools' },
  { to: '/ai/meta-analysis', label: 'Meta Analysis', group: 'AI tools' },
  { to: '/ai/injury-risk-assess', label: 'Injury Risk Assess', group: 'AI tools' },
  { to: '/ai/sponsorship-match', label: 'Sponsorship Match', group: 'AI tools' },
  { to: '/ai/live-stream-status', label: 'Live Stream Status', group: 'AI tools' },
  { to: '/ai/betting-insights', label: 'Betting Insights', group: 'AI tools' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
  { to: '/scrim-tilt-recovery', label: 'Scrim Tilt Recovery', group: 'Workspace' },
];

export default function AppSidebar() {
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIEsports Performance Analyzer</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
