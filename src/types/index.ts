export type ASEANCountry = 'SG' | 'MY' | 'ID' | 'VN' | 'TH' | 'PH';

export type IndustryVertical =
  | 'FinTech & Payments'
  | 'Logistics & Supply Chain'
  | 'AgriFood & ClimateTech'
  | 'Healthcare & MedTech'
  | 'Retail & E-commerce'
  | 'Enterprise AI & Cybersecurity'
  | 'Industrial IoT & Energy';

export interface EnterpriseChallenge {
  id: string;
  title: string;
  enterpriseName: string;
  industry: IndustryVertical;
  country: ASEANCountry;
  problemDescription: string;
  desiredOutcome: string;
  technicalRequirements: string[];
  dataSensitivity: 'Public' | 'Internal' | 'Confidential' | 'Highly Restricted (PDPA/Banking Secret)';
  integrationConstraints: string;
  expectedDurationWeeks: number;
  budgetRangeUSD: string;
  requiresLocalDataResidency: boolean;
  targetCustomerSegment?: string;
  createdAt: string;
}

export interface DataSecurityProfile {
  certifications: string[];
  dataResidency: string[];
  encryption: string;
  complianceNotes: string;
}

export interface CuratedStartup {
  id: string;
  name: string;
  country: ASEANCountry;
  industry: IndustryVertical;
  productDescription: string;
  coreCapabilities: string[];
  technologyCapabilities: string[];
  targetCustomerSegments: string[];
  integrationCapabilities: string[];
  relevantUseCases: string[];
  dataSecurityConsiderations: DataSecurityProfile;
  knownLimitations: string[];
  isSyntheticDemo: boolean; // false for real startups, true for synthetic demo entities

  // Real data provenance & verification metadata
  verificationStatus?: 'VERIFIED' | 'SOURCE-REPORTED' | 'UNVERIFIED' | 'SYNTHETIC';
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceUrl?: string;
  sourceOrganisation?: string;
  legalEntityName?: string;
  uenOrRegistrationNumber?: string;
  evidenceCitations?: Array<{
    id: string;
    claim: string;
    sourceName: string;
    sourceUrl: string;
    sourceType: string;
    extractedDate: string;
  }>;

  // UI & Metadata backwards-compatibility fields
  foundedYear: number;
  stage: 'Seed' | 'Series A' | 'Series B' | 'Growth';
  website: string;
  tagline: string;
  summary: string;
  primaryIndustry: IndustryVertical;
  secondaryIndustries: IndustryVertical[];
  capabilities: string[]; // Alias to coreCapabilities
  techStack: string[];    // Alias to technologyCapabilities
  verifiedCertifications: string[]; // Alias to dataSecurityConsiderations.certifications
  dataResidencyOptions: string[];   // Alias to dataSecurityConsiderations.dataResidency
  notableDeployments: string[];
  evidenceQuality: 'Audited Tier-1' | 'Enterprise Verified' | 'Validated Pilot';
  evidenceNotes: string;
  headquarters: string;
}

export interface MatchingWeights {
  capabilityMatch: number;          // Default 0.30
  industryUseCaseRelevance: number; // Default 0.25
  technicalCompatibility: number;   // Default 0.15
  targetMarketRelevance: number;    // Default 0.15
  integrationReadiness: number;     // Default 0.15
}

export interface DimensionScore {
  rawScore: number;       // 0 - 100
  weight: number;         // e.g. 0.30
  weightedScore: number;   // rawScore * weight
  evaluationNotes: string;
}

export interface DimensionScores {
  capabilityMatch: DimensionScore;
  industryUseCaseRelevance: DimensionScore;
  technicalCompatibility: DimensionScore;
  targetMarketRelevance: DimensionScore;
  integrationReadiness: DimensionScore;
}

export interface MatchScoreBreakdown {
  domainScore: number;       // Domain & Use-case (Max 35)
  capabilityScore: number;   // Core capabilities (Max 30)
  regionalScore: number;     // Market & Data residency (Max 15)
  readinessScore: number;    // Integration & Tech compatibility (Max 20)
}

export interface MatchResult {
  startup: CuratedStartup;
  overallScore: number; // 0 - 100
  dimensionScores: DimensionScores;
  breakdown: MatchScoreBreakdown;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  capabilityGaps: string[];
  matchingEvidence: string[];
  potentialRisks: string[];
  missingInformation: string[];
  matchReasons: string[];
  explanation: string;
  evidenceQuality: CuratedStartup['evidenceQuality'];
  complianceFit: string;
}

export interface ProposalMilestone {
  id: string;
  phase: string;
  title: string;
  durationWeeks: number;
  deliverables: string[];
  acceptanceCriteria: string;
}

export interface RaciItem {
  id: string;
  activity: string;
  enterpriseRole: 'Responsible' | 'Accountable' | 'Consulted' | 'Informed';
  startupRole: 'Responsible' | 'Accountable' | 'Consulted' | 'Informed';
  notes: string;
}

export interface ProposalKpi {
  id: string;
  metric: string;
  baseline: string;
  target: string;
  measurementMethod: string;
}

export type ProposalStatus = 'Draft' | 'Under Review' | 'Approved' | 'Rejected';

export interface ApprovalRecord {
  status: ProposalStatus;
  decidedBy?: string;
  deciderRole?: string;
  decidedAt?: string;
  decisionNotes?: string;
  rejectionReason?: string;
  explicitHumanSignoff: boolean;
}

export interface ProposalEditRecord {
  id: string;
  timestamp: string;
  editorName?: string;
  fieldsEdited: string[];
  summaryNotes?: string;
}

export interface OriginalProposalSnapshot {
  executiveSummary: string;
  inScope: string[];
  outOfScope: string[];
  milestones: ProposalMilestone[];
  raciMatrix: RaciItem[];
  kpis: ProposalKpi[];
  snapshotCreatedAt: string;
}

export interface ProposalSourceSnapshot {
  challenge: EnterpriseChallenge;
  startup: CuratedStartup;
  matchScore?: number;
  matchReasons?: string[];
  matchedCapabilities?: string[];
  capabilityGaps?: string[];
  generatedAt: string;
}

export interface DealRecord {
  id: string;
  challengeId: string;
  challengeTitle: string;
  enterpriseName: string;
  industry: IndustryVertical;
  country: ASEANCountry;
  startupId: string;
  startupName: string;
  startupCountry: ASEANCountry;
  matchScore: number;
  proposalId: string;
  proposalStatus: ProposalStatus;
  nextAction: string;
  updatedAt: string;
  createdAt: string;
}

export interface PilotProposal {
  id: string;
  challengeId: string;
  startupId: string;
  challengeTitle: string;
  enterpriseName: string;
  startupName: string;
  startupCountry: ASEANCountry;
  status: ProposalStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  nextAction?: string;

  // Data integrity and source preservation
  sourceSnapshot?: ProposalSourceSnapshot;

  // Explicit human sign-off
  approvalRecord?: ApprovalRecord;

  // Edit preservation and AI provenance indicators
  editedFields?: string[];
  editHistory?: ProposalEditRecord[];
  originalGenerated?: OriginalProposalSnapshot;

  provenance: {
    verifiedStartupFacts: string[];
    enterpriseSuppliedInputs: string[];
    aiGeneratedSections: string[];
  };

  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  inScope: string[];
  outOfScope: string[];
  integrationArchitecture: string;
  milestones: ProposalMilestone[];
  raciMatrix: RaciItem[];
  kpis: ProposalKpi[];
  technicalRisks: string[];
  dataResidencyPlan: string;
  openQuestions: string[];
  legalDisclaimer: string;
}

export interface PipelineMetrics {
  activeChallenges: number;
  matchedStartups: number;
  completedProposals: number;
  avgFeasibilityScore: number;
  avgPilotDurationWeeks: number;
  totalDeals: number;
  draftsCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
}

