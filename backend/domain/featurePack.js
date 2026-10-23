'use strict';
// Feature pack FP34B — pure helpers: tasks store, search/filter, CSV/JSON export, deterministic domain AI.
// Provider is only attempted by the router when OPENROUTER_API_KEY or OPENAI_API_KEY is set;
// otherwise these deterministic functions are used and labelled aiGenerated:false.
const COLUMNS = ['id','username','real_name','game','role','country','kda','winrate','apm','accuracy'];
const SEARCH_FIELDS = ['username','real_name','game','role','country'];

function hasProvider() { return !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY); }
function filterRecords(records, filters = {}) {
  const list = Array.isArray(records) ? records : [];
  const q = String(filters.search || filters.q || '').trim().toLowerCase();
  return list.filter((r) => {
    for (const [k, v] of Object.entries(filters || {})) {
      if (['search','q','format','page','limit'].includes(k) || v === undefined || v === null || v === '') continue;
      if (r[k] === undefined) continue;
      if (String(r[k]).toLowerCase() !== String(v).toLowerCase()) return false;
    }
    if (q) {
      const hay = SEARCH_FIELDS.map((f) => (r[f] === undefined || r[f] === null ? '' : String(r[f]))).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(records, columns = COLUMNS) {
  const list = Array.isArray(records) ? records : [];
  return [columns.join(','), ...list.map((r) => columns.map((c) => csvEscape(r[c])).join(','))].join('\n');
}
function toJsonExport(records) { return { exported_at: new Date().toISOString(), count: (records || []).length, data: records || [] }; }

function createTaskStore() {
  let nextId = 1; const byUser = new Map();
  const listFor = (u) => { if (!byUser.has(String(u))) byUser.set(String(u), []); return byUser.get(String(u)); };
  return {
    list(userId) { return [...listFor(userId)]; },
    create(userId, data = {}) {
      if (!data.title || String(data.title).trim() === '') throw Object.assign(new Error('title is required'), { status: 400 });
      const task = { id: nextId++, user_id: userId, title: String(data.title), description: data.description ?? '', status: data.status ?? 'todo', priority: data.priority ?? 'medium', completed: data.completed ?? false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      listFor(userId).push(task); return task;
    },
    update(userId, id, patch = {}) {
      const task = listFor(userId).find((t) => String(t.id) === String(id));
      if (!task) return null;
      for (const [k, v] of Object.entries(patch)) { if (v !== undefined && !['id','user_id'].includes(k)) task[k] = v; }
      task.updated_at = new Date().toISOString(); return task;
    },
  };
}
function wrap(label, summary, sections) {
  return { aiGenerated: false, generatedBy: 'deterministic-fallback', provider: null, label, summary, sections };
}
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function avg(records, field) { if (!records.length) return 0; return Math.round((records.reduce((a, r) => a + num(r[field]), 0) / records.length) * 100) / 100; }
function countBy(records, field) { const m = {}; for (const r of records) { const k = r[field] === undefined || r[field] === null || r[field] === '' ? '' : String(r[field]); m[k] = (m[k] || 0) + 1; } return m; }

function performanceSummary(records = []) {
  return wrap('Performance summary', `Averaged ${records.length} player record(s) deterministically.`, [
    { label: 'Players analysed', value: records.length },
    { label: 'Average KDA', value: avg(records, 'kda') },
    { label: 'Average winrate', value: avg(records, 'winrate') },
    { label: 'Average APM', value: avg(records, 'apm') },
    { label: 'Average accuracy', value: avg(records, 'accuracy') },
  ]);
}
function roleBalance(records = []) {
  const by = countBy(records, 'role');
  return wrap('Role balance', 'Counts players per role, including empty role values.', [
    { label: 'Players analysed', value: records.length },
    ...Object.entries(by).map(([k, v]) => ({ label: `Role: ${k === '' ? '(empty)' : k}`, value: v })),
  ]);
}
function lowWinrateWatchlist(records = []) {
  const low = records.filter((r) => num(r.winrate) < 50);
  return wrap('Low winrate watchlist', 'Counts players below 50 winrate; 0 winrate is preserved, not dropped.', [
    { label: 'Players analysed', value: records.length },
    { label: 'Players below 50 winrate', value: low.length },
    { label: 'Players at exactly 0 winrate', value: records.filter((r) => num(r.winrate) === 0).length },
  ]);
}

module.exports = { COLUMNS, hasProvider, filterRecords, toCsv, toJsonExport, createTaskStore, performanceSummary, roleBalance, lowWinrateWatchlist };
