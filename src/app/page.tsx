'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { scrollToTop } from '@/lib/scroll';
import { useGenerateProposal } from '@/hooks/useGenerateProposal';
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

  const generateProposal = useGenerateProposal();

  // Load stored proposals and metrics on client mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const goTo = (next: AppView) => {
    navigate(next);
    scrollToTop();
  };

  return (
    <>
      <Navbar
        currentView={view}
        onNavigate={goTo}
        onOpenStartupsModal={() => openDirectory()}
      />

      <main className="app-container" style={{ marginTop: '1.5rem' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
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
            onSelectStartup={(match) => generateProposal.mutate(match)}
            onBackToChallenge={() => navigate('new-challenge')}
            isGeneratingProposal={generateProposal.isPending}
          />
        )}

        {view === 'proposal' && activeProposal && (
          <ProposalWorkspace
            proposal={activeProposal}
            onSave={saveProposal}
            onBack={() => navigate('dashboard')}
          />
        )}
          </motion.div>
        </AnimatePresence>
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
