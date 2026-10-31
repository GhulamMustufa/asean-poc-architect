'use client';

import React, { useState, useEffect } from 'react';
import { EnterpriseChallenge, MatchResult, PilotProposal, PipelineMetrics } from '@/types';
import { getStoredProposals, saveProposal, getPipelineMetrics } from '@/lib/store';
import { matchStartupsToChallenge } from '@/lib/matcher';
import { ALL_STARTUPS } from '@/data/startups';
import { generateStructuredProposal } from '@/lib/proposalGenerator';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { ChallengeForm } from '@/components/ChallengeForm';
import { MatchResultsView } from '@/components/MatchResultsView';
import { ProposalWorkspace } from '@/components/ProposalWorkspace';
import { StartupsModal } from '@/components/StartupsModal';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-challenge' | 'match-results' | 'proposal'>('dashboard');
  const [proposals, setProposals] = useState<PilotProposal[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    activeChallenges: 4,
    matchedStartups: 12,
    completedProposals: 2,
    avgFeasibilityScore: 89.4,
    avgPilotDurationWeeks: 8,
    totalDeals: 2,
    draftsCount: 0,
    underReviewCount: 1,
    approvedCount: 1,
    rejectedCount: 0
  });

  const [currentChallenge, setCurrentChallenge] = useState<EnterpriseChallenge | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activeProposal, setActiveProposal] = useState<PilotProposal | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [isStartupsModalOpen, setIsStartupsModalOpen] = useState(false);

  // Load initial data on client mount
  useEffect(() => {
    const loadedProposals = getStoredProposals();
    setProposals(loadedProposals);
    setMetrics(getPipelineMetrics());
  }, []);

  const handleStartNewPoc = () => {
    setCurrentView('new-challenge');
  };

  const handleChallengeSubmit = (challenge: EnterpriseChallenge) => {
    setCurrentChallenge(challenge);
    const scoredMatches = matchStartupsToChallenge(challenge, ALL_STARTUPS);
    setMatches(scoredMatches);
    setCurrentView('match-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStartupForProposal = async (match: MatchResult) => {
    if (!currentChallenge) return;
    setIsGeneratingProposal(true);

    try {
      // Call server-side AI generation route
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: currentChallenge,
          startupId: match.startup.id,
          providerPreference: 'gemini'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result?.proposal) {
          const generatedProposal = data.result.proposal;
          generatedProposal.sourceSnapshot = {
            challenge: currentChallenge,
            startup: match.startup,
            matchScore: match.overallScore,
            matchReasons: match.matchReasons,
            matchedCapabilities: match.matchedCapabilities,
            capabilityGaps: match.capabilityGaps,
            generatedAt: new Date().toISOString()
          };
          saveProposal(generatedProposal);
          setProposals(getStoredProposals());
          setMetrics(getPipelineMetrics());
          setActiveProposal(generatedProposal);
          setIsGeneratingProposal(false);
          setCurrentView('proposal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      throw new Error('Server route returned non-success response');
    } catch (e) {
      console.warn('[Page] Server generation failed or offline, executing client-side fallback orchestrator:', e);
      // Client-side fallback to guarantee zero demo failure
      const fallbackProposal = generateStructuredProposal(currentChallenge, match.startup);
      fallbackProposal.sourceSnapshot = {
        challenge: currentChallenge,
        startup: match.startup,
        matchScore: match.overallScore,
        matchReasons: match.matchReasons,
        matchedCapabilities: match.matchedCapabilities,
        capabilityGaps: match.capabilityGaps,
        generatedAt: new Date().toISOString()
      };
      saveProposal(fallbackProposal);
      setProposals(getStoredProposals());
      setMetrics(getPipelineMetrics());
      setActiveProposal(fallbackProposal);
      setIsGeneratingProposal(false);
      setCurrentView('proposal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenProposal = (proposal: PilotProposal) => {
    setActiveProposal(proposal);
    setCurrentView('proposal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProposal = (updatedProposal: PilotProposal) => {
    saveProposal(updatedProposal);
    setActiveProposal(updatedProposal);
    const updatedList = getStoredProposals();
    setProposals(updatedList);
    setMetrics(getPipelineMetrics());
  };

  return (
    <>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenStartupsModal={() => setIsStartupsModalOpen(true)}
      />

      <main className="app-container" style={{ marginTop: '1.5rem' }}>
        {currentView === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            proposals={proposals}
            onStartNewPoc={handleStartNewPoc}
            onOpenProposal={handleOpenProposal}
            onOpenStartupsModal={() => setIsStartupsModalOpen(true)}
          />
        )}

        {currentView === 'new-challenge' && (
          <ChallengeForm
            onSubmit={handleChallengeSubmit}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'match-results' && currentChallenge && (
          <MatchResultsView
            challenge={currentChallenge}
            matches={matches}
            onSelectStartup={handleSelectStartupForProposal}
            onBackToChallenge={() => setCurrentView('new-challenge')}
            isGeneratingProposal={isGeneratingProposal}
          />
        )}

        {currentView === 'proposal' && activeProposal && (
          <ProposalWorkspace
            proposal={activeProposal}
            onSave={handleSaveProposal}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      <StartupsModal
        isOpen={isStartupsModalOpen}
        onClose={() => setIsStartupsModalOpen(false)}
      />
    </>
  );
}
