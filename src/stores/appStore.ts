import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { EnterpriseChallenge, MatchResult, PilotProposal, PipelineMetrics } from '@/types';
import { getStoredProposals, saveProposal as persistProposal, getPipelineMetrics } from '@/lib/store';
import { matchStartupsToChallenge } from '@/lib/matcher';
import { ALL_STARTUPS } from '@/data/startups';

export type AppView = 'dashboard' | 'new-challenge' | 'match-results' | 'proposal';

/** Country code for the directory filter, or 'ALL'. */
export type DirectoryCountry = string;

export interface AppState {
  view: AppView;
  challenge: EnterpriseChallenge | null;
  matches: MatchResult[];
  activeProposal: PilotProposal | null;
  proposals: PilotProposal[];
  metrics: PipelineMetrics;
  directory: { open: boolean; country: DirectoryCountry };
}

export interface AppActions {
  navigate: (view: AppView) => void;
  hydrate: () => void;
  submitChallenge: (challenge: EnterpriseChallenge) => void;
  openProposal: (proposal: PilotProposal) => void;
  setActiveProposal: (proposal: PilotProposal | null) => void;
  saveProposal: (proposal: PilotProposal) => void;
  openDirectory: (country?: DirectoryCountry) => void;
  closeDirectory: () => void;
}

export type AppStore = AppState & AppActions;

export const INITIAL_METRICS: PipelineMetrics = {
  activeChallenges: 4,
  matchedStartups: ALL_STARTUPS.length,
  completedProposals: 2,
  avgFeasibilityScore: 89.4,
  avgPilotDurationWeeks: 8,
  totalDeals: 2,
  draftsCount: 0,
  underReviewCount: 1,
  approvedCount: 1,
  rejectedCount: 0,
};

export const initialAppState = (): AppState => ({
  view: 'dashboard',
  challenge: null,
  matches: [],
  activeProposal: null,
  proposals: [],
  metrics: INITIAL_METRICS,
  directory: { open: false, country: 'ALL' },
});

export function createAppStore(initial: Partial<AppState> = {}) {
  return createStore<AppStore>()((set) => {
    const refresh = () => ({ proposals: getStoredProposals(), metrics: getPipelineMetrics() });

    return {
      ...initialAppState(),
      ...initial,

      navigate: (view) => set({ view }),

      hydrate: () => set(refresh()),

      submitChallenge: (challenge) =>
        set({
          challenge,
          matches: matchStartupsToChallenge(challenge, ALL_STARTUPS),
          view: 'match-results',
        }),

      openProposal: (proposal) => set({ activeProposal: proposal, view: 'proposal' }),

      setActiveProposal: (proposal) => set({ activeProposal: proposal }),

      saveProposal: (proposal) => {
        persistProposal(proposal);
        set({ activeProposal: proposal, ...refresh() });
      },

      openDirectory: (country = 'ALL') => set({ directory: { open: true, country } }),

      closeDirectory: () => set((s) => ({ directory: { ...s.directory, open: false } })),
    };
  });
}

/** Singleton store for the app (client only). */
export const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStore) => T): T {
  return useStore(appStore, selector);
}
