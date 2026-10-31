import {
  CuratedStartup,
  EnterpriseChallenge,
  MatchingWeights,
  MatchResult,
  DimensionScores,
  MatchScoreBreakdown
} from '@/types';
import { CURATED_STARTUPS } from '@/data/startups';

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  capabilityMatch: 0.30,
  industryUseCaseRelevance: 0.25,
  technicalCompatibility: 0.15,
  targetMarketRelevance: 0.15,
  integrationReadiness: 0.15
};

/**
 * Normalizes user-supplied weights so their sum equals exactly 1.0.
 */
export function normalizeWeights(weights?: Partial<MatchingWeights>): MatchingWeights {
  const merged: MatchingWeights = {
    ...DEFAULT_MATCHING_WEIGHTS,
    ...(weights || {})
  };

  const total =
    merged.capabilityMatch +
    merged.industryUseCaseRelevance +
    merged.technicalCompatibility +
    merged.targetMarketRelevance +
    merged.integrationReadiness;

  if (total <= 0) {
    return { ...DEFAULT_MATCHING_WEIGHTS };
  }

  return {
    capabilityMatch: merged.capabilityMatch / total,
    industryUseCaseRelevance: merged.industryUseCaseRelevance / total,
    technicalCompatibility: merged.technicalCompatibility / total,
    targetMarketRelevance: merged.targetMarketRelevance / total,
    integrationReadiness: merged.integrationReadiness / total
  };
}

/**
 * Helper to check semantic overlap between a requirement and a list of capability strings.
 * Avoids false-positive keyword overlap on trivial stop words like "data", "real-time", "system".
 */
function isCapabilityCovered(requirement: string, capabilities: string[]): { covered: boolean; matchedCapability?: string } {
  const reqNormalized = requirement.trim().toLowerCase();
  if (!reqNormalized) return { covered: false };

  // Common synonym / equivalence dictionary for ASEAN enterprise domains
  const SYNONYMS: Record<string, string[]> = {
    'aml': ['anti-money laundering', 'transaction monitoring', 'sanction screening', 'financial crime'],
    'anti-money laundering': ['aml', 'transaction monitoring', 'sanction & pep screening'],
    'fraud': ['fraud prevention', 'transaction monitoring', 'anomaly detection', 'anti-fraud'],
    'transaction monitoring': ['aml', 'real-time transaction monitoring', 'fraud'],
    'ocr': ['document extraction', 'intelligent document processing', 'invoice matching'],
    'invoice': ['invoice extraction', 'invoice matching', 'b2b procurement', 'e-tax invoice'],
    'cold-chain': ['cold-chain temperature tracking', 'temperature telematics', 'reefer container'],
    'iot': ['iot sensor', 'telematics', 'gps & ble temperature', 'smart meter'],
    'telematics': ['iot telematics', 'real-time gps', 'fleet dispatch'],
    'his': ['hospital information system', 'clinical appointment', 'ehr'],
    'ehr': ['electronic health record', 'fhir', 'hl7', 'his'],
    'ewa': ['earned wage access', 'payroll integration', 'salary deduction'],
    'payroll': ['hris & payroll', 'earned wage', 'salary deduction'],
    'confidential computing': ['enclaves', 'secure multi-party computation', 'amd sev', 'intel sgx'],
    'drone': ['autonomous drone', 'aerial inspection', 'point cloud processing'],
    'carbon': ['scope 1-2-3', 'cbam', 'greenhouse gas', 'emission calculations']
  };

  for (const cap of capabilities) {
    const capNormalized = cap.trim().toLowerCase();

    // 1. Direct equality or substring containment
    if (capNormalized === reqNormalized || capNormalized.includes(reqNormalized) || reqNormalized.includes(capNormalized)) {
      return { covered: true, matchedCapability: cap };
    }

    // 2. Check synonyms
    for (const [key, synList] of Object.entries(SYNONYMS)) {
      if (reqNormalized.includes(key) && (capNormalized.includes(key) || synList.some(s => capNormalized.includes(s)))) {
        return { covered: true, matchedCapability: cap };
      }
    }

    // 3. Significant token intersection (excluding short/stop words)
    const reqTokens = reqNormalized.split(/[\s/,-]+/).filter(t => t.length >= 4 && !['real', 'time', 'system', 'based', 'with', 'from', 'into'].includes(t));
    const capTokens = capNormalized.split(/[\s/,-]+/).filter(t => t.length >= 4 && !['real', 'time', 'system', 'based', 'with', 'from', 'into'].includes(t));
    
    const overlapCount = reqTokens.filter(t => capTokens.includes(t)).length;
    if (reqTokens.length > 0 && overlapCount >= Math.min(2, reqTokens.length)) {
      return { covered: true, matchedCapability: cap };
    }
  }

  return { covered: false };
}

/**
 * Deterministic Matching Engine
 * 
 * Compares an EnterpriseChallenge against a CuratedStartup across 5 configurable dimensions:
 * 1. Capability Match (30%)
 * 2. Industry & Use-Case Relevance (25%)
 * 3. Technical Compatibility (15%)
 * 4. Target Market Relevance (15%)
 * 5. Integration Readiness (15%)
 */
export function scoreStartupMatch(
  challenge: EnterpriseChallenge,
  startup: CuratedStartup,
  customWeights?: Partial<MatchingWeights>
): MatchResult {
  const weights = normalizeWeights(customWeights);
  const matchingEvidence: string[] = [];
  const capabilityGaps: string[] = [];
  const potentialRisks: string[] = [];
  const missingInformation: string[] = [];
  const matchedCapabilitiesList: string[] = [];

  // =========================================================================
  // DIMENSION 1: CAPABILITY MATCH (Raw Score 0 - 100)
  // =========================================================================
  let capabilityRawScore = 0;
  let capabilityNotes = '';

  const requirements = (challenge.technicalRequirements || []).filter(r => r.trim().length > 0);

  if (requirements.length === 0) {
    // Missing Information in Challenge: Neutral baseline, not a penalty
    missingInformation.push('Challenge technical requirements not explicitly itemized; evaluated on broad domain overlap.');
    
    // Check general problem description overlap
    const problemText = `${challenge.problemDescription} ${challenge.desiredOutcome}`.toLowerCase();
    let implicitMatches = 0;
    startup.coreCapabilities.forEach(c => {
      if (problemText.includes(c.toLowerCase().split(' ')[0])) {
        implicitMatches++;
        matchedCapabilitiesList.push(c);
      }
    });
    capabilityRawScore = Math.min(75, Math.max(40, implicitMatches * 15 + 30));
    capabilityNotes = `Estimated ${implicitMatches} potential capability alignments from problem narrative (unspecified requirements).`;
  } else {
    // Factual capability matching against specified requirements
    // Check across core capabilities, technology capabilities, and integration capabilities
    const allStartupCapabilities = [
      ...startup.coreCapabilities,
      ...startup.technologyCapabilities,
      ...startup.integrationCapabilities
    ];

    let matchedCount = 0;
    requirements.forEach(req => {
      const match = isCapabilityCovered(req, allStartupCapabilities);
      if (match.covered) {
        matchedCount++;
        const capName = match.matchedCapability || req;
        if (!matchedCapabilitiesList.includes(capName)) {
          matchedCapabilitiesList.push(capName);
        }
        matchingEvidence.push(`Direct capability coverage for "${req}" via startup capability: ${capName}.`);
      } else {
        capabilityGaps.push(req);
      }
    });

    const recallRatio = matchedCount / requirements.length;
    // Base recall score (up to 75 pts) + breadth bonus (up to 25 pts)
    const baseScore = Math.round(recallRatio * 75);
    const breadthBonus = Math.min(25, matchedCapabilitiesList.length * 6);
    capabilityRawScore = Math.min(100, baseScore + breadthBonus);

    // Conflict check: Do startup's known limitations conflict with core requirements?
    for (const limitation of startup.knownLimitations) {
      for (const req of requirements) {
        if (limitation.toLowerCase().includes(req.toLowerCase())) {
          capabilityRawScore = Math.max(0, capabilityRawScore - 20);
          potentialRisks.push(`Startup known limitation directly restricts requirement "${req}": ${limitation}`);
        }
      }
    }

    capabilityNotes = `Covered ${matchedCount} of ${requirements.length} required capabilities (${Math.round(recallRatio * 100)}% recall).`;
  }

  // =========================================================================
  // DIMENSION 2: INDUSTRY & USE-CASE RELEVANCE (Raw Score 0 - 100)
  // =========================================================================
  let industryRawScore = 0;
  let industryNotes = '';

  // 1. Concrete Use-Case Overlap (up to 50 pts)
  const challengeNarrative = `${challenge.title} ${challenge.problemDescription} ${challenge.desiredOutcome}`.toLowerCase();
  let matchedUseCaseCount = 0;

  startup.relevantUseCases.forEach(uc => {
    const ucLower = uc.toLowerCase();
    const ucTokens = ucLower.split(/[\s/,-]+/).filter(t => t.length > 4 && !['between', 'through', 'across', 'system', 'platform'].includes(t));
    const tokenHits = ucTokens.filter(t => challengeNarrative.includes(t)).length;

    if (tokenHits >= 2 || challengeNarrative.includes(ucLower.slice(0, 15))) {
      matchedUseCaseCount++;
      matchingEvidence.push(`Relevant proven use case: "${uc}".`);
    }
  });

  const useCaseScore = Math.min(50, matchedUseCaseCount * 25);

  // 2. Industry Alignment (up to 50 pts)
  const isPrimaryIndustry = startup.industry === challenge.industry || startup.primaryIndustry === challenge.industry;
  const isSecondaryIndustry = startup.secondaryIndustries && startup.secondaryIndustries.includes(challenge.industry);
  const isCrossCuttingAI = startup.industry === 'Enterprise AI & Cybersecurity' || (startup.secondaryIndustries || []).includes('Enterprise AI & Cybersecurity');

  let industryBaseScore = 0;
  if (isPrimaryIndustry) {
    industryBaseScore = 50;
    matchingEvidence.push(`Exact primary industry alignment in ${startup.industry}.`);
  } else if (isSecondaryIndustry) {
    industryBaseScore = 35;
    matchingEvidence.push(`Secondary industry coverage for ${challenge.industry}.`);
  } else if (isCrossCuttingAI && (matchedCapabilitiesList.length > 0 || matchedUseCaseCount > 0)) {
    industryBaseScore = 20;
    matchingEvidence.push(`Horizontal AI & Cybersecurity technology applicable to ${challenge.industry}.`);
  } else {
    // Genuine Industry Mismatch
    industryBaseScore = 0;
    potentialRisks.push(`Industry mismatch: Startup focuses on ${startup.industry}, while enterprise operates in ${challenge.industry}.`);
  }

  industryRawScore = Math.min(100, industryBaseScore + useCaseScore);
  industryNotes = `Industry alignment: ${isPrimaryIndustry ? 'Primary' : isSecondaryIndustry ? 'Secondary' : isCrossCuttingAI && industryBaseScore > 0 ? 'Adjacent AI' : 'Mismatched'}. Matched ${matchedUseCaseCount} concrete use cases.`;

  // =========================================================================
  // DIMENSION 3: TECHNICAL COMPATIBILITY (Raw Score 0 - 100)
  // =========================================================================
  let techRawScore = 60; // neutral base
  let techNotes = '';

  // Data Sensitivity & Security Rigor Check
  const isHighSensitivity = challenge.dataSensitivity === 'Highly Restricted (PDPA/Banking Secret)' || challenge.dataSensitivity === 'Confidential';
  const hasTier1Audit = startup.dataSecurityConsiderations.certifications.some(c =>
    c.includes('ISO') || c.includes('SOC 2') || c.includes('MAS TRM') || c.includes('HIPAA') || c.includes('EAL4+')
  );

  if (isHighSensitivity) {
    if (hasTier1Audit) {
      techRawScore += 25;
      matchingEvidence.push(`Security posture matches ${challenge.dataSensitivity}: Certified with ${startup.dataSecurityConsiderations.certifications.join(', ')}.`);
    } else {
      techRawScore -= 20;
      potentialRisks.push(`Security risk: Enterprise requires ${challenge.dataSensitivity}, but startup lacks verified Tier-1 SOC2/ISO audit certifications.`);
    }
  } else {
    techRawScore += 15;
  }

  // Tech stack compatibility
  const challengeTechText = `${challenge.technicalRequirements.join(' ')} ${challenge.integrationConstraints}`.toLowerCase();
  let techStackMatches = 0;
  startup.technologyCapabilities.forEach(tech => {
    if (challengeTechText.includes(tech.toLowerCase().split(' ')[0])) {
      techStackMatches++;
    }
  });

  if (techStackMatches > 0) {
    techRawScore += Math.min(15, techStackMatches * 5);
    matchingEvidence.push(`Compatible technology capabilities: ${startup.technologyCapabilities.slice(0, 3).join(', ')}.`);
  }

  techRawScore = Math.max(10, Math.min(100, techRawScore));
  techNotes = `Security rating: ${hasTier1Audit ? 'Audited Tier-1' : 'Standard'}. Tech stack synergy: ${techStackMatches} matched components.`;

  // =========================================================================
  // DIMENSION 4: TARGET MARKET RELEVANCE (Raw Score 0 - 100)
  // =========================================================================
  let marketRawScore = 0;
  let marketNotes = '';

  // 1. Enterprise Customer Persona (up to 50 pts)
  const enterpriseNameLower = challenge.enterpriseName.toLowerCase();
  const industryLower = challenge.industry.toLowerCase();
  const segmentMatches = startup.targetCustomerSegments.filter(seg => {
    const sLower = seg.toLowerCase();
    return (
      (industryLower.includes('fintech') && (sLower.includes('bank') || sLower.includes('payment') || sLower.includes('remittance'))) ||
      (industryLower.includes('logistics') && (sLower.includes('carrier') || sLower.includes('freight') || sLower.includes('distributor') || sLower.includes('shipper'))) ||
      (industryLower.includes('healthcare') && (sLower.includes('hospital') || sLower.includes('clinic') || sLower.includes('health') || sLower.includes('insurance'))) ||
      (industryLower.includes('agrifood') && (sLower.includes('agri') || sLower.includes('farm') || sLower.includes('food') || sLower.includes('utility') || sLower.includes('plantation'))) ||
      (industryLower.includes('retail') && (sLower.includes('retail') || sLower.includes('merchant') || sLower.includes('store') || sLower.includes('concessionaire'))) ||
      (industryLower.includes('cybersecurity') && (sLower.includes('enterprise') || sLower.includes('multinational') || sLower.includes('conglomerate') || sLower.includes('bank')))
    );
  });

  if (segmentMatches.length > 0) {
    marketRawScore += 50;
    matchingEvidence.push(`Target customer segment match: Serves ${segmentMatches[0]}.`);
  } else {
    marketRawScore += 25; // Neutral baseline
    missingInformation.push(`Specific enterprise sub-tier not explicitly identified; partial segment alignment assumed.`);
  }

  // 2. Geographic Footprint & Sovereign Data Residency (up to 50 pts)
  const isDomesticCountry = startup.country === challenge.country;
  if (isDomesticCountry) {
    marketRawScore += 35;
    matchingEvidence.push(`Domestic market presence in ${challenge.country} with local operational entity.`);
  } else {
    marketRawScore += 20;
    matchingEvidence.push(`Cross-border ASEAN hub presence (${startup.country}) servicing ${challenge.country}.`);
  }

  // Check Data Residency Constraint
  if (challenge.requiresLocalDataResidency) {
    const residencyOptions = startup.dataSecurityConsiderations.dataResidency || startup.dataResidencyOptions || [];
    const hasDomesticResidency = residencyOptions.some(opt => opt.toUpperCase().includes(challenge.country));

    if (hasDomesticResidency) {
      marketRawScore += 15;
      matchingEvidence.push(`Verified sovereign local data residency available in ${challenge.country}.`);
    } else {
      // Genuine Mismatch on mandatory local data residency
      marketRawScore = Math.max(10, marketRawScore - 25);
      potentialRisks.push(`Data sovereignty gap: Enterprise requires domestic data residency in ${challenge.country}, but startup cloud nodes reside in: ${residencyOptions.join(', ')}.`);
    }
  } else {
    marketRawScore += 15;
  }

  marketRawScore = Math.max(10, Math.min(100, marketRawScore));
  marketNotes = `Market profile: ${segmentMatches.length > 0 ? 'Target segment aligned' : 'General segment'}. Geography: ${isDomesticCountry ? 'Domestic' : 'Regional ASEAN'}.`;

  // =========================================================================
  // DIMENSION 5: INTEGRATION READINESS (Raw Score 0 - 100)
  // =========================================================================
  let integrationRawScore = 50; // Neutral baseline
  let integrationNotes = '';

  const constraints = (challenge.integrationConstraints || '').toLowerCase().trim();

  if (!constraints || constraints.length < 5) {
    // Missing Information in Challenge
    missingInformation.push('Integration constraints not specified in challenge; evaluated on startup standard API maturity.');
    integrationRawScore = 75; // Standard API readiness
    integrationNotes = 'No specific enterprise integration constraints supplied; standard REST API readiness assumed.';
  } else {
    let matchedConstraintCount = 0;
    let mismatchedConstraintCount = 0;

    // Check specific constraint tokens
    const CONSTRAINT_PATTERNS = [
      { key: 'kafka', label: 'Kafka Event Streaming' },
      { key: 'sap', label: 'SAP Connector' },
      { key: 'mtls', label: 'Mutual TLS (mTLS)' },
      { key: 'vpc', label: 'Private VPC Peering' },
      { key: 'sftp', label: 'Batch SFTP Ingestion' },
      { key: 'rest', label: 'RESTful API' },
      { key: 'webhook', label: 'Outbound Webhooks' },
      { key: 'fhir', label: 'FHIR / HL7 Interface' }
    ];

    CONSTRAINT_PATTERNS.forEach(pat => {
      if (constraints.includes(pat.key)) {
        const supported = startup.integrationCapabilities.some(cap => cap.toLowerCase().includes(pat.key));
        if (supported) {
          matchedConstraintCount++;
          matchingEvidence.push(`Supported integration capability: ${pat.label}.`);
        } else {
          mismatchedConstraintCount++;
          potentialRisks.push(`Integration constraint gap: Enterprise requires "${pat.label}", but startup does not list this native integration capability.`);
        }
      }
    });

    if (matchedConstraintCount > 0 && mismatchedConstraintCount === 0) {
      integrationRawScore = 95;
      integrationNotes = `100% of detected integration constraints supported (${matchedConstraintCount} protocols matched).`;
    } else if (matchedConstraintCount > 0 && mismatchedConstraintCount > 0) {
      integrationRawScore = 65;
      integrationNotes = `Partial integration support (${matchedConstraintCount} matched, ${mismatchedConstraintCount} gaps).`;
    } else if (mismatchedConstraintCount > 0) {
      integrationRawScore = 30; // Genuine mismatch
      integrationNotes = `Significant integration gaps: Lacks native support for ${mismatchedConstraintCount} requested constraints.`;
    } else {
      integrationRawScore = 75;
      integrationNotes = 'Standard integration profile compatible with enterprise staging.';
    }
  }

  // Include startup's known limitations as operational risks
  startup.knownLimitations.forEach(lim => {
    if (!potentialRisks.includes(lim)) {
      potentialRisks.push(`Operational limitation: ${lim}`);
    }
  });

  // Disjoint Domain Guard: If both industry relevance <= 10 and zero capabilities match,
  // ensure generic baselines do not buoy an irrelevant vendor into a false positive
  const isDisjointDomain = industryRawScore <= 10 && matchedCapabilitiesList.length === 0;
  if (isDisjointDomain) {
    techRawScore = Math.min(20, techRawScore);
    integrationRawScore = Math.min(15, integrationRawScore);
    marketRawScore = Math.min(15, marketRawScore);
    potentialRisks.unshift(`Severe domain mismatch: Startup operates in ${startup.industry} with 0 capability overlap for ${challenge.industry}.`);
  }

  // =========================================================================
  // OVERALL WEIGHTED CALCULATION
  // =========================================================================
  const dimensionScores: DimensionScores = {
    capabilityMatch: {
      rawScore: Math.round(capabilityRawScore),
      weight: Number(weights.capabilityMatch.toFixed(2)),
      weightedScore: Math.round(capabilityRawScore * weights.capabilityMatch * 10) / 10,
      evaluationNotes: capabilityNotes
    },
    industryUseCaseRelevance: {
      rawScore: Math.round(industryRawScore),
      weight: Number(weights.industryUseCaseRelevance.toFixed(2)),
      weightedScore: Math.round(industryRawScore * weights.industryUseCaseRelevance * 10) / 10,
      evaluationNotes: industryNotes
    },
    technicalCompatibility: {
      rawScore: Math.round(techRawScore),
      weight: Number(weights.technicalCompatibility.toFixed(2)),
      weightedScore: Math.round(techRawScore * weights.technicalCompatibility * 10) / 10,
      evaluationNotes: techNotes
    },
    targetMarketRelevance: {
      rawScore: Math.round(marketRawScore),
      weight: Number(weights.targetMarketRelevance.toFixed(2)),
      weightedScore: Math.round(marketRawScore * weights.targetMarketRelevance * 10) / 10,
      evaluationNotes: marketNotes
    },
    integrationReadiness: {
      rawScore: Math.round(integrationRawScore),
      weight: Number(weights.integrationReadiness.toFixed(2)),
      weightedScore: Math.round(integrationRawScore * weights.integrationReadiness * 10) / 10,
      evaluationNotes: integrationNotes
    }
  };

  const calculatedTotal =
    dimensionScores.capabilityMatch.weightedScore +
    dimensionScores.industryUseCaseRelevance.weightedScore +
    dimensionScores.technicalCompatibility.weightedScore +
    dimensionScores.targetMarketRelevance.weightedScore +
    dimensionScores.integrationReadiness.weightedScore;

  const overallScore = Math.max(0, Math.min(100, Math.round(calculatedTotal)));

  // Generate backward-compatible breakdown (Domain 35, Capability 30, Regional 15, Readiness 20)
  const breakdown: MatchScoreBreakdown = {
    domainScore: Math.round((industryRawScore / 100) * 35),
    capabilityScore: Math.round((capabilityRawScore / 100) * 30),
    regionalScore: Math.round((marketRawScore / 100) * 15),
    readinessScore: Math.round(((techRawScore + integrationRawScore) / 200) * 20)
  };

  // Structured human-readable explanation
  let fitTier = 'Weak / Exploratory';
  if (overallScore >= 80) fitTier = 'High-Conviction Match';
  else if (overallScore >= 60) fitTier = 'Viable Candidate with Identified Gaps';
  else if (overallScore >= 40) fitTier = 'Partial Alignment / Adjacent Fit';

  const explanation = `${startup.name} achieves a ${overallScore}% overall compatibility score (${fitTier}). ` +
    `Strengths include ${dimensionScores.industryUseCaseRelevance.evaluationNotes} and ${dimensionScores.capabilityMatch.evaluationNotes} ` +
    (capabilityGaps.length > 0
      ? `Identified gaps to resolve during Phase 1 include: ${capabilityGaps.slice(0, 2).join(', ')}. `
      : 'Core functional requirements are fully addressed. ') +
    `Data residency profile is verified via ${startup.dataSecurityConsiderations.dataResidency.join(', ')}.`;

  const matchReasons = [
    `${dimensionScores.capabilityMatch.evaluationNotes} (Capability Score: ${dimensionScores.capabilityMatch.rawScore}/100)`,
    `${dimensionScores.industryUseCaseRelevance.evaluationNotes} (Industry Fit: ${dimensionScores.industryUseCaseRelevance.rawScore}/100)`,
    `${dimensionScores.technicalCompatibility.evaluationNotes} (Security/Tech: ${dimensionScores.technicalCompatibility.rawScore}/100)`,
    `${dimensionScores.targetMarketRelevance.evaluationNotes} (Market Relevance: ${dimensionScores.targetMarketRelevance.rawScore}/100)`,
    `${dimensionScores.integrationReadiness.evaluationNotes} (Integration: ${dimensionScores.integrationReadiness.rawScore}/100)`
  ];

  return {
    startup,
    overallScore,
    dimensionScores,
    breakdown,
    matchedCapabilities: matchedCapabilitiesList,
    missingCapabilities: capabilityGaps,
    capabilityGaps,
    matchingEvidence,
    potentialRisks: potentialRisks.slice(0, 4),
    missingInformation,
    matchReasons,
    explanation,
    evidenceQuality: startup.evidenceQuality,
    complianceFit: startup.dataSecurityConsiderations.dataResidency.join(', ')
  };
}

/**
 * Ranks all curated startups against an enterprise challenge using the deterministic scoring engine.
 */
export function matchStartupsToChallenge(
  challenge: EnterpriseChallenge,
  startups: CuratedStartup[] = CURATED_STARTUPS,
  customWeights?: Partial<MatchingWeights>
): MatchResult[] {
  const scored = startups.map(startup => scoreStartupMatch(challenge, startup, customWeights));
  return scored.sort((a, b) => b.overallScore - a.overallScore);
}
