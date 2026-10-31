import { PilotProposal } from '@/types';

export const SAMPLE_PROPOSALS: PilotProposal[] = [
  {
    id: 'prop-sample-01',
    challengeId: 'chal-sample-01',
    startupId: 'startup-sg-tookitaki',
    challengeTitle: 'Real-time Cross-Border Remittance AML & Fraud Screen Sandbox',
    enterpriseName: 'Maybank Regional Digital Banking',
    startupName: 'Tookitaki FinSights',
    startupCountry: 'SG',
    status: 'Under Review',
    nextAction: 'Awaiting steering committee sign-off',
    version: 2,
    createdAt: '2026-10-24T08:30:00Z',
    updatedAt: '2026-10-29T14:20:00Z',
    editedFields: ['executiveSummary'],
    approvalRecord: {
      status: 'Under Review',
      explicitHumanSignoff: false,
      decisionNotes: 'Submitted for Group Risk & Compliance steering review.'
    },
    provenance: {
      verifiedStartupFacts: [
        'MAS TRM Guideline Compliant & ISO/IEC 27001 certified.',
        'Production track record with United Overseas Bank (UOB) and Tier-1 lenders.',
        'Pre-built Apache Spark / Kafka connectors for real-time transaction ingestion.'
      ],
      enterpriseSuppliedInputs: [
        'High false-positive rate (84%) currently overwhelming compliance analysts in SG & MY.',
        'Strict SLA requirement: <180ms decision latency per transaction event.',
        'Target pilot duration: 8 weeks in an isolated staging environment.'
      ],
      aiGeneratedSections: [
        'Structured 3-phase sandbox pilot plan with milestone acceptance gates.',
        'RACI matrix establishing explicit boundaries between bank IT and startup engineering.',
        'Measurable KPI target to cut false positives by 40% while preserving 100% recall on AML typologies.'
      ]
    },
    executiveSummary:
      'This 8-week Proof-of-Concept evaluates Tookitaki FinSights within Maybank’s isolated staging environment to benchmark real-time AML transaction monitoring against existing legacy rule sets. The pilot focuses on reducing compliance analyst alert fatigue across cross-border SG-MY remittance corridors while preserving complete regulatory auditability.',
    problemStatement:
      'Maybank’s regional cross-border retail payment channels generate over 120,000 daily transactions with an 84% false-positive alert rate under static rule engines. This drives prohibitive manual investigation costs and risks customer friction during peak remittance windows.',
    proposedSolution:
      'Deploy Tookitaki’s federated typology network and ML anomaly detection in an asynchronous shadow-mode sandbox. The engine ingests anonymized transaction streams to score suspicious behavior and auto-suppress known benign patterns without altering live core banking operations.',
    inScope: [
      'Ingestion of 30 days of historical anonymized remittance logs (approx. 3.5M records).',
      'Synthetic live-stream stress testing simulating 1,200 transactions per second (TPS).',
      'Comparative benchmarking against Maybank’s current rule engine outputs.',
      'Deployment within Maybank SG-AWS VPC with zero outbound external data egress.'
    ],
    outOfScope: [
      'Production write-back or automated blocking of live customer transactions.',
      'Integration with external core credit bureaus or foreign tax registries.',
      'Customer-facing UI or mobile app modifications.'
    ],
    integrationArchitecture:
      'Read-only event streaming via Kafka consumer group to a dedicated Tookitaki container cluster running within Maybank’s private VPC. Anonymization proxy strips PII (names, NRIC/passport, raw account numbers) before typology analysis.',
    milestones: [
      {
        id: 'm1',
        phase: 'Phase 1: Environment & Synthetic Ingestion',
        title: 'Sandbox Provisioning & Data Anonymization Validation',
        durationWeeks: 2,
        deliverables: [
          'VPC peering and Kafka topic subscription verification.',
          'Anonymization pipeline certification meeting bank infosec standards.',
          'Initial historical data batch load and baseline schema mapping.'
        ],
        acceptanceCriteria: 'Bank infosec sign-off on zero-PII leakage and successful ingestion of 100k sample test events.'
      },
      {
        id: 'm2',
        phase: 'Phase 2: Benchmark Evaluation',
        title: 'Model Tuning & Shadow Run Execution',
        durationWeeks: 4,
        deliverables: [
          'Parallel execution of legacy rules vs Tookitaki typology models over 14 days.',
          'Real-time latency profiling under simulated peak traffic bursts.',
          'False-positive reduction audit report co-signed by compliance leads.'
        ],
        acceptanceCriteria: 'Achieve >35% reduction in alert volume with zero false negatives on historical regulatory flagged test cases.'
      },
      {
        id: 'm3',
        phase: 'Phase 3: Governance & Final Business Case',
        title: 'Executive Pilot Review & Production Blueprint',
        durationWeeks: 2,
        deliverables: [
          'Final quantitative POC performance evaluation report.',
          'Production architecture sizing, operational runbook, and total cost of ownership (TCO) model.',
          'Handover documentation and sandbox teardown.'
        ],
        acceptanceCriteria: 'Formal sign-off by Head of Financial Crime Compliance and Enterprise Architecture Committee.'
      }
    ],
    raciMatrix: [
      {
        id: 'r1',
        activity: 'VPC sandbox provisioning & network access tokens',
        enterpriseRole: 'Responsible',
        startupRole: 'Consulted',
        notes: 'Maybank Cloud Platform team provisions dedicated staging subnets.'
      },
      {
        id: 'r2',
        activity: 'Data anonymization proxy deployment and testing',
        enterpriseRole: 'Accountable',
        startupRole: 'Responsible',
        notes: 'Tookitaki deploys hashing algorithms tested against MAS TRM guidelines.'
      },
      {
        id: 'r3',
        activity: 'Historical transaction log ingestion and model calibration',
        enterpriseRole: 'Consulted',
        startupRole: 'Responsible',
        notes: 'Fine-tunes typology sensitivity based on historical false-positive logs.'
      },
      {
        id: 'r4',
        activity: 'Weekly compliance alert precision audit',
        enterpriseRole: 'Responsible',
        startupRole: 'Informed',
        notes: 'Maybank compliance officers independently score flagged alerts.'
      },
      {
        id: 'r5',
        activity: 'Final POC governance presentation and production recommendation',
        enterpriseRole: 'Accountable',
        startupRole: 'Responsible',
        notes: 'Joint presentation to Maybank Innovation & Group Risk committees.'
      }
    ],
    kpis: [
      {
        id: 'k1',
        metric: 'False-Positive Alert Reduction',
        baseline: '84.2% of generated AML alerts are false alarms',
        target: '≤ 45.0% false-positive rate across test corridors',
        measurementMethod: 'Comparative audit by 3 independent senior compliance analysts.'
      },
      {
        id: 'k2',
        metric: 'Decision Pipeline Latency (p99)',
        baseline: '450ms under legacy batch pipeline',
        target: '≤ 120ms at 1,500 transactions per second',
        measurementMethod: 'CloudWatch synthetic monitoring with timestamped Kafka message tags.'
      },
      {
        id: 'k3',
        metric: 'Regulatory Typology Coverage',
        baseline: 'Static rules covering 14 basic pattern scenarios',
        target: 'Dynamic coverage of 40+ complex ASEAN trade-based laundering typologies',
        measurementMethod: 'Validation against MAS & BNM red-flag scenario library.'
      }
    ],
    technicalRisks: [
      'Data drift between historical training datasets and high-velocity live test data.',
      'Kafka broker partition lag during simulated 2,000 TPS burst stress tests.',
      'Information security policy delays in authorizing staging environment database access.'
    ],
    dataResidencyPlan:
      'All computational execution and intermediate database storage will reside strictly in Maybank’s isolated AWS Singapore (ap-southeast-1) private tenant. No payload or telemetry data is routed outside this zone.',
    openQuestions: [
      'Can Maybank provide 90 days of labeled historical SAR (Suspicious Activity Report) filings for ground-truth training?',
      'Will the compliance operations team commit two dedicated FTE analysts for Phase 2 dual-scoring?'
    ],
    legalDisclaimer:
      'ADVISORY NOTICE: This Proof-of-Concept proposal is a technical and operational exploration draft. It does not constitute formal regulatory pre-approval from the Monetary Authority of Singapore (MAS) or Bank Negara Malaysia (BNM). Full regulatory and legal due diligence is required prior to commercial production cutover.'
  },
  {
    id: 'prop-sample-02',
    challengeId: 'chal-sample-02',
    startupId: 'startup-id-logisly',
    challengeTitle: 'FMCG Inter-Island Cold-Chain IoT Visibility Pilot',
    enterpriseName: 'Indofood Agri Resources',
    startupName: 'Logisly FreightMesh',
    startupCountry: 'ID',
    status: 'Approved',
    nextAction: 'Download PDF & initiate Phase 1 sandbox agreement',
    version: 1,
    createdAt: '2026-10-18T10:15:00Z',
    updatedAt: '2026-10-26T16:45:00Z',
    editedFields: [],
    approvalRecord: {
      status: 'Approved',
      decidedBy: 'Budi Santoso',
      deciderRole: 'VP of Supply Chain Technology',
      decidedAt: '2026-10-26T16:45:00Z',
      decisionNotes: 'Formally approved following verification of Kominfo PSE status and Jakarta GCP local residency.',
      explicitHumanSignoff: true
    },
    provenance: {
      verifiedStartupFacts: [
        'Over 40,000 monthly freight movements managed across Java, Sumatra, and Sulawesi.',
        'Kominfo PSE registered with localized Indonesian cloud presence (ID-GCP Jakarta).',
        'Direct hardware telematics integrations with Teltonika and Queclink IoT trackers.'
      ],
      enterpriseSuppliedInputs: [
        'High spoilage rate (6.8%) on temperature-sensitive dairy and refrigerated lines.',
        'Target corridor: Surabaya to Makassar inter-island ferry and refrigerated trucking route.',
        'Requested pilot duration: 6 weeks across 25 dedicated test vehicles.'
      ],
      aiGeneratedSections: [
        'Sensor placement guide and IoT heartbeat frequency recommendation.',
        'Automated e-POD temperature breach exception notification workflow.',
        'Shared responsibility RACI mapping port handling and maritime transit handoffs.'
      ]
    },
    executiveSummary:
      'A 6-week operational pilot deploying Logisly’s IoT telematics and FreightMesh platform across 25 refrigerated trucks operating between Surabaya and Makassar. The pilot benchmarks real-time temperature tracking, cold-chain exception alerts, and automated proof-of-delivery to cut transit spoilage by 60%.',
    problemStatement:
      'Indofood’s cold-chain distribution across maritime roll-on/roll-off (RoRo) ferry crossings suffers from intermittent visibility blackouts, leading to unmonitored temperature spikes and high spoilage disputes with third-party logistics (3PL) carriers.',
    proposedSolution:
      'Equip 25 refrigerated fleet assets with Logisly dual-SIM BLE temperature sensors and offline-buffering GPS trackers that automatically sync trip telemetry to Indofood’s logistics control tower whenever 4G connectivity is re-established.',
    inScope: [
      'Installation of cellular IoT temperature sensors across 25 designated 3PL trucks.',
      'Integration of Logisly exception webhook API into Indofood’s SAP Transport Management module.',
      'Real-time alert dispatch to warehouse receiving teams via WhatsApp Business API and email.',
      'Weekly carrier SLA scorecards evaluating temperature compliance.'
    ],
    outOfScope: [
      'Physical retrofitting of refrigeration compressor units or mechanical maintenance.',
      'Full nationwide rollout across Indofood’s 600+ dry freight vehicle fleet.',
      'Hardware procurement beyond the 25 pilot tracker units provided by Logisly.'
    ],
    integrationArchitecture:
      'MQTT sensor telemetry sent to Logisly’s Jakarta GCP ingestion cluster. Outbound REST webhooks push sanitized trip status and temperature threshold breaches directly into Indofood’s private corporate intranet via secure API gateway.',
    milestones: [
      {
        id: 'm1',
        phase: 'Phase 1: Sensor Deployment & Fleet Calibration',
        title: 'Hardware Installation & Driver Onboarding',
        durationWeeks: 2,
        deliverables: [
          'Installation of 25 certified temperature data loggers in test reefers.',
          'Driver mobile app training for digital trip manifest creation and e-POD sign-off.',
          'Baseline temperature variance calibration inside refrigerated chambers.'
        ],
        acceptanceCriteria: '100% sensor pairing verified with live telemetry visible in Indofood dispatch console.'
      },
      {
        id: 'm2',
        phase: 'Phase 2: Live Corridor Trialling',
        title: 'Active Maritime Transit Monitoring',
        durationWeeks: 3,
        deliverables: [
          'Tracking of minimum 50 completed round trips between Surabaya and Makassar.',
          'Real-time exception notification within 60 seconds of any 2°C threshold breach.',
          'Automated carrier penalty and rebate calculation based on digital temperature logs.'
        ],
        acceptanceCriteria: 'Zero untracked temperature excursion events across the 50 pilot trips.'
      },
      {
        id: 'm3',
        phase: 'Phase 3: Financial & SLA Synthesis',
        title: 'Pilot Impact Review & Procurement Business Case',
        durationWeeks: 1,
        deliverables: [
          'Quantified spoilage reduction financial impact report.',
          '3PL carrier feedback and operational SLA scorecard.',
          'Multi-year enterprise contract proposal and scaled rollout schedule.'
        ],
        acceptanceCriteria: 'Review and sign-off by Indofood Logistics VP and Procurement Director.'
      }
    ],
    raciMatrix: [
      {
        id: 'r1',
        activity: 'Hardware sensor provision & vehicle mounting',
        enterpriseRole: 'Consulted',
        startupRole: 'Responsible',
        notes: 'Logisly field engineers install sensors at Surabaya distribution depot.'
      },
      {
        id: 'r2',
        activity: '3PL carrier coordination and driver protocol enforcement',
        enterpriseRole: 'Responsible',
        startupRole: 'Informed',
        notes: 'Indofood logistics supervisors mandate e-POD checklist usage.'
      },
      {
        id: 'r3',
        activity: 'SAP Transport Management webhook endpoint configuration',
        enterpriseRole: 'Responsible',
        startupRole: 'Consulted',
        notes: 'Indofood enterprise IT team maps inbound JSON event schemas.'
      },
      {
        id: 'r4',
        activity: '24/7 telematics exception triage & support',
        enterpriseRole: 'Informed',
        startupRole: 'Responsible',
        notes: 'Logisly operations desk monitors sensor battery and signal integrity.'
      }
    ],
    kpis: [
      {
        id: 'k1',
        metric: 'Cargo Spoilage Reduction Rate',
        baseline: '6.8% incident rate on tested maritime corridor',
        target: '≤ 2.0% incident rate during pilot duration',
        measurementMethod: 'Receiving dock quality inspection logs at Makassar distribution hub.'
      },
      {
        id: 'k2',
        metric: 'Real-time Exception Notification Time',
        baseline: 'Discovered upon arrival (average 48 hours post-incident)',
        target: '≤ 5 minutes of cellular reconnect / immediate upon threshold breach',
        measurementMethod: 'Automated timestamp comparison between sensor event and alert push.'
      },
      {
        id: 'k3',
        metric: 'Digital Proof of Delivery (e-POD) Adoption',
        baseline: '100% paper-based delivery receipts taking 12 days to reconcile',
        target: '≥ 90% digital e-POD completion within 2 hours of dock unloading',
        measurementMethod: 'System audit of completed delivery signatures in FreightMesh.'
      }
    ],
    technicalRisks: [
      'Extended maritime dead zones during Java Sea ferry crossings exceeding 12 hours.',
      'Driver tampering or sensor disconnection during vehicle loading.',
      'Extreme humidity causing sensor calibration drift in older refrigerated trailers.'
    ],
    dataResidencyPlan:
      'All GPS coordinates, temperature readings, and carrier logs reside inside Google Cloud Platform Jakarta (asia-southeast2) conforming with Indonesian Government Regulation PP 71/2019.',
    openQuestions: [
      'Will 3PL contracted transport partners permit permanent mounting brackets on their leased trailers?',
      'Does Indofood require integration with their legacy AS/400 warehouse terminal?'
    ],
    legalDisclaimer:
      'ADVISORY NOTICE: This Proof-of-Concept proposal serves solely as an operational trial framework. Commercial carrier liability adjustments and insurance claim terms require formal legal contract execution.'
  }
];
