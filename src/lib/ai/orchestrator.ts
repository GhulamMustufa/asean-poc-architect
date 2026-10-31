import { CuratedStartup, EnterpriseChallenge, PilotProposal, RaciItem } from '@/types';
import { ModelAdapter } from './modelAdapter.interface';
import { DeterministicFallbackAdapter } from './deterministicFallbackAdapter';
import { GeminiAdapter } from './geminiAdapter';
import { OllamaGemmaAdapter } from './ollamaAdapter';
import { ModelProvider, ProposalGenerationResult, GenerationMetadata, ProposalGenerationStages } from './types';
import { FullStructuredProposalStageSchema } from './schemas';

export interface OrchestrationOptions {
  preferredProvider?: ModelProvider;
  geminiApiKey?: string;
  ollamaHost?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class ProposalOrchestrator {
  private fallbackAdapter: DeterministicFallbackAdapter;
  private geminiAdapter: GeminiAdapter;
  private ollamaAdapter: OllamaGemmaAdapter;

  constructor(options?: OrchestrationOptions) {
    this.fallbackAdapter = new DeterministicFallbackAdapter();
    this.geminiAdapter = new GeminiAdapter(options?.geminiApiKey);
    this.ollamaAdapter = new OllamaGemmaAdapter(options?.ollamaHost);
  }

  /**
   * Resolves the primary adapter to attempt based on user preference and configuration.
   */
  private selectPrimaryAdapter(preferredProvider?: ModelProvider): ModelAdapter {
    if (preferredProvider === 'gemini' && this.geminiAdapter.isAvailable()) {
      return this.geminiAdapter;
    }
    if (preferredProvider === 'ollama-gemma' && this.ollamaAdapter.isAvailable()) {
      return this.ollamaAdapter;
    }
    if (preferredProvider === 'deterministic-fallback') {
      return this.fallbackAdapter;
    }

    // Auto-discovery priority: Gemini -> Ollama -> Deterministic Fallback
    if (this.geminiAdapter.isAvailable()) {
      return this.geminiAdapter;
    }
    if (this.ollamaAdapter.isAvailable()) {
      return this.ollamaAdapter;
    }
    return this.fallbackAdapter;
  }

  /**
   * Executes the 6-stage proposal generation workflow with timeout, retry limits,
   * schema validation, and automatic zero-failure fallback.
   */
  async generateProposal(
    challenge: EnterpriseChallenge,
    startup: CuratedStartup,
    options?: OrchestrationOptions
  ): Promise<ProposalGenerationResult> {
    const startTime = Date.now();
    const primaryAdapter = this.selectPrimaryAdapter(options?.preferredProvider);
    const maxRetries = options?.maxRetries ?? 1;
    const timeoutMs = options?.timeoutMs ?? 15000;

    let attempts = 0;
    let stagesData: any = null;
    let activeAdapter: ModelAdapter = primaryAdapter;
    let usedFallback = false;
    let failureReason: string | undefined;

    // 1. Attempt generation with primary adapter
    while (attempts <= maxRetries && !stagesData) {
      attempts++;
      try {
        const rawOutput = await activeAdapter.generateStages(challenge, startup, { timeoutMs });
        const validation = FullStructuredProposalStageSchema.safeParse(rawOutput);
        if (!validation.success) {
          throw new Error(`Output schema validation failed: ${validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
        }
        stagesData = validation.data;
      } catch (err: any) {
        console.warn(`[Orchestrator] Attempt ${attempts} using ${activeAdapter.name} failed:`, err?.message || err);
        failureReason = err?.message || String(err);

        if (attempts > maxRetries && activeAdapter !== this.fallbackAdapter) {
          console.warn('[Orchestrator] Switching to deterministic fallback engine to guarantee zero-failure execution.');
          activeAdapter = this.fallbackAdapter;
          usedFallback = true;
          try {
            stagesData = await this.fallbackAdapter.generateStages(challenge, startup);
          } catch (fallbackErr: any) {
            console.error('[Orchestrator] Fatal fallback error:', fallbackErr);
            throw fallbackErr;
          }
        }
      }
    }

    if (!stagesData) {
      // Direct safety fallback
      usedFallback = true;
      activeAdapter = this.fallbackAdapter;
      stagesData = await this.fallbackAdapter.generateStages(challenge, startup);
    }

    const latencyMs = Date.now() - startTime;
    const proposalId = `prop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const stages: ProposalGenerationStages = {
      challengeUnderstanding: stagesData.challengeUnderstanding,
      pilotScoping: stagesData.pilotScoping,
      roadmap: stagesData.roadmap,
      kpiDesign: stagesData.kpiDesign,
      riskCompliance: stagesData.riskCompliance
    };

    // 2. Synthesize RACI Responsibility Matrix based on scoped deliverables & owners
    const raciMatrix: RaciItem[] = [
      {
        id: 'raci-1',
        activity: 'Sandbox infrastructure provisioning & mutual TLS allowlisting',
        enterpriseRole: 'Responsible',
        startupRole: 'Consulted',
        notes: `${challenge.enterpriseName} cloud team provisions dedicated staging subnets.`
      },
      {
        id: 'raci-2',
        activity: 'Connector configuration & test data schema mapping',
        enterpriseRole: 'Consulted',
        startupRole: 'Responsible',
        notes: `${startup.name} deploys software adapters meeting schema specifications.`
      },
      {
        id: 'raci-3',
        activity: 'Sanitized sample dataset extraction & compliance verification',
        enterpriseRole: 'Accountable',
        startupRole: 'Consulted',
        notes: 'Ensures zero unmasked customer PII enters the pilot boundary.'
      },
      {
        id: 'raci-4',
        activity: 'Execution of 30-day active workload test scenarios',
        enterpriseRole: 'Responsible',
        startupRole: 'Responsible',
        notes: 'Joint engineering execution with daily exception triage.'
      },
      {
        id: 'raci-5',
        activity: 'Final governance evaluation & commercial transition sign-off',
        enterpriseRole: 'Accountable',
        startupRole: 'Informed',
        notes: 'Enterprise executive steering committee renders procurement decision.'
      }
    ];

    // 3. Assemble complete typed PilotProposal
    const proposal: PilotProposal = {
      id: proposalId,
      challengeId: challenge.id,
      startupId: startup.id,
      challengeTitle: challenge.title,
      enterpriseName: challenge.enterpriseName,
      startupName: startup.name,
      startupCountry: startup.country,
      status: 'Draft',
      nextAction: 'Review draft & submit for steering review',
      version: 1,
      createdAt: now,
      updatedAt: now,
      editedFields: [],
      approvalRecord: {
        status: 'Draft',
        explicitHumanSignoff: false
      },
      originalGenerated: {
        executiveSummary: stagesData.executiveSummary,
        inScope: [...stages.pilotScoping.inScope],
        outOfScope: [...stages.pilotScoping.outOfScope],
        milestones: JSON.parse(JSON.stringify(stages.roadmap.milestones)),
        raciMatrix: JSON.parse(JSON.stringify(raciMatrix)),
        kpis: JSON.parse(JSON.stringify(stages.kpiDesign.kpis)),
        snapshotCreatedAt: now
      },
      sourceSnapshot: {
        challenge: JSON.parse(JSON.stringify(challenge)),
        startup: JSON.parse(JSON.stringify(startup)),
        generatedAt: now
      },
      provenance: {
        verifiedStartupFacts: [
          `${startup.name} is a ${startup.stage || 'verified'} tech enterprise (${startup.country}).`,
          `Verified Security Certifications: ${startup.dataSecurityConsiderations.certifications.join(', ')}.`,
          `Sovereign Data Residency Footprint: ${startup.dataSecurityConsiderations.dataResidency.join(', ')}.`,
          `Known Operational Limitations: ${startup.knownLimitations[0] || 'Standard enterprise pilot boundaries.'}`
        ],
        enterpriseSuppliedInputs: [
          `Enterprise Partner: ${challenge.enterpriseName} (${challenge.country}).`,
          `Problem Description: "${challenge.problemDescription}"`,
          `Target Desired Outcome: "${challenge.desiredOutcome}"`,
          `Data Sensitivity Classification: ${challenge.dataSensitivity}.`,
          `Data Residency Constraint: ${challenge.requiresLocalDataResidency ? `Mandatory inside ${challenge.country}` : 'Regional cloud nodes permitted'}.`
        ],
        aiGeneratedSections: [
          '60-Day example staged roadmap (Phase 1 Setup, Phase 2 Active Run, Phase 3 Governance).',
          'Measurable KPI targets explicitly framed as working assumptions pending sandbox validation.',
          'RACI responsibility distribution matrix between enterprise IT and startup engineering.',
          'Country-specific statutory compliance verification checklist.'
        ]
      },
      executiveSummary: stagesData.executiveSummary,
      problemStatement: stages.challengeUnderstanding.problemSummary,
      proposedSolution: stages.pilotScoping.pilotObjective,
      inScope: stages.pilotScoping.inScope,
      outOfScope: stages.pilotScoping.outOfScope,
      integrationArchitecture: `${stages.pilotScoping.requiredIntegrations.join(' ')} Data residency governed by ${startup.dataSecurityConsiderations.dataResidency[0] || 'designated regional VPC'}.`,
      milestones: stages.roadmap.milestones,
      raciMatrix,
      kpis: stages.kpiDesign.kpis,
      technicalRisks: [
        ...stages.riskCompliance.integrationRisks,
        ...stages.riskCompliance.operationalRisks
      ],
      dataResidencyPlan: challenge.requiresLocalDataResidency
        ? `All computation and data storage will reside strictly within availability zones in ${challenge.country} (${startup.dataSecurityConsiderations.dataResidency.find(r => r.includes(challenge.country)) || startup.dataSecurityConsiderations.dataResidency[0]}).`
        : `Data will be hosted in ${startup.dataSecurityConsiderations.dataResidency[0] || 'designated regional cloud nodes'} protected by AES-256 and TLS 1.3 encryption.`,
      openQuestions: [
        ...stages.riskCompliance.dataPrivacyQuestions,
        ...stages.riskCompliance.regulatoryQuestions
      ],
      legalDisclaimer: stages.riskCompliance.legalDisclaimer
    };

    const metadata: GenerationMetadata = {
      provider: activeAdapter.providerId,
      modelName: activeAdapter.name,
      generationStatus: usedFallback ? 'fallback' : 'completed',
      latencyMs,
      usedFallback,
      attempts,
      completedAt: now,
      errorNote: failureReason
    };

    return {
      proposal,
      stages,
      metadata
    };
  }
}
