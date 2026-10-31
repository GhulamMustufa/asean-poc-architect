import { test } from 'node:test';
import assert from 'node:assert';
import { getActiveTab } from '../src/lib/navigation';

test('getActiveTab maps views to the 3 mobile tabs', () => {
  assert.strictEqual(getActiveTab('dashboard'), 'dashboard');
  assert.strictEqual(getActiveTab('new-challenge'), 'new');
  assert.strictEqual(getActiveTab('match-results'), 'dashboard');
  assert.strictEqual(getActiveTab('proposal'), 'dashboard');
});

test('an open directory highlights the Directory tab', () => {
  assert.strictEqual(getActiveTab('dashboard', true), 'directory');
  assert.strictEqual(getActiveTab('proposal', true), 'directory');
});
