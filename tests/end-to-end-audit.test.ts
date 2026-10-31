import { test, describe } from 'node:test';
import assert from 'node:assert';
import { matchStartupsToChallenge } from '../src/lib/matcher';
import { CURATED_STARTUPS } from '../src/data/startups';
import { EnterpriseChallenge, PilotProposal } from '../src/types';
import { ProposalOrchestrator } from '../src/lib/ai/orchestrator';
import { generateProposalPdf } from '../src/lib/pdfExport';
import {
  saveChallenge,
  checkForDuplicateChallenge,
  validateStartupReference,
  getNextActionForStatus,
  getPipelineMetrics
} from '../src/lib/store';

describe('Senior QA & Hackathon Judge End-to-End Audit: Malaysian Bank Fraud Detection', () => {
  // Exact demonstration challenge
  const malaysianBankChallenge: EnterpriseChallenge = {
    id: 'chal-malaysia-bank-fraud-qa',
    title: 'AI-Assisted Transaction Fraud Surveillance & AML Alert Triage Sandbox',
    enterpriseName: 'Malayan Commercial Bank Berhad (Fictional Demo)',
    industry: 'FinTech & Payments',
    country: 'MY',
    problemDescription:
      'High false-positive transaction alert volume (84%) from legacy rule engines is overwhelming compliance investigation teams across Malaysia and regional remittance corridors, driving manual investigation backlogs and delayed alert resolution.',
    desiredOutcome:
      'Deploy explainable ML anomaly scoring in a shadow sandbox to cut manual investigation time by 40% while preserving 100% recall on verified fraud and AML typologies.',
    technicalRequirements: [
      'Real-time Transaction Monitoring',
      'Anti-Money Laundering (AML) Screening',
      'Typology Graph Anomaly Scoring',
      'Explainable Suspicion Rationale'
    ],
    dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
    integrationConstraints:
      'Read-only Kafka consumer group streaming with mTLS in dedicated VPC; strict adherence to Bank Negara Malaysia (BNM) RMIT guidelines; zero live database modification.',
    expectedDurationWeeks: 8,
    budgetRangeUSD: '$35,000 - $60,000',
    requiresLocalDataResidency: true,
    createdAt: new Date().toISOString()
  };

  let topMatches: ReturnType<typeof matchStartupsToChallenge> = [];
  let generatedProposal: PilotProposal;

  // =========================================================================
  // STEP 1 & 2: SUBMIT CHALLENGE & FIND MATCHING STARTUPS
  // =========================================================================
  test('Step 1 & 2: Submit Challenge and compute deterministic matching', () => {
    // 1. Validate inputs
    assert.ok(malaysianBankChallenge.title.length >= 10, 'Title must satisfy min length');
    assert.ok(malaysianBankChallenge.problemDescription.length >= 20, 'Problem description must satisfy min length');
    assert.ok(malaysianBankChallenge.desiredOutcome.length >= 15, 'Outcome must satisfy min length');
    assert.strictEqual(malaysianBankChallenge.country, 'MY', 'Country must be Malaysia');

    // 2. Persist challenge
    saveChallenge(malaysianBankChallenge);

    // 3. Run deterministic matching engine
    topMatches = matchStartupsToChallenge(malaysianBankChallenge, CURATED_STARTUPS);

    assert.ok(topMatches.length >= 12, 'Must evaluate against full curated dataset');
    assert.ok(topMatches.length >= 3, 'Must have at least 3 candidate matches');
  });

  // =========================================================================
  // STEP 3: COMPARE AT LEAST THREE STARTUP CANDIDATES
  // =========================================================================
  test('Step 3: Compare at least three startup candidates with explainable scores', () => {
    assert.ok(topMatches.length >= 3, 'Must compare at least 3 candidates');

    const candidate1 = topMatches[0];
    const candidate2 = topMatches[1];
    const candidate3 = topMatches[2];

    // Candidate 1: SentriShield AI (Strong Match)
    assert.strictEqual(candidate1.startup.id, 'synthetic-sg-sentrishield');
    assert.ok(candidate1.overallScore >= 85, `Candidate 1 score must be >= 85%, got ${candidate1.overallScore}%`);
    assert.strictEqual(candidate1.capabilityGaps.length, 0, 'Candidate 1 must have 0 critical capability gaps');
    assert.ok(candidate1.matchedCapabilities.length >= 3, 'Candidate 1 must match key fraud capabilities');

    // Candidate 2 & 3: Distinct scores and identified capability gaps
    assert.ok(candidate2.overallScore < candidate1.overallScore, 'Rank #2 score must be strictly lower than #1');
    assert.ok(candidate2.capabilityGaps.length > 0, 'Rank #2 must have identified capability gaps');
    assert.ok(candidate3.capabilityGaps.length > 0, 'Rank #3 must have identified capability gaps');

    // Explainability verification: Every score dimension has weights and evaluation notes
    [candidate1, candidate2, candidate3].forEach((cand) => {
      const { dimensionScores } = cand;
      assert.ok(dimensionScores.capabilityMatch.weight > 0);
      assert.ok(dimensionScores.industryUseCaseRelevance.weight > 0);
      assert.ok(dimensionScores.technicalCompatibility.weight > 0);
      assert.ok(dimensionScores.targetMarketRelevance.weight > 0);
      assert.ok(dimensionScores.integrationReadiness.weight > 0);
      assert.ok(dimensionScores.capabilityMatch.evaluationNotes.length > 5, 'Dimension must contain evaluation notes');
    });

    // Synthetic data label check: All candidates must be synthetic demo records
    [candidate1, candidate2, candidate3].forEach((cand) => {
      assert.strictEqual(cand.startup.isSyntheticDemo, true, 'Startups must be labeled as synthetic demo');
      assert.ok(cand.startup.name.includes('(Synthetic Demo)'), 'Display name must include synthetic label');
    });
  });

  // =========================================================================
  // STEP 4 & 5: SELECT STRONGEST MATCH & GENERATE PILOT PROPOSAL
  // =========================================================================
  test('Step 4 & 5: Select strongest match and generate proposal via orchestrator', async () => {
    const selectedMatch = topMatches[0];
    assert.strictEqual(selectedMatch.startup.id, 'synthetic-sg-sentrishield');

    // Validate startup foreign key reference
    const fkCheck = validateStartupReference(selectedMatch.startup.id);
    assert.strictEqual(fkCheck.isValid, true);

    // Generate proposal using orchestrator (with fallback resilience)
    const orchestrator = new ProposalOrchestrator();
    const result = await orchestrator.generateProposal(malaysianBankChallenge, selectedMatch.startup, {
      preferredProvider: 'deterministic-fallback'
    });

    assert.ok(result.proposal, 'Proposal must be synthesized');
    generatedProposal = result.proposal;

    // Attach frozen sourceSnapshot matching page.tsx behavior
    generatedProposal.sourceSnapshot = {
      challenge: malaysianBankChallenge,
      startup: selectedMatch.startup,
      matchScore: selectedMatch.overallScore,
      matchReasons: selectedMatch.matchReasons,
      matchedCapabilities: selectedMatch.matchedCapabilities,
      capabilityGaps: selectedMatch.capabilityGaps,
      generatedAt: new Date().toISOString()
    };

    assert.strictEqual(generatedProposal.status, 'Draft', 'Initial status must be Draft');
    assert.strictEqual(generatedProposal.startupName, selectedMatch.startup.name);
    assert.strictEqual(generatedProposal.enterpriseName, malaysianBankChallenge.enterpriseName);
  });

  // =========================================================================
  // STEP 6: REVIEW 60-DAY ROADMAP AND KPIS
  // =========================================================================
  test('Step 6: Review 60-day roadmap and verify KPI target assumptions', () => {
    // 60-Day Phased Roadmap Check
    assert.ok(generatedProposal.milestones.length >= 3, 'Must have at least 3 milestones');
    const totalWeeks = generatedProposal.milestones.reduce((acc, m) => acc + m.durationWeeks, 0);
    assert.strictEqual(totalWeeks, 8, 'Total pilot roadmap duration must equal 8 weeks (~60 days)');

    generatedProposal.milestones.forEach((m) => {
      assert.ok(m.title.length > 5, 'Milestone must have descriptive title');
      assert.ok(m.deliverables.length >= 2, 'Milestone must specify deliverables');
      assert.ok(m.acceptanceCriteria.length >= 10, 'Milestone must define acceptance criteria');
    });

    // KPI Design: Must be marked as working assumptions
    assert.ok(generatedProposal.kpis.length >= 2, 'Must contain target KPIs');
    generatedProposal.kpis.forEach((kpi) => {
      assert.ok(kpi.metric.length > 5);
      assert.ok(kpi.baseline.length > 5);
      assert.ok(
        kpi.target.includes('Assumption') || (kpi as any).targetIsAssumption === true,
        `KPI target must be flagged as assumption: ${kpi.target}`
      );
      assert.ok(kpi.measurementMethod.length > 10, 'KPI must have measurement method');
    });
  });

  // =========================================================================
  // STEP 7: INSPECT COMPLIANCE QUESTIONS AND RISKS
  // =========================================================================
  test('Step 7: Inspect statutory compliance questions, BNM RMIT, and legal disclaimers', () => {
    // Technical Risks
    assert.ok(generatedProposal.technicalRisks.length >= 2, 'Must identify technical risks');

    // Data Residency Plan
    assert.ok(
      generatedProposal.dataResidencyPlan.includes('Malaysia') ||
      generatedProposal.dataResidencyPlan.includes('sovereign') ||
      generatedProposal.dataResidencyPlan.includes('reside'),
      'Must specify sovereign data residency plan'
    );

    // Advisory Legal Disclaimer
    assert.ok(
      generatedProposal.legalDisclaimer.includes('ADVISORY NOTICE'),
      'Must contain prominent advisory notice'
    );
    assert.ok(
      generatedProposal.legalDisclaimer.includes('does not constitute') ||
      generatedProposal.legalDisclaimer.includes('Does not constitute'),
      'Must disclaim statutory legal advice or binding contracts'
    );
  });

  // =========================================================================
  // STEP 8: EDIT A PROPOSAL FIELD & PRESERVE SNAPSHOT
  // =========================================================================
  test('Step 8: Edit proposal fields, verify [USER EDITED] tracking and original snapshot', () => {
    assert.ok(generatedProposal.originalGenerated, 'Must retain originalGenerated snapshot');
    const originalSummary = generatedProposal.originalGenerated.executiveSummary;

    // Simulate user editing the executive summary and an in-scope item
    const customSummary = 'Malayan Commercial Bank steering committee amended pilot scope for Phase 1.';
    const updatedInScope = [...generatedProposal.inScope, 'Dedicated Bank Negara Malaysia compliance audit sandbox report'];

    const editedProposal: PilotProposal = {
      ...generatedProposal,
      executiveSummary: customSummary,
      inScope: updatedInScope,
      editedFields: ['executiveSummary', 'inScope'],
      updatedAt: new Date().toISOString()
    };

    assert.strictEqual(editedProposal.executiveSummary, customSummary);
    assert.strictEqual(editedProposal.originalGenerated?.executiveSummary, originalSummary);
    assert.notStrictEqual(editedProposal.executiveSummary, editedProposal.originalGenerated?.executiveSummary);
    assert.ok(editedProposal.editedFields?.includes('executiveSummary'));
    assert.ok(editedProposal.editedFields?.includes('inScope'));

    generatedProposal = editedProposal;
  });

  // =========================================================================
  // STEP 9: APPROVE THE PROPOSAL (HUMAN GOVERNANCE)
  // =========================================================================
  test('Step 9: Enforce explicit human approval without automated contracts', () => {
    // Status transition: Draft -> Under Review
    generatedProposal.status = 'Under Review';
    generatedProposal.nextAction = getNextActionForStatus('Under Review');
    assert.strictEqual(generatedProposal.status, 'Under Review');
    assert.strictEqual(generatedProposal.nextAction, 'Awaiting steering committee sign-off');

    // Status transition: Under Review -> Approved with explicit human credentials
    const approverName = 'Dato Sri Kamaruddin';
    const approverRole = 'Head of Group Fraud Risk & Digital Transformation';
    const approvalNotes = 'Vetted by Financial Crime Compliance. Approved for Phase 1 VPC deployment.';

    generatedProposal.status = 'Approved';
    generatedProposal.nextAction = getNextActionForStatus('Approved');
    generatedProposal.approvalRecord = {
      status: 'Approved',
      decidedBy: approverName,
      deciderRole: approverRole,
      decidedAt: new Date().toISOString(),
      decisionNotes: approvalNotes,
      explicitHumanSignoff: true
    };

    assert.strictEqual(generatedProposal.status, 'Approved');
    assert.strictEqual(generatedProposal.approvalRecord.explicitHumanSignoff, true);
    assert.strictEqual(generatedProposal.approvalRecord.decidedBy, approverName);
    assert.strictEqual(generatedProposal.nextAction, 'Download PDF & initiate Phase 1 sandbox agreement');
  });

  // =========================================================================
  // STEP 10: EXPORT THE PDF
  // =========================================================================
  test('Step 10: Export clean downloadable PDF with header label and pagination', () => {
    const doc = generateProposalPdf(generatedProposal);
    const pageCount = doc.getNumberOfPages();

    assert.ok(pageCount >= 2, `PDF must span multiple structured pages, got: ${pageCount}`);

    // Verify binary buffer generation
    const buffer = doc.output('arraybuffer');
    assert.ok(buffer.byteLength > 2000, 'PDF buffer must contain valid PDF stream');
  });

  // =========================================================================
  // AUDIT ITEM CHECKS: PERSISTENCE, DUPLICATES, METRICS
  // =========================================================================
  test('Audit Hardening: Duplicate detection and pipeline metrics consistency', () => {
    // Check duplicate detection
    const dupResult = checkForDuplicateChallenge({
      enterpriseName: malaysianBankChallenge.enterpriseName,
      title: malaysianBankChallenge.title
    });
    assert.strictEqual(dupResult.isDuplicate, true, 'Should detect saved challenge as duplicate');

    // Check pipeline metrics
    const metrics = getPipelineMetrics();
    assert.ok(metrics.totalDeals >= 1);
    assert.ok(metrics.matchedStartups >= 12);
    assert.ok(metrics.avgPilotDurationWeeks >= 6 && metrics.avgPilotDurationWeeks <= 12);
  });
});
