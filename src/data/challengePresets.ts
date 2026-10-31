import type { EnterpriseChallenge } from '@/types';

export interface ChallengePreset {
  label: string;
  isRealWorld?: boolean;
  sourceNote?: string;
  data: Omit<EnterpriseChallenge, 'id' | 'createdAt'>;
}

/** One-click demo scenarios for the challenge form. */
export const CHALLENGE_PRESETS: ChallengePreset[] = [
  {
    label: '[REAL IMDA OIP] PSA Singapore — Port Turnaround Analytics (SG)',
    isRealWorld: true,
    sourceNote: 'IMDA Open Innovation Platform (Singapore)',
    data: {
      title: 'Predictive Quay Crane and Vessel Turnaround Analytics',
      enterpriseName: 'PSA Corporation Limited',
      industry: 'Logistics & Supply Chain',
      country: 'SG',
      problemDescription: 'Container vessels experience unpredictable quay crane waiting times during monsoon peak traffic in the Singapore Strait. Terminal planners require predictive vessel turnaround and berth allocation analytics to optimize crane moves per hour and reduce vessel carbon emissions during berth idle.',
      desiredOutcome: 'Deploy predictive AIS and crane telemetry models to achieve a 15% reduction in container vessel dwell time and improve berth scheduling accuracy by 25%.',
      technicalRequirements: [
        'Port Vessel Turnaround Analytics',
        'AIS Satellite Vessel Telemetry Ingestion',
        'Berth Allocation & Quay Crane Scheduling Optimization',
        'Maritime GHG Emission Tracking (Scope 1 & 2)'
      ],
      dataSensitivity: 'Confidential',
      integrationConstraints: 'Must ingest real-time AIS vessel telemetry and terminal operating system (TOS) EDI messages via secure HTTPS API with local Singapore data residency (AWS ap-southeast-1).',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$40,000 - $75,000 (IMDA OIP Grant Co-funded)',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '[REAL BNM SANDBOX] Maybank — Real-time Mule & Fraud Detection (MY)',
    isRealWorld: true,
    sourceNote: 'Bank Negara Malaysia FinTech Sandbox / Maybank Compliance',
    data: {
      title: 'AI-Assisted Transaction Fraud Surveillance & AML Alert Triage Sandbox',
      enterpriseName: 'Malayan Banking Berhad (Maybank)',
      industry: 'FinTech & Payments',
      country: 'MY',
      problemDescription: 'Cross-border digital remittance and instant retail payments generate high volumes of false-positive compliance alerts (exceeding 80%), overwhelming compliance investigators and slowing down legitimate customer payments while sophisticated money mule rings evade static rule engines.',
      desiredOutcome: 'Implement an explainable machine learning typology detection engine in a shadow production sandbox to reduce false-positive alerts by at least 40% while identifying high-risk mule account clusters within 15 minutes of first transaction.',
      technicalRequirements: ['Real-time Transaction Monitoring', 'Anti-Money Laundering (AML) Screening', 'Typology Graph Anomaly Scoring', 'Explainable Suspicion Rationale'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Read-only Kafka consumer group streaming with mTLS in dedicated VPC; strict adherence to Bank Negara Malaysia (BNM) RMIT guidelines; zero live database modification.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$50,000 - $90,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '[REAL BUMN PILOT] Indofood — Cold-Chain Telematics & e-POD (ID)',
    isRealWorld: true,
    sourceNote: 'Indonesia BUMN Supply Chain Forum / HUB.ID Komdigi',
    data: {
      title: 'End-to-End Cold-Chain Fleet Telematics & Temperature SLA Tracking',
      enterpriseName: 'PT Indofood CBP Sukses Makmur',
      industry: 'Logistics & Supply Chain',
      country: 'ID',
      problemDescription: 'Perishable dairy and frozen food shipments across inter-island Java and Sumatra logistics corridors suffer sporadic spoilage due to undetected reefer container compressor failures and unauthorized driver route detours.',
      desiredOutcome: 'Equip long-haul refrigerated fleets with real-time IoT temperature sensors and automated electronic proof-of-delivery (e-POD) to achieve zero temperature excursion spoilage across pilot transport corridors.',
      technicalRequirements: ['Real-time GPS / IoT Telematics', 'Cold-Chain Temperature Tracking', 'Proof of Delivery (e-POD)', 'Dynamic Fleet Dispatch'],
      dataSensitivity: 'Internal',
      integrationConstraints: 'Integration via REST webhooks into corporate SAP Transport Management module; offline buffering for 12+ hour maritime dead zones.',
      expectedDurationWeeks: 6,
      budgetRangeUSD: '$30,000 - $55,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '[REAL SUNWAY ILABS] Sunway Group — Smart Estate IoT Sub-metering (MY)',
    isRealWorld: true,
    sourceNote: 'Sunway iLabs Corporate Innovation Accelerator',
    data: {
      title: 'Smart Estate IoT Sub-metering & Energy Optimization',
      enterpriseName: 'Sunway Group',
      industry: 'Industrial IoT & Energy',
      country: 'MY',
      problemDescription: 'Commercial properties and retail facilities face rising utility tariffs and manual billing overhead from thousands of tenant electricity and water meters, preventing real-time carbon tracking and ESG compliance reporting.',
      desiredOutcome: 'Deploy automated IoT digital sub-metering with cloud billing and HVAC chiller plant optimization to achieve 12% energy reduction and automate tenant billing.',
      technicalRequirements: [
        'IoT Smart Water & Electricity Meter Telemetry',
        'Building Automation System (BAS) Integration',
        'Automated Rental Invoice & Receipt Generation',
        'Digital Twin Asset Cloud Telemetry'
      ],
      dataSensitivity: 'Internal',
      integrationConstraints: 'Must interface with existing BACnet and Modbus building management controllers and export energy data to Sunway sustainability cloud.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$35,000 - $65,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: 'Malaysian Commercial Bank (Fictional Demo Benchmark)',
    isRealWorld: false,
    sourceNote: 'Synthetic Benchmark Control',
    data: {
      title: 'AI-Assisted Transaction Fraud Surveillance & AML Alert Triage Sandbox',
      enterpriseName: 'Malayan Commercial Bank Berhad (Fictional Demo)',
      industry: 'FinTech & Payments',
      country: 'MY',
      problemDescription: 'High false-positive transaction alert volume (84%) from legacy rule engines is overwhelming compliance investigation teams across Malaysia and regional remittance corridors, driving manual investigation backlogs and delayed alert resolution.',
      desiredOutcome: 'Deploy explainable ML anomaly scoring in a shadow sandbox to cut manual investigation time by 40% while preserving 100% recall on verified fraud and AML typologies.',
      technicalRequirements: ['Real-time Transaction Monitoring', 'Anti-Money Laundering (AML) Screening', 'Typology Graph Anomaly Scoring', 'Explainable Suspicion Rationale'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Read-only Kafka consumer group streaming with mTLS in dedicated VPC; strict adherence to Bank Negara Malaysia (BNM) RMIT guidelines; zero live database modification.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$35,000 - $60,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: 'Cold-Chain IoT Visibility (Logistics / ID)',
    data: {
      title: 'Inter-Island Maritime Reefer Telematics & Temperature Compliance Monitoring',
      enterpriseName: 'Nusantara Agro-Cold Logistics',
      industry: 'Logistics & Supply Chain',
      country: 'ID',
      problemDescription: 'Frequent cargo spoilage and missing proof-of-delivery receipts during multi-day roll-on/roll-off ferry crossings between Java and Sulawesi islands.',
      desiredOutcome: 'Equip 25 refrigerated trucks with offline-buffering cellular IoT temperature trackers to achieve automated exception alerts and digital e-POD verification.',
      technicalRequirements: ['Real-time GPS / IoT Telematics', 'Cold-Chain Temperature Tracking', 'Proof of Delivery (e-POD)', 'Dynamic Fleet Dispatch'],
      dataSensitivity: 'Internal',
      integrationConstraints: 'Integration via REST webhooks into corporate SAP Transport Management module; offline buffering for 12+ hour maritime dead zones.',
      expectedDurationWeeks: 6,
      budgetRangeUSD: '$20,000 - $40,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: 'Multi-lingual ERP Invoice Extraction (Enterprise AI / MY)',
    data: {
      title: 'Automated 3-Way Cross-Border Supplier Invoice Ingestion into Enterprise SAP ERP',
      enterpriseName: 'Borneo Industrial Conglomerate',
      industry: 'Enterprise AI & Cybersecurity',
      country: 'MY',
      problemDescription: 'Accounts Payable teams spend over 400 hours monthly manually keying multi-currency invoices in Malay, English, and Vietnamese into legacy SAP ERP systems.',
      desiredOutcome: 'Automate document ingestion with over 98% field extraction accuracy and automated 3-way purchase order reconciliation.',
      technicalRequirements: ['Multi-lingual OCR (EN, ID, VN, TH)', 'Automated 3-Way Invoice Matching', 'SAP / NetSuite Direct Connectors', 'Tax & GST/VAT Validation'],
      dataSensitivity: 'Confidential',
      integrationConstraints: 'Must run in dedicated regional VPC with immutable audit trail lineage for external tax authority compliance.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$25,000 - $50,000',
      requiresLocalDataResidency: false
    }
  },
  {
    label: 'Hospital Insurance Claims Bridge (Healthcare / TH)',
    data: {
      title: 'Automated Outpatient Insurance Pre-Authorization & Direct TPA Claims Clearing',
      enterpriseName: 'Siam Regional Medical Network',
      industry: 'Healthcare & MedTech',
      country: 'TH',
      problemDescription: 'Manual insurance pre-authorization delays patient discharge by up to 3 hours, causing outpatient bed bottlenecks and administrative overhead.',
      desiredOutcome: 'Bridge Hospital Information System (HIS) with private insurer TPA endpoints for instant electronic eligibility checks and cashless settlement.',
      technicalRequirements: ['Hospital Information System (HIS) API Bridge', 'Direct Insurance TPA Claims Clearing', 'Electronic Health Record (EHR) Pseudonymization'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Strict compliance with Thailand PDPA and HIPAA pseudonymization standards; zero storage of raw patient clinical notes on third-party servers.',
      expectedDurationWeeks: 10,
      budgetRangeUSD: '$40,000 - $75,000',
      requiresLocalDataResidency: true
    }
  }
];
