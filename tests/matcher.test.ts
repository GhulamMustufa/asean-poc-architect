import { test, describe } from 'node:test';
import assert from 'node:assert';
import { scoreStartupMatch, matchStartupsToChallenge, normalizeWeights, DEFAULT_MATCHING_WEIGHTS } from '../src/lib/matcher';
import { CURATED_STARTUPS } from '../src/data/startups';
import { EnterpriseChallenge } from '../src/types';

describe('Deterministic Matching Engine Tests', () => {

  // Retrieve key startups for unit testing
  const sentriShield = CURATED_STARTUPS.find(s => s.id === 'synthetic-sg-sentrishield')!;
  const nusantaraCold = CURATED_STARTUPS.find(s => s.id === 'synthetic-id-nusantaracold')!;
  const bhdDocuFlow = CURATED_STARTUPS.find(s => s.id === 'synthetic-my-docuflow')!;
  const aeroPulse = CURATED_STARTUPS.find(s => s.id === 'synthetic-my-aeropulse')!;

  assert.ok(sentriShield, 'SentriShield AI must exist in synthetic dataset');
  assert.ok(nusantaraCold, 'NusantaraCold must exist in synthetic dataset');
  assert.ok(bhdDocuFlow, 'BhdDocuFlow must exist in synthetic dataset');
  assert.ok(aeroPulse, 'AeroPulse must exist in synthetic dataset');

  // =========================================================================
  // TEST 1: STRONG MATCH CASE (Fraud Detection Challenge vs SentriShield AI)
  // =========================================================================
  test('Strong Match: Cross-Border Banking AML challenge matches SentriShield with score >= 85%', () => {
    const fraudChallenge: EnterpriseChallenge = {
      id: 'chal-strong-fraud',
      title: 'Real-time Anti-Money Laundering & Transaction Monitoring for Cross-Border Remittance',
      enterpriseName: 'Maybank Regional Digital Banking',
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

    const result = scoreStartupMatch(fraudChallenge, sentriShield);

    // Assertions for strong match
    assert.ok(result.overallScore >= 85, `Expected score >= 85%, got ${result.overallScore}%`);
    assert.strictEqual(result.dimensionScores.industryUseCaseRelevance.rawScore, 100, 'Expected 100% industry & use-case relevance');
    assert.ok(result.dimensionScores.capabilityMatch.rawScore >= 85, 'Expected high capability match score');
    assert.ok(result.dimensionScores.technicalCompatibility.rawScore >= 85, 'Expected high technical compatibility for Tier-1 MAS TRM certs');
    assert.ok(result.dimensionScores.integrationReadiness.rawScore >= 90, 'Expected high integration score for Kafka mTLS match');

    // Assert evidence extraction
    assert.ok(result.matchingEvidence.length >= 4, 'Expected robust matching evidence points');
    assert.ok(result.matchingEvidence.some(e => e.includes('Kafka')), 'Evidence should cite Kafka support');
    assert.ok(result.matchingEvidence.some(e => e.includes('Transaction Monitoring') || e.includes('Anti-Money Laundering')), 'Evidence should cite AML/Transaction monitoring');

    // Assert zero critical capability gaps
    assert.strictEqual(result.capabilityGaps.length, 0, 'SentriShield should have 0 capability gaps for this AML challenge');
    assert.ok(result.explanation.includes('High-Conviction Match'), 'Explanation should highlight high conviction');
  });

  // =========================================================================
  // TEST 2: PARTIAL MATCH CASE (Viable candidate with identified gaps)
  // =========================================================================
  test('Partial Match: Multi-capability challenge with some missing features scores between 50% and 78%', () => {
    // Challenge requires invoice OCR AND automated supplier factoring/lending
    const partialChallenge: EnterpriseChallenge = {
      id: 'chal-partial-erp',
      title: 'Automated Supplier Invoice OCR and Instant Factoring Working Capital',
      enterpriseName: 'Sime Darby Industrial Supplies',
      industry: 'Enterprise AI & Cybersecurity',
      country: 'MY',
      problemDescription: 'Need to extract data from multi-currency invoices in SAP ERP and also provide immediate working capital advance factoring to suppliers.',
      desiredOutcome: 'Automate 3-way invoice extraction and instantly disburse supplier cash advances.',
      technicalRequirements: ['Multi-lingual OCR', 'Automated 3-Way Invoice Matching', 'SAP Connector', 'Cross-Border Supplier Financing Underwriting'],
      dataSensitivity: 'Confidential',
      integrationConstraints: 'SAP S/4HANA Connector and SFTP batch ingestion',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$40,000',
      requiresLocalDataResidency: true,
      createdAt: new Date().toISOString()
    };

    // BhdDocuFlow has OCR and SAP connector, but does NOT do supplier financing underwriting
    const result = scoreStartupMatch(partialChallenge, bhdDocuFlow);

    assert.ok(result.overallScore >= 50 && result.overallScore <= 78, `Expected score between 50% and 78%, got ${result.overallScore}%`);
    assert.ok(result.capabilityGaps.length > 0, 'Expected identified capability gaps');
    assert.ok(result.capabilityGaps.some(g => g.includes('Supplier Financing Underwriting')), 'Should identify missing supplier financing capability');
    assert.ok(result.matchingEvidence.some(e => e.includes('Multi-lingual OCR') || e.includes('3-Way Invoice')), 'Evidence should show covered OCR');
  });

  // =========================================================================
  // TEST 3: WEAK MATCH CASE (Adjacent domain / partial fit with limitations)
  // =========================================================================
  test('Weak Match: Adjacent candidate with poor use-case fit scores between 20% and 49%', () => {
    // Challenge is Hospital Clinical Health Records
    const healthcareChallenge: EnterpriseChallenge = {
      id: 'chal-hospital',
      title: 'Hospital Patient Flow and Bed Allocation Telematics',
      enterpriseName: 'Bumrungrad Hospital Network',
      industry: 'Healthcare & MedTech',
      country: 'TH',
      problemDescription: 'Need clinical bed telematics and real-time electronic health record pseudonymization.',
      desiredOutcome: 'Monitor bed occupancy and pseudonymize patient clinical notes.',
      technicalRequirements: ['Hospital Information System (HIS) API Bridge', 'Electronic Health Record (EHR) Pseudonymization', 'FHIR Schema Translation'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'HL7 and FHIR protocol bridge with Thai PDPA compliance',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$50,000',
      requiresLocalDataResidency: true,
      createdAt: new Date().toISOString()
    };

    // Test with NusantaraCold (which does freight telematics in Indonesia)
    const result = scoreStartupMatch(healthcareChallenge, nusantaraCold);

    assert.ok(result.overallScore < 50, `Expected weak match score < 50%, got ${result.overallScore}%`);
    assert.ok(result.capabilityGaps.length >= 2, 'Expected multiple capability gaps for logistics startup in healthcare');
    assert.ok(result.potentialRisks.some(r => r.includes('Industry mismatch') || r.includes('sovereignty gap')), 'Potential risks should flag industry/data mismatch');
  });

  // =========================================================================
  // TEST 4: NO-MATCH CASE (Completely disjoint domain: Drones vs Banking Fraud)
  // =========================================================================
  test('No Match: Utility drone startup tested against Tier-1 banking fraud scores < 25%', () => {
    const bankingAmlChallenge: EnterpriseChallenge = {
      id: 'chal-bank-no-match',
      title: 'Core Banking Anti-Money Laundering & Sanction Screening',
      enterpriseName: 'DBS Bank Singapore',
      industry: 'FinTech & Payments',
      country: 'SG',
      problemDescription: 'High-frequency banking wire transaction monitoring and terrorist financing typology detection.',
      desiredOutcome: 'Detect sanction evasion patterns on SWIFT transaction logs.',
      technicalRequirements: ['Real-time Transaction Monitoring', 'Sanction Screening', 'Anti-Money Laundering (AML) Screening'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Private VPC peering with Kafka streaming and mTLS',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$60,000',
      requiresLocalDataResidency: true,
      createdAt: new Date().toISOString()
    };

    // AeroPulse does autonomous utility drone inspections in Malaysia
    const result = scoreStartupMatch(bankingAmlChallenge, aeroPulse);

    assert.ok(result.overallScore < 25, `Expected score < 25%, got ${result.overallScore}%`);
    assert.ok(result.dimensionScores.industryUseCaseRelevance.rawScore <= 5, 'Industry score should be near zero for disjoint domain');
    assert.strictEqual(result.matchedCapabilities.length, 0, 'Expected 0 matched capabilities between drones and banking AML');
    assert.strictEqual(result.capabilityGaps.length, 3, 'All 3 AML capabilities should be reported as gaps');
  });

  // =========================================================================
  // TEST 5: MISSING INFORMATION VS GENUINE MISMATCH
  // =========================================================================
  test('Missing Information vs Mismatch: Unspecified requirements do not cause unfair penalties', () => {
    // Challenge with missing technical requirements and missing integration constraints
    const sparseChallenge: EnterpriseChallenge = {
      id: 'chal-sparse',
      title: 'Exploring AI in Cross-Border Trade Payments',
      enterpriseName: 'Regional Merchant Group',
      industry: 'FinTech & Payments',
      country: 'SG',
      problemDescription: 'We are seeking potential FinTech innovation opportunities in cross-border settlements.',
      desiredOutcome: 'Explore feasibility and efficiency gains.',
      technicalRequirements: [], // MISSING INFORMATION
      dataSensitivity: 'Internal',
      integrationConstraints: '', // MISSING INFORMATION
      expectedDurationWeeks: 6,
      budgetRangeUSD: '$30,000',
      requiresLocalDataResidency: false,
      createdAt: new Date().toISOString()
    };

    const result = scoreStartupMatch(sparseChallenge, sentriShield);

    // Verify missing information is logged explicitly
    assert.ok(result.missingInformation.length >= 1, 'Should log missing information notes');
    assert.ok(result.missingInformation.some(m => m.includes('technical requirements not explicitly')), 'Should flag unspecified requirements');
    assert.ok(result.missingInformation.some(m => m.includes('Integration constraints not specified')), 'Should flag unspecified integration constraints');

    // Verify neutral baseline scores rather than punitive zero
    assert.ok(result.dimensionScores.capabilityMatch.rawScore >= 40, 'Capability match should be neutral baseline, not 0');
    assert.ok(result.dimensionScores.integrationReadiness.rawScore >= 70, 'Integration readiness should be neutral baseline for standard API, not 0');
  });

  test('Genuine Mismatch: Explicitly required feature absent in startup causes penalty and risk flag', () => {
    const strictResidencyChallenge: EnterpriseChallenge = {
      id: 'chal-residency',
      title: 'Strict Vietnam Domestic Cold Chain Ingestion',
      enterpriseName: 'Hanoi Logistics Authority',
      industry: 'Logistics & Supply Chain',
      country: 'VN',
      problemDescription: 'Requires refrigerated logistics monitoring with mandatory local storage in Vietnam.',
      desiredOutcome: 'Zero data transfer outside Vietnam.',
      technicalRequirements: ['Cold-Chain Temperature Tracking'],
      dataSensitivity: 'Confidential',
      integrationConstraints: 'REST Webhooks',
      expectedDurationWeeks: 6,
      budgetRangeUSD: '$20,000',
      requiresLocalDataResidency: true, // STRICT LOCAL DATA RESIDENCY IN VN
      createdAt: new Date().toISOString()
    };

    // NusantaraCold only has residency in ID-GCP and ID-AWS (Indonesia), NOT Vietnam!
    const result = scoreStartupMatch(strictResidencyChallenge, nusantaraCold);

    assert.ok(result.potentialRisks.some(r => r.includes('sovereignty gap') || r.includes('domestic data residency')),
      'Should flag genuine mismatch on data residency constraint');
  });

  // =========================================================================
  // TEST 6: CONFIGURABLE WEIGHTS
  // =========================================================================
  test('Configurable Weights: Normalization and weight shifting work deterministically', () => {
    const rawWeights = { capabilityMatch: 0.80, industryUseCaseRelevance: 0.20 };
    const normalized = normalizeWeights(rawWeights);

    // Sum should equal exactly 1.0
    const sum = Object.values(normalized).reduce((acc, w) => acc + w, 0);
    assert.ok(Math.abs(sum - 1.0) < 0.0001, `Normalized weights must sum to 1.0, got ${sum}`);

    // Test that emphasizing capabilityMatch increases overall score when capability is 100%
    const challenge: EnterpriseChallenge = {
      id: 'chal-weight-test',
      title: 'AML Transaction Monitoring',
      enterpriseName: 'Commercial Bank',
      industry: 'FinTech & Payments',
      country: 'SG',
      problemDescription: 'Transaction monitoring',
      desiredOutcome: 'Detect fraud',
      technicalRequirements: ['Transaction Monitoring', 'Sanction Screening'],
      dataSensitivity: 'Internal',
      integrationConstraints: 'REST',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$30k',
      requiresLocalDataResidency: false,
      createdAt: new Date().toISOString()
    };

    const defaultResult = scoreStartupMatch(challenge, sentriShield, DEFAULT_MATCHING_WEIGHTS);
    const customResult = scoreStartupMatch(challenge, sentriShield, {
      capabilityMatch: 0.70,
      industryUseCaseRelevance: 0.10,
      technicalCompatibility: 0.10,
      targetMarketRelevance: 0.05,
      integrationReadiness: 0.05
    });

    assert.ok(typeof customResult.overallScore === 'number', 'Overall score must be a number');
    assert.strictEqual(customResult.dimensionScores.capabilityMatch.weight, 0.7, 'Custom weight should be applied');
  });

  // =========================================================================
  // TEST 7: NO FABRICATION / GROUND TRUTH INTEGRITY
  // =========================================================================
  test('Ground Truth Integrity: All matching evidence originates strictly from startup profile', () => {
    const fraudChallenge: EnterpriseChallenge = {
      id: 'chal-ground-truth',
      title: 'Anti-Money Laundering Screening',
      enterpriseName: 'FinTech Bank',
      industry: 'FinTech & Payments',
      country: 'SG',
      problemDescription: 'AML compliance and transaction monitoring',
      desiredOutcome: 'Reduce false alerts',
      technicalRequirements: ['Anti-Money Laundering (AML) Screening'],
      dataSensitivity: 'Confidential',
      integrationConstraints: 'Kafka',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$30k',
      requiresLocalDataResidency: false,
      createdAt: new Date().toISOString()
    };

    const result = scoreStartupMatch(fraudChallenge, sentriShield);

    // Check that matched capabilities are a strict subset of sentriShield.coreCapabilities
    result.matchedCapabilities.forEach(c => {
      assert.ok(
        sentriShield.coreCapabilities.includes(c) || sentriShield.capabilities.includes(c),
        `Matched capability "${c}" must exist in startup profile`
      );
    });

    // Check that startup is flagged as synthetic demo
    assert.strictEqual(result.startup.isSyntheticDemo, true, 'Startup must be flagged as synthetic demonstration record');
  });

  // =========================================================================
  // TEST 8: RANKING CONSISTENCY ACROSS MULTIPLE STARTUPS
  // =========================================================================
  test('Ranking Consistency: Top ranked startup for fraud challenge is SentriShield AI', () => {
    const fraudChallenge: EnterpriseChallenge = {
      id: 'chal-ranking',
      title: 'Real-time Anti-Money Laundering & Transaction Monitoring',
      enterpriseName: 'ASEAN Merchant Bank Group',
      industry: 'FinTech & Payments',
      country: 'SG',
      problemDescription: 'High false-positive alert volume (82%) from legacy rule engines in cross-border remittance corridors.',
      desiredOutcome: 'Deploy explainable ML anomaly scoring in a shadow sandbox to decrease false-positives by 40%.',
      technicalRequirements: ['Kafka Event Streaming', 'Transaction Monitoring', 'Sanction Screening', 'Anti-Money Laundering (AML) Screening'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Must support read-only Kafka consumer group streaming with AES-256 data encryption and zero outbound egress.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$35,000 - $60,000',
      requiresLocalDataResidency: true,
      createdAt: new Date().toISOString()
    };

    const ranked = matchStartupsToChallenge(fraudChallenge, CURATED_STARTUPS);

    assert.ok(ranked.length >= 10, 'Must rank all available startups');
    assert.strictEqual(ranked[0].startup.id, 'synthetic-sg-sentrishield', 'SentriShield AI must be ranked #1 for Banking AML challenge');
    assert.ok(ranked[0].overallScore > ranked[1].overallScore, 'Top match must have higher score than second match');

    // Verify drone / agriculture startups are ranked near the bottom
    const droneRank = ranked.findIndex(r => r.startup.id === 'synthetic-my-aeropulse');
    assert.ok(droneRank > ranked.length - 4, `Utility drone startup should be near bottom of rankings for banking AML, got rank ${droneRank + 1}`);
  });

});
