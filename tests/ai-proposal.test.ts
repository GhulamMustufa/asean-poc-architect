import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ProposalOrchestrator } from '../src/lib/ai/orchestrator';
import { ModelAdapter } from '../src/lib/ai/modelAdapter.interface';
import { FullStructuredProposalStageSchema } from '../src/lib/ai/schemas';
import { CURATED_STARTUPS } from '../src/data/startups';
import { EnterpriseChallenge } from '../src/types';

describe('AI-Powered Pilot Proposal Workflow Tests', () => {
  const sentriShield = CURATED_STARTUPS.find(s => s.id === 'synthetic-sg-sentrishield')!;
  assert.ok(sentriShield, 'SentriShield AI must exist in dataset');

  const sampleChallenge: EnterpriseChallenge = {
    id: 'chal-test-01',
    title: 'Real-time Anti-Money Laundering & Transaction Monitoring for Cross-Border Remittance',
    enterpriseName: 'ASEAN Merchant Bank Group',
    industry: 'FinTech & Payments',
    country: 'SG',
    problemDescription: 'High false-positive alert volume (82%) from legacy rule engines is overwhelming compliance investigation teams across Singapore and Malaysia remittance corridors.',
    desiredOutcome: 'Deploy explainable ML anomaly scoring in a shadow sandbox to decrease false-positive alert volume by 40% while ensuring 100% detection of verified AML typologies.',
    technicalRequirements: ['Kafka Event Streaming', 'Transaction Monitoring', 'Sanction Screening', 'Explainable Suspicion Rationale'],
    dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
    integrationConstraints: 'Must support read-only Kafka consumer group streaming with AES-256 data encryption and zero outbound egress.',
    expectedDurationWeeks: 8,
    budgetRangeUSD: '$35,000 - $60,000',
    requiresLocalDataResidency: true,
    createdAt: new Date().toISOString()
  };

  // =========================================================================
  // TEST 1: SUCCESSFUL MULTI-STAGE GENERATION
  // =========================================================================
  test('Successful Generation: Orchestrator executes all 6 stages and generates 60-day roadmap', async () => {
    const orchestrator = new ProposalOrchestrator();
    const result = await orchestrator.generateProposal(sampleChallenge, sentriShield, {
      preferredProvider: 'deterministic-fallback'
    });

    // Verify Generation Metadata
    assert.ok(result.metadata, 'Result must contain generation metadata');
    assert.strictEqual(result.metadata.provider, 'deterministic-fallback');
    assert.ok(result.metadata.latencyMs >= 0, 'Latency must be tracked');
    assert.ok(result.metadata.completedAt, 'Completion timestamp must be set');

    // Stage 1: Challenge Understanding
    const stage1 = result.stages.challengeUnderstanding;
    assert.ok(stage1.problemSummary.includes(sampleChallenge.enterpriseName), 'Summary must reference enterprise name');
    assert.ok(stage1.desiredBusinessOutcomes.length >= 1, 'Outcomes must be extracted');
    assert.ok(stage1.extractedConstraints.length >= 2, 'Constraints must be extracted');
    assert.ok(stage1.assumptions.length >= 1, 'Assumptions must be specified');

    // Stage 2: Pilot Scoping
    const stage2 = result.stages.pilotScoping;
    assert.ok(stage2.pilotObjective.length > 20, 'Objective must be meaningful');
    assert.ok(stage2.inScope.length >= 2, 'Must define in-scope items');
    assert.ok(stage2.outOfScope.length >= 2, 'Must define out-of-scope boundaries');
    assert.ok(stage2.deliverables.length >= 2, 'Must specify deliverables');

    // Stage 3: 60-Day Roadmap
    const stage3 = result.stages.roadmap;
    assert.strictEqual(stage3.totalDays, 60, 'Roadmap must specify exactly 60 days');
    assert.strictEqual(stage3.milestones.length, 3, 'Must have 3 phased milestones');
    assert.strictEqual(stage3.milestones[0].dayRange, 'Days 1–15', 'Phase 1 must cover Days 1-15');
    assert.strictEqual(stage3.milestones[1].dayRange, 'Days 16–45', 'Phase 2 must cover Days 16-45');
    assert.strictEqual(stage3.milestones[2].dayRange, 'Days 46–60', 'Phase 3 must cover Days 46-60');
    stage3.milestones.forEach((m) => {
      assert.ok(m.title, 'Milestone must have title');
      assert.ok(m.owner, 'Milestone must have designated owner');
      assert.ok(m.acceptanceCriteria, 'Milestone must have acceptance criteria');
    });

    // Stage 4: KPI Design (Targets must be marked as assumptions)
    const stage4 = result.stages.kpiDesign;
    assert.ok(stage4.kpis.length >= 2, 'Must recommend at least 2 measurable KPIs');
    stage4.kpis.forEach((kpi) => {
      assert.strictEqual(kpi.targetIsAssumption, true, 'KPI targets must be marked as assumptions until validated');
      assert.ok(kpi.target.includes('Assumption'), 'KPI target text must explicitly state assumption');
      assert.ok(kpi.measurementMethod, 'KPI must have measurement method');
      assert.ok(kpi.measurementPeriod, 'KPI must have measurement period');
    });

    // Stage 5: Risk & Compliance Review
    const stage5 = result.stages.riskCompliance;
    assert.ok(stage5.dataPrivacyQuestions.length >= 1, 'Must identify privacy questions');
    assert.ok(stage5.securityQuestions.length >= 1, 'Must identify security questions');
    assert.ok(stage5.countrySpecificRequirements.length >= 1, 'Must identify country-specific statutory requirements');
    assert.strictEqual(stage5.countrySpecificRequirements[0].country, 'SG');
    assert.ok(stage5.countrySpecificRequirements[0].jurisdictionMandate.includes('PDPA'), 'Must reference SG PDPA');
    assert.ok(stage5.legalDisclaimer.includes('ADVISORY NOTICE'), 'Must contain mandatory legal disclaimer');

    // Separation Audit (Verified facts vs Assumptions vs Expert Review)
    assert.ok(stage5.separationAudit.verifiedFacts.length >= 2, 'Must list verified facts');
    assert.ok(stage5.separationAudit.unvalidatedAssumptions.length >= 1, 'Must list assumptions');
    assert.ok(stage5.separationAudit.expertReviewRequired.length >= 1, 'Must list expert review points');

    // Stage 6: Final Assembled Proposal
    const proposal = result.proposal;
    assert.ok(proposal.id.startsWith('prop-'), 'Proposal ID must be generated');
    assert.strictEqual(proposal.status, 'Draft', 'Initial status must be Draft');
    assert.strictEqual(proposal.version, 1, 'Initial version must be 1');
    assert.ok(proposal.executiveSummary.length > 50, 'Executive summary must be thorough');
    assert.ok(proposal.raciMatrix.length >= 4, 'RACI matrix must be populated');
  });

  // =========================================================================
  // TEST 2: HANDLING MISSING CHALLENGE DATA
  // =========================================================================
  test('Missing Data: Orchestrator handles sparse challenge inputs gracefully without crashing', async () => {
    const sparseChallenge: EnterpriseChallenge = {
      id: 'chal-sparse-test',
      title: 'Evaluating Digital KYC Ingestion',
      enterpriseName: 'Borneo Trust Bank',
      industry: 'FinTech & Payments',
      country: 'MY',
      problemDescription: 'Need to explore digital KYC automation for retail accounts.',
      desiredOutcome: 'Explore feasibility of automated screening.',
      technicalRequirements: [], // MISSING
      dataSensitivity: 'Confidential',
      integrationConstraints: '', // MISSING
      expectedDurationWeeks: 6,
      budgetRangeUSD: '', // MISSING
      requiresLocalDataResidency: false,
      createdAt: new Date().toISOString()
    };

    const orchestrator = new ProposalOrchestrator();
    const result = await orchestrator.generateProposal(sparseChallenge, sentriShield, {
      preferredProvider: 'deterministic-fallback'
    });

    // Check that missing information is surfaced in Stage 1
    const missingInfo = result.stages.challengeUnderstanding.missingInformation;
    assert.ok(missingInfo.length >= 2, 'Should capture missing technical requirements and integration constraints');
    assert.ok(missingInfo.some(m => m.includes('Technical stack') || m.includes('not supplied')), 'Should note missing stack info');

    // Verify proposal still compiles cleanly
    assert.ok(result.proposal.id, 'Should still produce a valid proposal');
    assert.strictEqual(result.stages.roadmap.totalDays, 60, 'Should preserve 60-day roadmap standard');
  });

  // =========================================================================
  // TEST 3: INVALID / MALFORMED MODEL RESPONSES TRIGGER FALLBACK
  // =========================================================================
  test('Invalid Model Response: Malformed adapter triggers schema rejection and falls back seamlessly', async () => {
    // Create a mock adapter that returns malformed / incomplete JSON violating the schema
    class MalformedMockAdapter implements ModelAdapter {
      name = 'Faulty LLM Model (Simulation)';
      providerId = 'gemini' as const;
      isAvailable() { return true; }
      async generateStages() {
        // Return an object missing required roadmap and KPI fields (violates Zod schema)
        return {
          challengeUnderstanding: {
            problemSummary: 'Too short',
            desiredBusinessOutcomes: [], // Empty (violates .min(1))
            extractedConstraints: [],
            assumptions: [],
            missingInformation: []
          }
        } as any;
      }
    }

    // Orchestrator configured with a faulty adapter
    const orchestrator = new ProposalOrchestrator();
    (orchestrator as any).geminiAdapter = new MalformedMockAdapter();

    const result = await orchestrator.generateProposal(sampleChallenge, sentriShield, {
      preferredProvider: 'gemini',
      maxRetries: 1
    });

    // Assert that the orchestrator caught the schema error and switched to deterministic fallback
    assert.strictEqual(result.metadata.usedFallback, true, 'Must activate fallback when model response is malformed');
    assert.strictEqual(result.metadata.generationStatus, 'fallback', 'Status must be marked as fallback');
    assert.ok(result.proposal.executiveSummary.length > 20, 'Fallback proposal must be complete and valid');
    assert.strictEqual(result.stages.roadmap.totalDays, 60, 'Fallback roadmap must be intact');
  });

  // =========================================================================
  // TEST 4: TIMEOUT AND RETRY LIMIT ENFORCEMENT
  // =========================================================================
  test('Timeout Handling: Slow model exceeding timeout triggers retry limit and falls back safely', async () => {
    // Create an adapter that simulates an unacceptably slow or hanging network call
    class HangingMockAdapter implements ModelAdapter {
      name = 'Hanging Network Model (Simulation)';
      providerId = 'gemini' as const;
      isAvailable() { return true; }
      async generateStages(_c: any, _s: any, options?: { timeoutMs?: number }) {
        const timeout = options?.timeoutMs || 50;
        await new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError: The operation was aborted due to timeout.')), timeout);
        });
        return {} as any;
      }
    }

    const orchestrator = new ProposalOrchestrator();
    (orchestrator as any).geminiAdapter = new HangingMockAdapter();

    const result = await orchestrator.generateProposal(sampleChallenge, sentriShield, {
      preferredProvider: 'gemini',
      timeoutMs: 50,
      maxRetries: 1
    });

    assert.strictEqual(result.metadata.usedFallback, true, 'Should fall back after timeouts');
    assert.ok(result.metadata.attempts >= 1, 'Should track attempted retries');
    assert.ok(result.proposal, 'Proposal must be successfully created by fallback');
  });

  // =========================================================================
  // TEST 5: PRESERVATION OF STRICT TRUTH (NO INVENTED CLAIMS)
  // =========================================================================
  test('Truth Preservation: AI proposal does not claim statutory regulatory authorization', async () => {
    const orchestrator = new ProposalOrchestrator();
    const result = await orchestrator.generateProposal(sampleChallenge, sentriShield);

    // Verify legal disclaimer disclaimer is mandatory and strict
    assert.ok(
      result.stages.riskCompliance.legalDisclaimer.includes('ADVISORY NOTICE'),
      'Disclaimer must be present'
    );
    assert.ok(
      result.stages.riskCompliance.legalDisclaimer.includes('does not constitute') ||
      result.stages.riskCompliance.legalDisclaimer.includes('Does not constitute'),
      'Must disclaim statutory legal approval'
    );

    // Check that country specific requirements require independent legal review
    result.stages.riskCompliance.countrySpecificRequirements.forEach((req) => {
      assert.strictEqual(
        req.status,
        'Requires Independent Legal Review',
        'Requirements must mandate expert review rather than claiming automatic compliance'
      );
    });
  });

});
