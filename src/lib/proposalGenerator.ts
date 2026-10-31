import { CuratedStartup, EnterpriseChallenge, PilotProposal, ProposalMilestone, ProposalKpi, RaciItem } from '@/types';

export function generateStructuredProposal(
  challenge: EnterpriseChallenge,
  startup: CuratedStartup
): PilotProposal {
  const proposalId = `prop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // 1. Establish strict provenance metadata
  const verifiedStartupFacts = [
    `${startup.name} is a ${startup.stage} ASEAN tech enterprise founded in ${startup.foundedYear} (HQ: ${startup.headquarters}).`,
    `Verified Security Certifications: ${startup.verifiedCertifications.join(', ')}.`,
    `Verified Live Deployments: ${startup.notableDeployments.join(', ')}.`,
    `Cloud & Data Residency Footprint: ${startup.dataResidencyOptions.join(', ')}.`,
    `Evidence Audit Level: ${startup.evidenceQuality} (${startup.evidenceNotes})`
  ];

  const enterpriseSuppliedInputs = [
    `Enterprise: ${challenge.enterpriseName} (${challenge.country}) in ${challenge.industry}.`,
    `Core Business Problem: "${challenge.problemDescription}"`,
    `Target Business Outcome: "${challenge.desiredOutcome}"`,
    `Data Sensitivity Classification: ${challenge.dataSensitivity} with local data residency constraint: ${challenge.requiresLocalDataResidency ? 'YES' : 'NO'}.`,
    `Expected POC Duration: ${challenge.expectedDurationWeeks} weeks.`
  ];

  const aiGeneratedSections = [
    'Phased 3-stage pilot sandbox architecture tailored to the duration constraints.',
    'RACI governance matrix defining operational boundaries between enterprise IT and startup engineering.',
    'Quantitative KPI targets and baseline measurement methodology.',
    'Technical risk mitigation plan and regulatory compliance checklist.'
  ];

  // 2. Synthesize Executive Summary & Problem/Solution
  const executiveSummary =
    `This ${challenge.expectedDurationWeeks}-week Proof-of-Concept proposal outlines a structured pilot between ${challenge.enterpriseName} and ${startup.name} to address ${challenge.title.toLowerCase()}. By leveraging ${startup.name}'s verified ${startup.capabilities.slice(0, 3).join(', ')} capabilities, the pilot aims to validate operational feasibility, benchmark performance targets, and de-risk enterprise integration within an isolated, compliant sandbox environment.`;

  const problemStatement =
    `${challenge.enterpriseName} currently faces critical friction in its ${challenge.industry} operations: ${challenge.problemDescription}. Left unaddressed, this impacts business velocity, operational cost, and customer experience.`;

  const proposedSolution =
    `${startup.name} will deploy its enterprise solution (${startup.tagline}) using a low-friction, secure integration architecture. Utilizing ${startup.techStack.slice(0, 3).join(', ')}, the platform will ingest sample workflows to achieve: ${challenge.desiredOutcome}. The trial will run strictly in a non-disruptive pilot topology.`;

  // 3. Define Scope & Boundaries
  const inScope = [
    `Deployment of ${startup.name}'s software in an isolated staging or sandbox tenant.`,
    `Ingestion and processing of agreed sanitized enterprise datasets or synthetic traffic.`,
    `Bi-weekly performance benchmarking against current baseline metrics.`,
    `Testing adherence to ${challenge.requiresLocalDataResidency ? `local data residency within ${challenge.country}` : 'regional cloud data security best practices'}.`,
    `Executive evaluation readout and production transition blueprint.`
  ];

  const outOfScope = [
    'Unregulated direct modification of live production databases or mission-critical enterprise ERP/core systems.',
    'Customer-facing commercial launch prior to formal security audit and compliance sign-off.',
    'Permanent long-term software licensing commitments during the trial phase.'
  ];

  const integrationArchitecture =
    `Secure REST / gRPC API integration via mutual TLS (mTLS) and IP allowlisting. Data will be hosted according to ${startup.dataResidencyOptions[0] || 'designated regional VPC'}, with end-to-end encryption (AES-256 at rest, TLS 1.3 in transit) and zero unmasked PII exposure.`;

  // 4. Milestones based on expected duration
  const totalWeeks = challenge.expectedDurationWeeks || 8;
  const phase1Weeks = Math.max(1, Math.round(totalWeeks * 0.25));
  const phase2Weeks = Math.max(2, Math.round(totalWeeks * 0.5));
  const phase3Weeks = Math.max(1, totalWeeks - phase1Weeks - phase2Weeks);

  const milestones: ProposalMilestone[] = [
    {
      id: 'm1',
      phase: 'Phase 1: Environment Setup & Data Readiness',
      title: 'Sandbox Provisioning & Security Baseline',
      durationWeeks: phase1Weeks,
      deliverables: [
        'Secure sandbox tenant provisioning and network ingress/egress configuration.',
        'Data anonymization protocol verification and sample test dataset load.',
        'Initial API connectivity test and schema validation.'
      ],
      acceptanceCriteria: `${challenge.enterpriseName} IT security team sign-off on staging environment isolation and test data readiness.`
    },
    {
      id: 'm2',
      phase: 'Phase 2: Pilot Execution & Workload Benchmarking',
      title: 'Functional Trialling & Metric Calibration',
      durationWeeks: phase2Weeks,
      deliverables: [
        'Execution of primary test scenarios covering core business workflows.',
        'Weekly benchmark reports evaluating latency, accuracy, and operational throughput.',
        'Joint bi-weekly technical sprint reviews between technical leads.'
      ],
      acceptanceCriteria: `Successful processing of target test volume with zero critical system failures or unresolved security alerts.`
    },
    {
      id: 'm3',
      phase: 'Phase 3: Impact Evaluation & Transition Blueprint',
      title: 'Governance Review & Production Roadmap',
      durationWeeks: phase3Weeks,
      deliverables: [
        'Comprehensive POC evaluation report synthesizing quantitative KPI achievement.',
        'Total Cost of Ownership (TCO) and production integration architecture specification.',
        'Clean teardown of sandbox test data and return/deletion confirmation.'
      ],
      acceptanceCriteria: 'Executive presentation and formal decision on production procurement or scaled expansion.'
    }
  ];

  // 5. RACI Matrix
  const raciMatrix: RaciItem[] = [
    {
      id: 'r1',
      activity: 'Sandbox infrastructure provisioning & network allowlisting',
      enterpriseRole: 'Responsible',
      startupRole: 'Consulted',
      notes: `${challenge.enterpriseName} IT security oversees infrastructure isolation.`
    },
    {
      id: 'r2',
      activity: 'Software configuration and API adapter deployment',
      enterpriseRole: 'Consulted',
      startupRole: 'Responsible',
      notes: `${startup.name} engineering team deploys and configures the pilot instance.`
    },
    {
      id: 'r3',
      activity: 'Sanitized test dataset creation and quality verification',
      enterpriseRole: 'Responsible',
      startupRole: 'Consulted',
      notes: 'Ensures zero production PII or confidential trade secrets are exposed.'
    },
    {
      id: 'r4',
      activity: 'Operational scenario testing and day-to-day triage',
      enterpriseRole: 'Responsible',
      startupRole: 'Responsible',
      notes: 'Collaborative daily testing during active pilot execution.'
    },
    {
      id: 'r5',
      activity: 'Final governance review and steering committee sign-off',
      enterpriseRole: 'Accountable',
      startupRole: 'Informed',
      notes: `${challenge.enterpriseName} leadership renders commercial decision.`
    }
  ];

  // 6. KPIs & Target Metrics
  const kpis: ProposalKpi[] = [
    {
      id: 'k1',
      metric: 'Primary Operational Efficiency Gain',
      baseline: 'Current manual / legacy baseline workflow',
      target: '≥ 35% reduction in processing cycle time or manual review overhead',
      measurementMethod: 'Comparative time-motion analysis on 500 sample transactions.'
    },
    {
      id: 'k2',
      metric: 'System Accuracy & Precision Rate',
      baseline: 'Legacy baseline precision rate',
      target: '≥ 95% accuracy on automated classification / extraction tasks',
      measurementMethod: 'Independent validation sample reviewed by enterprise domain experts.'
    },
    {
      id: 'k3',
      metric: 'Integration Interface Reliability (Uptime & Latency)',
      baseline: 'N/A (New Pilot Architecture)',
      target: '≥ 99.5% API availability with p95 response time < 250ms',
      measurementMethod: 'Automated synthetic monitoring and endpoint telemetry logging.'
    }
  ];

  // 7. Risks & Compliance
  const technicalRisks = [
    `Data schema disparity between ${challenge.enterpriseName}'s legacy format and ${startup.name}'s ingestion API.`,
    `Network firewall latency or authentication token expiration during batch processing.`,
    `Team availability during crucial phase transitions requiring stakeholder sign-off.`
  ];

  const dataResidencyPlan = challenge.requiresLocalDataResidency
    ? `Data processing and storage will be strictly confined to cloud availability zones within ${challenge.country} (${startup.dataResidencyOptions.find(o => o.includes(challenge.country)) || startup.dataResidencyOptions[0]}), adhering to national data sovereignty and privacy mandates.`
    : `Data processing will leverage ${startup.name}'s certified secure regional nodes (${startup.dataResidencyOptions[0]}), protected by end-to-end cryptographic controls.`;

  const openQuestions = [
    `Will ${challenge.enterpriseName} provide pre-sanitized historical logs or will automated synthetic data generation be utilized?`,
    `Who is designated as the primary technical sponsor and escalation contact during the pilot?`,
    `What are the specific procurement prerequisites required prior to commercial contract discussion?`
  ];

  const legalDisclaimer =
    'ADVISORY NOTICE: This Proof-of-Concept proposal is an operational and technical scoping framework generated by ASEAN POC-Architect. It does not constitute formal legal advice, statutory regulatory authorization, or binding commercial procurement. All legal covenants, indemnities, and regulatory compliance reviews must be executed through formal institutional channels.';

  return {
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
      executiveSummary,
      inScope: [...inScope],
      outOfScope: [...outOfScope],
      milestones: JSON.parse(JSON.stringify(milestones)),
      raciMatrix: JSON.parse(JSON.stringify(raciMatrix)),
      kpis: JSON.parse(JSON.stringify(kpis)),
      snapshotCreatedAt: now
    },
    sourceSnapshot: {
      challenge: JSON.parse(JSON.stringify(challenge)),
      startup: JSON.parse(JSON.stringify(startup)),
      generatedAt: now
    },
    provenance: {
      verifiedStartupFacts,
      enterpriseSuppliedInputs,
      aiGeneratedSections
    },
    executiveSummary,
    problemStatement,
    proposedSolution,
    inScope,
    outOfScope,
    integrationArchitecture,
    milestones,
    raciMatrix,
    kpis,
    technicalRisks,
    dataResidencyPlan,
    openQuestions,
    legalDisclaimer
  };
}
