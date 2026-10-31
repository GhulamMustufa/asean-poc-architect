import { z } from 'zod';

export const Stage1ChallengeUnderstandingSchema = z.object({
  problemSummary: z.string().min(10),
  desiredBusinessOutcomes: z.array(z.string().min(5)).min(1),
  extractedConstraints: z.array(z.string().min(3)).min(1),
  assumptions: z.array(z.string().min(3)).min(1),
  missingInformation: z.array(z.string().min(3))
});

export const Stage2PilotScopingSchema = z.object({
  pilotObjective: z.string().min(15),
  inScope: z.array(z.string().min(5)).min(2),
  outOfScope: z.array(z.string().min(5)).min(2),
  requiredIntegrations: z.array(z.string().min(3)).min(1),
  dependencies: z.array(z.string().min(3)).min(1),
  deliverables: z.array(z.string().min(5)).min(2)
});

export const RoadmapMilestoneSchema = z.object({
  id: z.string(),
  phase: z.string().min(3),
  dayRange: z.string().min(3),
  title: z.string().min(5),
  durationWeeks: z.number().positive(),
  owner: z.enum(['Enterprise Lead', 'Startup Lead', 'Joint Working Group']),
  deliverables: z.array(z.string().min(3)).min(1),
  acceptanceCriteria: z.string().min(10)
});

export const Stage3RoadmapSchema = z.object({
  totalDays: z.number().default(60),
  totalWeeks: z.number().default(8),
  milestones: z.array(RoadmapMilestoneSchema).min(3)
});

export const Stage4KpiItemSchema = z.object({
  id: z.string(),
  metric: z.string().min(5),
  baseline: z.string().min(5),
  target: z.string().min(5),
  targetIsAssumption: z.literal(true),
  measurementMethod: z.string().min(10),
  measurementPeriod: z.string().min(5)
});

export const Stage4KpiDesignSchema = z.object({
  kpis: z.array(Stage4KpiItemSchema).min(2),
  kpiGovernanceNotes: z.string().min(10)
});

export const CountrySpecificRequirementSchema = z.object({
  country: z.enum(['SG', 'MY', 'ID', 'VN', 'TH', 'PH']),
  jurisdictionMandate: z.string().min(5),
  verificationNeeded: z.string().min(10),
  status: z.literal('Requires Independent Legal Review')
});

export const Stage5RiskComplianceSchema = z.object({
  dataPrivacyQuestions: z.array(z.string().min(5)).min(1),
  securityQuestions: z.array(z.string().min(5)).min(1),
  integrationRisks: z.array(z.string().min(5)).min(1),
  operationalRisks: z.array(z.string().min(5)).min(1),
  regulatoryQuestions: z.array(z.string().min(5)).min(1),
  countrySpecificRequirements: z.array(CountrySpecificRequirementSchema).min(1),
  separationAudit: z.object({
    verifiedFacts: z.array(z.string().min(5)).min(1),
    unvalidatedAssumptions: z.array(z.string().min(5)).min(1),
    expertReviewRequired: z.array(z.string().min(5)).min(1)
  }),
  legalDisclaimer: z.string().min(20)
});

export const FullStructuredProposalStageSchema = z.object({
  challengeUnderstanding: Stage1ChallengeUnderstandingSchema,
  pilotScoping: Stage2PilotScopingSchema,
  roadmap: Stage3RoadmapSchema,
  kpiDesign: Stage4KpiDesignSchema,
  riskCompliance: Stage5RiskComplianceSchema,
  executiveSummary: z.string().min(20)
});
