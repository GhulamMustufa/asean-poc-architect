'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MatchResult } from '@/types';
import { generateProposalWithFallback } from '@/lib/generateProposal';
import { appStore } from '@/stores/appStore';
import { scrollToTop } from '@/lib/scroll';

export function useGenerateProposal() {
  return useMutation({
    mutationKey: ['generate-proposal'],
    // The function already falls back offline, so a retry only re-runs a thrown
    // error (e.g. the fallback generator itself failing).
    retry: 1,
    mutationFn: async (match: MatchResult) => {
      const { challenge } = appStore.getState();
      if (!challenge) throw new Error('No active challenge');
      return generateProposalWithFallback({ challenge, match });
    },
    onSuccess: ({ proposal, usedFallback, error }) => {
      if (usedFallback) {
        console.warn('[Proposal] Server generation failed or offline, used client-side fallback:', error);
        toast('Used offline generator', {
          description: 'The AI service was unavailable, so a deterministic draft was created. Review it before sharing.',
        });
      } else {
        toast.success('AI draft ready', { description: `Pilot plan for ${proposal.startupName}.` });
      }
      const { saveProposal, navigate } = appStore.getState();
      saveProposal(proposal);
      navigate('proposal');
      scrollToTop();
    },
    onError: (error) => {
      toast.error('Could not create the pilot plan', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });
}
