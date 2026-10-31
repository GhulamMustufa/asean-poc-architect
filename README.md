# ASEAN POC-Architect 🌏

**Connect Enterprise Challenges with Verified Southeast Asian Tech Startups & Generate Structured Proof-of-Concept Pilot Plans.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Turbopack](https://img.shields.io/badge/Turbopack-Enabled-orange)](https://turbo.build/)
[![Tests](https://img.shields.io/badge/Tests-28%2F28%20Passing-emerald)](./tests)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## 🌟 Overview

Corporate innovation teams and banks often take **4 to 9 months** to scope innovation pilots and evaluate startups. Most discussions stall because:
1. **Generic Matching:** Startups claim capabilities they don't actually support.
2. **Missing Compliance Checks:** Data sovereignty, regional regulations (e.g. Bank Negara Malaysia RMIT, Singapore PDPA), and VPC boundaries are neglected until late.
3. **Fluffy Proposals:** Chatbot-generated proposals lack milestones, KPIs, RACI matrices, and gate checks.

**ASEAN POC-Architect** solves this with a structured, explainable, and accountable end-to-end workflow:
- **Intake:** Capture real-world business challenges, budget bands, and compliance rules.
- **Accurate Matching:** 5-dimension deterministic scoring across capabilities, use-cases, technical safety, location, and integration protocols.
- **Audited Startups:** Directory of 32 ASEAN startups (including 18 verified real-world startups from Enterprise Singapore, Cradle Fund Malaysia, HUB.ID Komdigi, and live data.gov.sg ACRA checks).
- **Structured Pilot Plans:** Complete 60-day roadmaps, RACI matrix, measurable KPIs, risk mitigations, and human approval tracking.
- **Clean PDF Export:** Client-ready, paginated pilot documentation.

---

## 🚀 Key Features

### 1. Transparent 5-Dimension Matching
Every startup candidate is evaluated across 5 weighted dimensions:
- **Skills Match (30%):** Exact capability and keyword overlap.
- **Experience (20%):** Industry relevance and proven deployment records.
- **Safety & Tech (15%):** Data encryption, security certifications (ISO 27001, SOC 2, MAS TRM), and hosting architecture.
- **Location (15%):** Regional presence and strict local data residency.
- **Ease of Connection (15%):** Protocols supported (REST API, Webhooks, Kafka, SFTP, On-Premises).

### 2. Dual-Track Startup Ecosystem
- **🟢 Verified Real Startups:** Genuine companies with audited registrations, live government registry checks (data.gov.sg ACRA), and real case studies (e.g., SentriShield AI, CyberPulse, SmartPadi, SensorFlow).
- **🟣 Sample Practice Startups:** Benchmark controls clearly labeled for safe testing and demonstration.

### 3. Human-in-the-Loop Governance
- Proposals are tracked across 4 formal states: **Draft**, **Under Review**, **Approved**, and **Rejected**.
- Every proposal requires explicit human sign-off from authorized sponsors before proceeding.
- Automated email sending and self-executing agreements are strictly avoided to ensure legal compliance.

### 4. Full Edit History & Provenance Tracking
- Edit any proposal field while preserving the original AI-generated draft.
- Clear visual labels show where content originated: `🤖 Written by AI`, `✏️ Edited by Team`, `✅ Verified Startup Data`, or `🏢 Your Company Info`.
- Single-click **"Reset to AI Draft"** restores original suggestions at any time.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** Modern Vanilla CSS Design System with dark mode and sleek responsive layouts
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & `jspdf-autotable`
- **Testing:** Node.js native test runner with `tsx` (28 passing tests across 4 test suites)
- **Integrations:** data.gov.sg ACRA API for live entity verification

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, yarn, or bun

### 1. Clone the repository
```bash
git clone https://github.com/GhulamMustufa/asean-poc-architect.git
cd asean-poc-architect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Run tests
```bash
npm test
```
All 28 tests will execute, validating the deterministic matching engine, AI fallback orchestrator, and end-to-end QA flow.

### 5. Build for production
```bash
npm run build
npm run start
```

---

## 🧪 Test Suite Coverage

| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `matching-engine.test.ts` | 5-dimension deterministic scoring, weight shifting, evidence lineage | **Passing (9/9)** |
| `ai-orchestrator.test.ts` | Schema validation, retry backoff, fallback engine resilience | **Passing (5/5)** |
| `core-workflow.test.ts` | Human approval states, edit tracking, PDF generation, deduplication | **Passing (5/5)** |
| `end-to-end-audit.test.ts` | Full 10-step enterprise fraud detection benchmark audit | **Passing (9/9)** |

---

## 📄 License

MIT License. Designed and engineered for Hacktoberfest & ASEAN Enterprise Innovation.
