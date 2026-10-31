# ASEAN POC-Architect — Hackathon Jury Demo Guide

**Target Audience:** Hackathon Presenters, Technical Judges, Enterprise Evaluators  
**Goal:** Deliver a flawless 3-to-5 minute live demonstration showcasing Multi-Model AI Routing, On-Device Privacy, and Zero-Failure Automatic Failover under unpredictable venue Wi-Fi.

---

## 1. Pre-Demo Checklist (5 Minutes Before Stage)

- [ ] Dev server running: `npm run dev` (running on `http://localhost:3000`).
- [ ] Check AI Gateway Health: Click the **AI Selector** button in the top navigation bar.
- [ ] Confirm at least one provider shows `Connected` (Ollama or Google or Groq).
- [ ] Remember: Even if all cloud and local models are turned off, the **Offline Grounded Demo Engine** guarantees a 100% successful proposal synthesis with zero latency.

---

## 2. Standard 3-Step Demo Script

### Step 1: The Problem & Deterministic Matching (60 Seconds)
1. **Show the Dashboard**:
   - Point out the 32 verified ASEAN startups from Singapore, Malaysia, Indonesia, Vietnam, Thailand, and Philippines.
   - Explain to the judges: *"Most AI hackathon apps are GPT wrappers that hallucinate company names. We grounded our platform in real data and mathematical matching."*
2. **Submit an Enterprise Challenge**:
   - Click **+ Start New Project**.
   - Select the pre-loaded template: **"Real-time Anti-Money Laundering & Transaction Monitoring"** (Singapore / Malaysia corridor).
   - Click **Calculate Startup Matches**.
3. **Show Explainable Scoring**:
   - Highlight **SentriShield AI (Singapore)** scoring **89%**.
   - Show the 5-dimension breakdown: Capability (93%), Use-Case Relevance (90%), Technical Fit (85%), Market Residency (90%), Integration Readiness (85%).
   - Emphasize: *"No LLM generated this ranking. It is purely deterministic mathematics."*

---

### Step 2: Multi-Model AI Gateway in Action (90 Seconds)

1. **Demonstration A — Cloud High-Reasoning (Google Gemma 4)**:
   - In the navigation bar, open the **AI Gateway dropdown**.
   - Select **Google Gemma 4 (31B IT)** (or **Automatic — Recommended**).
   - Click **Generate Structured Pilot Proposal** on SentriShield AI.
   - Watch the proposal synthesize in real time.
   - Scroll to the top of the proposal workspace to show the **AI Gateway Execution Audit Badge**:
     ```
     AI Gateway Execution Audit
     Selected Model: Google Gemma 4 (31B IT)
     Actual Provider: Google Gemma (Cloud)
     Actual Model Identifier: gemma-4-31b-it
     Measured Latency: ~1,400ms
     Cascade Fallback: No (Direct Primary Execution)
     ```

2. **Demonstration B — High-Speed Cloud Inference (Groq Cloud)**:
   - In the top navigation, switch the AI model to **Groq Cloud (Instant LPU)**.
   - Click **Start New Project** ➔ pick another challenge (e.g. KYC Ingestion) ➔ click **Generate Proposal**.
   - Point out the sub-second speed (~400ms) and execution badge verifying Groq LPU execution.

3. **Demonstration C — Local-Only Edge Inference (Ollama / Air-Gap)**:
   - In the navigation bar, open the **AI Gateway dropdown**.
   - Toggle **Local-Only Mode (Zero Cloud)** ON.
   - Select **Local Ollama (Gemma 2:2B)**.
   - Explain to the jury: *"For defense, central banks, and hospitals with strict data residency, we completely cut off outbound cloud API calls. This proposal is generated 100% on the device's Apple Silicon GPU."*
   - Generate proposal: Notice the green badge `Local Edge Only (Air-Gap Safe)` in the execution audit card.

---

### Step 3: The Climax — Automatic Failover & Simulated Cloud Failure (60 Seconds)

This is the killer feature that wows judges who worry about venue Wi-Fi failures.

1. **Turn on Simulated Failure**:
   - In the AI Gateway dropdown, toggle **Simulate Cloud Failure (Demo Mode)** ON.
   - Explain to the judges: *"Venue Wi-Fi often drops during live demos. Let's simulate a sudden cloud outage."*
2. **Generate a Proposal**:
   - Click **Generate Proposal**.
3. **Show the Transparent Recovery**:
   - The application does not crash. It automatically catches the simulated cloud failure, cascades to the next provider, and recovers instantly.
   - Point to the amber **AI Execution Audit Card**:
     ```
     AI Gateway Execution Audit [Fallback Triggered]
     Selected Model: gemma-4-31b-it (Simulated Outage)
     Actual Provider Used: Verified Deterministic Backup
     Actual Model Identifier: deterministic-demo-engine
     Cascade Fallback Triggered: Yes (Auto Recovered)
     Failover Cascade Rationale: Simulated Cloud Failure ➔ Activated deterministic demo engine
     ```
   - Emphasize to the judges: *"We never lie to the user. We display the exact model that was requested, the fallback that recovered the session, and the verified latency."*

---

## 4. Answering Tough Technical Judge Questions

### Q1: "Why not just use LangChain or LiteLLM?"
> *"LiteLLM and LangChain add massive dependency bloat and often obscure JSON validation. Our Universal Gateway is a native, lightweight TypeScript architecture tailored specifically to ASEAN data residency constraints, with zero-dependency cryptographic caching, explicit local-only isolation, and strict Zod schema validation."*

### Q2: "Can you run this on an 8GB M1 Mac without crashing?"
> *"Yes. We specifically chose Google Gemma 2 (2B) and Qwen 2.5 Coder (3B) because they fit comfortably in ~1.8GB of RAM. We also enforce sequential execution and a 20-second deadline so models never load concurrently or trigger memory pressure."*

### Q3: "Does local Ollama make your app 100% air-gapped?"
> *"We are completely honest about this: local inference ensures the prompt and proposal generation never leave the machine. However, full air-gap compliance also requires isolating any external databases or cloud analytics. Our architecture explicitly labels this as 'Local Edge Inference', not an absolute air-gap."*

### Q4: "What happens if venue Wi-Fi completely dies?"
> *"Our Deterministic Fallback Engine requires zero network connectivity. It uses grounded rule-based synthesis bound strictly to the enterprise inputs and verified startup profile, guaranteeing a flawless presentation under any condition."*
