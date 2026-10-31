import { ASEANCountry, CuratedStartup, EnterpriseChallenge, PilotProposal, ProposalKpi, ProposalMilestone, RaciItem } from '@/types';

export type ModelProvider = 'gemini' | 'ollama-gemma' | 'deterministic-fallback';

export type GenerationStatus = 'pending' | 'in_progress' | 'completed' | 'fallback' | 'failed';

export interface Stage1ChallengeUnderstanding {
  problemSummary: string;
  desiredBusinessOutcomes: string[];
  extractedConstraints: string[];
  assumptions: string[];
  missingInformation: string[];
}

export interface Stage2PilotScoping {
  pilotObjective: string;
  inScope: string[];
  outOfScope: string[];
  requiredIntegrations: string[];
  dependencies: string[];
  deliverables: string[];
}

export interface RoadmapMilestone extends ProposalMilestone {
  dayRange: string; // e.g. "Days 1–15"
  owner: 'Enterprise Lead' | 'Startup Lead' | 'Joint Working Group';
}

export interface Stage3Roadmap {
  totalDays: number; // Exactly 60 days
  totalWeeks: number;
  milestones: RoadmapMilestone[];
}

export interface Stage4KpiItem extends ProposalKpi {
  targetIsAssumption: true; // Explicitly marked as proposed assumption until validated
  measurementPeriod: string;
}

export interface Stage4KpiDesign {
  kpis: Stage4KpiItem[];
  kpiGovernanceNotes: string;
}

export interface CountrySpecificRequirement {
  country: ASEANCountry;
  jurisdictionMandate: string;
  verificationNeeded: string;
  status: 'Requires Independent Legal Review';
}

export interface Stage5RiskCompliance {
  dataPrivacyQuestions: string[];
  securityQuestions: string[];
  integrationRisks: string[];
  operationalRisks: string[];
  regulatoryQuestions: string[];
  countrySpecificRequirements: CountrySpecificRequirement[];
  separationAudit: {
    verifiedFacts: string[];
    unvalidatedAssumptions: string[];
    expertReviewRequired: string[];
  };
  legalDisclaimer: string;
}

export interface ProposalGenerationStages {
  challengeUnderstanding: Stage1ChallengeUnderstanding;
  pilotScoping: Stage2PilotScoping;
  roadmap: Stage3Roadmap;
  kpiDesign: Stage4KpiDesign;
  riskCompliance: Stage5RiskCompliance;
}

export interface GenerationMetadata {
  provider: ModelProvider | string;
  modelName: string;
  generationStatus: GenerationStatus;
  latencyMs: number;
  usedFallback: boolean;
  attempts: number;
  completedAt: string;
  errorNote?: string;
  // Multi-Model AI Gateway Execution Transparency
  gatewayExecution?: {
    requestedModelId?: string;
    actualProviderId: string;
    actualProviderName: string;
    actualModelId: string;
    latencyMs: number;
    fallbackUsed: boolean;
    fallbackReason?: string;
    fallbackChain?: string[];
    isCachedResult?: boolean;
    cacheTimestamp?: string;
    localOnlyEnforced?: boolean;
  };
}

export interface ProposalGenerationResult {
  proposal: PilotProposal;
  stages: ProposalGenerationStages;
  metadata: GenerationMetadata;
}
