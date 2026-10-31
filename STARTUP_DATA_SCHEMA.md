# STARTUP_DATA_SCHEMA.md
## ASEAN POC-Architect — Enterprise Startup Data & Provenance Schema
**Author:** Senior Data Engineer & API Systems Architect  
**Date:** October 31, 2026  
**Status:** Approved Standard Schema (Phase 4)  
**Target Platform:** ASEAN POC-Architect

---

### Design Objective
To eliminate AI hallucination and ensure enterprise-grade traceability, every entity in ASEAN POC-Architect must adhere to a strict, typed schema featuring **multi-tiered verification**, **granular evidence citation**, and **formal source attribution**. 

No capability, integration protocol, customer deployment, or security certification may exist without an explicit source citation and verification tier.

---

## 1. Verification Tiers & Confidence Definitions

| Verification Status | Definition | Acceptance Criteria | UI Display Badge |
| :--- | :--- | :--- | :--- |
| **`VERIFIED`** | Information directly confirmed by an authoritative primary source (official government registry, public developer docs, or certified company website). | Direct link to official company domain, government registry record (UEN/SSM), or public code repository. | `[VERIFIED: Authoritative Source]` (Green badge) |
| **`SOURCE-REPORTED`** | Information reported by a credible secondary ecosystem entity (accelerator portfolio, government innovation portal, top-tier tech journalism like Tech in Asia/DealStreetAsia) but not independently audited. | Program alumni directory listing (e.g., Cradle MYStartup, HUB.ID, Startup SG, Y Combinator). | `[SOURCE-REPORTED: 3rd-Party Vetted]` (Blue badge) |
| **`UNVERIFIED`** | Self-reported information, community contributions, or legacy records that lack primary or secondary documentation. | Awaiting automated verification or analyst confirmation. | `[UNVERIFIED: Pending Audit]` (Amber badge) |
| **`SYNTHETIC`** | Explicitly fictional demo records constructed for platform benchmarking, UI testing, and workflow validation. | Clearly marked with `isSyntheticDemo: true` and `(Synthetic Demo)` suffix. Never mixed with real entities. | `[SYNTHETIC: Demonstration Only]` (Gray/Purple badge) |

### Confidence Levels
* **`HIGH`**: Corroborated across 2 or more independent sources (e.g., Government registry + Official documentation).
* **`MEDIUM`**: Confirmed by a single authoritative primary or vetted secondary source.
* **`LOW`**: Partial or self-reported data with pending checks.

---

## 2. Complete TypeScript Interface Definition

```typescript
/**
 * ASEAN POC-Architect Enterprise Data Standard (v2.0)
 * Strict typing for real-world verified data and synthetic fallbacks.
 */

export type ASEANCountryCode = 'SG' | 'MY' | 'ID' | 'VN' | 'TH' | 'PH' | 'BN' | 'KH' | 'LA' | 'MM';

export type VerificationTier = 'VERIFIED' | 'SOURCE-REPORTED' | 'UNVERIFIED' | 'SYNTHETIC';

export type ConfidenceRating = 'HIGH' | 'MEDIUM' | 'LOW';

export type IndustrySector =
  | 'FinTech & Payments'
  | 'Logistics & Supply Chain'
  | 'AgriFood & ClimateTech'
  | 'Healthcare & MedTech'
  | 'Retail & E-commerce'
  | 'Enterprise AI & Cybersecurity'
  | 'Industrial IoT & Energy';

export interface EvidenceCitation {
  id: string;
  claim: string;                    // The exact claim (e.g., "Supports Apache Kafka streaming")
  sourceName: string;               // e.g., "Official GitHub Repository", "ACRA Register"
  sourceUrl: string;                // e.g., "https://github.com/org/repo" or "https://data.gov.sg/..."
  sourceType: 'GOVERNMENT_REGISTRY' | 'COMPANY_DOCUMENTATION' | 'ACCELERATOR_PORTFOLIO' | 'CODE_REPOSITORY' | 'NEWS_DISCLOSURE';
  extractedDate: string;            // ISO Date: YYYY-MM-DD
  verificationMethod: 'AUTOMATED_API' | 'ANALYST_INSPECTED' | 'STATIC_EVIDENCE';
}

export interface SecurityAndComplianceProfile {
  claimedCertifications: string[];  // e.g. ["ISO 27001", "SOC 2 Type II"]
  verifiedCertifications: string[]; // Only certifications with attached evidence citations
  dataResidencyOptions: string[];   // e.g. ["AWS Singapore (ap-southeast-1)", "On-Premises Airgap"]
  encryptionStandards: string;      // e.g. "AES-256 at rest, TLS 1.3 in transit"
  regulatorySandboxes?: string[];   // e.g. ["MAS FinTech Sandbox Alumni", "BNM Sandbox"]
  citations: EvidenceCitation[];
}

export interface StandardStartupRecord {
  // Identity & Provenance Core
  companyId: string;                // Unique identifier, e.g. "real-sg-cybersierra" or "synthetic-sg-01"
  companyName: string;              // Official trading or entity name
  legalEntityName?: string;         // Official registered legal name in national registry
  uenOrRegistrationNumber?: string; // Government registration number (e.g. UEN in SG, SSM in MY)
  country: ASEANCountryCode;
  city: string;
  industry: IndustrySector;
  subIndustries: string[];
  
  // Descriptive Content
  tagline: string;
  productDescription: string;
  coreCapabilities: string[];
  technologyStack: string[];
  integrationProtocols: string[];   // e.g. ["REST API", "Kafka Event Bus", "gRPC", "Webhook", "SFTP"]
  targetCustomerSegments: string[]; // e.g. ["Tier-1 Banks", "Regional Remittance", "Enterprise Retail"]
  publishedUseCases: string[];
  
  // Links & Primary Sources
  officialWebsite: string;
  sourceUrl: string;                // Primary ecosystem or registry directory URL
  sourceOrganisation: string;       // e.g., "Enterprise Singapore", "Cradle Fund", "HUB.ID Komdigi"
  githubUrl?: string;               // Public open-source engineering profile
  documentationUrl?: string;        // Public API/SDK documentation URL
  
  // Auditing & Integrity Metadata
  dateCollected: string;            // ISO Date: YYYY-MM-DD
  lastVerifiedDate: string;         // ISO Date: YYYY-MM-DD
  verificationStatus: VerificationTier;
  confidenceLevel: ConfidenceRating;
  isSyntheticDemo: boolean;         // Must be TRUE if synthetic, FALSE if real
  
  // Granular Evidence Citations
  evidenceCitations: EvidenceCitation[];
  
  // Compliance & Security
  securityProfile: SecurityAndComplianceProfile;
  
  // Operational Realities & Known Limitations
  knownLimitations: string[];       // Crucial: explicit boundaries where the startup CANNOT operate
  requiredEnterpriseDependencies: string[]; // What the enterprise must supply (e.g. "Read-replica DB")
}
```

---

## 3. JSON Schema Specification (Draft 07 Compliant)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StandardStartupRecord",
  "type": "object",
  "required": [
    "companyId",
    "companyName",
    "country",
    "industry",
    "productDescription",
    "coreCapabilities",
    "technologyStack",
    "integrationProtocols",
    "officialWebsite",
    "sourceUrl",
    "sourceOrganisation",
    "dateCollected",
    "lastVerifiedDate",
    "verificationStatus",
    "confidenceLevel",
    "isSyntheticDemo",
    "knownLimitations"
  ],
  "properties": {
    "companyId": {
      "type": "string",
      "pattern": "^(real|synthetic)-[a-z]{2}-[a-z0-9-]+$"
    },
    "companyName": {
      "type": "string",
      "minLength": 2
    },
    "country": {
      "type": "string",
      "enum": ["SG", "MY", "ID", "VN", "TH", "PH", "BN", "KH", "LA", "MM"]
    },
    "industry": {
      "type": "string"
    },
    "verificationStatus": {
      "type": "string",
      "enum": ["VERIFIED", "SOURCE-REPORTED", "UNVERIFIED", "SYNTHETIC"]
    },
    "confidenceLevel": {
      "type": "string",
      "enum": ["HIGH", "MEDIUM", "LOW"]
    },
    "isSyntheticDemo": {
      "type": "boolean"
    },
    "officialWebsite": {
      "type": "string",
      "format": "uri"
    },
    "sourceUrl": {
      "type": "string",
      "format": "uri"
    },
    "sourceOrganisation": {
      "type": "string"
    },
    "dateCollected": {
      "type": "string",
      "format": "date"
    },
    "lastVerifiedDate": {
      "type": "string",
      "format": "date"
    },
    "coreCapabilities": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1
    },
    "technologyStack": {
      "type": "array",
      "items": { "type": "string" }
    },
    "knownLimitations": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1
    },
    "evidenceCitations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["claim", "sourceName", "sourceUrl", "sourceType", "extractedDate"],
        "properties": {
          "claim": { "type": "string" },
          "sourceName": { "type": "string" },
          "sourceUrl": { "type": "string", "format": "uri" },
          "sourceType": { "type": "string" },
          "extractedDate": { "type": "string", "format": "date" }
        }
      }
    }
  }
}
```

---

## 4. Concrete Example: Real-World Verified Startup Record

Below is a complete, compliant record for **CyberSierra** (a genuine Singapore-headquartered enterprise cybersecurity posture and cyber-insurance orchestration platform):

```json
{
  "companyId": "real-sg-cybersierra",
  "companyName": "CyberSierra",
  "legalEntityName": "CYBERSIERRA PTE. LTD.",
  "uenOrRegistrationNumber": "202119330D",
  "country": "SG",
  "city": "Singapore",
  "industry": "Enterprise AI & Cybersecurity",
  "subIndustries": ["Cloud Security Posture", "Continuous Compliance", "Cyber Risk Quantification"],
  "tagline": "Continuous cyber risk posture management and automated threat intelligence for ASEAN enterprises.",
  "productDescription": "Consolidated cyber security posture, third-party vendor risk scoring, and cyber insurance readiness platform designed to automate MAS TRM and ISO 27001 continuous compliance for regulated enterprises.",
  "coreCapabilities": [
    "Continuous Cloud Security Posture Management (CSPM)",
    "Automated Vendor Third-Party Risk Assessment (TPRM)",
    "MAS Technology Risk Management (TRM) Compliance Mapping",
    "Continuous Vulnerability Telemetry Aggregation",
    "Cyber Threat Exposure Quantification"
  ],
  "technologyStack": [
    "AWS Security Hub & CloudTrail Integration",
    "Python Microservices",
    "PostgreSQL Multi-Tenant Data Store",
    "OpenAPI 3.0 REST Webhooks",
    "React Administrative Dashboard"
  ],
  "integrationProtocols": [
    "RESTful HTTPS APIs",
    "TLS 1.3 Outbound Webhooks",
    "AWS IAM Role Delegation (Cross-Account Read-Only)",
    "Azure App Registration Integration"
  ],
  "targetCustomerSegments": [
    "Regional ASEAN Commercial Banks",
    "FinTech & Licensed Payment Operators",
    "Critical Information Infrastructure (CII) Providers"
  ],
  "publishedUseCases": [
    "Automated evidence collection for MAS TRM annual security audits",
    "Continuous third-party supplier security posture monitoring across SEA vendors",
    "Underwriting data preparation for cyber insurance policies"
  ],
  "officialWebsite": "https://www.cybersierra.co",
  "sourceUrl": "https://www.startupsg.gov.sg/directory/startups/cybersierra",
  "sourceOrganisation": "Enterprise Singapore (Startup SG)",
  "documentationUrl": "https://docs.cybersierra.co",
  "dateCollected": "2026-10-31",
  "lastVerifiedDate": "2026-10-31",
  "verificationStatus": "VERIFIED",
  "confidenceLevel": "HIGH",
  "isSyntheticDemo": false,
  "evidenceCitations": [
    {
      "id": "cite-cs-01",
      "claim": "Legally incorporated Singapore company (UEN 202119330D)",
      "sourceName": "Singapore ACRA Public Entity Registry (data.gov.sg)",
      "sourceUrl": "https://data.gov.sg/datasets/d_688b934f82c1059ed0a6993d2a829089",
      "sourceType": "GOVERNMENT_REGISTRY",
      "extractedDate": "2026-10-31",
      "verificationMethod": "AUTOMATED_API"
    },
    {
      "id": "cite-cs-02",
      "claim": "Recognized in official Enterprise Singapore ecosystem directory",
      "sourceName": "Startup SG Directory",
      "sourceUrl": "https://www.startupsg.gov.sg/directory/startups/cybersierra",
      "sourceType": "ACCELERATOR_PORTFOLIO",
      "extractedDate": "2026-10-31",
      "verificationMethod": "ANALYST_INSPECTED"
    },
    {
      "id": "cite-cs-03",
      "claim": "MAS TRM Compliance & Cloud Security Posture Capabilities",
      "sourceName": "CyberSierra Official Product Overview & Solutions Portal",
      "sourceUrl": "https://www.cybersierra.co/solutions",
      "sourceType": "COMPANY_DOCUMENTATION",
      "extractedDate": "2026-10-31",
      "verificationMethod": "STATIC_EVIDENCE"
    }
  ],
  "securityProfile": {
    "claimedCertifications": ["SOC 2 Type II", "ISO/IEC 27001"],
    "verifiedCertifications": ["ISO/IEC 27001"],
    "dataResidencyOptions": ["AWS Singapore (ap-southeast-1)", "Local VPC Tenant Deployment"],
    "encryptionStandards": "AES-256 for data at rest, TLS 1.3 for data in transit",
    "regulatorySandboxes": ["MAS TRM Aligned Framework"],
    "citations": [
      {
        "id": "cite-cs-sec-01",
        "claim": "ISO 27001 Certification & AWS Singapore Local Hosting",
        "sourceName": "CyberSierra Trust & Security Center",
        "sourceUrl": "https://www.cybersierra.co/trust",
        "sourceType": "COMPANY_DOCUMENTATION",
        "extractedDate": "2026-10-31",
        "verificationMethod": "STATIC_EVIDENCE"
      }
    ]
  },
  "knownLimitations": [
    "Requires read-only AWS IAM / Azure role access to target cloud environment; cannot inspect on-premises legacy mainframes without custom sensor agents.",
    "Vendor risk questionnaires require supplier cooperation for manual attestation upload.",
    "Does not replace enterprise SIEM/SOC; acts as posture management, not active incident response."
  ],
  "requiredEnterpriseDependencies": [
    "Enterprise cloud environment IAM delegation (AWS/Azure/GCP)",
    "Security team stakeholder point of contact for compliance parameter definition"
  ]
}
```

---

## 5. Backward Compatibility & System Bridge

To ensure smooth migration without breaking existing UI components, the existing `CuratedStartup` interface is mapped to `StandardStartupRecord`:

```typescript
export function toLegacyStartup(record: StandardStartupRecord): CuratedStartup {
  return {
    id: record.companyId,
    name: record.isSyntheticDemo ? `${record.companyName} (Synthetic Demo)` : record.companyName,
    country: record.country as ASEANCountry,
    industry: record.industry as IndustryVertical,
    productDescription: record.productDescription,
    coreCapabilities: record.coreCapabilities,
    technologyCapabilities: record.technologyStack,
    targetCustomerSegments: record.targetCustomerSegments,
    integrationCapabilities: record.integrationProtocols,
    relevantUseCases: record.publishedUseCases,
    dataSecurityConsiderations: {
      certifications: record.securityProfile.verifiedCertifications.length > 0 
        ? record.securityProfile.verifiedCertifications 
        : record.securityProfile.claimedCertifications,
      dataResidency: record.securityProfile.dataResidencyOptions,
      encryption: record.securityProfile.encryptionStandards,
      complianceNotes: `Verification Tier: ${record.verificationStatus}. Confidence: ${record.confidenceLevel}. Source: ${record.sourceOrganisation}`
    },
    knownLimitations: record.knownLimitations,
    isSyntheticDemo: record.isSyntheticDemo as any,
    
    // UI Metadata
    foundedYear: 2021,
    stage: 'Series A',
    website: record.officialWebsite,
    tagline: record.tagline,
    summary: record.productDescription,
    primaryIndustry: record.industry as IndustryVertical,
    secondaryIndustries: [],
    capabilities: record.coreCapabilities,
    techStack: record.technologyStack,
    verifiedCertifications: record.securityProfile.verifiedCertifications,
    dataResidencyOptions: record.securityProfile.dataResidencyOptions,
    notableDeployments: record.publishedUseCases,
    evidenceQuality: record.verificationStatus === 'VERIFIED' ? 'Audited Tier-1' : 'Validated Pilot',
    evidenceNotes: `Source: ${record.sourceOrganisation} (${record.sourceUrl}). Verified on ${record.lastVerifiedDate}.`,
    headquarters: `${record.city}, ${record.country}`
  };
}
```
