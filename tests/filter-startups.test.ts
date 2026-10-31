import { test, describe } from 'node:test';
import assert from 'node:assert';
import { filterStartups } from '../src/lib/filterStartups';
import { ALL_STARTUPS } from '../src/data/startups';

describe('filterStartups', () => {
  test('no filter returns every startup', () => {
    assert.strictEqual(filterStartups(ALL_STARTUPS).length, ALL_STARTUPS.length);
  });

  test('country SG returns only Singapore startups (case-insensitive)', () => {
    const sg = filterStartups(ALL_STARTUPS, { country: 'sg' });
    assert.ok(sg.length > 0);
    assert.ok(sg.every((s) => s.country === 'SG'));
    assert.strictEqual(sg.length, ALL_STARTUPS.filter((s) => s.country === 'SG').length);
  });

  test('country BN returns no startups', () => {
    assert.deepStrictEqual(filterStartups(ALL_STARTUPS, { country: 'BN' }), []);
  });

  test('verified and sample tiers split the directory', () => {
    const verified = filterStartups(ALL_STARTUPS, { tier: 'VERIFIED' });
    const sample = filterStartups(ALL_STARTUPS, { tier: 'SYNTHETIC' });
    assert.ok(verified.every((s) => !s.isSyntheticDemo));
    assert.ok(sample.every((s) => s.isSyntheticDemo));
    assert.strictEqual(verified.length + sample.length, ALL_STARTUPS.length);
  });

  test('search matches a capability', () => {
    const target = ALL_STARTUPS[0];
    const cap = target.capabilities[0];
    const hits = filterStartups(ALL_STARTUPS, { query: `  ${cap.toUpperCase()} ` });
    assert.ok(hits.some((s) => s.id === target.id));
    assert.ok(hits.every((s) => [s.name, s.tagline, s.primaryIndustry, ...s.capabilities].some((f) => f.toLowerCase().includes(cap.toLowerCase()))));
  });

  test('filters combine', () => {
    const hits = filterStartups(ALL_STARTUPS, { country: 'MY', tier: 'VERIFIED' });
    assert.ok(hits.every((s) => s.country === 'MY' && !s.isSyntheticDemo));
  });
});
