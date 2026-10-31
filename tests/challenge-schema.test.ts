import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  challengeFormSchema,
  enterpriseChallengeSchema,
  presetToFormValues,
  toEnterpriseChallenge,
  EMPTY_CHALLENGE_FORM,
} from '../src/lib/schemas/challenge';
import { CHALLENGE_PRESETS } from '../src/data/challengePresets';
import { REAL_ENTERPRISE_CHALLENGES } from '../src/data/realChallenges';

describe('Challenge form schema (Zod)', () => {
  test('every demo preset passes form validation', () => {
    for (const p of CHALLENGE_PRESETS) {
      const r = challengeFormSchema.safeParse(presetToFormValues(p.data));
      assert.ok(r.success, `${p.label}: ${r.success ? '' : r.error.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; ')}`);
    }
  });

  test('every real enterprise challenge passes the stored-challenge schema', () => {
    for (const c of REAL_ENTERPRISE_CHALLENGES) {
      const r = enterpriseChallengeSchema.safeParse(c);
      assert.ok(r.success, `${c.id}: ${r.success ? '' : r.error.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; ')}`);
    }
  });

  test('a missing title fails with a field message', () => {
    const r = challengeFormSchema.safeParse({ ...presetToFormValues(CHALLENGE_PRESETS[0].data), title: '' });
    assert.strictEqual(r.success, false);
    const issue = r.error!.issues.find((i) => i.path[0] === 'title');
    assert.ok(issue);
    assert.match(issue!.message, /project title/i);
  });

  test('the empty form reports all required fields', () => {
    const r = challengeFormSchema.safeParse(EMPTY_CHALLENGE_FORM);
    assert.strictEqual(r.success, false);
    const fields = new Set(r.error!.issues.map((i) => i.path[0]));
    for (const f of ['title', 'enterpriseName', 'problemDescription', 'desiredOutcome']) assert.ok(fields.has(f), f);
  });

  test('countries outside the matcher (e.g. BN) are rejected', () => {
    const r = challengeFormSchema.safeParse({ ...presetToFormValues(CHALLENGE_PRESETS[0].data), country: 'BN' });
    assert.strictEqual(r.success, false);
    assert.ok(r.error!.issues.some((i) => i.path[0] === 'country'));
  });

  test('toEnterpriseChallenge keeps the original output shape and defaults', () => {
    const now = new Date('2026-10-31T00:00:00Z');
    const base = presetToFormValues(CHALLENGE_PRESETS[0].data);
    const c = toEnterpriseChallenge({ ...base, technicalRequirementsText: ' A ,, B ', integrationConstraints: ' ' }, now);
    assert.deepStrictEqual(c.technicalRequirements, ['A', 'B']);
    assert.strictEqual(c.integrationConstraints, 'Standard HTTPS REST API with mutual TLS.');
    assert.strictEqual(c.createdAt, now.toISOString());
    assert.ok(c.id.startsWith('chal-'));
    assert.ok(enterpriseChallengeSchema.safeParse(c).success);

    const empty = toEnterpriseChallenge({ ...base, technicalRequirementsText: '' }, now);
    assert.deepStrictEqual(empty.technicalRequirements, ['Core API Integration', 'Data Security Compliance']);
  });
});
