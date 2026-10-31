# ASEAN POC-Architect — Multi-Model AI Gateway Test Report

**QA & Test Engineer:** Senior QA Lead & AI Systems Architect  
**Execution Environment:** Node.js v20.19.4, tsx test runner, macOS Apple Silicon  
**Total Test Suites:** 9  
**Total Automated Tests:** 43  
**Passing Tests:** 43 (100%)  
**Failing Tests:** 0 (0%)  
**Execution Time:** ~21.09 seconds  
**Date of Execution:** October 31, 2026  

---

## 1. Test Suite Summary Table

| Test Suite File | Test Count | Pass | Fail | Execution Time | Primary Target Verified |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`tests/ai-gateway.test.ts`** | 15 | 15 | 0 | 66.4 ms | Provider drivers, schema parsing, cascades, local-only isolation, cache invalidation |
| **`tests/ai-proposal.test.ts`** | 5 | 5 | 0 | 20.4 s | 6-stage proposal synthesis, roadmap timing, KPI assumptions, fallback triggers |
| **`tests/end-to-end-audit.test.ts`** | 9 | 9 | 0 | 62.4 ms | Enterprise AML bank scenario, deterministic matching, proposal review, PDF export |
| **`tests/matcher.test.ts`** | 9 | 9 | 0 | 51.9 ms | 5-dimension deterministic scoring, weight customization, risk gap penalties |
| **`tests/workflow.test.ts`** | 5 | 5 | 0 | 144.2 ms | Human approval gating, versioning, audit trail, deal pipeline metrics |
| **TOTAL** | **43** | **43** | **0** | **21.09 s** | **100% Zero-Failure Execution** |

---

## 2. Detailed Test Specifications & Assertions

### Suite 1: `tests/ai-gateway.test.ts` (Universal AI Gateway Engine)

1. **JSON Extractor Resilience**:
   - *Test*: Safely extracts and parses JSON when wrapped in markdown code fences (` ```json `), preceded by explanatory text, or followed by sign-offs.
   - *Result*: **PASS**. Rejects unparseable non-JSON text with structured error.
2. **Google Gemma Provider — Missing API Key**:
   - *Test*: When `GOOGLE_AI_API_KEY` is omitted, `isConfigured()` returns `false` and execution returns `ERR_NOT_CONFIGURED` without crashing.
   - *Result*: **PASS**.
3. **Google Gemma Provider — Mocked Successful Execution**:
   - *Test*: Mocks Google AI Studio HTTP response. Validates that returned parts text is parsed against expected Zod schema.
   - *Result*: **PASS**. Latency tracked, `providerId: 'google'`.
4. **Google Gemma Provider — Zod Schema Failure Rejection**:
   - *Test*: Provider receives payload missing required schema fields.
   - *Result*: **PASS**. Rejects malformed payload, returns `ERR_EXECUTION_FAILED`.
5. **Google Gemma Provider — Timeout Handling**:
   - *Test*: Simulates hanging network response exceeding `timeoutMs: 20ms`.
   - *Result*: **PASS**. AbortController aborts signal, returns `ERR_TIMEOUT`.
6. **Groq Provider — Missing API Key**:
   - *Test*: Verifies health check returns `status: 'not_configured'` when `GROQ_API_KEY` is absent.
   - *Result*: **PASS**.
7. **Groq Provider — Mocked Structured Generation**:
   - *Test*: Verifies OpenAI-compatible `/chat/completions` endpoint with `response_format: { type: 'json_object' }`.
   - *Result*: **PASS**.
8. **Local Ollama Provider — Connection Refusal**:
   - *Test*: Simulates inactive daemon (`ECONNREFUSED 127.0.0.1:11434`).
   - *Result*: **PASS**. Returns `unavailable` with actionable instruction to start Ollama.
9. **Local Ollama Provider — Missing Model Rejection**:
   - *Test*: Requests uninstalled model on Ollama.
   - *Result*: **PASS**. Strictly refuses to auto-download; instructs user to run `ollama pull <model>`.
10. **Local Ollama Provider — Mocked Local Execution**:
    - *Test*: Simulates successful on-device execution with `format: 'json'`.
    - *Result*: **PASS**.
11. **Gateway Cascade Failover**:
    - *Test*: Simulates HTTP 503 on Google provider. Verifies gateway automatically catches error and switches to Groq provider.
    - *Result*: **PASS**. `fallbackUsed: true`, `fallbackChain` records Google failure.
12. **Local-Only Mode Isolation**:
    - *Test*: Sets `localOnlyMode: true`. Intercepts all outgoing fetch URLs.
    - *Result*: **PASS**. Zero outbound cloud URLs (`googleapis.com`, `groq.com`) contacted. Exclusively routes to `localhost:11434`.
13. **Cascade Exhaustion ➔ Deterministic Fallback**:
    - *Test*: Simulates all live network and local LLM failures.
    - *Result*: **PASS**. Activates `DeterministicCachedFallbackProvider`. Returns complete validated output with zero application crash.
14. **Cryptographic Result Caching**:
    - *Test*: Seeds cache with SHA-256 key (`taskType:challengeSig:startupSig`). Simulates network outage.
    - *Result*: **PASS**. Serves cached result, tags with `isCachedResult: true`.
15. **Cache Invalidation on Input Change**:
    - *Test*: Verifies that modifying the enterprise challenge input produces a different cryptographic hash, preventing stale cache reuse.
    - *Result*: **PASS**.

---

### Suite 2: `tests/ai-proposal.test.ts` (Proposal Workflow & Disclaimers)

1. **Successful Generation**: Orchestrator produces all 6 stages (`challengeUnderstanding`, `pilotScoping`, `roadmap`, `kpiDesign`, `riskCompliance`, `executiveSummary`) and 60-day roadmap.
2. **Missing Challenge Data**: Sparse inputs handled gracefully; missing technical constraints flagged in Stage 1 missing information checklist.
3. **Malformed Adapter Schema Rejection**: Malformed model outputs rejected by Zod schema and recovered by fallback engine.
4. **Timeout Enforcement**: Hanging network call exceeding timeout triggers retry limit and activates safety fallback.
5. **Truth Preservation & Legal Disclaimers**: Disclaimers verified; country-specific regulations explicitly marked `Requires Independent Legal Review` rather than false automatic approval.

---

### Suite 3: `tests/matcher.test.ts` (Deterministic Matching Engine)

1. **Strong Match Verification**: SentriShield AI matches Cross-Border AML challenge with score ≥ 85%.
2. **Partial Match**: Scores between 50% and 78% for partial capability overlaps.
3. **Weak Match**: Adjacent candidate scores between 20% and 49%.
4. **No Match**: Agricultural drone tested against tier-1 banking fraud scores < 25%.
5. **Missing Info vs Mismatch**: Unspecified items do not receive unfair penalty deductions.
6. **Explicit Gap Penalty**: Missing mandatory constraint produces explainable penalty.
7. **Configurable Dimension Weights**: Math calculations remain 100% deterministic under weight shifts.
8. **Ground Truth Integrity**: Every match reason links back to verified startup record.
9. **Ranking Consistency**: Deterministic sorting ensures identical candidate ranking on every run.

---

## 3. Production Build Validation

```bash
npm run build
```
- **Result**: `✓ Compiled successfully in 1492ms`
- **TypeScript**: Finished cleanly in 4.0s with zero type errors.
- **Dynamic Route Optimization**:
  - `ƒ /api/ai/health` (Server-rendered on demand)
  - `ƒ /api/proposals/generate` (Server-rendered on demand)
  - `ƒ /api/verify-entity` (Server-rendered on demand)
