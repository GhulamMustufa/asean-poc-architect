import { z } from 'zod';
import type { ASEANCountry, EnterpriseChallenge, IndustryVertical } from '@/types';

/** Countries the matcher supports (mirrors the ASEANCountry type). */
export const CHALLENGE_COUNTRIES = ['SG', 'ID', 'MY', 'VN', 'TH', 'PH'] as const satisfies readonly ASEANCountry[];

export const INDUSTRIES = [
  'FinTech & Payments',
  'Logistics & Supply Chain',
  'AgriFood & ClimateTech',
  'Healthcare & MedTech',
  'Retail & E-commerce',
  'Enterprise AI & Cybersecurity',
  'Industrial IoT & Energy',
] as const satisfies readonly IndustryVertical[];

export const DATA_SENSITIVITIES = [
  { value: 'Public', label: 'Public (open information)' },
  { value: 'Internal', label: 'Internal (company records)' },
  { value: 'Confidential', label: 'Confidential (business sensitive)' },
  { value: 'Highly Restricted (PDPA/Banking Secret)', label: 'Highly sensitive (customer / banking data)' },
] as const satisfies readonly { value: EnterpriseChallenge['dataSensitivity']; label: string }[];

export const DURATION_OPTIONS = [
  { value: 4, label: '4 weeks (quick test)' },
  { value: 6, label: '6 weeks (standard trial)' },
  { value: 8, label: '8 weeks (full pilot)' },
  { value: 10, label: '10 weeks (pilot + rollout plan)' },
  { value: 12, label: '12 weeks (extended pilot)' },
] as const;

const SENSITIVITY_VALUES = DATA_SENSITIVITIES.map((d) => d.value) as [
  EnterpriseChallenge['dataSensitivity'],
  ...EnterpriseChallenge['dataSensitivity'][],
];

const countrySchema = z.enum(CHALLENGE_COUNTRIES, {
  error: 'Choose one of the supported countries: SG, ID, MY, VN, TH or PH.',
});

/** Validation for the challenge form (what the user edits). */
export const challengeFormSchema = z.object({
  title: z.string().trim().min(10, 'Please enter a project title (at least 10 characters).'),
  enterpriseName: z.string().trim().min(2, 'Company name is required.'),
  industry: z.enum(INDUSTRIES, { error: 'Choose an industry.' }),
  country: countrySchema,
  problemDescription: z.string().trim().min(20, 'Describe the problem in at least 20 characters.'),
  desiredOutcome: z.string().trim().min(15, 'Describe what success looks like (at least 15 characters).'),
  technicalRequirementsText: z.string(),
  dataSensitivity: z.enum(SENSITIVITY_VALUES),
  integrationConstraints: z.string(),
  expectedDurationWeeks: z.number().int().min(1).max(52),
  budgetRangeUSD: z.string().trim().min(1, 'Enter an estimated budget range.'),
  requiresLocalDataResidency: z.boolean(),
});

export type ChallengeFormValues = z.infer<typeof challengeFormSchema>;

/** Validation for a stored/finished EnterpriseChallenge. */
export const enterpriseChallengeSchema = challengeFormSchema
  .omit({ technicalRequirementsText: true })
  .extend({
    id: z.string().min(1),
    technicalRequirements: z.array(z.string().min(1)).min(1),
    integrationConstraints: z.string().min(1),
    targetCustomerSegment: z.string().optional(),
    createdAt: z.string().min(1),
  });

export const EMPTY_CHALLENGE_FORM: ChallengeFormValues = {
  title: '',
  enterpriseName: '',
  industry: 'FinTech & Payments',
  country: 'SG',
  problemDescription: '',
  desiredOutcome: '',
  technicalRequirementsText: '',
  dataSensitivity: 'Confidential',
  integrationConstraints: '',
  expectedDurationWeeks: 8,
  budgetRangeUSD: '$30,000 - $50,000',
  requiresLocalDataResidency: true,
};

export function presetToFormValues(data: Omit<EnterpriseChallenge, 'id' | 'createdAt'>): ChallengeFormValues {
  return {
    title: data.title,
    enterpriseName: data.enterpriseName,
    industry: data.industry,
    country: data.country,
    problemDescription: data.problemDescription,
    desiredOutcome: data.desiredOutcome,
    technicalRequirementsText: data.technicalRequirements.join(', '),
    dataSensitivity: data.dataSensitivity,
    integrationConstraints: data.integrationConstraints,
    expectedDurationWeeks: data.expectedDurationWeeks,
    budgetRangeUSD: data.budgetRangeUSD,
    requiresLocalDataResidency: data.requiresLocalDataResidency,
  };
}

/** Builds the EnterpriseChallenge the rest of the app expects (same shape as before). */
export function toEnterpriseChallenge(values: ChallengeFormValues, now: Date = new Date()): EnterpriseChallenge {
  const technicalRequirements = values.technicalRequirementsText
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return {
    id: `chal-${now.getTime().toString(36)}`,
    title: values.title.trim(),
    enterpriseName: values.enterpriseName.trim(),
    industry: values.industry,
    country: values.country,
    problemDescription: values.problemDescription.trim(),
    desiredOutcome: values.desiredOutcome.trim(),
    technicalRequirements: technicalRequirements.length > 0 ? technicalRequirements : ['Core API Integration', 'Data Security Compliance'],
    dataSensitivity: values.dataSensitivity,
    integrationConstraints: values.integrationConstraints.trim() || 'Standard HTTPS REST API with mutual TLS.',
    expectedDurationWeeks: Number(values.expectedDurationWeeks) || 8,
    budgetRangeUSD: values.budgetRangeUSD,
    requiresLocalDataResidency: values.requiresLocalDataResidency,
    createdAt: now.toISOString(),
  };
}
