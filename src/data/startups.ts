import { CuratedStartup } from '@/types';
import { REAL_STARTUPS } from './realStartups';

export { REAL_STARTUPS };

/**
 * SYNTHETIC DEMONSTRATION DATASET (BENCHMARK CONTROLS)
 * 
 * DISCLAIMER:
 * All entity records in this array are fictional synthetic demonstration representations
 * created strictly for testing and benchmarking of ASEAN POC-Architect.
 */
export const SYNTHETIC_STARTUPS: CuratedStartup[] = [
  {
    id: 'synthetic-sg-sentrishield',
    name: 'SentriShield AI (Synthetic Demo)',
    country: 'SG',
    industry: 'FinTech & Payments',
    productDescription: 'Community-driven enterprise Anti-Money Laundering (AML) and transaction fraud surveillance engine designed for Tier-1 commercial banks and licensed cross-border payment institutions.',
    coreCapabilities: [
      'Real-time Transaction Monitoring',
      'Anti-Money Laundering (AML) Screening',
      'Sanction & PEP Screening',
      'Typology Graph Anomaly Scoring',
      'Explainable Suspicion Rationale',
      'Automated SAR Narrative Drafting'
    ],
    technologyCapabilities: [
      'Apache Kafka Real-time Streaming',
      'Apache Spark Batch & Streaming Engine',
      'Python / PyTorch Graph Neural Networks',
      'PostgreSQL Relational Audit Store',
      'Mutual TLS (mTLS) & gRPC Interfaces',
      'Docker / Kubernetes Deployment'
    ],
    targetCustomerSegments: [
      'Tier-1 Commercial Banks',
      'Licensed Cross-Border Payment Providers',
      'Digital Challenger Banks',
      'Regional Remittance Operators'
    ],
    integrationCapabilities: [
      'Kafka Consumer Group Event Streaming',
      'RESTful OpenAPI 3.0 Endpoints',
      'Mutual TLS (mTLS) Authentication',
      'Private VPC Peering (AWS ap-southeast-1)',
      'Nightly Batch SFTP Re-scoring Pipeline'
    ],
    relevantUseCases: [
      'Cross-border remittance fraud mitigation',
      'High-velocity credit card anomaly detection',
      'Automated suspicious activity report (SAR) compliance drafting',
      'Reduction of false-positive transaction alerts'
    ],
    dataSecurityConsiderations: {
      certifications: ['ISO/IEC 27001 Certified', 'SOC 2 Type II Audited', 'MAS TRM Aligned'],
      dataResidency: ['SG-AWS (ap-southeast-1)', 'Dedicated On-Premise Airgap Appliance'],
      encryption: 'AES-256 at rest, TLS 1.3 in transit with client certificate pinning',
      complianceNotes: 'Synthetic compliance architecture designed to satisfy Monetary Authority of Singapore (MAS) TRM guidelines and PDPA data isolation standards.'
    },
    knownLimitations: [
      'Requires a minimum of 50,000 historical labeled transactions for optimal graph typology calibration.',
      'Does not directly integrate with legacy IBM mainframe COBOL transaction logs without an intermediary Kafka or MQ adapter.',
      'Does not provide an end-user consumer mobile application (strictly enterprise B2B backend infrastructure).'
    ],
    isSyntheticDemo: true,
    foundedYear: 2021,
    stage: 'Series B',
    website: 'https://demo-sentrishield.synthetic.asia',
    tagline: 'Enterprise Real-time AML & Cross-Border Fraud Prevention Engine',
    summary: 'Synthetic FinTech startup profile demonstrating automated AML transaction monitoring and suspicious typology graph detection for regional commercial banks.',
    primaryIndustry: 'FinTech & Payments',
    secondaryIndustries: ['Enterprise AI & Cybersecurity'],
    capabilities: [
      'Real-time Transaction Monitoring',
      'Anti-Money Laundering (AML) Screening',
      'Sanction & PEP Screening',
      'Typology Graph Anomaly Scoring',
      'Explainable Suspicion Rationale',
      'Kafka Event Streaming'
    ],
    techStack: ['Kafka', 'Spark', 'Python', 'PyTorch', 'PostgreSQL', 'Kubernetes'],
    verifiedCertifications: ['ISO/IEC 27001', 'SOC 2 Type II', 'MAS TRM Aligned'],
    dataResidencyOptions: ['SG-AWS (ap-southeast-1)', 'Dedicated On-Premise Airgap Appliance'],
    notableDeployments: ['Simulated Sandbox Tier-1 Bank (SG)', 'Simulated Regional Remittance Hub (MY)'],
    evidenceQuality: 'Audited Tier-1',
    evidenceNotes: 'Synthetic audited benchmark profile demonstrating 99.8% precision on simulated FATF red-flag test vectors.',
    headquarters: 'Singapore (Fictional Demo)'
  },
  {
    id: 'synthetic-id-nusantaracold',
    name: 'NusantaraCold IoT (Synthetic Demo)',
    country: 'ID',
    industry: 'Logistics & Supply Chain',
    productDescription: 'Inter-island refrigerated freight telematics and automated cold-chain temperature exception engine built for maritime and trucking operators across Indonesia.',
    coreCapabilities: [
      'Real-time GPS & BLE Temperature Telematics',
      'Offline-Buffering Telemetry Sync',
      'Electronic Proof of Delivery (e-POD)',
      'Cold-Chain Temperature Breach Alerts',
      'Carrier SLA & Demurrage Auditing',
      'Reefer Container Humidity Tracking'
    ],
    technologyCapabilities: [
      'MQTT IoT Sensor Protocol',
      'Go / Golang Ingestion Microservices',
      'Google Cloud Platform (Jakarta asia-southeast2)',
      'TimescaleDB Time-Series Database',
      'React Native Mobile Driver Application',
      'REST Webhooks for ERP Integration'
    ],
    targetCustomerSegments: [
      'FMCG Cold-Chain Distributors',
      'Maritime Roll-on/Roll-off (RoRo) Ferry Carriers',
      'Pharmaceutical Temperature-Controlled Shippers',
      'National Supermarket Warehouse Operators'
    ],
    integrationCapabilities: [
      'Outbound REST Webhooks',
      'SAP Transport Management (TM) REST API Adapter',
      'WhatsApp Business API Notification Bridge',
      'CSV / JSON Batch S3 Ingestion'
    ],
    relevantUseCases: [
      'Inter-island refrigerated ferry transit monitoring',
      'Perishable dairy and frozen poultry spoilage prevention',
      'Automated carrier penalty calculation for temperature excursion',
      'Paperless e-POD delivery verification at receiving dock'
    ],
    dataSecurityConsiderations: {
      certifications: ['ISO 9001 Quality Certified', 'Kominfo PSE Registered (ID)'],
      dataResidency: ['ID-GCP (Jakarta asia-southeast2)', 'ID-AWS (Jakarta)'],
      encryption: 'TLS 1.2 payload encryption, encrypted sensor flash storage',
      complianceNotes: 'Compliant with Indonesian Government Regulation PP 71/2019 on electronic data system sovereignty.'
    },
    knownLimitations: [
      'Sensor battery life limited to 45 days continuous reporting before recharge is required.',
      'Real-time alert transmission delayed while at open sea until cellular 4G/LTE reconnects at destination port.',
      'Hardware mounting requires physical access to refrigerated container door seals.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2020,
    stage: 'Series A',
    website: 'https://demo-nusantaracold.synthetic.id',
    tagline: 'IoT Cold-Chain Telematics & Inter-Island Freight Visibility',
    summary: 'Synthetic logistics startup profile providing offline-buffering temperature telemetry and e-POD verification for Indonesian maritime corridors.',
    primaryIndustry: 'Logistics & Supply Chain',
    secondaryIndustries: ['AgriFood & ClimateTech', 'Retail & E-commerce'],
    capabilities: [
      'Real-time GPS / IoT Telematics',
      'Cold-Chain Temperature Tracking',
      'Proof of Delivery (e-POD)',
      'Offline-Buffering Telemetry',
      'Carrier SLA Auditing'
    ],
    techStack: ['MQTT', 'Go', 'TimescaleDB', 'GCP Jakarta', 'React Native'],
    verifiedCertifications: ['Kominfo PSE Registered', 'ISO 9001 Quality'],
    dataResidencyOptions: ['ID-GCP (Jakarta)', 'ID-AWS (Jakarta)'],
    notableDeployments: ['Simulated Surabaya-Makassar Dairy Trial', 'Simulated Jakarta Port Pilot'],
    evidenceQuality: 'Enterprise Verified',
    evidenceNotes: 'Synthetic benchmark demonstrating zero data loss across simulated 18-hour Java Sea connectivity dead zones.',
    headquarters: 'Jakarta, Indonesia (Fictional Demo)'
  },
  {
    id: 'synthetic-my-docuflow',
    name: 'BhdDocuFlow Systems (Synthetic Demo)',
    country: 'MY',
    industry: 'Enterprise AI & Cybersecurity',
    productDescription: 'Multi-lingual intelligent document processing (IDP) and 3-way purchase order reconciliation platform tailored for multinational ERP systems in Malaysia and Singapore.',
    coreCapabilities: [
      'Multi-lingual OCR (English, Malay, Chinese, Vietnamese)',
      'Automated 3-Way Invoice Matching',
      'ERP Journal Ledger Generation',
      'Tax & SST/GST/VAT Validation',
      'Audit Trail Lineage & Extraction Confidence',
      'Duplicate Invoice Detection'
    ],
    technologyCapabilities: [
      'Python / PyTorch LayoutLMv3 Custom Models',
      'FastAPI Microservice Backend',
      'PostgreSQL Document Store',
      'SAP RFC / BAPI NetWeaver Connector',
      'Azure Cloud Malaysia (Kuala Lumpur)',
      'REST & GraphQL Document Ingestion APIs'
    ],
    targetCustomerSegments: [
      'Multinational Conglomerates & Shared Services Centers',
      'Regional Manufacturing Enterprises',
      'Large FMCG Wholesalers',
      'Commercial Retail Chain Head Offices'
    ],
    integrationCapabilities: [
      'SAP ERP / S/4HANA Certified Connector',
      'Oracle NetSuite SuiteTalk API',
      'Secure SFTP Batch PDF Hotfolder Ingestion',
      'RESTful Multi-Part Upload Endpoints'
    ],
    relevantUseCases: [
      'Accounts payable invoice processing automation',
      'Cross-border customs declaration and bill of lading parsing',
      'Supplier credit terms validation against purchase orders',
      'Elimination of manual keying into enterprise accounting systems'
    ],
    dataSecurityConsiderations: {
      certifications: ['ISO/IEC 27001 Certified', 'SOC 2 Type I Audited', 'Malaysia PDPA Compliant'],
      dataResidency: ['MY-Azure (Kuala Lumpur)', 'SG-AWS'],
      encryption: 'AES-256 field-level database encryption, TLS 1.3 in transit',
      complianceNotes: 'Stores extracted invoice data in sovereign Malaysian cloud nodes with immutable cryptographic audit hashes.'
    },
    knownLimitations: [
      'Handwritten non-standard paper receipts have lower extraction confidence (approx. 82%) compared to digital PDF invoices (99.2%).',
      'Direct SAP connectors require SAP NetWeaver JCo middleware installation on the enterprise boundary.',
      'Does not process physical cheque clearing or cash remittance disbursements.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2019,
    stage: 'Series A',
    website: 'https://demo-bhddocuflow.synthetic.my',
    tagline: 'Intelligent Multi-lingual Invoice Extraction for Enterprise ERPs',
    summary: 'Synthetic Enterprise AI startup profile specializing in automated 3-way invoice matching and SAP connectors for Malaysian shared service centers.',
    primaryIndustry: 'Enterprise AI & Cybersecurity',
    secondaryIndustries: ['FinTech & Payments'],
    capabilities: [
      'Multi-lingual OCR (EN, ID, VN, TH)',
      'Automated 3-Way Invoice Matching',
      'SAP / NetSuite Direct Connectors',
      'Tax & GST/VAT Validation',
      'Audit Trail Lineage'
    ],
    techStack: ['Python', 'PyTorch', 'FastAPI', 'PostgreSQL', 'SAP JCo', 'Azure MY'],
    verifiedCertifications: ['ISO 27001', 'SOC 2 Type I', 'Malaysia PDPA Certified'],
    dataResidencyOptions: ['MY-Azure (Kuala Lumpur)', 'SG-AWS'],
    notableDeployments: ['Simulated Shared Services Center (Kuala Lumpur)', 'Simulated Manufacturing ERP Trial'],
    evidenceQuality: 'Enterprise Verified',
    evidenceNotes: 'Synthetic testing showed 99.4% field accuracy on multi-currency ASEAN invoices.',
    headquarters: 'Kuala Lumpur, Malaysia (Fictional Demo)'
  },
  {
    id: 'synthetic-vn-mekongtrace',
    name: 'MekongTrace Systems (Synthetic Demo)',
    country: 'VN',
    industry: 'AgriFood & ClimateTech',
    productDescription: 'Farm-to-export digital traceability and cold-chain compliance ledger connecting Vietnamese agricultural producers with international supermarket chains.',
    coreCapabilities: [
      'Farm QR Code Provenance Generation',
      'Pesticide & Fertilizer Batch Logging',
      'Cold-Chain Route Departure/Arrival Tracking',
      'HACCP & VietGAP Compliance Auditing',
      'Export Sanitary Certificate Vault',
      'B2B Supplier Portal'
    ],
    technologyCapabilities: [
      'Node.js / Express Microservices',
      'PostgreSQL with PostGIS Geospatial Extension',
      'Cryptographic Merkle Tree Batch Ledger',
      'Flutter Cross-Platform Mobile Field App',
      'Local VNPT Cloud Hosting in Hanoi'
    ],
    targetCustomerSegments: [
      'Export Agricultural Cooperatives',
      'International Supermarket Sourcing Desks',
      'Food Processing & Canning Conglomerates',
      'F&B Restaurant Chains'
    ],
    integrationCapabilities: [
      'RESTful JSON API',
      'GS1 EPCIS Standard XML/JSON Export',
      'Offline-First Mobile Sync for Rural Farms',
      'Automated PDF Export Certificate Generator'
    ],
    relevantUseCases: [
      'Mekong Delta fruit and rice export provenance tracking',
      'Rapid recall management for contaminated food batches',
      'Verification of sustainable agricultural practices for EU/US exports',
      'Centralized B2B farmer cooperative procurement'
    ],
    dataSecurityConsiderations: {
      certifications: ['HACCP Certified System Design', 'VietGAP Compliance Partner', 'ISO 22000 Aligned'],
      dataResidency: ['VN-Local VNPT Cloud (Hanoi)', 'SG-AWS'],
      encryption: 'TLS 1.3, SHA-256 record verification hashing',
      complianceNotes: 'Compliant with Vietnamese Cybersecurity Law 24/2018/QH14 regarding agricultural data localization.'
    },
    knownLimitations: [
      'Requires cooperative field supervisors to physically inspect farmer inputs weekly to verify self-reported logs.',
      'No integration with banking core networks (traceability and compliance only; payment handling is out of scope).',
      'Offline mobile caching is limited to 7 days before sync is required.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2021,
    stage: 'Seed',
    website: 'https://demo-mekongtrace.synthetic.vn',
    tagline: 'Farm-to-Fork Agricultural Traceability & Quality Compliance',
    summary: 'Synthetic AgriFood startup profile providing QR-code supply chain provenance and VietGAP compliance logging in Vietnam.',
    primaryIndustry: 'AgriFood & ClimateTech',
    secondaryIndustries: ['Logistics & Supply Chain', 'Retail & E-commerce'],
    capabilities: [
      'B2B Fresh Produce Procurement',
      'Farm Traceability & QR Provenance',
      'Cold-Chain Route Optimization',
      'Food Safety Compliance Logging',
      'GS1 EPCIS Export'
    ],
    techStack: ['Node.js', 'PostgreSQL', 'PostGIS', 'Flutter', 'VNPT Cloud'],
    verifiedCertifications: ['HACCP Aligned', 'VietGAP Network Certified'],
    dataResidencyOptions: ['VN-Local VNPT Cloud', 'SG-AWS'],
    notableDeployments: ['Simulated Mekong Fruit Exporters Hub', 'Simulated Ho Chi Minh Supermarket Pilot'],
    evidenceQuality: 'Validated Pilot',
    evidenceNotes: 'Synthetic benchmark demonstrated trace-back retrieval in under 3.2 seconds across 10,000 product cartons.',
    headquarters: 'Can Tho, Vietnam (Fictional Demo)'
  },
  {
    id: 'synthetic-th-siamcare',
    name: 'SiamCare OS (Synthetic Demo)',
    country: 'TH',
    industry: 'Healthcare & MedTech',
    productDescription: 'Hospital Information System (HIS) integration bridge and automated insurance third-party administrator (TPA) claims pre-authorization engine.',
    coreCapabilities: [
      'Hospital Information System (HIS) API Bridge',
      'Direct Insurance TPA Claims Clearing',
      'Electronic Health Record (EHR) Pseudonymization',
      'Outpatient Pre-Authorization Workflow',
      'FHIR R4 Diagnostic Schema Translation',
      'Cashless Patient Discharge Coordination'
    ],
    technologyCapabilities: [
      'HL7 / FHIR Standard Engine',
      'Kotlin / Spring Boot Enterprise Backend',
      'PostgreSQL Encrypted Clinical Cache',
      'Mutual TLS Gateway with Private IP Peering',
      'AWS Thailand Local Zone (Bangkok)'
    ],
    targetCustomerSegments: [
      'Private Hospital Networks',
      'Outpatient Specialty Clinic Groups',
      'Health Insurance Providers & TPAs',
      'Corporate Employee Wellness Networks'
    ],
    integrationCapabilities: [
      'FHIR / HL7 REST & MLLP Interfaces',
      'Insurer SOAP / XML Legacy Claim Gateways',
      'Secure WebSocket Real-time Status Broadcast',
      'REST Webhook for Patient Billing Systems'
    ],
    relevantUseCases: [
      'Reducing hospital discharge waiting time from 3 hours to 15 minutes',
      'Automated medical necessity validation against insurer rule policies',
      'Secure patient demographic pseudonymization for clinical analytics',
      'Direct billing reconciliation between hospital finance and insurance underwriters'
    ],
    dataSecurityConsiderations: {
      certifications: ['HIPAA Compliant Security Controls', 'Thailand PDPA Certified', 'ISO 27701 Privacy'],
      dataResidency: ['TH-AWS (Bangkok)', 'SG-AWS'],
      encryption: 'Field-level AES-GCM encryption for patient PII, TLS 1.3 with mTLS',
      complianceNotes: 'Strictly complies with Thailand Personal Data Protection Act (B.E. 2562) regarding sensitive medical records.'
    },
    knownLimitations: [
      'Does not provide an electronic medical record (EMR) charting interface for doctors (acts purely as an integration bridge).',
      'Requires hospital IT to expose a read-only FHIR or HL7 v2 ADT feed.',
      'Emergency room (ER) multi-trauma billing requires manual human approval.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2020,
    stage: 'Series B',
    website: 'https://demo-siamcare.synthetic.th',
    tagline: 'Healthcare Interoperability Bridge & TPA Insurance Claims Automation',
    summary: 'Synthetic HealthTech startup profile automating hospital insurance pre-authorization and FHIR clinical bridges in Thailand.',
    primaryIndustry: 'Healthcare & MedTech',
    secondaryIndustries: ['FinTech & Payments'],
    capabilities: [
      'Hospital Information System (HIS) API Bridge',
      'Direct Insurance TPA Claims Clearing',
      'Electronic Health Record (EHR) Pseudonymization',
      'HL7 / FHIR Schema Translation',
      'Outpatient Pre-Authorization'
    ],
    techStack: ['HL7 / FHIR', 'Kotlin', 'Spring Boot', 'PostgreSQL', 'AWS Bangkok'],
    verifiedCertifications: ['HIPAA Security Aligned', 'Thailand PDPA Compliant', 'ISO 27701'],
    dataResidencyOptions: ['TH-AWS (Bangkok)', 'SG-AWS'],
    notableDeployments: ['Simulated Bangkok Multi-Hospital Sandbox', 'Simulated TPA Insurance Pilot'],
    evidenceQuality: 'Enterprise Verified',
    evidenceNotes: 'Synthetic trial demonstrated 72% reduction in insurance eligibility dispute turnaround.',
    headquarters: 'Bangkok, Thailand (Fictional Demo)'
  },
  {
    id: 'synthetic-ph-bayanipay',
    name: 'BayaniPay WageAccess (Synthetic Demo)',
    country: 'PH',
    industry: 'FinTech & Payments',
    productDescription: 'Automated earned wage access (EWA) and enterprise employee financial wellness platform integrated directly with Philippine enterprise payroll systems.',
    coreCapabilities: [
      'HRIS & Payroll API Integration (SAP, Workday, Sprout)',
      'Real-time Earned Wage Calculation',
      'Instant Disbursal via PESONet & InstaPay',
      'Zero-Balance Sheet Liability Model',
      'Anti-Fraud Payroll Verification',
      'Automated Salary Deduction Reconciliation'
    ],
    technologyCapabilities: [
      'Python / Django REST Framework',
      'PostgreSQL Transaction Store',
      'Redis Distributed Lock & Rate Limiter',
      'Direct Philippine Open Finance API Gateways',
      'AWS Asia Pacific (Singapore / Philippines Edge)'
    ],
    targetCustomerSegments: [
      'Business Process Outsourcing (BPO) Companies',
      'Manufacturing & Industrial Conglomerates',
      'Nationwide Retail & Fast Food Chains',
      'Hospital & Healthcare Provider Staff'
    ],
    integrationCapabilities: [
      'SAP SuccessFactors API Connector',
      'Workday HCM Webhook Integration',
      'Encrypted CSV SFTP Automated Payroll Ingestion',
      'Direct PESONet / InstaPay Bank Gateway APIs'
    ],
    relevantUseCases: [
      'Reducing BPO staff attrition through flexible salary drawdown',
      'Eliminating predatory payday loans for hourly and shift workers',
      'Zero-workload payroll reconciliation for corporate HR teams',
      'Emergency liquidity access for medical and family emergencies'
    ],
    dataSecurityConsiderations: {
      certifications: ['SEC Philippines Regulated Lending Entity', 'NPC Data Privacy Seal', 'ISO 27001'],
      dataResidency: ['PH-AWS Edge / Dedicated VPC', 'SG-AWS'],
      encryption: 'AES-256 for employee salary logs, TLS 1.3 for API calls',
      complianceNotes: 'Complies with Republic Act 10173 (Philippine Data Privacy Act) and Bangko Sentral ng Pilipinas (BSP) consumer protection regulations.'
    },
    knownLimitations: [
      'Available only to formally employed workers under partner enterprise corporate contracts (no unbanked gig-worker direct sign-up).',
      'Maximum drawdown capped at 50% of accrued wages to prevent employee over-indebtedness.',
      'Requires monthly HR payroll reconciliation sign-off.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2019,
    stage: 'Series A',
    website: 'https://demo-bayanipay.synthetic.ph',
    tagline: 'Enterprise Earned Wage Access & Financial Wellness Infrastructure',
    summary: 'Synthetic FinTech startup profile providing automated earned wage access integrated with HRIS payroll in the Philippines.',
    primaryIndustry: 'FinTech & Payments',
    secondaryIndustries: ['Enterprise AI & Cybersecurity'],
    capabilities: [
      'HRIS & Payroll API Integration',
      'Automated Earned Wage Computation',
      'Instant Disbursal via PESONet / InstaPay',
      'Zero-Balance Sheet Liability Architecture',
      'Anti-Fraud Payroll Verification'
    ],
    techStack: ['Python', 'Django', 'PostgreSQL', 'Redis', 'AWS Edge'],
    verifiedCertifications: ['SEC Philippines Regulated', 'NPC Data Privacy Seal', 'ISO 27001'],
    dataResidencyOptions: ['PH-AWS Dedicated', 'SG-AWS'],
    notableDeployments: ['Simulated Manila BPO Enterprise Trial', 'Simulated Retail Chain Workforce Pilot'],
    evidenceQuality: 'Enterprise Verified',
    evidenceNotes: 'Synthetic simulation demonstrated zero payroll discrepancy across 15,000 simulated salary cycles.',
    headquarters: 'Manila, Philippines (Fictional Demo)'
  },
  {
    id: 'synthetic-sg-veritrust',
    name: 'VeriTrust Sovereign Enclave (Synthetic Demo)',
    country: 'SG',
    industry: 'Enterprise AI & Cybersecurity',
    productDescription: 'Hardware-enforced confidential computing and sovereign multi-party privacy enclaves allowing financial and government entities to analyze cross-border data without exposing plaintext.',
    coreCapabilities: [
      'Hardware Confidential Computing Enclaves (AMD SEV / Intel SGX)',
      'Cross-Border PDPA Data Gateway',
      'Real-time PII Anonymization & Tokenization',
      'Secure Multi-Party Computation (SMPC)',
      'Immutable Cryptographic Audit Logging',
      'Model-to-Data Secure Remote Attestation'
    ],
    technologyCapabilities: [
      'Rust Systems Programming',
      'WebAssembly (Wasm) Micro-runtime',
      'AMD SEV-SNP & Intel SGX Hardware Drivers',
      'PostgreSQL Immutable Append-Only Ledger',
      'Bare-Metal Equinix SG1 Singapore Enclave'
    ],
    targetCustomerSegments: [
      'Sovereign Wealth Funds & Central Banks',
      'Healthcare Data Consortiums',
      'Cross-Border Law Enforcement & Regulatory Sandboxes',
      'Tier-1 Multinational Financial Institutions'
    ],
    integrationCapabilities: [
      'gRPC with Hardware Remote Attestation Verification',
      'RESTful mTLS Management API',
      'Local Air-Gapped Appliance Integration',
      'SDK for Python and C++ Data Scientists'
    ],
    relevantUseCases: [
      'Cross-border financial crime intelligence sharing between non-affiliated banks',
      'Clinical trial data synthesis without patient identification exposure',
      'Privacy-preserving credit scoring across telecommunications and banking data',
      'Execution of proprietary ML algorithms on sovereign overseas datasets'
    ],
    dataSecurityConsiderations: {
      certifications: ['Common Criteria EAL4+ Aligned', 'ISO/IEC 27001 Certified', 'FIPS 140-3 Cryptography'],
      dataResidency: ['SG-Equinix Metal Airgap', 'Dedicated Regional VPC', 'On-Premises Dedicated'],
      encryption: 'Hardware memory encryption (AES-128/256), cryptographic remote attestation',
      complianceNotes: 'Engineered to satisfy cross-border transfer requirements under GDPR Chapter V and ASEAN Cross-Border Data Flows Mechanism.'
    },
    knownLimitations: [
      'High computational latency overhead (approx. 15–20% slower than non-encrypted bare-metal execution).',
      'Requires hardware supporting AMD SEV-SNP or Intel SGX (cannot run on generic legacy virtualization nodes).',
      'Demands advanced cryptographic expertise from client enterprise security teams.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2021,
    stage: 'Series A',
    website: 'https://demo-veritrust.synthetic.sg',
    tagline: 'Zero-Trust Confidential Computing & Sovereign Data Enclaves',
    summary: 'Synthetic cybersecurity startup profile providing hardware confidential computing and privacy-preserving data enclaves in Singapore.',
    primaryIndustry: 'Enterprise AI & Cybersecurity',
    secondaryIndustries: ['FinTech & Payments', 'Healthcare & MedTech'],
    capabilities: [
      'Confidential Computing Enclaves',
      'Cross-Border PDPA Data Gateway',
      'Real-time PII Anonymization',
      'Secure Multi-Party Computation',
      'Hardware Remote Attestation'
    ],
    techStack: ['Rust', 'WebAssembly', 'AMD SEV', 'Intel SGX', 'Equinix Metal'],
    verifiedCertifications: ['ISO 27001', 'FIPS 140-3 Validated', 'Common Criteria Aligned'],
    dataResidencyOptions: ['SG-Equinix Metal Airgap', 'Dedicated Sovereign VPC'],
    notableDeployments: ['Simulated Inter-Bank Consortium Sandbox', 'Simulated Healthcare Research Enclave'],
    evidenceQuality: 'Audited Tier-1',
    evidenceNotes: 'Synthetic benchmark verified zero plaintext leakage under simulated memory dump attacks.',
    headquarters: 'Singapore (Fictional Demo)'
  },
  {
    id: 'synthetic-id-warungcredit',
    name: 'WarungLink MicroFin (Synthetic Demo)',
    country: 'ID',
    industry: 'Retail & E-commerce',
    productDescription: 'AI-driven working capital and inventory micro-credit scoring engine enabling FMCG brand principals to finance unbanked mom-and-pop retailers across Indonesia.',
    coreCapabilities: [
      'FMCG Distributor ERP Order Stream Integration',
      'Alternative Micro-Credit Scoring Model',
      'WhatsApp Bot Loan Application & Acceptance',
      'Automated Reconciliation & Repayment Deduction',
      'Hyperlocal Retail SKU Demand Heatmaps',
      'Dynamic Credit Limit Adjustment'
    ],
    technologyCapabilities: [
      'Python / Scikit-Learn Credit Risk Models',
      'Node.js WhatsApp Business Cloud API Gateway',
      'PostgreSQL on Google Cloud Platform Jakarta',
      'BigQuery Real-time Demand Analytics',
      'OJK Regulatory Reporting API'
    ],
    targetCustomerSegments: [
      'FMCG Multinational Brand Principals',
      'Authorized National Beverage & Food Distributors',
      'Micro-Retail Merchant Associations',
      'B2B Wholesale Cash & Carry Outlets'
    ],
    integrationCapabilities: [
      'Distributor ERP Webhook & REST Ingestion',
      'WhatsApp Business Interactive Messages API',
      'Indonesian Virtual Account (BCA, Mandiri, BRI) Reconciliation',
      'Batch CSV Daily Sales Ledger Sync'
    ],
    relevantUseCases: [
      'Eliminating cash-flow bottlenecks for neighbourhood warungs ordering inventory',
      'Increasing distributor sales throughput by 30% through rolling 7-day terms',
      'Digital credit history creation for unbanked micro-entrepreneurs',
      'Automating payment collection via national QRIS and bank virtual accounts'
    ],
    dataSecurityConsiderations: {
      certifications: ['OJK FinTech Sandbox Participant (Synthetic Profile)', 'ISO 27001'],
      dataResidency: ['ID-GCP (Jakarta)', 'ID-AWS (Jakarta)'],
      encryption: 'AES-256 for loan ledger records, TLS 1.3 for all web services',
      complianceNotes: 'Structured under OJK regulation POJK 77/POJK.01/2016 for peer-to-peer and institutional lending platforms.'
    },
    knownLimitations: [
      'Credit limits strictly capped at IDR 25,000,000 (~$1,600 USD) per merchant.',
      'Requires at least 3 months of verified prior order history with an authorized distributor.',
      'Does not provide inventory physical warehousing or transportation.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2020,
    stage: 'Series A',
    website: 'https://demo-warunglink.synthetic.id',
    tagline: 'AI Micro-Credit & Working Capital for FMCG Retail Networks',
    summary: 'Synthetic retail FinTech startup profile providing automated merchant working capital inside Indonesian distributor order streams.',
    primaryIndustry: 'Retail & E-commerce',
    secondaryIndustries: ['FinTech & Payments'],
    capabilities: [
      'FMCG Distributor ERP Integration',
      'Alternative Micro-Credit Scoring',
      'WhatsApp Order Financing Interface',
      'Automated Repayment Collection',
      'Stock Turnover Analytics'
    ],
    techStack: ['Python', 'Node.js', 'BigQuery', 'GCP Jakarta', 'WhatsApp API'],
    verifiedCertifications: ['OJK Sandbox Participant', 'ISO 27001'],
    dataResidencyOptions: ['ID-GCP (Jakarta)', 'ID-AWS (Jakarta)'],
    notableDeployments: ['Simulated West Java FMCG Network', 'Simulated Beverage Distributor Trial'],
    evidenceQuality: 'Enterprise Verified',
    evidenceNotes: 'Synthetic simulation demonstrated 0.7% default rate across 50,000 simulated micro-loans.',
    headquarters: 'Bandung, Indonesia (Fictional Demo)'
  },
  {
    id: 'synthetic-my-aeropulse',
    name: 'AeroPulse Autonomous Drones (Synthetic Demo)',
    country: 'MY',
    industry: 'AgriFood & ClimateTech',
    productDescription: 'Autonomous aerial drone inspection and computer vision anomaly detection platform for power transmission utilities, solar farms, and oil palm plantations.',
    coreCapabilities: [
      'Autonomous Drone Flight Path Orchestration',
      'LiDAR & Thermal Point Cloud Processing',
      'Computer Vision Insulator & Pylon Defect Detection',
      'Vegetation Encroachment Predictive Alerts',
      'Solar Panel Hotspot Thermal Classification',
      'GIS / SCADA Integration'
    ],
    technologyCapabilities: [
      'C++ / ROS (Robot Operating System) Drone Edge',
      'PyTorch YOLOv8 Computer Vision Models',
      'PostGIS Spatial Database Engine',
      'NVIDIA Jetson Edge Inference Accelerators',
      'Microsoft Azure Southeast Asia (Kuala Lumpur)'
    ],
    targetCustomerSegments: [
      'National Electric Grid & Power Transmission Operators',
      'Commercial Solar Utility Farm Developers',
      'Large Palm Oil & Rubber Plantations',
      'Highway and Railway Infrastructure Authorities'
    ],
    integrationCapabilities: [
      'Esri ArcGIS / QGIS Native Connectors',
      'SCADA Telemetry Export Standards',
      'RESTful Cloud Mission Planning API',
      'Secure High-Bandwidth Cloud GeoTIFF Upload'
    ],
    relevantUseCases: [
      'Preventative maintenance for high-voltage electricity transmission towers',
      'Thermal anomaly detection on 50MW+ utility-scale solar photovoltaic farms',
      'Automated counting and health indexing of oil palm canopies',
      'Early detection of wildfire and encroaching jungle vegetation along power lines'
    ],
    dataSecurityConsiderations: {
      certifications: ['CAAM Commercial Flight Authorized (Synthetic)', 'ISO 27001', 'ISO 45001 Safety'],
      dataResidency: ['MY-Azure (Kuala Lumpur)', 'Hybrid Local Storage'],
      encryption: 'AES-256 encrypted flight telemetry, TLS 1.3 cloud transmission',
      complianceNotes: 'Compliant with Malaysian Civil Aviation Authority (CAAM) civil drone airspace directives.'
    },
    knownLimitations: [
      'Drone operations constrained by severe tropical rainstorms and wind gusts exceeding 38 km/h.',
      'Requires certified visual observer or BVLOS regulatory permit from civil aviation authorities.',
      'Does not conduct physical wire repairs or mechanical line replacement.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2018,
    stage: 'Growth',
    website: 'https://demo-aeropulse.synthetic.my',
    tagline: 'Autonomous Drone Inspection & Computer Vision for Utility Assets',
    summary: 'Synthetic AgriFood & ClimateTech startup profile providing autonomous aerial asset inspections and computer vision in Malaysia.',
    primaryIndustry: 'AgriFood & ClimateTech',
    secondaryIndustries: ['Logistics & Supply Chain', 'Enterprise AI & Cybersecurity'],
    capabilities: [
      'Autonomous Drone Asset Inspection',
      'Computer Vision Defect Detection',
      'Thermal & LiDAR Point Cloud Processing',
      'Predictive Asset Life Analysis',
      'GIS / SCADA Integration'
    ],
    techStack: ['C++', 'PyTorch', 'PostGIS', 'NVIDIA Jetson', 'Azure MY'],
    verifiedCertifications: ['CAAM Flight Authorized', 'ISO 27001', 'ISO 45001 Safety'],
    dataResidencyOptions: ['MY-Azure (Kuala Lumpur)', 'Hybrid Local Storage'],
    notableDeployments: ['Simulated Transmission Grid Corridor (Perak)', 'Simulated Solar Farm Trial'],
    evidenceQuality: 'Audited Tier-1',
    evidenceNotes: 'Synthetic inspection benchmarks demonstrated 96.8% defect detection accuracy compared to manual foot patrols.',
    headquarters: 'Cyberjaya, Malaysia (Fictional Demo)'
  },
  {
    id: 'synthetic-th-flowomni',
    name: 'FlowOmni POS & Retail OS (Synthetic Demo)',
    country: 'TH',
    industry: 'Retail & E-commerce',
    productDescription: 'Omnichannel inventory synchronization, automated Thai Revenue Department e-Tax invoicing, and multi-store point-of-sale integration for Southeast Asian retail chains.',
    coreCapabilities: [
      'Thailand Revenue Dept e-Tax Invoice Generation',
      'Real-time Multi-Location Inventory Sync',
      'Consignment Departmental Settlement',
      'Supplier Rebate & Commission Engine',
      'Line Official Account (Line OA) Customer Chat CRM',
      'Credit Card & PromptPay Settlement Reconciliation'
    ],
    technologyCapabilities: [
      'C# / .NET 8 Enterprise Architecture',
      'React Web & Tablet Interface',
      'Microsoft SQL Server on Azure Southeast Asia',
      'RabbitMQ Distributed Event Broker',
      'Cryptographic PKI XML e-Tax Signing Module'
    ],
    targetCustomerSegments: [
      'Department Store Concessionaires & Fashion Retailers',
      'Multi-Branch Restaurant & Cafe Franchises',
      'Consumer Electronics Retail Chains',
      'Supermarket & Convenience Store Outlets'
    ],
    integrationCapabilities: [
      'Direct Thai Revenue Department e-Tax XML Gateway',
      'PromptPay & Thai QR Payment Engine',
      'REST Webhooks for ERP / Warehouse Sync',
      'Ingenico / PAX POS Terminal Driver Bridge'
    ],
    relevantUseCases: [
      'Mandatory electronic tax invoice (e-Tax) generation and PDF signing for retail sales',
      'Preventing stock discrepancies across physical stores and online Shopee/Lazada channels',
      'Automating monthly consignment turnover calculations for shopping mall tenants',
      'Speeding up retail point-of-sale checkout with integrated QR payments'
    ],
    dataSecurityConsiderations: {
      certifications: ['Thai Revenue Dept Certified e-Tax Service Provider (Synthetic Profile)', 'ISO 27001'],
      dataResidency: ['TH-Azure (Central Thailand)', 'SG-Azure'],
      encryption: 'Hardware Security Module (HSM) PKI key signing, AES-256 at rest',
      complianceNotes: 'Certified under Thai Revenue Department specifications for Electronic Tax Invoices and Receipts.'
    },
    knownLimitations: [
      'E-tax generation requires an active authorized corporate digital certificate (PKI token) registered in Thailand.',
      'Offline store mode supports queuing transactions for up to 24 hours before online batch upload is required.',
      'Does not provide cross-border ocean freight freight-forwarding services.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2019,
    stage: 'Series B',
    website: 'https://demo-flowomni.synthetic.th',
    tagline: 'Cloud Invoicing, POS & Multi-Tier Channel Inventory Sync for Retail',
    summary: 'Synthetic retail startup profile automating electronic tax invoicing and multi-store inventory synchronization in Thailand.',
    primaryIndustry: 'Retail & E-commerce',
    secondaryIndustries: ['FinTech & Payments'],
    capabilities: [
      'Thailand Revenue Dept e-Tax Invoice API',
      'Real-time Consignment Inventory Sync',
      'Multi-Store POS Integration',
      'Supplier Commission Engine',
      'Payment Gateway Reconciliation'
    ],
    techStack: ['.NET 8', 'React', 'SQL Server', 'RabbitMQ', 'Azure TH'],
    verifiedCertifications: ['Thai Revenue Certified e-Tax', 'ISO 27001'],
    dataResidencyOptions: ['TH-Azure (Bangkok)', 'SG-Azure'],
    notableDeployments: ['Simulated Department Store Pilot', 'Simulated Franchise Chain Sandbox'],
    evidenceQuality: 'Audited Tier-1',
    evidenceNotes: 'Synthetic simulation processed 250,000 monthly e-Tax transactions with zero tax authority schema rejections.',
    headquarters: 'Bangkok, Thailand (Fictional Demo)'
  },
  {
    id: 'synthetic-vn-annamcarbon',
    name: 'AnnamCarbon ESG (Synthetic Demo)',
    country: 'VN',
    industry: 'AgriFood & ClimateTech',
    productDescription: 'IoT factory emission metering and Scope 1-2-3 carbon accounting platform helping export manufacturers in Vietnam comply with EU CBAM regulations.',
    coreCapabilities: [
      'Factory Floor IoT Smart Meter Ingestion',
      'EU CBAM (Carbon Border Adjustment Mechanism) Form Reporting',
      'GHG Protocol Aligned Scope 1, 2, and 3 Calculations',
      'Supply Chain Vendor ESG Audit Survey Portal',
      'Satellite Biomass / Deforestation Land Verification',
      'Carbon Reduction Decarbonization Roadmap Generator'
    ],
    technologyCapabilities: [
      'Python / Pandas Emission Calculation Models',
      'TimescaleDB Time-Series Energy Store',
      'Node.js REST API Microservices',
      'Sentinel-2 European Space Agency Satellite API Connector',
      'AWS Singapore (ap-southeast-1) with Local VNPT Edge Caching'
    ],
    targetCustomerSegments: [
      'Steel, Aluminum & Cement Export Manufacturers',
      'Garment, Textile & Footwear OEM Exporters',
      'Large Agricultural Packaging Plants',
      'Industrial Park Management Authorities'
    ],
    integrationCapabilities: [
      'Modbus / RS-485 IoT Industrial Meter Gateway',
      'SAP ERP Material & Energy Bill-of-Materials Ingestion',
      'RESTful Sustainability Data API',
      'Exportable EU CBAM XML Format Generator'
    ],
    relevantUseCases: [
      'Meeting European Union CBAM carbon compliance filing requirements for steel exporters',
      'Auditing Scope 3 carbon footprint across 200+ tier-2 textile sub-suppliers in Vietnam',
      'Real-time alert dispatch when industrial boiler emissions exceed environmental permits',
      'Generating verified sustainability audit reports for international bank ESG-linked loans'
    ],
    dataSecurityConsiderations: {
      certifications: ['GHG Protocol Aligned Methodology', 'TÜV Rheinland Audited Calculator (Synthetic Profile)'],
      dataResidency: ['SG-AWS', 'VN-Local VNPT Cloud'],
      encryption: 'AES-256 database storage, TLS 1.3 API endpoints',
      complianceNotes: 'Compliant with European Commission Regulation (EU) 2023/956 on CBAM reporting guidelines.'
    },
    knownLimitations: [
      'Scope 3 upstream supplier estimations require active vendor survey participation or default industry coefficient fallback.',
      'Does not broker physical carbon offset credit trades on secondary commodities markets.',
      'Requires factory electrical sub-metering hardware to be installed for machine-level granularity.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2022,
    stage: 'Seed',
    website: 'https://demo-annamcarbon.synthetic.vn',
    tagline: 'Automated Scope 1-3 Carbon Accounting & EU CBAM Reporting',
    summary: 'Synthetic ClimateTech startup profile providing automated carbon emissions accounting and EU CBAM reporting for Vietnamese exporters.',
    primaryIndustry: 'AgriFood & ClimateTech',
    secondaryIndustries: ['Logistics & Supply Chain', 'Enterprise AI & Cybersecurity'],
    capabilities: [
      'Factory Floor IoT Energy Ingestion',
      'EU CBAM Compliance Form Generation',
      'Scope 1-2-3 Emission Calculations',
      'Supply Chain Vendor ESG Portal',
      'Decarbonization Roadmap'
    ],
    techStack: ['Python', 'TimescaleDB', 'Node.js', 'Sentinel-2', 'AWS SG'],
    verifiedCertifications: ['GHG Protocol Aligned', 'TÜV Rheinland Audited'],
    dataResidencyOptions: ['SG-AWS', 'VN-Local Data Center'],
    notableDeployments: ['Simulated Industrial Park Pilot (Binh Duong)', 'Simulated Steel Mill ESG Trial'],
    evidenceQuality: 'Validated Pilot',
    evidenceNotes: 'Synthetic benchmark verified calculation alignment within 0.4% of manual third-party carbon audit standards.',
    headquarters: 'Ho Chi Minh City, Vietnam (Fictional Demo)'
  },
  {
    id: 'synthetic-sg-crediflow',
    name: 'CrediFlow Embedded FX (Synthetic Demo)',
    country: 'SG',
    industry: 'FinTech & Payments',
    productDescription: 'API-driven cross-border B2B supplier financing, dynamic FX hedging, and digital escrow engine for ASEAN trade corridors.',
    coreCapabilities: [
      'Embedded B2B Trade Credit APIs',
      'Real-time Invoice Verification via Peppol e-Invoicing',
      'Automated Dynamic FX Hedging',
      'Multi-Currency Virtual Escrow Accounts',
      'Cross-Border Supplier Financing Underwriting',
      'Credit Default Risk Modeling'
    ],
    technologyCapabilities: [
      'TypeScript / NestJS Microservices',
      'PostgreSQL Relational Ledger',
      'RabbitMQ Event Bus',
      'Peppol E-Delivery Network Access Point',
      'AWS Singapore (ap-southeast-1) with High-Availability Multi-AZ'
    ],
    targetCustomerSegments: [
      'Cross-Border B2B Marketplaces',
      'Regional Trading Companies & Importers',
      'Commercial Logistics Operators offering FinTech',
      'Multinational Procurement Platforms'
    ],
    integrationCapabilities: [
      'RESTful OpenAPI 3.0 Endpoints',
      'Peppol BIS Billing 3.0 Network Bridge',
      'Webhooks for Escrow Disbursement Notifications',
      'SWIFT / FAST Bank Settlement Connectors'
    ],
    relevantUseCases: [
      'Instant supplier payout upon proof of shipment for Singapore-Malaysia trade',
      'Mitigating currency volatility on 60-day cross-border import invoices',
      'Embedded financing checkout button inside B2B wholesale procurement portals',
      'Automated invoice authenticity verification via regional Peppol e-invoicing networks'
    ],
    dataSecurityConsiderations: {
      certifications: ['MAS Major Payment Institution Licensed Framework (Synthetic Profile)', 'ISO/IEC 27001', 'SOC 2 Type II Aligned'],
      dataResidency: ['SG-AWS (ap-southeast-1)', 'MY-AWS Dedicated'],
      encryption: 'AES-256 database encryption, TLS 1.3 with client certificate pinning',
      complianceNotes: 'Complies with Singapore Payment Services Act 2019 and MAS notice on cross-border money transfer services.'
    },
    knownLimitations: [
      'Single transaction financing volume capped at $500,000 USD equivalent during pilot sandbox phase.',
      'Requires buyer and supplier to complete automated digital KYC verification prior to first drawdown.',
      'Does not support physical cash or OTC currency exchange.'
    ],
    isSyntheticDemo: true,
    foundedYear: 2021,
    stage: 'Series A',
    website: 'https://demo-crediflow.synthetic.sg',
    tagline: 'Embedded B2B Credit Infrastructure & Cross-Border FX Settlement',
    summary: 'Synthetic FinTech startup profile providing embedded supplier trade credit and dynamic FX hedging for ASEAN trade lanes.',
    primaryIndustry: 'FinTech & Payments',
    secondaryIndustries: ['Logistics & Supply Chain', 'Retail & E-commerce'],
    capabilities: [
      'B2B Embedded Credit APIs',
      'Real-time Invoice Verification',
      'Dynamic FX Hedging',
      'Multi-Currency Virtual Escrow',
      'Supplier Financing Underwriting'
    ],
    techStack: ['TypeScript', 'NestJS', 'PostgreSQL', 'RabbitMQ', 'Peppol AP', 'AWS SG'],
    verifiedCertifications: ['MAS FinTech Directory Listed', 'ISO 27001', 'SOC 2 Aligned'],
    dataResidencyOptions: ['SG-AWS', 'MY-AWS Dedicated'],
    notableDeployments: ['Simulated Regional B2B Marketplace Pilot', 'Simulated Cross-Border Trade Sandbox'],
    evidenceQuality: 'Enterprise Verified',
    evidenceNotes: 'Synthetic simulation processed $14M in mock trade credit with zero settlement delays.',
    headquarters: 'Singapore (Fictional Demo)'
  },
  {
    id: 'synthetic-id-baharifreight',
    name: 'BahariFreight Mesh (Synthetic Demo)',
    country: 'ID',
    industry: 'Logistics & Supply Chain',
    productDescription: 'Archipelagic inter-island container space booking and automated port demurrage management software tailored for Indonesian roll-on/roll-off and barge carriers.',
    coreCapabilities: [
      'Inter-Island Ferry Vessel Deck Space Optimization',
      'Automated Port Demurrage & Detention Calculation',
      'Container Terminal Operating System (TOS) API Connector',
      'Driver Queue Slot Booking at Port Gates',
      'Digital Manifest & Customs Export Integration',
      'Barge Fuel Consumption Analytics'
    ],
    technologyCapabilities: [
      'Node.js / TypeScript Microservices',
      'MongoDB Atlas & Redis Cache',
      'PostGIS Maritime Corridor Tracking',
      'AWS Jakarta (ap-southeast-3)',
      'Progressive Web App (PWA) for Port Gate Marshals'
    ],
    targetCustomerSegments: [
      'Domestic Indonesian Shipping Lines (Pelayaran Rakyat & RoRo)',
      'Port Terminal Authorities (Pelindo)',
      'Inter-Island Freight Forwarders',
      'Mining and Bulk Commodity Shippers'
    ],
    integrationCapabilities: [
      'Inaportnet (Indonesian Port Single Window) API Connector',
      'Pelindo Container Terminal EDIFACT / XML Gateway',
      'REST Webhooks for Logistics Dispatch Modules',
      'SMS & WhatsApp Gate Pass Broadcast'
    ],
    relevantUseCases: [
      'Eliminating 14-hour truck queues at Merak-Bakauheni ferry terminals',
      'Real-time visibility into barge cargo movements across East Kalimantan and Java',
      'Automated demurrage billing dispute resolution with shipping lines',
      'Digital compliance with Indonesian maritime cabotage regulations'
    ],
    dataSecurityConsiderations: {
      certifications: ['Kominfo PSE Certified', 'ISO 27001 Security Aligned'],
      dataResidency: ['ID-AWS (Jakarta ap-southeast-3)', 'ID-Telkom Hyperscale'],
      encryption: 'TLS 1.3, encrypted database storage with access control logging',
      complianceNotes: 'Compliant with Indonesian Ministry of Transportation circulars on digital port clearance documentation.'
    },
    knownLimitations: [
      'Requires participating port terminals to support Inaportnet digital gate clearance.',
      'Does not provide ship navigation hardware or marine radar equipment.',
      'Limited capability for international deep-sea container vessels (focused on domestic inter-island cabotage).'
    ],
    isSyntheticDemo: true,
    foundedYear: 2020,
    stage: 'Series A',
    website: 'https://demo-baharifreight.synthetic.id',
    tagline: 'Inter-Island Maritime Ferry Deck Optimization & Port Demurrage Tracking',
    summary: 'Synthetic logistics startup profile providing inter-island ferry booking and port terminal gate slot management in Indonesia.',
    primaryIndustry: 'Logistics & Supply Chain',
    secondaryIndustries: ['Retail & E-commerce'],
    capabilities: [
      'Inter-Island Ferry Deck Space Optimization',
      'Port Demurrage Calculation',
      'Port Terminal TOS API Connector',
      'Driver Queue Slot Booking',
      'Digital Manifest & Customs Integration'
    ],
    techStack: ['Node.js', 'MongoDB', 'Redis', 'PostGIS', 'AWS Jakarta'],
    verifiedCertifications: ['Kominfo PSE Registered', 'ISO 27001 Aligned'],
    dataResidencyOptions: ['ID-AWS (Jakarta)', 'ID-Telkom Dedicated'],
    notableDeployments: ['Simulated Merak-Bakauheni Ferry Pilot', 'Simulated Tanjung Perak Port Sandbox'],
    evidenceQuality: 'Enterprise Verified',
    evidenceNotes: 'Synthetic simulation reduced simulated port gate idle queue times by 48%.',
    headquarters: 'Surabaya, Indonesia (Fictional Demo)'
  },
  {
    id: 'synthetic-ph-insuraflow',
    name: 'InsuraFlow Claims AI (Synthetic Demo)',
    country: 'PH',
    industry: 'Healthcare & MedTech',
    productDescription: 'Parametric micro-insurance underwriting and automated weather-triggered disaster payout platform protecting smallholder farmers and community healthcare providers.',
    coreCapabilities: [
      'Parametric Weather & Typhoon Payout Automation',
      'Satellite Rainfall & Windspeed Telemetry Ingestion',
      'Mobile Wallet Instant Disbursal (GCash, Maya)',
      'Community Hospital Micro-Coverage Underwriting',
      'Automated Policyholder KYC via PhilSys National ID',
      'Actuarial Risk Pricing Engine'
    ],
    technologyCapabilities: [
      'Python / PyTorch Actuarial Anomaly Models',
      'FastAPI Microservices',
      'PostgreSQL Relational Ledger',
      'PAGASA / NOAA Satellite Meteorological API Connectors',
      'AWS Singapore (ap-southeast-1) with Philippine Edge Nodes'
    ],
    targetCustomerSegments: [
      'Microfinance Rural Banks & Cooperatives',
      'General Insurance Underwriters in Southeast Asia',
      'Agricultural Input Suppliers providing bundled warranty',
      'Local Government Social Welfare Units'
    ],
    integrationCapabilities: [
      'GCash / Maya Open Disbursement API',
      'PhilSys (Philippine Identification System) Verification Bridge',
      'RESTful Policy Inception API',
      'Automated SMS Broadcast for Weather Warning & Payout Confirmation'
    ],
    relevantUseCases: [
      'Automated 24-hour typhoon disaster relief payout to rice farmers based on windspeed index',
      'Micro-health emergency cash grants for rural clinic patients',
      'Protecting agricultural cooperatives from drought-induced loan defaults',
      'Paperless zero-adjuster claim settlement for natural catastrophe policies'
    ],
    dataSecurityConsiderations: {
      certifications: ['Insurance Commission (IC) Sandbox Authorized (Synthetic Profile)', 'NPC Privacy Seal'],
      dataResidency: ['PH-AWS Edge / Dedicated Tenant', 'SG-AWS'],
      encryption: 'AES-256 for policyholder records, TLS 1.3 for payout triggers',
      complianceNotes: 'Compliant with Insurance Commission of the Philippines Circular 2020-098 regarding digital microinsurance products.'
    },
    knownLimitations: [
      'Parametric triggers are strictly determined by NOAA/PAGASA weather satellite station data; subjective damage claims without index trigger are not covered.',
      'Maximum automated micro-claim payout capped at PHP 50,000 (~$900 USD) per policyholder.',
      'Requires policyholder to maintain an active registered Philippine mobile wallet (GCash/Maya).'
    ],
    isSyntheticDemo: true,
    foundedYear: 2021,
    stage: 'Seed',
    website: 'https://demo-insuraflow.synthetic.ph',
    tagline: 'Parametric Weather Insurance & Automated Disaster Relief Payouts',
    summary: 'Synthetic InsurTech startup profile providing automated weather-triggered parametric claims and mobile wallet disbursements in the Philippines.',
    primaryIndustry: 'Healthcare & MedTech',
    secondaryIndustries: ['FinTech & Payments', 'AgriFood & ClimateTech'],
    capabilities: [
      'Parametric Weather Payout Automation',
      'Satellite Rainfall Telemetry Ingestion',
      'Mobile Wallet Instant Disbursal',
      'PhilSys National ID KYC Bridge',
      'Actuarial Risk Pricing Engine'
    ],
    techStack: ['Python', 'PyTorch', 'FastAPI', 'PostgreSQL', 'NOAA API', 'AWS Edge'],
    verifiedCertifications: ['Insurance Commission Authorized', 'NPC Privacy Seal'],
    dataResidencyOptions: ['PH-AWS Dedicated', 'SG-AWS'],
    notableDeployments: ['Simulated Luzon Agri-Cooperative Sandbox', 'Simulated Visayas Clinic Pilot'],
    evidenceQuality: 'Validated Pilot',
    evidenceNotes: 'Synthetic benchmark triggered mock payouts to 4,500 test accounts in under 4 minutes after simulated typhoon landfall.',
    headquarters: 'Cebu, Philippines (Fictional Demo)'
  }
];

/**
 * Baseline Curated Startups collection (preserves backward compatibility with existing tests).
 */
export const CURATED_STARTUPS: CuratedStartup[] = SYNTHETIC_STARTUPS;

/**
 * Combined Complete Registry of Genuine Verified Startups and Synthetic Benchmark Controls.
 */
export const ALL_STARTUPS: CuratedStartup[] = [
  ...REAL_STARTUPS,
  ...SYNTHETIC_STARTUPS
];


