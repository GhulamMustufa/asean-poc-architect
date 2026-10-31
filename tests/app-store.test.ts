import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createAppStore } from '../src/stores/appStore';
import { REAL_ENTERPRISE_CHALLENGES } from '../src/data/realChallenges';
import { SAMPLE_PROPOSALS } from '../src/data/sampleProposals';

describe('Zustand app store', () => {
  test('navigate changes the view', () => {
    const store = createAppStore();
    assert.strictEqual(store.getState().view, 'dashboard');
    store.getState().navigate('new-challenge');
    assert.strictEqual(store.getState().view, 'new-challenge');
  });

  test('submitChallenge stores the challenge, runs matching and shows results', () => {
    const store = createAppStore();
    const challenge = REAL_ENTERPRISE_CHALLENGES[0];
    store.getState().submitChallenge(challenge);
    const s = store.getState();
    assert.strictEqual(s.view, 'match-results');
    assert.strictEqual(s.challenge, challenge);
    assert.ok(s.matches.length > 0, 'expected at least one match');
    for (let i = 1; i < s.matches.length; i++) {
      assert.ok(s.matches[i - 1].overallScore >= s.matches[i].overallScore, 'matches sorted by score');
    }
  });

  test('openDirectory sets the country and closeDirectory keeps it', () => {
    const store = createAppStore();
    store.getState().openDirectory('MY');
    assert.deepStrictEqual(store.getState().directory, { open: true, country: 'MY' });
    store.getState().closeDirectory();
    assert.deepStrictEqual(store.getState().directory, { open: false, country: 'MY' });
    store.getState().openDirectory();
    assert.deepStrictEqual(store.getState().directory, { open: true, country: 'ALL' });
  });

  test('openProposal sets the active proposal and view', () => {
    const store = createAppStore();
    store.getState().openProposal(SAMPLE_PROPOSALS[0]);
    assert.strictEqual(store.getState().view, 'proposal');
    assert.strictEqual(store.getState().activeProposal?.id, SAMPLE_PROPOSALS[0].id);
  });

  test('saveProposal persists and refreshes proposals and metrics', () => {
    const store = createAppStore();
    store.getState().hydrate();
    const before = store.getState().proposals;
    const edited = { ...before[0], challengeTitle: "Edited by store test", updatedAt: new Date().toISOString() };
    store.getState().saveProposal(edited);
    const s = store.getState();
    assert.strictEqual(s.activeProposal?.challengeTitle, "Edited by store test");
    const saved = s.proposals.find((p) => p.id === edited.id);
    assert.ok(saved, 'saved proposal present in list');
    assert.strictEqual(saved!.challengeTitle, "Edited by store test");
    assert.strictEqual(s.metrics.totalDeals, s.proposals.length);
  });
});
