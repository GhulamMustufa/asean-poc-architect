import { CuratedStartup, EnterpriseChallenge, ASEANCountry } from '@/types';
import { ModelAdapter, StructuredProposalOutput } from './modelAdapter.interface';

export class DeterministicFallbackAdapter implements ModelAdapter {
  name = 'Deterministic Fallback Engine (Zero-Failure Demo Adapter)';
  providerId = 'deterministic-fallback' as const;

  isAvailable(): boolean {
    return true; // Always available
  }

  async generateStages(
    challenge: EnterpriseChallenge,
    startup: CuratedStartup
  ): Promise<StructuredProposalOutput> {
    // -------------------------------------------------------------------------
    // STAGE 1: CHALLENGE UNDERSTANDING
    // -------------------------------------------------------------------------
    const missingInfoItems: string[] = [];
    if (!challenge.technicalRequirements || challenge.technicalRequirements.length === 0) {
      missingInfoItems.push('Technical stack versions and architecture diagrams not supplied.');
    }
    if (!challenge.integrationConstraints) {
      missingInfoItems.push('Specific firewall / proxy and staging network boundaries not detailed.');
    }
    if (!challenge.budgetRangeUSD) {
      missingInfoItems.push('Enterprise pilot budget authorization threshold not provided.');
    }
    if (missingInfoItems.length === 0) {
      missingInfoItems.push('Formal historical baseline log volume for pre-pilot calibration to be confirmed.');
    }

    const challengeUnderstanding = {
      problemSummary: `${challenge.enterpriseName} is addressing operational bottlenecks in ${challenge.country} within ${challenge.industry}: ${challenge.problemDescription}`,
      desiredBusinessOutcomes: [
        challenge.desiredOutcome,
        `Validate operational feasibility of ${startup.name}'s capabilities within an isolated staging environment.`,
        `Establish an evidence-based business case for potential production rollout with zero live system disruption.`
      ],
      extractedConstraints: [
        `Expected POC timeline: 60-Day staged roadmap (8.5 Weeks).`,
        `Data sensitivity tier: ${challenge.dataSensitivity}.`,
        challenge.requiresLocalDataResidency
          ? `Strict domestic data residency mandated inside ${challenge.country}.`
          : `Regional ASEAN cloud deployment permitted with encrypted transmission.`,
        `Integration boundaries: ${challenge.integrationConstraints || 'Standard secure HTTPS REST / API integration.'}`
      ],
      assumptions: [
        `${challenge.enterpriseName} will allocate technical point-of-contact and staging environment access within Days 1–5.`,
        `Sanitized or synthetic test datasets representative of actual production schemas will be provided for benchmarking.`,
        `No production customer data or live core transactional databases will be directly modified during the trial.`
      ],
      missingInformation: missingInfoItems
    };

    // -------------------------------------------------------------------------
    // STAGE 2: PILOT SCOPING
    // -------------------------------------------------------------------------
    const pilotObjective = `Execute a controlled, non-disruptive 60-day Proof-of-Concept to evaluate ${startup.name}'s ${startup.coreCapabilities.slice(0, 3).join(', ')} against ${challenge.enterpriseName}'s operational performance benchmarks.`;

    const inScope = [
      `Provisioning of an isolated sandbox tenant in ${startup.dataSecurityConsiderations.dataResidency[0] || 'designated cloud zone'}.`,
      `Configuration of API connectors and test harness for agreed test scenarios.`,
      `Ingestion and processing of historical or synthetic test workloads.`,
      `Weekly performance benchmarking comparing accuracy, latency, and throughput against agreed baseline metrics.`,
      `Joint technical readout and production architecture sizing blueprint at Day 60.`
    ];

    const outOfScope = [
      `Direct write-back access to live production databases or mission-critical enterprise ERP systems.`,
      `Customer-facing commercial feature launch prior to completed information security audits.`,
      `Long-term software licensing agreements or permanent multi-year enterprise commitments during the trial.`,
      `Custom proprietary hardware retrofitting outside ${startup.name}'s standard appliance specifications.`
    ];

    const requiredIntegrations = [
      `Secure API gateway integration via mutual TLS (mTLS) and IP allowlisting.`,
      `Sanitized test data feed integration (${startup.integrationCapabilities[0] || 'RESTful API'}).`,
      `Telemetry reporting and log collection dashboard for joint evaluation.`
    ];

    const dependencies = [
      `${challenge.enterpriseName} IT security approval of sandbox network architecture.`,
      `Timely delivery of sanitized sample datasets for initial schema calibration.`,
      `Bi-weekly steering sync between enterprise project lead and startup engineering team.`
    ];

    const deliverables = [
      `Sandbox Architecture and Security Configuration Specification (Day 15).`,
      `Mid-Pilot Operational Calibration and Interim Performance Report (Day 35).`,
      `Final Proof-of-Concept Quantitative Evaluation Report and TCO Transition Blueprint (Day 60).`
    ];

    const pilotScoping = {
      pilotObjective,
      inScope,
      outOfScope,
      requiredIntegrations,
      dependencies,
      deliverables
    };

    // -------------------------------------------------------------------------
    // STAGE 3: ROADMAP (60-DAY EXAMPLE ROADMAP)
    // -------------------------------------------------------------------------
    const roadmap = {
      totalDays: 60,
      totalWeeks: 8,
      milestones: [
        {
          id: 'm1',
          phase: 'Phase 1: Setup & Data Readiness',
          dayRange: 'Days 1–15',
          durationWeeks: 2,
          title: 'Sandbox Provisioning & Security Baseline',
          owner: 'Joint Working Group' as const,
          deliverables: [
            'Isolated sandbox environment provisioned with private IP allowlisting.',
            'Data anonymization protocol verification meeting enterprise security standards.',
            'Initial schema mapping test with 10,000 synthetic sample events.'
          ],
          acceptanceCriteria: `${challenge.enterpriseName} IT security sign-off confirming zero live PII leakage and successful end-to-end sandbox handshake.`
        },
        {
          id: 'm2',
          phase: 'Phase 2: Pilot Trial & Workload Benchmarking',
          dayRange: 'Days 16–45',
          durationWeeks: 4,
          title: 'Active Workload Trialling & Performance Tuning',
          owner: 'Startup Lead' as const,
          deliverables: [
            'Continuous shadow execution of target operational test scenarios over 30 days.',
            'Weekly benchmark reporting on throughput, latency, and exception handling accuracy.',
            'Fine-tuning of algorithmic thresholds based on enterprise feedback.'
          ],
          acceptanceCriteria: 'Zero critical system outages and continuous processing meeting agreed pilot performance targets.'
        },
        {
          id: 'm3',
          phase: 'Phase 3: Impact Evaluation & Governance Blueprint',
          dayRange: 'Days 46–60',
          durationWeeks: 2,
          title: 'Executive Readout & Production Transition Roadmap',
          owner: 'Enterprise Lead' as const,
          deliverables: [
            'Consolidated POC evaluation report summarizing quantitative KPI achievement.',
            'Production enterprise architecture blueprint, operational runbook, and total cost of ownership (TCO) model.',
            'Complete teardown of sandbox test data with cryptographic destruction certificate.'
          ],
          acceptanceCriteria: 'Formal steering committee evaluation and strategic go/no-go determination on production procurement.'
        }
      ]
    };

    // -------------------------------------------------------------------------
    // STAGE 4: KPI DESIGN (MEASURABLE KPIS WITH TARGETS AS ASSUMPTIONS)
    // -------------------------------------------------------------------------
    const kpiDesign = {
      kpiGovernanceNotes: 'NOTICE: In accordance with architectural integrity standards, all target metrics below are marked as proposed working assumptions. Baseline values represent legacy workflows and must be formally measured in Phase 1.',
      kpis: [
        {
          id: 'kpi-1',
          metric: 'Primary Operational Efficiency & Cycle Time Reduction',
          baseline: 'Current legacy manual baseline (To be audited during Days 1–15)',
          target: '≥ 35% reduction in processing cycle time (Proposed Assumption - Subject to Sandbox Validation)',
          targetIsAssumption: true as const,
          measurementMethod: 'Comparative timestamp analysis on 500 standardized operational test transactions.',
          measurementPeriod: 'Evaluated continuously during Days 20–45'
        },
        {
          id: 'kpi-2',
          metric: 'Automated Accuracy & Precision Rate',
          baseline: 'Current manual baseline precision (To be verified with historical logs)',
          target: '≥ 95% classification/extraction precision (Proposed Assumption - Subject to Sandbox Validation)',
          targetIsAssumption: true as const,
          measurementMethod: 'Independent validation audit conducted by enterprise subject-matter experts.',
          measurementPeriod: 'Weekly sample batches throughout Phase 2'
        },
        {
          id: 'kpi-3',
          metric: 'System Interface Availability & Response Latency',
          baseline: 'N/A (New Pilot Infrastructure Interface)',
          target: '99.5% uptime with p95 latency < 250ms (Proposed Assumption - Subject to Sandbox Validation)',
          targetIsAssumption: true as const,
          measurementMethod: 'Automated synthetic monitoring and transaction response telemetry logging.',
          measurementPeriod: '24/7 continuous telemetry during active trial'
        }
      ]
    };

    // -------------------------------------------------------------------------
    // STAGE 5: RISK & COMPLIANCE REVIEW
    // -------------------------------------------------------------------------
    const countryRequirementsMap: Record<ASEANCountry, { mandate: string; verification: string }> = {
      SG: {
        mandate: 'Personal Data Protection Act 2012 (PDPA) & MAS Technology Risk Management (TRM) Guidelines',
        verification: 'Verify customer data anonymization proxy controls and AWS ap-southeast-1 encryption key ownership.'
      },
      MY: {
        mandate: 'Personal Data Protection Act 2010 (PDPA) & Bank Negara Malaysia (BNM) RMIT Policy',
        verification: 'Verify that cross-border cloud processing meets BNM Risk Management in Technology directives.'
      },
      ID: {
        mandate: 'Law No. 27/2022 on Personal Data Protection (UU PDP) & Government Regulation PP 71/2019',
        verification: 'Confirm electronic transaction logs and user data remain stored on Indonesian soil (Jakarta availability zone).'
      },
      VN: {
        mandate: 'Law on Cybersecurity No. 24/2018/QH14 & Decree 13/2023/ND-CP on Personal Data Protection',
        verification: 'Verify cross-border data transfer impact assessment (DTA) compliance before off-shore processing.'
      },
      TH: {
        mandate: 'Personal Data Protection Act B.E. 2562 (2019) (PDPA)',
        verification: 'Ensure explicit data controller-processor agreements and local data storage encryption protocols.'
      },
      PH: {
        mandate: 'Data Privacy Act of 2012 (Republic Act No. 10173) & National Privacy Commission (NPC) Circulars',
        verification: 'Verify NPC registration and employee consent mechanisms for automated payroll/data processing.'
      }
    };

    const targetReq = countryRequirementsMap[challenge.country] || countryRequirementsMap.SG;

    const riskCompliance = {
      dataPrivacyQuestions: [
        `Does the proposed synthetic test dataset require masking of specific customer identifiers prior to sandbox ingress?`,
        `What cryptographic key management protocol governs encryption keys for data in transit and at rest?`
      ],
      securityQuestions: [
        `Has ${startup.name}'s software undergone an independent third-party penetration test within the past 12 months?`,
        `How does the sandbox architecture enforce network isolation to prevent unauthorized lateral movement?`
      ],
      integrationRisks: [
        `Potential latency impact if enterprise firewall inspects deep-packet mTLS payloads.`,
        `Data schema format discrepancies between enterprise legacy exports and modern JSON ingestion APIs.`
      ],
      operationalRisks: [
        `Availability of designated enterprise technical leads during scheduled Phase 2 review gates.`,
        `Startup engineering capacity allocation during unexpected triage incidents.`
      ],
      regulatoryQuestions: [
        `Does this operational Proof-of-Concept touch any regulated activities requiring notification to ${challenge.country}'s statutory authority?`,
        `What formal sign-offs are required by enterprise Group Compliance before Phase 2 testing begins?`
      ],
      countrySpecificRequirements: [
        {
          country: challenge.country,
          jurisdictionMandate: targetReq.mandate,
          verificationNeeded: targetReq.verification,
          status: 'Requires Independent Legal Review' as const
        }
      ],
      separationAudit: {
        verifiedFacts: [
          `${startup.name} holds verified security credentials: ${startup.dataSecurityConsiderations.certifications.join(', ')}.`,
          `Startup data residency is formally documented in ${startup.dataSecurityConsiderations.dataResidency.join(', ')}.`,
          `Enterprise industry: ${challenge.industry} in ${challenge.country}.`
        ],
        unvalidatedAssumptions: [
          `Proposed 35% efficiency target is a modeling assumption pending live Phase 2 empirical validation.`,
          `Estimated sandbox setup timeline assumes enterprise network firewall rules are approved within 5 business days.`
        ],
        expertReviewRequired: [
          `Enterprise Legal Counsel review of liability caps and intellectual property ownership during trial.`,
          `Information Security Officer sign-off on mutual TLS certificate authority configuration.`
        ]
      },
      legalDisclaimer: 'ADVISORY NOTICE: This Proof-of-Concept proposal is a technical and operational exploration blueprint generated by ASEAN POC-Architect. It does not constitute formal statutory legal advice, regulatory authorization, or binding procurement commitments. All legal covenants and compliance reviews must be executed through formal corporate channels.'
    };

    // -------------------------------------------------------------------------
    // STAGE 6: PROPOSAL ASSEMBLY
    // -------------------------------------------------------------------------
    const executiveSummary = `This 60-day Proof-of-Concept pilot proposal outlines a structured operational trial between ${challenge.enterpriseName} and ${startup.name} (${startup.country}). By deploying ${startup.name}'s verified ${startup.coreCapabilities.slice(0, 3).join(', ')} capabilities within an isolated sandbox environment, the pilot provides an objective, empirical testbed to validate ${challenge.desiredOutcome.toLowerCase()} while maintaining zero disruption to live operations.`;

    return {
      challengeUnderstanding,
      pilotScoping,
      roadmap,
      kpiDesign,
      riskCompliance,
      executiveSummary
    };
  }
}
