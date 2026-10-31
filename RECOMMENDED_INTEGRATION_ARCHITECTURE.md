# RECOMMENDED_INTEGRATION_ARCHITECTURE.md
## ASEAN POC-Architect — Recommended Integration & Matching Architecture
**Author:** Senior Product Architect & Data Systems Lead  
**Date:** October 31, 2026  
**Status:** Approved System Design (Phase 5 & Phase 6)  
**Target Platform:** ASEAN POC-Architect

---

### Architectural Mission
To transition ASEAN POC-Architect from an offline demo into an **enterprise-credible, hybrid real-data matching and POC generation platform**. 

The architecture guarantees:
1. **Sub-second demo responsiveness** (no waiting 25 seconds for synchronous web scraping during an executive pitch).
2. **Resilience against 3rd-party API downtimes** (graceful offline fallback with explicit status badges).
3. **Rigorous match explainability** (mathematical, deterministic scoring with explicit "No Match" capability).
4. **End-to-end source attribution** (every match score is tied to verified evidence).

---

## 1. End-to-End System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER (Next.js 16 App Router)                      │
│                                                                                  │
│  [ Enterprise Challenge Input ] ──► [ Match Results & Evidence Drawer ]          │
│  [ Interactive Proposal Workspace ] ──► [ Human Sign-Off & PDF Exporter ]        │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTP REST / Server Actions
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                    API & ORCHESTRATION LAYER (Next.js API Routes)                │
│                                                                                  │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐ │
│  │ Match Engine Service  │  │ Proposal Orchestrator   │  │ Verification Router │ │
│  │ (Deterministic Match) │  │ (Zod Schema Validation) │  │ (ACRA & GitHub API) │ │
│  └───────────┬───────────┘  └───────────┬────────────┘  └──────────┬──────────┘ │
└──────────────┼──────────────────────────┼──────────────────────────┼─────────────┘
               │                          │                          │
┌──────────────▼──────────────────────────▼──────────────────────────▼─────────────┐
│                       HYBRID DATA & PERSISTENCE TIER                             │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ Local Verified Cache & Static Registry (In-Memory / JSON / Neon PostgreSQL)│  │
│  │  • 15–20 Hand-Audited Real ASEAN Startups (Cradle, EnterpriseSG, HUB.ID)   │  │
│  │  • Full Evidence Citations & Known Limitations                             │  │
│  │  • 14 Synthetic Fallback Records (Strictly Tagged isSyntheticDemo: true)   │  │
│  └──────────────────────────────────────┬─────────────────────────────────────┘  │
│                                         │ Async Cache Refresh / On-Demand Check  │
│  ┌──────────────────────────────────────▼─────────────────────────────────────┐  │
│  │ Live External Adapters (Non-Blocking, Short-Timeout with Circuit Breaker) │  │
│  │  • Singapore Data.gov.sg ACRA Datastore API (Live Entity Verification)     │  │
│  │  • GitHub REST API / MCP (Live Repository & Language Verification)          │  │
│  │  • Gemini 2.5 Flash / Gemma Model Provider (Structured Output)             │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Advanced Deterministic Matching Engine

The matching engine in `src/lib/matcher.ts` is elevated from simple keyword overlap to an **Evidentiary Match Matrix** that explicitly models enterprise procurement constraints.

### 2.1 The 6 Evaluation Dimensions & Weights

```
Overall Match Score = 
    (Capability Match        × 0.30) +
    (Industry Relevance      × 0.20) +
    (Technical Compatibility × 0.15) +
    (Integration Readiness   × 0.15) +
    (Data Residency & Geo    × 0.10) +
    (Evidence Quality Tier   × 0.10)
```

1. **Capability Match (30%):** Direct intersection between enterprise required outcomes and startup's verified capabilities.
2. **Industry & Domain Relevance (20%):** Startup experience in the specific vertical (e.g. Banking, AgriFood, Logistics).
3. **Technical Compatibility (15%):** Alignment of technology stack (e.g., Python, Kafka, Spark, PostgreSQL, Kubernetes).
4. **Integration Readiness (15%):** Support for required enterprise transport protocols (e.g., mTLS REST, Webhooks, SFTP batch, VPC Peering).
5. **Geographic & Data Residency Fit (10%):** Does the startup provide data residency in the required jurisdiction (e.g., Malaysia PDPA, Singapore MAS TRM, Indonesia PP 71/2019)?
6. **Evidence Quality Score (10%):**
   * `VERIFIED` (Audited Primary Source): 100 points
   * `SOURCE-REPORTED` (3rd-party Program Alumni): 80 points
   * `UNVERIFIED` (Self-reported): 40 points
   * `SYNTHETIC` (Demo entity): Capped at 50 points

### 2.2 Strict Categorization: 4 Match Statuses

The engine must classify every candidate into one of 4 discrete outcomes:

```
                          ┌───────────────────────────┐
                          │   Enterprise Challenge    │
                          └─────────────┬─────────────┘
                                        │
                ┌───────────────────────┴───────────────────────┐
                ▼                                               ▼
     Score ≥ 75 & Gaps ≤ 1                           Score 50-74 OR Gaps 2-3
   ┌───────────────────────┐                       ┌─────────────────────────┐
   │    GENUINE MATCH      │                       │     PARTIAL MATCH       │
   │ (Full Pilot Proposal) │                       │ (Scope Gaps Identified) │
   └───────────────────────┘                       └─────────────────────────┘
                │                                               │
                ▼                                               ▼
     Missing Critical Info                            Score < 50 OR Hard
    (Residency/Tech Unknown)                         Constraint Violated
   ┌───────────────────────┐                       ┌─────────────────────────┐
   │ INSUFFICIENT EVIDENCE │                       │      NOT SUITABLE       │
   │ (Flagged for Discovery)                       │  (Disqualified / Reject)│
   └───────────────────────┘                       └─────────────────────────┘
```

#### A. Genuine Match (`GENUINE_MATCH`)
* **Threshold:** Overall Score $\ge 75$ AND zero Critical Disqualifiers.
* **Evidence:** At least 2 primary evidence citations matching challenge requirements.
* **Engine Action:** Emits green badge, recommends full 60-day pilot proposal.

#### B. Partial Match (`PARTIAL_MATCH`)
* **Threshold:** Overall Score $50 \le \text{Score} < 75$.
* **Characteristics:** Strong domain capability, but has 1–2 specific gaps (e.g., lacks required batch SFTP protocol or local VPC peering).
* **Engine Action:** Emits amber badge; explicitly surfaces required gap-remediation milestones in the roadmap.

#### C. Insufficient Information (`INSUFFICIENT_INFORMATION`)
* **Threshold:** Candidate matches keywords, but `verificationStatus == 'UNVERIFIED'` or critical security attributes (data residency, encryption) are absent.
* **Engine Action:** Emits warning badge: *"Cannot recommend for live banking data without security audit."*

#### D. Not Suitable (`NOT_SUITABLE`)
* **Threshold:** Score $< 50$ OR violates a hard non-negotiable constraint (e.g., Enterprise demands Malaysian data residency; startup only offers US multi-tenant cloud).
* **Engine Action:** Excluded from recommendations or shown in collapsible "Disqualified Candidates" drawer with exact reason.

### 2.3 The "No Suitable Match Found" Condition
If all startups in the registry score $< 50$ or fail hard constraints, the system MUST emit a clear, honest state:

```typescript
export interface MatchingResponse {
  hasMatches: boolean;
  message: string;
  recommendedStartups: MatchResult[];
  disqualifiedStartups: { startupName: string; disqualificationReason: string }[];
  marketGapInsights: string[];
}
```
* **UI Representation:** Renders an empty state banner: *"No suitable ASEAN startup found that satisfies both your technical integration constraints (mTLS/Kafka) and local data residency in Malaysia. Consider broadening integration constraints or initiating an Open Innovation Call via IMDA OIP."*
* **Anti-Hallucination Barrier:** The LLM is NEVER allowed to invent a match score or override mathematical thresholding.

---

## 3. High-Performance Hybrid Data Layer (Latency & Offline Strategy)

Executive demonstrations and live hackathon judging cannot tolerate network latency, API timeouts, or rate-limit blocks (HTTP 429).

### 3.1 The Three-Tier Storage Pattern

```
Tier 1: Fast In-Memory Local Cache (0ms latency)
   ├── Pre-seeded with 15-20 verified real ASEAN startup profiles
   └── Pre-seeded with 14 clearly tagged synthetic demonstration profiles

Tier 2: Asynchronous Verification Layer (Background, Non-blocking)
   ├── Background worker updates UEN status via data.gov.sg API
   └── Background worker checks commit recency via GitHub REST API

Tier 3: Graceful Offline Fallback & Circuit Breaker
   ├── 1.5s timeout on external API requests
   └── Automatic fallback to cached verification badge if API is down
```

### 3.2 Real-Time Verification Adapter Implementation
When viewing a startup profile in the UI, an optional "Live Verification" chip triggers a lightweight server action:

```typescript
// src/lib/verification/acraAdapter.ts
export async function verifySingaporeEntity(uenOrName: string): Promise<{
  verified: boolean;
  uen?: string;
  legalName?: string;
  status?: string;
  source: string;
}> {
  const CONTROLLER_TIMEOUT_MS = 1500;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONTROLLER_TIMEOUT_MS);

  try {
    const url = `https://api-production.data.gov.sg/v2/public/api/action/datastore_search?resource_id=d_688b934f82c1059ed0a6993d2a829089&q=${encodeURIComponent(uenOrName)}&limit=1`;
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 86400 } });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const record = data?.result?.records?.[0];

    if (record) {
      return {
        verified: true,
        uen: record.uen,
        legalName: record.entity_name,
        status: record.entity_status_description,
        source: 'ACRA via data.gov.sg'
      };
    }
    return { verified: false, source: 'data.gov.sg (No Record Found)' };
  } catch (err) {
    clearTimeout(timeoutId);
    // Graceful circuit breaker fallback
    return { verified: false, source: 'data.gov.sg (Offline / Timeout Fallback)' };
  }
}
```

---

## 4. Proposal Generation Workflow with Grounded LLM

The proposal generation process (`src/lib/ai/orchestrator.ts`) enforces strict bi-directional grounding:

```
[ Selected Enterprise Challenge ] ──┐
                                     ├──► [ Context Boundary Builder ]
[ Verified Startup JSON Record ] ───┘           │
                                                ▼
                             [ Injects Grounding Invariants ]
                             (No Hallucinated Certs/Partnerships)
                                                │
                                                ▼
                             [ Gemini 2.5 Flash / Gemma Engine ]
                             (Schema-enforced JSON generation)
                                                │
                                                ▼
                             [ Evidentiary Schema Validator ]
                             (Cross-checks claims against record)
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
                    Valid Grounding                           Integrity Violation
             [ Pilot Proposal Workspace ]              [ Fallback to Grounded Template ]
```

This guarantees that every milestone, RACI role, and KPI is rooted exclusively in verified real-world facts.
