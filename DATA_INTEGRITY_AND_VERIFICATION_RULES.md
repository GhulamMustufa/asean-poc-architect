# DATA_INTEGRITY_AND_VERIFICATION_RULES.md
## ASEAN POC-Architect — Data Integrity, Verification Rules & Anti-Hallucination Policy
**Author:** Independent Technical Auditor & AI Safety Architect  
**Date:** October 31, 2026  
**Status:** Mandatory Compliance Standard (Phase 4)  
**Target Platform:** ASEAN POC-Architect

---

### Core Principle
In enterprise software procurement, **an ungrounded claim is an engineering defect**. 

If ASEAN POC-Architect suggests a startup claiming it has a "SOC 2 Type II audit", an "Apache Kafka gRPC endpoint", or an "active partnership with Maybank" when no such capability or relationship exists, the platform causes severe procurement, compliance, and legal liability.

This document establishes immutable architectural invariants and runtime verification rules to guarantee total data integrity.

---

## 1. The 7 Absolute System Invariants (Zero-Tolerance Rules)

The platform backend, matching engine, and LLM prompt orchestrators MUST enforce these 7 invariants without exception:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE 7 SYSTEM INTEGRITY INVARIANTS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. NEVER invent company capabilities not in the verified record.           │
│ 2. NEVER invent enterprise customers, deployments, or case studies.       │
│ 3. NEVER invent funding rounds, valuation, or capitalization numbers.     │
│ 4. NEVER invent API availability, protocols, or SDK specifications.        │
│ 5. NEVER invent security certifications (ISO, SOC 2, PCI-DSS, MAS TRM).   │
│ 6. NEVER present synthetic demonstration records as real legal entities.    │
│ 7. NEVER claim a startup is interested in or committed to a partnership     │
│    without explicit signed human evidence.                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

Any violation of these invariants during runtime or evaluation is classified as a **Critical Severity 1 Data Defect**.

---

## 2. Classification Governance: Boundary Rules

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    VERIFIED     │  ≠    │ SOURCE-REPORTED │  ≠    │    SYNTHETIC    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Isolation Invariant:** `SYNTHETIC` entities must NEVER be merged into the `VERIFIED` pool.
   * `isSyntheticDemo` must remain a strict boolean flag.
   * Synthetic records must always display the label `(Synthetic Demo)` in their title and carry the verification badge `[SYNTHETIC: Demonstration Only]`.
2. **Downward Downgrade Rule:** If any capability or certification in a `VERIFIED` record cannot produce a live clickable URL or primary artifact, the entire record must be downgraded to `SOURCE-REPORTED` or `UNVERIFIED`.
3. **No Inference of Certifications:** An LLM or matching algorithm must NEVER infer that "because a startup is in FinTech, it must be PCI-DSS compliant." Certifications exist ONLY if explicitly cited in `securityProfile.verifiedCertifications`.

---

## 3. Verification Protocol & Audit Checklist

Before any startup record is approved for the `VERIFIED` or `SOURCE-REPORTED` production catalog, it must pass this 8-step verification pipeline:

```
[ Step 1: Legal Entity Check ] ──────► Query ACRA / SSM / Gov Registry for active legal status.
[ Step 2: Domain Authenticity ] ─────► Confirm official corporate domain matches DNS & SSL certificate.
[ Step 3: Ecosystem Presence ] ──────► Cross-check with Cradle, EnterpriseSG, HUB.ID, or NIA directory.
[ Step 4: Technical Claims Audit ] ──► Validate claimed tech stack against public GitHub / API docs.
[ Step 5: Trust Center Audit ] ──────► Inspect public trust center for real ISO/SOC compliance badges.
[ Step 6: Negative Capability Check ]► Document at least 2 explicit Known Limitations / non-capabilities.
[ Step 7: Granular Citation ] ──────► Attach exact source URL to every capability item.
[ Step 8: Immutability Seal ] ───────► Timestamp, sign with auditor ID, and store in verified ledger.
```

### Verification Checklist Table

| Item # | Verification Check | Required Evidence | Failure Action |
| :---: | :--- | :--- | :--- |
| **V-01** | Legal Business Existence | National Registry UEN / Registration No. (e.g., ACRA API) | Mark as `UNVERIFIED` |
| **V-02** | Official Website Operation | Active HTTPS website with valid SSL certificate | Reject Record |
| **V-03** | Primary Ecosystem Vetting | Listing in Cradle, EnterpriseSG, HUB.ID, NIA, or YC catalog | Downgrade to `UNVERIFIED` |
| **V-04** | API / Protocol Verification | Public API documentation, OpenAPI JSON, or developer docs | Remove Protocol from `integrationProtocols` |
| **V-05** | Security Certification Claim | Visible certificate number, audit report summary, or trust badge | Move from `verifiedCertifications` to `claimedCertifications` |
| **V-06** | Known Limitations Stated | At least 2 clear limitations (e.g., "No on-premise mainframe support") | Block from `VERIFIED` status |
| **V-07** | Source URL Attribution | Direct, accessible web link to source material | Downgrade confidence to `LOW` |
| **V-08** | Age of Verification | `lastVerifiedDate` within the last 180 days | Flag for Refresh / Audit |

---

## 4. Prompt Engineering & LLM Guardrails

When AI orchestrators (`src/lib/ai/orchestrator.ts`) invoke Gemini, Gemma, or OpenAI models to generate proposals, roadmaps, or RACI charts, strict anti-hallucination prompt boundaries must be injected:

### 4.1 Grounding System Prompt Injection
```typescript
export const DATA_INTEGRITY_SYSTEM_INSTRUCTION = `
You are the ASEAN POC-Architect Proposal Engine. You operate under strict enterprise evidentiary rules.

MANDATORY RULES:
1. GROUNDING MANDATE: You may ONLY reference capabilities, technologies, protocols, and certifications
   that appear verbatim in the provided startup record: \${JSON.stringify(startup)}.
2. PROHIBITION ON EXTRAPOLATION: You are strictly forbidden from inventing new features, proprietary models,
   enterprise customers, certifications, or security standards not explicitly listed.
3. ADMISSION OF LIMITATIONS: If the enterprise challenge requires a technology or capability that the startup
   does not have, you MUST declare it as an Out-of-Scope item or a Critical Gap.
4. HONEST UNCERTAINTY: If data residency options or compliance details are unspecified in the startup record,
   state: "Unspecified in verified records; requires technical clarification during Phase 1 discovery."
5. NO PARTNERSHIP PRESUMPTION: State all proposals as "Subject to Technical and Legal Due Diligence."
   Never claim the startup has agreed to pricing, timelines, or SLAs.
`;
```

### 4.2 Post-Generation Evidentiary Validator
Every generated proposal must pass a post-generation schema check that cross-references all claims against the startup's ground truth record:

```typescript
export function validateProposalGrounding(
  generatedProposal: any,
  startup: StandardStartupRecord
): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];
  const generatedText = JSON.stringify(generatedProposal).toLowerCase();

  // 1. Audit Security Claims
  const FORBIDDEN_CERT_WORDS = ['pci-dss', 'soc 2', 'iso 27001', 'fedramp', 'hipaa'];
  for (const cert of FORBIDDEN_CERT_WORDS) {
    if (generatedText.includes(cert)) {
      const isClaimedOrVerified = startup.securityProfile.claimedCertifications
        .concat(startup.securityProfile.verifiedCertifications)
        .some(c => c.toLowerCase().includes(cert));
      if (!isClaimedOrVerified) {
        violations.push(`Hallucinated Certification: Proposal mentions '${cert}' but startup record does not hold it.`);
      }
    }
  }

  // 2. Audit Protocol Claims
  const FORBIDDEN_PROTOCOLS = ['grpc', 'kafka', 'graphql', 'sap rfc'];
  for (const protocol of FORBIDDEN_PROTOCOLS) {
    if (generatedText.includes(protocol)) {
      const hasProtocol = startup.integrationProtocols.some(p => p.toLowerCase().includes(protocol));
      if (!hasProtocol) {
        violations.push(`Hallucinated Protocol: Proposal promises '${protocol}' integration not supported by startup.`);
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}
```

---

## 5. Traceability Architecture

Every proposal milestone, RACI assignment, and KPI must maintain a bi-directional audit link:

```
[ Enterprise Challenge Requirement ] ──► (ID: REQ-01: "MAS TRM Compliance")
                 │
                 ▼
[ Match Engine Dimension Score ] ──────► (Dim: capabilityMatch, Score: 95)
                 │
                 ▼
[ Startup Verified Evidence ] ─────────► (Cite: "cite-cs-sec-01", Source: CyberSierra Trust Center)
                 │
                 ▼
[ Generated Pilot Proposal Section ] ──► (Section: "Phase 1: Compliance Telemetry Ingestion")
                 │
                 ▼
[ Human Review Sign-Off ] ─────────────► (Signed: "Chief Risk Officer, Maybank", 2026-10-31)
```

With this traceability chain, an enterprise compliance officer can click any sentence in a generated pilot proposal and immediately see the exact source URL, government registry filing, or engineering repository that proves the claim.
