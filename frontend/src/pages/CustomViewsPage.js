import React, { useState } from 'react';
import PlayerKdaObjectiveBar from '../components/PlayerKdaObjectiveBar';
import MapPerformanceHeatmap from '../components/MapPerformanceHeatmap';
import ScoutingReportPdf from '../components/ScoutingReportPdf';
import MetaRulesEditor from '../components/MetaRulesEditor';

const TABS = [
  { id: 'kda', label: 'Player KDA & Objectives', icon: '📊' },
  { id: 'heatmap', label: 'Map Performance Heatmap', icon: '🗺️' },
  { id: 'scouting', label: 'Scouting Report (PDF)', icon: '📄' },
  { id: 'meta', label: 'Meta / Strategy Rules', icon: '⚙️' },
];

function CustomViewsPage() {
  const [tab, setTab] = useState('kda');

  return (
    <div style={{ padding: 20 }} data-testid="custom-views-page">
      <h1 style={{ marginBottom: 4 }}>Esports Views</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Custom analytics views: KDA &amp; objective bars, map heatmaps, scouting PDFs, and a meta/strategy rules editor.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            data-testid={`tab-${t.id}`}
            className={tab === t.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setTab(t.id)}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'kda' && <PlayerKdaObjectiveBar />}
      {tab === 'heatmap' && <MapPerformanceHeatmap />}
      {tab === 'scouting' && <ScoutingReportPdf />}
      {tab === 'meta' && <MetaRulesEditor />}
    </div>
  );
}

export default CustomViewsPage;
