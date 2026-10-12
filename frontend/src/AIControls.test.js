import React, { act } from 'react';
global.IS_REACT_ACT_ENVIRONMENT = true;
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import AIPresetButtons from './components/AIPresetButtons';
import FormattedAIReport from './components/FormattedAIReport';
import AIAnalysisHistory from './components/AIAnalysisHistory';
jest.mock('axios', () => ({ post: jest.fn(), get: jest.fn() }));
import axios from 'axios';
import Login from './pages/Login';
import TrainingPlanGenerator from './pages/TrainingPlanGenerator';

const render = element => {
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(element));
  return { host, cleanup: () => { act(() => root.unmount()); host.remove(); } };
};

test('preset fills all supplied fields without submitting', () => {
  let submitted = 0; const fields = {};
  const { host, cleanup } = render(<form onSubmit={event => { event.preventDefault(); submitted++; }}>
    <AIPresetButtons presets={[{ label: 'Aim', fill: () => Object.assign(fields, { id: '23', focus: 'Aim', duration: '2 Weeks' }) }, { label: 'Team', fill: () => {} }]} />
  </form>);
  act(() => host.querySelector('button').click());
  expect(fields).toEqual({ id: '23', focus: 'Aim', duration: '2 Weeks' });
  expect(submitted).toBe(0);
  cleanup();
});

test('returned and saved JSON retain false, zero, empty string, lists and tables', () => {
  const fixture = { assessment: { safe: false, score: 0, note: '', actions: ['Rest', 'Review'], metrics: [{ name: 'APM', value: 0 }, { name: 'Ready', value: false }] } };
  for (const response of [fixture, JSON.stringify(fixture)]) {
    const { host, cleanup } = render(<FormattedAIReport response={response} />);
    expect(host.textContent).toContain('Assessment');
    expect(host.textContent).toContain('No');
    expect(host.textContent).toContain('0');
    expect(host.textContent).toContain('(empty string)');
    expect(host.querySelector('table')).not.toBeNull();
    expect(host.querySelector('pre')).toBeNull();
    cleanup();
  }
});

test('saved history opens the formatted detail view', async () => {
  axios.post.mockResolvedValueOnce({ data: { history: [{ id: 7, analysis_type: 'injury_risk', content: JSON.stringify({ risk: false, score: 0 }) }] } });
  const { host, cleanup } = render(<AIAnalysisHistory entityType="player" entityId="23" />);
  await act(async () => host.querySelector('button').click());
  expect(axios.post).toHaveBeenCalledWith('/api/ai/analysis-history', { entity_type: 'player', entity_id: '23' }, expect.any(Object));
  await act(async () => host.querySelector('.ai-history-row').click());
  expect(host.textContent).toContain('Risk');
  expect(host.textContent).toContain('No');
  expect(host.textContent).toContain('0');
  cleanup();
});

test('demo fill is disabled when frontend credentials are unavailable', () => {
  const { host, cleanup } = render(<MemoryRouter><Login /></MemoryRouter>);
  const button = [...host.querySelectorAll('button')].find(item => item.textContent.includes('Fill Demo Credentials'));
  expect(button.type).toBe('button');
  expect(button.disabled).toBe(true);
  expect(host.textContent).toContain('not configured');
  cleanup();
});


test('training plan preset fills player, focus areas and duration without generating', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 23, name: 'Player A' }, { id: 24, name: 'Player B' }] });
  axios.post.mockClear();
  const { host, cleanup } = render(<MemoryRouter><TrainingPlanGenerator /></MemoryRouter>);
  await act(async () => {});
  const button = [...host.querySelectorAll('button')].find(item => item.textContent === 'Aim and positioning');
  expect(button.disabled).toBe(false);
  act(() => button.click());
  expect(host.querySelector('#player-select').value).toBe('23');
  expect(host.querySelector('#duration-select').value).toBe('2 Weeks');
  expect([...host.querySelectorAll('input[type=checkbox]:checked')]).toHaveLength(2);
  expect(axios.post).not.toHaveBeenCalled();
  cleanup();
});

test('configured demo control fills fields without submitting', () => {
  process.env.REACT_APP_DEMO_EMAIL = 'fixture@example.invalid';
  process.env.REACT_APP_DEMO_PASSWORD = 'fixture-only';
  axios.post.mockClear();
  const { host, cleanup } = render(<MemoryRouter><Login /></MemoryRouter>);
  const button = [...host.querySelectorAll('button')].find(item => item.textContent.includes('Fill Demo Credentials'));
  act(() => button.click());
  expect(host.querySelector('#email').value).toBe(process.env.REACT_APP_DEMO_EMAIL);
  expect(host.querySelector('#password').value).toBe(process.env.REACT_APP_DEMO_PASSWORD);
  expect(axios.post).not.toHaveBeenCalled();
  cleanup();
  delete process.env.REACT_APP_DEMO_EMAIL;
  delete process.env.REACT_APP_DEMO_PASSWORD;
});
