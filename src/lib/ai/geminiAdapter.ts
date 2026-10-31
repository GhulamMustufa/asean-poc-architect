import { CuratedStartup, EnterpriseChallenge } from '@/types';
import { ModelAdapter, StructuredProposalOutput } from './modelAdapter.interface';
import { FullStructuredProposalStageSchema } from './schemas';

export class GeminiAdapter implements ModelAdapter {
  name = 'Google Gemini API (Grounded Structured Adapter)';
  providerId = 'gemini' as const;

  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'gemini-2.0-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateStages(
    challenge: EnterpriseChallenge,
    startup: CuratedStartup,
    options?: { timeoutMs?: number; signal?: AbortSignal }
  ): Promise<StructuredProposalOutput> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured on the server.');
    }

    const timeoutMs = options?.timeoutMs || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const systemInstruction = `You are a senior enterprise innovation architect and technical lead specializing in Southeast Asian enterprise-startup Proof-of-Concept pilots.
Your task is to synthesize a structured 6-stage pilot proposal between an enterprise problem owner and a curated startup.

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. Ground all outputs STRICTLY in the provided enterprise challenge and startup dataset records.
2. NEVER invent startup facts, funding rounds, customers, or certifications not explicitly present in the startup record.
3. NEVER claim statutory regulatory compliance or legal approval. Clearly disclaim that formal legal sign-off is required.
4. Mark all proposed KPI targets explicitly as assumptions subject to sandbox validation. Never invent historical enterprise performance metrics.
5. Generate an actionable 60-day roadmap divided into Phase 1 (Days 1–15), Phase 2 (Days 16–45), and Phase 3 (Days 46–60).
6. Return your response strictly as a JSON object adhering to the specified schema, with no markdown code blocks or conversational text.`;

      const userPrompt = `Synthesize a structured pilot proposal for the following enterprise challenge and startup record:

ENTERPRISE CHALLENGE:
${JSON.stringify(challenge, null, 2)}

STARTUP PROFILE (GROUND TRUTH):
${JSON.stringify(startup, null, 2)}

Generate a valid JSON object matching this structure:
{
  "challengeUnderstanding": {
    "problemSummary": "string",
    "desiredBusinessOutcomes": ["string"],
    "extractedConstraints": ["string"],
    "assumptions": ["string"],
    "missingInformation": ["string"]
  },
  "pilotScoping": {
    "pilotObjective": "string",
    "inScope": ["string"],
    "outOfScope": ["string"],
    "requiredIntegrations": ["string"],
    "dependencies": ["string"],
    "deliverables": ["string"]
  },
  "roadmap": {
    "totalDays": 60,
    "totalWeeks": 8,
    "milestones": [
      {
        "id": "m1",
        "phase": "Phase 1: Setup & Data Readiness",
        "dayRange": "Days 1–15",
        "title": "string",
        "durationWeeks": 2,
        "owner": "Joint Working Group",
        "deliverables": ["string"],
        "acceptanceCriteria": "string"
      },
      {
        "id": "m2",
        "phase": "Phase 2: Pilot Trial & Workload Benchmarking",
        "dayRange": "Days 16–45",
        "title": "string",
        "durationWeeks": 4,
        "owner": "Startup Lead",
        "deliverables": ["string"],
        "acceptanceCriteria": "string"
      },
      {
        "id": "m3",
        "phase": "Phase 3: Impact Evaluation & Governance Blueprint",
        "dayRange": "Days 46–60",
        "title": "string",
        "durationWeeks": 2,
        "owner": "Enterprise Lead",
        "deliverables": ["string"],
        "acceptanceCriteria": "string"
      }
    ]
  },
  "kpiDesign": {
    "kpiGovernanceNotes": "string",
    "kpis": [
      {
        "id": "kpi-1",
        "metric": "string",
        "baseline": "string",
        "target": "string",
        "targetIsAssumption": true,
        "measurementMethod": "string",
        "measurementPeriod": "string"
      }
    ]
  },
  "riskCompliance": {
    "dataPrivacyQuestions": ["string"],
    "securityQuestions": ["string"],
    "integrationRisks": ["string"],
    "operationalRisks": ["string"],
    "regulatoryQuestions": ["string"],
    "countrySpecificRequirements": [
      {
        "country": "${challenge.country}",
        "jurisdictionMandate": "string",
        "verificationNeeded": "string",
        "status": "Requires Independent Legal Review"
      }
    ],
    "separationAudit": {
      "verifiedFacts": ["string"],
      "unvalidatedAssumptions": ["string"],
      "expertReviewRequired": ["string"]
    },
    "legalDisclaimer": "string"
  },
  "executiveSummary": "string"
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        }),
        signal: options?.signal || controller.signal
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API HTTP Error (${response.status}): ${errText}`);
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Empty response content received from Gemini API');
      }

      // Parse and validate with Zod schema
      const parsedJson = JSON.parse(rawText);
      const validated = FullStructuredProposalStageSchema.parse(parsedJson);
      return validated;
    } finally {
      clearTimeout(timer);
    }
  }
}
