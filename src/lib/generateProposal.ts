import type { EnterpriseChallenge, MatchResult, PilotProposal } from '@/types';
import { generateStructuredProposal } from '@/lib/proposalGenerator';

export type Fetcher = (input: string, init?: RequestInit) => Promise<Pick<Response, 'ok' | 'json'>>;

export interface GatewayModelConfig {
  preferredModelId?: string;
  localOnlyMode?: boolean;
  simulateFailure?: boolean;
}

export interface GenerateProposalInput {
  challenge: EnterpriseChallenge;
  match: MatchResult;
  /** User's AI gateway choice from the model switcher. */
  modelConfig?: GatewayModelConfig;
  fetcher?: Fetcher;
  now?: () => Date;
}

export interface GenerateProposalResult {
  proposal: PilotProposal;
  usedFallback: boolean;
  error?: unknown;
}

export const GENERATE_ENDPOINT = '/api/proposals/generate';

export function buildGenerateRequestBody(challenge: EnterpriseChallenge, match: MatchResult, modelConfig: GatewayModelConfig = {}) {
  return {
    challenge,
    startupId: match.startup.id,
    preferredModelId: modelConfig.preferredModelId,
    localOnlyMode: modelConfig.localOnlyMode,
    simulateFailure: modelConfig.simulateFailure,
  };
}

/**
 * Asks the server AI route for a proposal. If it is offline or returns a
 * non-success payload, falls back to the deterministic client generator so
 * the demo never fails. Either way the frozen source snapshot is attached.
 */
export async function generateProposalWithFallback({
  challenge,
  match,
  modelConfig,
  fetcher = (input, init) => fetch(input, init),
  now = () => new Date(),
}: GenerateProposalInput): Promise<GenerateProposalResult> {
  const snapshot = () => ({
    challenge,
    startup: match.startup,
    matchScore: match.overallScore,
    matchReasons: match.matchReasons,
    matchedCapabilities: match.matchedCapabilities,
    capabilityGaps: match.capabilityGaps,
    generatedAt: now().toISOString(),
  });

  try {
    const response = await fetcher(GENERATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildGenerateRequestBody(challenge, match, modelConfig)),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.success && data.result?.proposal) {
        const proposal: PilotProposal = { ...data.result.proposal, sourceSnapshot: snapshot() };
        return { proposal, usedFallback: false };
      }
    }
    throw new Error('Server route returned non-success response');
  } catch (error) {
    const proposal = generateStructuredProposal(challenge, match.startup);
    proposal.sourceSnapshot = snapshot();
    return { proposal, usedFallback: true, error };
  }
}
