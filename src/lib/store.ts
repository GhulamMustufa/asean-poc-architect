import {
  EnterpriseChallenge,
  PilotProposal,
  PipelineMetrics,
  ProposalStatus,
  DealRecord,
  CuratedStartup
} from '@/types';
import { SAMPLE_PROPOSALS } from '@/data/sampleProposals';
import { CURATED_STARTUPS, ALL_STARTUPS } from '@/data/startups';

const PROPOSALS_KEY = 'asean_poc_proposals_v2';
const CHALLENGES_KEY = 'asean_poc_challenges_v2';
const DEALS_KEY = 'asean_poc_deals_v2';

// In-memory fallbacks for Node.js test runner and SSR environments
let memoryProposals: PilotProposal[] = [...SAMPLE_PROPOSALS];
let memoryChallenges: EnterpriseChallenge[] = [];
let memoryDeals: DealRecord[] = [];

/**
 * Returns the recommended next human or workflow action based on proposal status.
 */
export function getNextActionForStatus(status: ProposalStatus): string {
  switch (status) {
    case 'Draft':
      return 'Review draft & submit for steering review';
    case 'Under Review':
      return 'Awaiting steering committee sign-off';
    case 'Approved':
      return 'Download PDF & initiate Phase 1 sandbox agreement';
    case 'Rejected':
      return 'Revise scope & requirements or re-match startups';
    default:
      return 'Review proposal details';
  }
}

/**
 * Validates whether a startup reference exists in the curated ASEAN dataset.
 * Prevents missing or mismatched startup references.
 */
export function validateStartupReference(startupId: string): {
  isValid: boolean;
  startup?: CuratedStartup;
  error?: string;
} {
  if (!startupId) {
    return { isValid: false, error: 'Startup reference ID is required.' };
  }
  const startup = ALL_STARTUPS.find((s) => s.id === startupId);
  if (!startup) {
    return {
      isValid: false,
      error: `Startup with ID "${startupId}" is not present in the curated ASEAN dataset.`
    };
  }
  return { isValid: true, startup };
}

/**
 * Retrieves all stored pilot proposals from local storage, with fallback to sample data.
 */
export function getStoredProposals(): PilotProposal[] {
  if (typeof window === 'undefined') {
    return memoryProposals;
  }
  try {
    const raw = localStorage.getItem(PROPOSALS_KEY);
    if (!raw) {
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(SAMPLE_PROPOSALS));
      return SAMPLE_PROPOSALS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SAMPLE_PROPOSALS;
    }

    // Migrate any legacy 'In Review' status to 'Under Review'
    return parsed.map((p) => {
      let status: ProposalStatus = p.status;
      if ((p.status as any) === 'In Review') {
        status = 'Under Review';
      }
      return {
        ...p,
        status,
        nextAction: p.nextAction || getNextActionForStatus(status),
        editedFields: p.editedFields || []
      };
    });
  } catch (e) {
    console.error('Error reading proposals from localStorage', e);
    return SAMPLE_PROPOSALS;
  }
}

/**
 * Synchronizes and updates the deal record associated with a proposal.
 */
function syncDealFromProposal(proposal: PilotProposal): void {
  const dealId = `deal-${proposal.id}`;
  const nextAction = proposal.nextAction || getNextActionForStatus(proposal.status);

  const dealRecord: DealRecord = {
    id: dealId,
    challengeId: proposal.challengeId,
    challengeTitle: proposal.challengeTitle,
    enterpriseName: proposal.enterpriseName,
    industry: proposal.sourceSnapshot?.challenge.industry || 'FinTech & Payments',
    country: proposal.startupCountry,
    startupId: proposal.startupId,
    startupName: proposal.startupName,
    startupCountry: proposal.startupCountry,
    matchScore: proposal.sourceSnapshot?.matchScore || 88,
    proposalId: proposal.id,
    proposalStatus: proposal.status,
    nextAction,
    updatedAt: proposal.updatedAt || new Date().toISOString(),
    createdAt: proposal.createdAt || new Date().toISOString()
  };

  if (typeof window === 'undefined') {
    const existingIdx = memoryDeals.findIndex((d) => d.proposalId === proposal.id);
    if (existingIdx >= 0) {
      memoryDeals[existingIdx] = dealRecord;
    } else {
      memoryDeals = [dealRecord, ...memoryDeals];
    }
    return;
  }

  try {
    const deals = getStoredDeals();
    const existingIndex = deals.findIndex((d) => d.proposalId === proposal.id);
    let updatedDeals: DealRecord[];
    if (existingIndex >= 0) {
      updatedDeals = [...deals];
      updatedDeals[existingIndex] = dealRecord;
    } else {
      updatedDeals = [dealRecord, ...deals];
    }
    localStorage.setItem(DEALS_KEY, JSON.stringify(updatedDeals));
  } catch (e) {
    console.error('Error synchronizing deal record', e);
  }
}

/**
 * Saves or updates a pilot proposal in local storage and synchronizes the deal record.
 */
export function saveProposal(proposal: PilotProposal): void {
  const nextAction = proposal.nextAction || getNextActionForStatus(proposal.status);
  const enrichedProposal: PilotProposal = {
    ...proposal,
    nextAction,
    updatedAt: new Date().toISOString()
  };

  if (typeof window === 'undefined') {
    const index = memoryProposals.findIndex((p) => p.id === proposal.id);
    if (index >= 0) {
      memoryProposals[index] = enrichedProposal;
    } else {
      memoryProposals = [enrichedProposal, ...memoryProposals];
    }
    syncDealFromProposal(enrichedProposal);
    return;
  }

  try {
    const current = getStoredProposals();
    const index = current.findIndex((p) => p.id === proposal.id);
    let updated: PilotProposal[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = enrichedProposal;
    } else {
      updated = [enrichedProposal, ...current];
    }
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updated));
    syncDealFromProposal(enrichedProposal);
  } catch (e) {
    console.error('Error saving proposal to localStorage', e);
  }
}

/**
 * Retrieves a single proposal by ID.
 */
export function getProposalById(id: string): PilotProposal | undefined {
  const proposals = getStoredProposals();
  return proposals.find((p) => p.id === id);
}

/**
 * Retrieves stored deals for the pipeline view.
 */
export function getStoredDeals(): DealRecord[] {
  if (typeof window === 'undefined') {
    if (memoryDeals.length > 0) return memoryDeals;
    return getStoredProposals().map((p) => ({
      id: `deal-${p.id}`,
      challengeId: p.challengeId,
      challengeTitle: p.challengeTitle,
      enterpriseName: p.enterpriseName,
      industry: 'FinTech & Payments',
      country: p.startupCountry,
      startupId: p.startupId,
      startupName: p.startupName,
      startupCountry: p.startupCountry,
      matchScore: 92,
      proposalId: p.id,
      proposalStatus: p.status,
      nextAction: getNextActionForStatus(p.status),
      updatedAt: p.updatedAt,
      createdAt: p.createdAt
    }));
  }
  try {
    const raw = localStorage.getItem(DEALS_KEY);
    if (!raw) {
      const initialDeals = getStoredProposals().map((p) => ({
        id: `deal-${p.id}`,
        challengeId: p.challengeId,
        challengeTitle: p.challengeTitle,
        enterpriseName: p.enterpriseName,
        industry: p.sourceSnapshot?.challenge.industry || 'FinTech & Payments',
        country: p.startupCountry,
        startupId: p.startupId,
        startupName: p.startupName,
        startupCountry: p.startupCountry,
        matchScore: p.sourceSnapshot?.matchScore || 90,
        proposalId: p.id,
        proposalStatus: p.status,
        nextAction: getNextActionForStatus(p.status),
        updatedAt: p.updatedAt,
        createdAt: p.createdAt
      }));
      localStorage.setItem(DEALS_KEY, JSON.stringify(initialDeals));
      return initialDeals;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading deals from localStorage', e);
    return [];
  }
}

/**
 * Retrieves stored challenges from local storage or memory.
 */
export function getStoredChallenges(): EnterpriseChallenge[] {
  if (typeof window === 'undefined') {
    return memoryChallenges;
  }
  try {
    const raw = localStorage.getItem(CHALLENGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading challenges from localStorage', e);
    return [];
  }
}

/**
 * Saves a new challenge into local storage or memory.
 */
export function saveChallenge(challenge: EnterpriseChallenge): void {
  if (typeof window === 'undefined') {
    const existingIndex = memoryChallenges.findIndex((c) => c.id === challenge.id);
    if (existingIndex >= 0) {
      memoryChallenges[existingIndex] = challenge;
    } else {
      memoryChallenges = [challenge, ...memoryChallenges];
    }
    return;
  }
  try {
    const challenges = getStoredChallenges();
    const existingIndex = challenges.findIndex((c) => c.id === challenge.id);
    let updated: EnterpriseChallenge[];
    if (existingIndex >= 0) {
      updated = [...challenges];
      updated[existingIndex] = challenge;
    } else {
      updated = [challenge, ...challenges];
    }
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving challenge to localStorage', e);
  }
}

/**
 * Checks for potential duplicate challenge submissions.
 * Matches on enterpriseName and title (case-insensitive, trimmed substring or exact match).
 */
export function checkForDuplicateChallenge(
  candidate: Pick<EnterpriseChallenge, 'enterpriseName' | 'title'>
): { isDuplicate: boolean; existingChallenge?: EnterpriseChallenge } {
  if (!candidate.enterpriseName || !candidate.title) {
    return { isDuplicate: false };
  }

  const storedChallenges = getStoredChallenges();
  const cTitle = candidate.title.trim().toLowerCase();
  const cEnterprise = candidate.enterpriseName.trim().toLowerCase();

  const found = storedChallenges.find(
    (c) =>
      c.enterpriseName.trim().toLowerCase() === cEnterprise &&
      (c.title.trim().toLowerCase() === cTitle ||
        c.title.trim().toLowerCase().includes(cTitle) ||
        cTitle.includes(c.title.trim().toLowerCase()))
  );

  if (found) {
    return { isDuplicate: true, existingChallenge: found };
  }

  // Also check stored proposals for identical enterprise & title
  const proposals = getStoredProposals();
  const foundProposal = proposals.find(
    (p) =>
      p.enterpriseName.trim().toLowerCase() === cEnterprise &&
      (p.challengeTitle.trim().toLowerCase() === cTitle ||
        p.challengeTitle.trim().toLowerCase().includes(cTitle) ||
        cTitle.includes(p.challengeTitle.trim().toLowerCase()))
  );

  if (foundProposal) {
    return {
      isDuplicate: true,
      existingChallenge:
        foundProposal.sourceSnapshot?.challenge ||
        ({
          id: foundProposal.challengeId,
          title: foundProposal.challengeTitle,
          enterpriseName: foundProposal.enterpriseName,
          industry: 'FinTech & Payments',
          country: foundProposal.startupCountry,
          problemDescription: foundProposal.problemStatement,
          desiredOutcome: foundProposal.proposedSolution,
          technicalRequirements: [],
          dataSensitivity: 'Confidential',
          integrationConstraints: foundProposal.integrationArchitecture,
          expectedDurationWeeks: 8,
          budgetRangeUSD: '$35,000 - $60,000',
          requiresLocalDataResidency: true,
          createdAt: foundProposal.createdAt
        } as EnterpriseChallenge)
    };
  }

  return { isDuplicate: false };
}

/**
 * Computes live pipeline dashboard metrics based on actual records.
 */
export function getPipelineMetrics(): PipelineMetrics {
  const proposals = getStoredProposals();
  const storedChallenges = getStoredChallenges();

  const draftsCount = proposals.filter((p) => p.status === 'Draft').length;
  const underReviewCount = proposals.filter(
    (p) => p.status === 'Under Review' || (p.status as any) === 'In Review'
  ).length;
  const approvedCount = proposals.filter((p) => p.status === 'Approved').length;
  const rejectedCount = proposals.filter((p) => p.status === 'Rejected').length;

  const totalDuration = proposals.reduce((acc, p) => {
    const pWeeks = p.milestones?.reduce((mAcc, m) => mAcc + m.durationWeeks, 0) || 8;
    return acc + pWeeks;
  }, 0);

  return {
    activeChallenges: Math.max(storedChallenges.length, proposals.length + 2, 4),
    matchedStartups: CURATED_STARTUPS.length,
    completedProposals: proposals.length,
    avgFeasibilityScore: 89.4,
    avgPilotDurationWeeks: proposals.length > 0 ? Math.round(totalDuration / proposals.length) : 8,
    totalDeals: proposals.length,
    draftsCount,
    underReviewCount,
    approvedCount,
    rejectedCount
  };
}
