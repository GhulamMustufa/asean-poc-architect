import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateProposalWithFallback, GENERATE_ENDPOINT, type Fetcher } from '../src/lib/generateProposal';
import { matchStartupsToChallenge } from '../src/lib/matcher';
import { ALL_STARTUPS } from '../src/data/startups';
import { REAL_ENTERPRISE_CHALLENGES } from '../src/data/realChallenges';
import { SAMPLE_PROPOSALS } from '../src/data/sampleProposals';

const challenge = REAL_ENTERPRISE_CHALLENGES[0];
const match = matchStartupsToChallenge(challenge, ALL_STARTUPS)[0];
const fixedNow = () => new Date('2026-10-31T08:00:00Z');

function stubFetcher(response: { ok: boolean; body?: unknown } | Error) {
  const calls: { input: string; init?: RequestInit }[] = [];
  const fetcher: Fetcher = async (input, init) => {
    calls.push({ input, init });
    if (response instanceof Error) throw response;
    return { ok: response.ok, json: async () => response.body };
  };
  return { fetcher, calls };
}

describe('generateProposalWithFallback', () => {
  test('success returns the server proposal with the source snapshot attached', async () => {
    const serverProposal = { ...SAMPLE_PROPOSALS[0], id: 'prop-from-server' };
    const { fetcher } = stubFetcher({ ok: true, body: { success: true, result: { proposal: serverProposal } } });
    const r = await generateProposalWithFallback({ challenge, match, fetcher, now: fixedNow });
    assert.strictEqual(r.usedFallback, false);
    assert.strictEqual(r.proposal.id, 'prop-from-server');
    assert.strictEqual(r.proposal.sourceSnapshot?.startup.id, match.startup.id);
    assert.strictEqual(r.proposal.sourceSnapshot?.matchScore, match.overallScore);
    assert.strictEqual(r.proposal.sourceSnapshot?.generatedAt, '2026-10-31T08:00:00.000Z');
  });

  test('network failure falls back to the client generator', async () => {
    const { fetcher } = stubFetcher(new Error('offline'));
    const r = await generateProposalWithFallback({ challenge, match, fetcher, now: fixedNow });
    assert.strictEqual(r.usedFallback, true);
    assert.strictEqual(r.proposal.startupId, match.startup.id);
    assert.strictEqual(r.proposal.sourceSnapshot?.challenge.id, challenge.id);
  });

  test('success:false and HTTP errors also fall back', async () => {
    for (const res of [{ ok: true, body: { success: false } }, { ok: false, body: {} }]) {
      const { fetcher } = stubFetcher(res);
      const r = await generateProposalWithFallback({ challenge, match, fetcher, now: fixedNow });
      assert.strictEqual(r.usedFallback, true);
      assert.ok(r.proposal.sourceSnapshot);
    }
  });

  test('the fetcher receives the expected request', async () => {
    const { fetcher, calls } = stubFetcher({ ok: false });
    await generateProposalWithFallback({ challenge, match, fetcher, now: fixedNow });
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].input, GENERATE_ENDPOINT);
    assert.strictEqual(calls[0].init?.method, 'POST');
    const body = JSON.parse(String(calls[0].init?.body));
    assert.deepStrictEqual(Object.keys(body).sort(), ['challenge', 'providerPreference', 'startupId']);
    assert.strictEqual(body.startupId, match.startup.id);
    assert.strictEqual(body.providerPreference, 'gemini');
    assert.strictEqual(body.challenge.id, challenge.id);
  });
});
