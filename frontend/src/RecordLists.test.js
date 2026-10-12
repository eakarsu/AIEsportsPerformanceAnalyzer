import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Players from './pages/Players';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import Tournaments from './pages/Tournaments';
import TrainingSchedules from './pages/TrainingSchedules';
import { listData, listCount } from './listData';

global.IS_REACT_ACT_ENVIRONMENT = true;
jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn() }));

// Domain fixtures mirror the project's own seed.sql labels and paginated API shape.
const teamNames = ['Shadow Wolves','Phoenix Rising',"Dragon's Breath",'Iron Fortress','Neon Strikers','Crimson Tide','Arctic Storm','Void Walkers','Titan Esports','Celestial Gaming','Thunder Hawks','Phantom Brigade','Emerald Serpents','Solar Flare','Omega Force','Nexus Gaming'];
const playerNames = ['ShadowBlade','PhoenixShot','DragonFist','IronGuard','NeonDash','CrimsonBow','FrostByte','VoidStep','TitanCrush','StarPulse','ThunderLord','PhantomAce','EmeraldViper','SolarWind','OmegaShield','NexusFire'];
const tournamentNames = ['World Championship 2025','CS2 Major: Berlin','Valorant Champions Tour','The International 14','Overwatch Champions Series','Spring Split 2026','CS2 RMR Spring','VCT Masters Shanghai','DPC Spring Tour','OW Champions Series Spring','Mid-Season Invitational','CS2 Major: Copenhagen','VCT Masters Bangkok','ESL Pro League Season 21','Dreamhack Summer Open','Asia Championship'];
const trainingNames = ['Assassin Mechanics Drill','AWP Flick Training','Site Execute Drills','Last Hit Practice','Aim Arena Warmup','Teamfight Positioning VOD','Retake Scenarios','Smoke Lineup Workshop','Offlane Matchup Study','Ana Nano Boost Timing','Jungle Pathing Optimization','Spray Control Workshop','Sova Arrow Lineups','Warding Strategy Session','Shield Management Drills','Team Scrim Block'];
const teams = teamNames.map((name, i) => ({ id: i + 1, name, game: 'Valorant' }));
const players = playerNames.map((username, i) => ({ id: i + 1, username, team_id: i + 1, game: 'Valorant' }));
const tournaments = tournamentNames.map((name, i) => ({ id: i + 1, name, status: 'upcoming' }));
const matches = teams.map((team, i) => ({ id: i + 1, team1_id: team.id, team2_id: teams[(i + 1) % teams.length].id, team1_name: team.name, team2_name: teams[(i + 1) % teams.length].name, match_date: '2026-03-01' }));
const training = trainingNames.map((title, i) => ({ id: i + 1, title, player_id: i + 1, player_name: playerNames[i], status: 'planned' }));
const payloads = { '/api/teams': teams, '/api/players': players, '/api/tournaments': tournaments, '/api/matches': matches, '/api/training': training };

beforeEach(() => {
  axios.get.mockImplementation((url) => Promise.resolve({ data: url === '/api/training' ? training : { data: payloads[url], pagination: { page: 1, limit: 20, total: payloads[url]?.length } } }));
});

test.each([
  ['players', Players, 'ShadowBlade'],
  ['teams', Teams, 'Shadow Wolves'],
  ['matches', Matches, 'Shadow Wolves'],
  ['tournaments', Tournaments, 'World Championship 2025'],
  ['training', TrainingSchedules, 'Assassin Mechanics Drill'],
])('%s shows at least 15 seeded domain records without a runtime error', async (_, Page, label) => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(<MemoryRouter><Page /></MemoryRouter>); });
  expect(host.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(15);
  expect(host.textContent).toContain(label);
  expect(errors).not.toHaveBeenCalled();
  await act(async () => root.unmount()); host.remove(); errors.mockRestore();
});

test('list helper supports paginated and direct arrays and guards malformed payloads', () => {
  expect(listData({ data: players, pagination: {} })).toHaveLength(16);
  expect(listData(training)).toHaveLength(16);
  expect(listData({ data: {} })).toEqual([]);
  expect(listCount({ data: players, pagination: { total: 42 } })).toBe(42);
});

// Exercise every native AI page against the paginated record payloads.
const nativePages = [
  ['PerformanceAnalysis', require('./pages/PerformanceAnalysis').default],
  ['StrategyAnalysis', require('./pages/StrategyAnalysis').default],
  ['OpponentScouting', require('./pages/OpponentScouting').default],
  ['TrainingPlanGenerator', require('./pages/TrainingPlanGenerator').default],
  ['MatchPrediction', require('./pages/MatchPrediction').default],
  ['HighlightClipSuggest', require('./pages/HighlightClipSuggest').default],
  ['WellnessLog', require('./pages/WellnessLog').default],
  ['TournamentBrief', require('./pages/TournamentBrief').default],
  ['MetaAnalysis', require('./pages/MetaAnalysis').default],
  ['InjuryRiskAssess', require('./pages/InjuryRiskAssess').default],
  ['SponsorshipMatch', require('./pages/SponsorshipMatch').default],
  ['LiveStreamStatus', require('./pages/LiveStreamStatus').default],
  ['BettingInsights', require('./pages/BettingInsights').default],
];

test.each(nativePages)('%s offers two working fill-only presets', async (_, Page) => {
  axios.post.mockClear();
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(<MemoryRouter><Page /></MemoryRouter>); });
  const buttons = [...host.querySelectorAll('.ai-preset-bar button')];
  expect(buttons.length).toBeGreaterThanOrEqual(2);
  expect(buttons[0].disabled).toBe(false);
  expect(buttons[1].disabled).toBe(false);
  for (const button of buttons.slice(0, 2)) {
    await act(async () => button.click());
    expect(axios.post).not.toHaveBeenCalled();
    const values = [...host.querySelectorAll('input:not([type=checkbox]):not([type=file]), select, textarea')].map(el => el.value);
    expect(values.some(Boolean)).toBe(true);
    if (_ !== 'SponsorshipMatch') expect(values.every(Boolean)).toBe(true);
    if (_ === 'TrainingPlanGenerator') expect(host.querySelectorAll('input[type=checkbox]:checked').length).toBeGreaterThan(0);
  }
  expect(errors).not.toHaveBeenCalled();
  await act(async () => root.unmount()); host.remove(); errors.mockRestore();
});

test('Batch 03 samples fill its prompt without submitting', async () => {
  const Page = require('./pages/Batch03Features').default;
  const request = jest.spyOn(global, 'fetch').mockImplementation(() => { throw new Error('sample invoked request'); });
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(<Page />));
  for (const label of ['Scenario', 'Data sample', 'Executive review']) {
    const button = [...host.querySelectorAll('button')].find((item) => item.textContent === label);
    expect(button).toBeDefined();
    await act(async () => button.click());
    expect(host.querySelector('textarea').value.length).toBeGreaterThan(20);
  }
  expect(request).not.toHaveBeenCalled();
  await act(async () => root.unmount()); host.remove(); request.mockRestore();
});
