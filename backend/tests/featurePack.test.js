'use strict';
const test=require('node:test'); const assert=require('node:assert/strict');
delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
const d=require('../domain/featurePack');
const rows=[{id:1,username:'pro1',game:'Valorant',role:'duelist',kda:0,winrate:0,apm:100,accuracy:50},{id:2,username:'pro2',game:'CS2',role:'',kda:2,winrate:60,apm:200,accuracy:70}];
test('search/filter on main list',()=>{ assert.equal(d.filterRecords(rows,{search:'pro1'}).length,1); assert.equal(d.filterRecords(rows,{role:'duelist'}).length,1); assert.equal(d.filterRecords(rows,{game:'cs2'}).length,1); assert.equal(d.filterRecords(rows,{}).length,2); });
test('CSV/JSON export preserves 0 winrate and empty role',()=>{ const csv=d.toCsv(rows); assert.match(csv,/pro1/); assert.ok(csv.includes(',0,0,')); assert.equal(d.toJsonExport(rows).data[1].role,''); });
test('tasks store user-scoped, preserves false',()=>{ const s=d.createTaskStore(); const t=s.create(1,{title:'Review VOD',completed:false}); assert.equal(s.list(2).length,0); assert.equal(s.update(1,t.id,{completed:false}).completed,false); assert.equal(s.update(2,t.id,{status:'x'}),null); });
test('AI fallback labelled, preserves 0 winrate section',()=>{ const r=d.lowWinrateWatchlist(rows); assert.equal(r.aiGenerated,false); assert.ok(r.sections.some(s=>s.label.includes('exactly 0')&&s.value===1)); const p=d.performanceSummary(rows); assert.ok(p.sections.some(s=>s.label.includes('KDA'))); });
