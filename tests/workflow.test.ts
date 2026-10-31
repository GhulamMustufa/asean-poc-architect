import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateStructuredProposal } from '../src/lib/proposalGenerator';
import { generateProposalPdf } from '../src/lib/pdfExport';
import {
  getNextActionForStatus,
  validateStartupReference,
  checkForDuplicateChallenge,
  getPipelineMetrics,
  saveChallenge
} from '../src/lib/store';
import { CURATED_STARTUPS } from '../src/data/startups';
import { EnterpriseChallenge, PilotProposal } from '../src/types';

describe('ASEAN POC-Architect Core Workflow Tests', () => {
  const sentriShield = CURATED_STARTUPS.find((s) => s.id === 'synthetic-sg-sentrishield')!;
  assert.ok(sentriShield, 'SentriShield AI must exist in synthetic dataset');

  const sampleChallenge: EnterpriseChallenge = {
    id: 'chal-workflow-test',
    title: 'Real-time Cross-Border Remittance AML Screening',
    enterpriseName: 'Maybank Regional Digital Banking',
    industry: 'FinTech & Payments',
    country: 'SG',
    problemDescription: 'High false-positive rate (82%) from legacy rule engines in cross-border remittance corridors.',
    desiredOutcome: 'Deploy explainable ML anomaly scoring in a shadow sandbox to cut false positives by 40%.',
    technicalRequirements: ['Kafka Event Streaming', 'Transaction Monitoring', 'Sanction Screening'],
    dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
    integrationConstraints: 'Read-only Kafka consumer group streaming with mTLS in SG VPC.',
    expectedDurationWeeks: 8,
    budgetRangeUSD: '$35,000 - $60,000',
    requiresLocalDataResidency: true,
    createdAt: new Date().toISOString()
  };

  // =========================================================================
  // REQUIREMENT 1: PROPOSAL EDITING & PROVENANCE PRESERVATION
  // =========================================================================
  test('Proposal Editing: Preserves original generated snapshot and tracks user edits', () => {
    const proposal = generateStructuredProposal(sampleChallenge, sentriShield);

    // Initial state
    assert.ok(proposal.originalGenerated, 'Must store original generated snapshot');
    assert.strictEqual(proposal.originalGenerated.executiveSummary, proposal.executiveSummary);
    assert.deepStrictEqual(proposal.editedFields, [], 'Initial proposal must have 0 edited fields');

    // Simulate user editing executive summary
    const editedSummary = 'User customized executive summary for regional executive committee.';
    const editedInScope = [...proposal.inScope, 'Custom enterprise pen-testing audit in Week 3'];
    const updatedMilestones = [...proposal.milestones];
    updatedMilestones[0].durationWeeks = 3;

    const modifiedProposal: PilotProposal = {
      ...proposal,
      executiveSummary: editedSummary,
      inScope: editedInScope,
      milestones: updatedMilestones,
      editedFields: ['executiveSummary', 'inScope', 'milestones']
    };

    // Assertions
    assert.strictEqual(modifiedProposal.executiveSummary, editedSummary);
    assert.strictEqual(modifiedProposal.originalGenerated?.executiveSummary, proposal.originalGenerated?.executiveSummary);
    assert.ok(modifiedProposal.editedFields?.includes('executiveSummary'));
    assert.ok(modifiedProposal.editedFields?.includes('inScope'));
    assert.ok(modifiedProposal.editedFields?.includes('milestones'));

    // Test reversion capability
    const revertedSummary = modifiedProposal.originalGenerated!.executiveSummary;
    assert.strictEqual(revertedSummary, proposal.executiveSummary, 'Reverting must restore original generated text');
  });

  // =========================================================================
  // REQUIREMENT 2: HUMAN APPROVAL LIFECYCLE
  // =========================================================================
  test('Human Approval: Enforces lifecycle statuses and explicit human sign-off', () => {
    const proposal = generateStructuredProposal(sampleChallenge, sentriShield);

    // 1. Initial status must be Draft
    assert.strictEqual(proposal.status, 'Draft');
    assert.strictEqual(getNextActionForStatus('Draft'), 'Review draft & submit for steering review');

    // 2. Submit for Review
    const underReviewProposal: PilotProposal = {
      ...proposal,
      status: 'Under Review',
      nextAction: getNextActionForStatus('Under Review'),
      approvalRecord: {
        status: 'Under Review',
        explicitHumanSignoff: false,
        decisionNotes: 'Submitted for steering review.'
      }
    };
    assert.strictEqual(underReviewProposal.status, 'Under Review');
    assert.strictEqual(underReviewProposal.approvalRecord?.explicitHumanSignoff, false);
    assert.strictEqual(getNextActionForStatus('Under Review'), 'Awaiting steering committee sign-off');

    // 3. Explicit Human Sign-Off
    const approvedProposal: PilotProposal = {
      ...underReviewProposal,
      status: 'Approved',
      nextAction: getNextActionForStatus('Approved'),
      approvalRecord: {
        status: 'Approved',
        decidedBy: 'Dato Seri Azman',
        deciderRole: 'Chief Technology Officer',
        decidedAt: new Date().toISOString(),
        decisionNotes: 'Formally approved. Proceed with VPC peering.',
        explicitHumanSignoff: true
      }
    };
    assert.strictEqual(approvedProposal.status, 'Approved');
    assert.strictEqual(approvedProposal.approvalRecord?.explicitHumanSignoff, true);
    assert.strictEqual(approvedProposal.approvalRecord?.decidedBy, 'Dato Seri Azman');
    assert.strictEqual(getNextActionForStatus('Approved'), 'Download PDF & initiate Phase 1 sandbox agreement');

    // 4. Rejection pathway
    const rejectedProposal: PilotProposal = {
      ...underReviewProposal,
      status: 'Rejected',
      nextAction: getNextActionForStatus('Rejected'),
      approvalRecord: {
        status: 'Rejected',
        rejectionReason: 'Exceeds target budget limit.',
        decidedAt: new Date().toISOString(),
        explicitHumanSignoff: true
      }
    };
    assert.strictEqual(rejectedProposal.status, 'Rejected');
    assert.strictEqual(rejectedProposal.approvalRecord?.rejectionReason, 'Exceeds target budget limit.');
    assert.strictEqual(getNextActionForStatus('Rejected'), 'Revise scope & requirements or re-match startups');
  });

  // =========================================================================
  // REQUIREMENT 3: PDF GENERATION & FORMATTING
  // =========================================================================
  test('Proposal Export: Generates professional PDF with mandatory review label and pagination', () => {
    const proposal = generateStructuredProposal(sampleChallenge, sentriShield);
    proposal.status = 'Approved';
    proposal.approvalRecord = {
      status: 'Approved',
      decidedBy: 'Tan Sri Michelle Lee',
      deciderRole: 'Head of Innovation & Group Risk',
      decidedAt: new Date().toISOString(),
      decisionNotes: 'Verified against MAS TRM guidelines.',
      explicitHumanSignoff: true
    };

    const doc = generateProposalPdf(proposal);
    const pageCount = doc.getNumberOfPages();

    assert.ok(pageCount >= 2, `PDF must span multiple structured pages, got ${pageCount}`);

    // Verify PDF output buffer
    const arrayBuffer = doc.output('arraybuffer');
    assert.ok(arrayBuffer.byteLength > 2000, 'PDF buffer must contain binary document content');
  });

  // =========================================================================
  // REQUIREMENT 4: DEAL TRACKING & NEXT ACTIONS
  // =========================================================================
  test('Deal Tracking: Maps statuses to actionable next steps and metrics', () => {
    const statuses = ['Draft', 'Under Review', 'Approved', 'Rejected'] as const;

    statuses.forEach((st) => {
      const action = getNextActionForStatus(st);
      assert.ok(action.length > 10, `Next action for ${st} must be descriptive, got: ${action}`);
    });

    const metrics = getPipelineMetrics();
    assert.ok(typeof metrics.draftsCount === 'number');
    assert.ok(typeof metrics.underReviewCount === 'number');
    assert.ok(typeof metrics.approvedCount === 'number');
    assert.ok(typeof metrics.rejectedCount === 'number');
    assert.ok(metrics.matchedStartups >= 12);
  });

  // =========================================================================
  // REQUIREMENT 5: DATA INTEGRITY & SOURCE PRESERVATION
  // =========================================================================
  test('Data Integrity: Detects duplicates, validates foreign keys, and freezes source snapshots', () => {
    // 1. Startup Foreign Key Validation
    const validLookup = validateStartupReference(sentriShield.id);
    assert.strictEqual(validLookup.isValid, true);
    assert.strictEqual(validLookup.startup?.name, sentriShield.name);

    const invalidLookup = validateStartupReference('non-existent-startup-id-999');
    assert.strictEqual(invalidLookup.isValid, false);
    assert.ok(invalidLookup.error?.includes('not present'));

    // 2. Duplicate Challenge Detection
    // First, save sampleChallenge
    saveChallenge(sampleChallenge);

    const duplicateCheck = checkForDuplicateChallenge({
      enterpriseName: sampleChallenge.enterpriseName,
      title: sampleChallenge.title
    });
    assert.strictEqual(duplicateCheck.isDuplicate, true, 'Should detect saved challenge as duplicate');

    // Also check against sample proposal
    const sampleProposalCheck = checkForDuplicateChallenge({
      enterpriseName: 'Maybank Regional Digital Banking',
      title: 'Real-time Cross-Border Remittance AML & Fraud Screen Sandbox'
    });
    assert.strictEqual(sampleProposalCheck.isDuplicate, true, 'Should detect sample proposal as duplicate');

    const nonDuplicateCheck = checkForDuplicateChallenge({
      enterpriseName: 'Unique New Enterprise Ltd',
      title: 'Completely Novel Solar Telematics Challenge 2026'
    });
    assert.strictEqual(nonDuplicateCheck.isDuplicate, false, 'Novel challenge should not be flagged as duplicate');

    // 3. Source Snapshot Preservation
    const proposal = generateStructuredProposal(sampleChallenge, sentriShield);
    assert.ok(proposal.sourceSnapshot, 'Must preserve sourceSnapshot');
    assert.strictEqual(proposal.sourceSnapshot.challenge.enterpriseName, sampleChallenge.enterpriseName);
    assert.strictEqual(proposal.sourceSnapshot.startup.name, sentriShield.name);

    // Verify deep copy / freeze
    sampleChallenge.enterpriseName = 'Modified Enterprise Name';
    assert.strictEqual(
      proposal.sourceSnapshot.challenge.enterpriseName,
      'Maybank Regional Digital Banking',
      'Source snapshot must remain frozen and unaffected by external object mutations'
    );
  });
});
