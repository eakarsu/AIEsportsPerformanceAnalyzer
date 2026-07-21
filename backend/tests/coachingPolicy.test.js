'use strict';
const test = require('node:test'); const assert = require('node:assert/strict'); const { normalizeMetric, assertTransition } = require('../domain/coachingPolicy');
test('metric retains reproducibility metadata', () => assert.deepEqual(normalizeMetric({ numerator: 15, denominator: 20, definitionVersion: 'v2', gamePatch: '14.3', sourceChecksum: 'sha256:x' }), { value: .75, definitionVersion: 'v2', gamePatch: '14.3', sourceChecksum: 'sha256:x' }));
test('consent is mandatory', () => assert.throws(() => assertTransition('ingested', 'metrics_ready', { consentActive: false }), /consent/));
test('only coach approves intervention', () => assert.throws(() => assertTransition('coach_review', 'approved', { consentActive: true, role: 'player' }), /coach/));
