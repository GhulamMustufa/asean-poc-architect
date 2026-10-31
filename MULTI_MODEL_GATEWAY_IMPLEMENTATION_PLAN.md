# Universal Multi-Model AI Gateway Implementation Plan
**ASEAN POC-Architect**
*Document Version: 1.0.0 | Date: 2026-10-31*
*Author: Senior AI Systems Architect & QA Engineering Lead*

---

## 1. Executive Summary & Objective

The objective of this initiative is to build a production-minded, vendor-independent **Universal AI Gateway** for ASEAN POC-Architect. The gateway will:
1. Support multiple AI model providers through a single standardized contract.
2. Enable seamless user selection of preferred models (Google Gemma 4 Cloud, Groq High-Speed, Local Ollama Gemma 2 2B / Qwen 2.5 Coder 3B, or Automatic Routing).
3. Implement an intelligent failover cascade with transient retry handling and offline cached demo fallbacks to guarantee resilience during poor hackathon venue Wi-Fi.
4. Enforce strict privacy and data sovereignty controls (including an explicit **Local-Only Mode**).
5. Provide complete execution visibility (displaying requested vs actual provider, model, latency, and fallback rationale).
6. Never replace or corrupt the mathematical 5-dimension deterministic startup matching engine.

---

## 2. Current Architecture & Reuse Analysis

### Existing Components:
- **`src/lib/ai/schemas.ts`**: High-quality, battle-tested Zod schemas (`FullStructuredProposalStageSchema`, Stage 1–5 schemas). **100% REUSED.**
- **`src/lib/ai/deterministicFallbackAdapter.ts`**: Robust, grounded proposal generator used as a zero-failure fallback. **100% REUSED.**
- **`src/lib/ai/geminiAdapter.ts`**: Direct Google API caller. Will be refactored into `GoogleProvider` implementing the universal contract.
- **`src/lib/ai/ollamaAdapter.ts`**: Basic Ollama caller. Will be upgraded into `LocalOllamaProvider` with health check, tag inspection, and model verification.
- **`src/lib/ai/orchestrator.ts`**: Higher-level proposal synthesizer. Will delegate underlying model calls to `UniversalAIGateway`.
- **`src/lib/matcher.ts`**: Pure deterministic 5-dimension algorithm. **UNCHANGED.**

### Files to Create or Modify:

| File | Action | Purpose |
| :--- | :--- | :--- |
| `src/lib/ai/gateway/types.ts` | **Create** | Common `AIProvider`, `GatewayRequest`, `GatewayResponse`, `ProviderHealth` types. |
| `src/lib/ai/gateway/cache.ts` | **Create** | In-memory & structured cache keyed by task, inputs, and schema version. |
| `src/lib/ai/gateway/providers/googleProvider.ts` | **Create** | Official Google API provider for Gemma 4 / Gemini models with server-side API key. |
| `src/lib/ai/gateway/providers/groqProvider.ts` | **Create** | Groq OpenAI-compatible provider with model discovery and timeout handling. |
| `src/lib/ai/gateway/providers/ollamaProvider.ts` | **Create** | Local Ollama provider supporting `gemma2:2b` & `qwen2.5-coder:3b` with health checks. |
| `src/lib/ai/gateway/providers/fallbackProvider.ts` | **Create** | Grounded deterministic backup provider. |
| `src/lib/ai/gateway/universalGateway.ts` | **Create** | Core routing engine, failover cascade, policy router, and execution tracking. |
| `src/app/api/ai/health/route.ts` | **Create** | Real-time health check endpoint for configured providers (never exposes keys). |
| `src/app/api/proposals/generate/route.ts` | **Modify** | Integrate gateway request parsing, model preferences, and routing metadata. |
| `src/components/ModelSwitcher.tsx` | **Create** | Compact navigation pill and settings drawer for model selection and health status. |
| `src/components/Navbar.tsx` | **Modify** | Embed ModelSwitcher in header navigation. |
| `src/components/ProposalWorkspace.tsx` | **Modify** | Display AI Execution audit badge (actual provider, model, latency, fallback status). |
| `tests/ai-gateway.test.ts` | **Create** | Comprehensive unit & integration tests covering all providers, cascades, and local-only mode. |
| `.env.example` | **Create** | Sanitized template documenting all supported environment variables. |

---

## 3. Standardized Provider Interface

```typescript
export type TaskType =
  | 'proposal_synthesis'
  | 'business_understanding'
  | 'pilot_scoping'
  | 'roadmap_generation'
  | 'kpi_design'
  | 'risk_compliance';

export interface GatewayRequest<T> {
  taskType: TaskType;
  systemInstruction: string;
  userPrompt: string;
  expectedSchema: z.ZodSchema<T>;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  preferredModelId?: string;
  isSensitiveData?: boolean;
}

export interface GatewayResponse<T> {
  success: boolean;
  providerId: string;
  modelId: string;
  structuredData?: T;
  latencyMs: number;
  fallbackUsed: boolean;
  fallbackChain?: string[];
  isCachedResult?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface AIProvider {
  id: string;
  displayName: string;
  providerType: 'cloud' | 'local' | 'fallback';
  supportedModels: { id: string; name: string; contextWindow: number }[];
  isConfigured(): boolean;
  healthCheck(): Promise<ProviderHealth>;
  generateStructuredOutput<T>(request: GatewayRequest<T>, signal?: AbortSignal): Promise<GatewayResponse<T>>;
}
```

---

## 4. Provider Specifications & Compatibility Findings

### A. Google Provider
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Model IDs:** `gemma-4-31b-it` (Gemma 4 family on Google AI Studio) with fallback to `gemini-2.0-flash`.
- **Environment Variable:** `GOOGLE_AI_API_KEY` (also backward-compatible with `GEMINI_API_KEY`).
- **Compatibility Note:** If `responseMimeType: 'application/json'` is unavailable on certain open-weights variants, a robust JSON block extractor will parse and validate the raw text before returning.

### B. Groq Provider
- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Environment Variables:** `GROQ_API_KEY`, `GROQ_MODEL_ID` (default: `llama-3.1-8b-instant`).
- **Compatibility Note:** In 2025/2026, Groq deprecated `gemma2-9b-it` in favor of high-throughput `llama-3.1-8b-instant` and active open models. The provider verifies available models or falls back safely to configured IDs.

### C. Local Ollama Provider
- **Endpoint:** `http://localhost:11434/api/generate` and `http://localhost:11434/api/tags`
- **Environment Variables:** `OLLAMA_BASE_URL` (default: `http://localhost:11434`), `OLLAMA_DEFAULT_MODEL` (default: `gemma2:2b`).
- **Installed & Verified Models on Host:**
  - `gemma2:2b` (2.6B parameters, Q4_0, verified active)
  - `qwen2.5-coder:3b` (3.1B parameters, Q4_K_M, verified active)
- **RAM Safeguards (M1 8GB):** Ollama is invoked sequentially. We never request both models concurrently to prevent swapping or out-of-memory kernel panics.

### D. Deterministic Cached Fallback Provider
- Grounded algorithm synthesizing structured 60-day roadmap, RACI matrix, assumptions-marked KPIs, and regulatory disclaimers. Always available (zero network dependency).

---

## 5. Failover Cascade & Caching Rules

```
[User Request]
       |
       v
[User Explicit Preference / Task Router]
       |
       +---> If Local-Only Mode Enabled:
       |        Attempt Ollama (20s) -> Fallback Provider (Instant)
       |        (NEVER routes to Google or Groq Cloud)
       |
       +---> If Cloud Permitted:
                1. Primary Provider (Timeout: 8s)
                2. Secondary Cloud Provider (Timeout: 8s)
                3. Local Ollama (Timeout: 20s, if running)
                4. Deterministic Cached Demo Result (Instant)
```

- **Deadline:** Global request deadline enforced at 30 seconds.
- **Cache Keying:** `hash(taskType + challengeId + startupId + schemaHash)`.
- **Cache Invalidation:** When challenge title, problem, or selected startup ID changes, previous cache is bypassed.
- **Visual Transparency:** All cached outputs display `[CACHED DEMO RESULT]` with timestamp.

---

## 6. Risks, Limitations & Honesty Standards

1. **No 100% Uptime Claims:** No distributed or local AI system can promise 100% uptime. Venue Wi-Fi drops, API rate limits, and machine sleep are anticipated and addressed with transparent fallbacks.
2. **Local Machine Hardware Limits:** M1 MacBook Pro 8GB RAM cannot host 70B models. Local inference is scoped to 2B–3B quantized weights.
3. **Air-Gap Transparency:** Running Ollama locally does not make the entire application air-gapped if government API checks (data.gov.sg) or external CDNs are invoked. The UI explicitly states data transfer boundaries.
4. **Deterministic Match Preservation:** The startup matching algorithm remains purely mathematical and independent of LLM hallucinations.

---

## 7. Execution Roadmap

- [x] Phase 1: Repository inspection & plan documentation (`MULTI_MODEL_GATEWAY_IMPLEMENTATION_PLAN.md`).
- [ ] Phase 2: Build standardized types, cache, and provider drivers (`src/lib/ai/gateway/`).
- [ ] Phase 3: Implement `UniversalAIGateway` with policy routing & failover cascade.
- [ ] Phase 4: Create real-time server health route (`/api/ai/health`).
- [ ] Phase 5: Build UI Model Switcher and Execution Transparency Indicator.
- [ ] Phase 6: Automated test suite (`tests/ai-gateway.test.ts`).
- [ ] Phase 7: Verification (`npm test`, `npm run build`), reports, and demo guide.
