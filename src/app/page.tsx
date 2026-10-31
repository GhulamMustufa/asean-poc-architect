'use client';

import React, { useEffect, useState } from 'react';
import { MatchResult } from '@/types';
import { generateStructuredProposal } from '@/lib/proposalGenerator';
import { scrollToTop } from '@/lib/scroll';
import { useAppStore, appStore, type AppView } from '@/stores/appStore';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { ChallengeForm } from '@/components/ChallengeForm';
import { MatchResultsView } from '@/components/MatchResultsView';
import { ProposalWorkspace } from '@/components/ProposalWorkspace';
import { StartupsModal } from '@/components/StartupsModal';
import { Footer } from '@/components/Footer';
import { MobileTabBar } from '@/components/MobileTabBar';

export default function Home() {
  const view = useAppStore((s) => s.view);
  const proposals = useAppStore((s) => s.proposals);
  const metrics = useAppStore((s) => s.metrics);
  const challenge = useAppStore((s) => s.challenge);
  const matches = useAppStore((s) => s.matches);
  const activeProposal = useAppStore((s) => s.activeProposal);
  const directoryOpen = useAppStore((s) => s.directory.open);
  const { navigate, hydrate, submitChallenge, openProposal, saveProposal, openDirectory, closeDirectory } =
    appStore.getState();

  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  // Load stored proposals and metrics on client mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const goTo = (next: AppView) => {
    navigate(next);
    scrollToTop();
  };

  const handleSelectStartupForProposal = async (match: MatchResult) => {
    if (!challenge) return;
    setIsGeneratingProposal(true);

    const snapshot = () => ({
      challenge,
      startup: match.startup,
      matchScore: match.overallScore,
      matchReasons: match.matchReasons,
      matchedCapabilities: match.matchedCapabilities,
      capabilityGaps: match.capabilityGaps,
      generatedAt: new Date().toISOString()
    });

    try {
      // Call server-side AI generation route
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge,
          startupId: match.startup.id,
          providerPreference: 'gemini'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result?.proposal) {
          const generatedProposal = data.result.proposal;
          generatedProposal.sourceSnapshot = snapshot();
          saveProposal(generatedProposal);
          setIsGeneratingProposal(false);
          goTo('proposal');
          return;
        }
      }
      throw new Error('Server route returned non-success response');
    } catch (e) {
      console.warn('[Page] Server generation failed or offline, executing client-side fallback orchestrator:', e);
      // Client-side fallback to guarantee zero demo failure
      const fallbackProposal = generateStructuredProposal(challenge, match.startup);
      fallbackProposal.sourceSnapshot = snapshot();
      saveProposal(fallbackProposal);
      setIsGeneratingProposal(false);
      goTo('proposal');
    }
  };

  return (
    <>
      <Navbar
        currentView={view}
        onNavigate={goTo}
        onOpenStartupsModal={() => openDirectory()}
      />

      <main className="app-container" style={{ marginTop: '1.5rem' }}>
        {view === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            proposals={proposals}
            onStartNewPoc={() => goTo('new-challenge')}
            onOpenProposal={(p) => {
              openProposal(p);
              scrollToTop();
            }}
            onOpenStartupsModal={() => openDirectory()}
          />
        )}

        {view === 'new-challenge' && (
          <ChallengeForm
            onSubmit={(c) => {
              submitChallenge(c);
              scrollToTop();
            }}
            onCancel={() => navigate('dashboard')}
          />
        )}

        {view === 'match-results' && challenge && (
          <MatchResultsView
            challenge={challenge}
            matches={matches}
            onSelectStartup={handleSelectStartupForProposal}
            onBackToChallenge={() => navigate('new-challenge')}
            isGeneratingProposal={isGeneratingProposal}
          />
        )}

        {view === 'proposal' && activeProposal && (
          <ProposalWorkspace
            proposal={activeProposal}
            onSave={saveProposal}
            onBack={() => navigate('dashboard')}
          />
        )}
      </main>

      <Footer />

      <MobileTabBar
        currentView={view}
        directoryOpen={directoryOpen}
        onNavigate={goTo}
        onOpenStartupsModal={() => openDirectory()}
      />

      <StartupsModal isOpen={directoryOpen} onClose={closeDirectory} />
    </>
  );
}
