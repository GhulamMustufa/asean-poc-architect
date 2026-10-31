# REAL_DATA_SOURCE_AUDIT.md
## ASEAN POC-Architect — Real-World Data Source Audit & Ecosystem Investigation
**Auditor:** Senior AI Product Architect & Data Systems Auditor  
**Date:** October 31, 2026  
**Status:** Complete Technical Audit (Phase 1 & Phase 2)  
**Target Platform:** ASEAN POC-Architect

---

### Executive Summary & Integrity Stance
The primary vulnerability of enterprise AI discovery platforms is **hallucinatory credibility**: pairing real enterprise problems with invented companies, unverified technical claims, or fictional compliance certifications. In enterprise pilots (e.g., MAS-regulated banks, Petronas supply chains, or Singtel networks), presenting ungrounded data destroys executive trust immediately.

This audit evaluates genuine ASEAN data sources across four critical pillars:
1. **Regional Startup Directories & Portals** (Government & Intergovernmental)
2. **Authoritative Company Verification & Profile Sources** (Registries & Portfolios)
3. **Genuine Enterprise Business Challenges** (Open Innovation Programs)
4. **Official Grants, Regulatory Sandboxes & Public Procurement**

Every evaluated source has been assessed on whether it provides an open REST API, downloadable structured datasets, public web directories, or restricted partner access.

---

## 1. Existing Project Audit (Phase 1 Baseline)

| Component | Current State | Ground Truth / Audit Finding | Integrity Assessment |
| :--- | :--- | :--- | :--- |
| **Startup Records** | 14 Records in `src/data/startups.ts` | All 14 records are explicitly flagged with `isSyntheticDemo: true` and name suffix `(Synthetic Demo)`. | **COMPLIANT**: No fictional entity is falsely advertised as a real business. |
| **Enterprise Challenges** | Seed data in `sampleProposals.ts` | 2 challenges (Maybank transaction fraud, Indofood cold-chain). | **ACCEPTABLE**: Pre-seeded demo scenarios, but need grounding in real published open innovation challenges. |
| **Matching Engine** | `src/lib/matcher.ts` | Deterministic 5-dimension weighted scoring (30% capability, 25% industry, 15% tech, 15% market, 15% integration). | **SOLID FOUNDATION**: Deterministic and explainable; lacks source-traceability fields and "No Match" threshold logic for unverified data. |
| **AI Generation** | `src/lib/ai/orchestrator.ts` | Multi-stage prompt pipeline enforcing Zod schemas with fallback to `DeterministicFallbackAdapter`. | **CONTROLLED**: Uses structured output validation; needs strict grounding constraints preventing the LLM from hallucinating certifications. |
| **Active External APIs** | None | System operates 100% offline/in-memory with client-side localStorage persistence. | **ISOLATED**: Zero live data pipeline; high demo stability, but zero real-world market intelligence. |

---

## 2. ASEAN Startup Directories Audit (Category A)

### 2.1 Startup ASEAN (`startup-asean.org`)
* **Managing Entity:** Powered by Cradle Fund Sdn Bhd under Malaysia’s ASEAN Chairmanship, overseen by the Ministry of Science, Technology and Innovation (MOSTI).
* **Official URL:** [https://startup-asean.org/](https://startup-asean.org/)
* **Platform Purpose:** Regional central directory intended to unite founders, investors, and ecosystem enablers across all 10 ASEAN Member States (Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Vietnam).
* **API Availability:** **No public developer REST API.** The platform operates as a server-rendered / client-hydrated directory for human web browsing.
* **Open Dataset:** No downloadable public bulk dataset (CSV/JSON/Parquet).
* **Directory Accessibility:** Public directory interface with search and taxonomy filters (country, sector, funding stage).
* **Authentication Requirement:** Web directory search is publicly viewable; full investor/founder matchmaking and direct messaging require portal registration.
* **Usage & Licensing Restrictions:** Standard terms of service protect directory data from automated bulk harvesting. No CC-BY or Open Data license is published.
* **Official Website Discovery:** Profiles typically link to the founder's claimed corporate URL, but links are self-reported and not cryptographic verifications.
* **Auditor Recommendation:** **Manual / Curated Ingestion Only.** Querying individual records for validation is permissible; automated bulk scraping violates terms. Use for entity existence cross-referencing.

### 2.2 Malaysia: MYStartup (`mystartup.gov.my`)
* **Managing Entity:** Cradle Fund Sdn Bhd (under MOSTI).
* **Official URL:** [https://mystartup.gov.my/](https://mystartup.gov.my/)
* **Platform Purpose:** Malaysia’s national "Single Window" digital platform for tech startups, accelerators, investors, and government incentives.
* **API Availability:** **Restricted.** While MYStartup includes an "API Hub" section, it is a directory of ecosystem partner APIs and institutional integrations rather than a public open REST endpoint to dump the startup database.
* **Open Dataset:** General economic/open-data is centralized at [data.gov.my](https://data.gov.my), which features OpenAPI docs; however, private startup performance data (revenues, capitalization) is governed under Cradle's reporting frameworks.
* **Directory Accessibility:** Public searchable directory listing hundreds of Malaysian startups by industry vertical, stage, and location.
* **Authentication:** Search is publicly accessible; founder self-service and corporate partner portals require MyGov/MYStartup SSO login.
* **Usage Restrictions:** Republication of whole directory data is restricted; data citing is permitted under official press and ecosystem reporting guidelines.
* **Official Website Discovery:** High reliability for Malaysian startups; official links and social channels are validated during Cradle onboarding.
* **Auditor Recommendation:** **High-Value Verified Source.** Hand-curate 5–8 prominent Malaysian startups directly from MYStartup cohort lists (e.g., Aerodyne, Dropee, PolicyStreet) with exact source attribution.

### 2.3 Singapore: Startup SG & Enterprise Singapore (`startupsg.gov.sg`)
* **Managing Entity:** Enterprise Singapore (EnterpriseSG), statutory board under the Ministry of Trade and Industry (MTI).
* **Official URL:** [https://www.startupsg.gov.sg/](https://www.startupsg.gov.sg/)
* **Platform Purpose:** National showcase of Singapore-based tech startups, accredited incubators, Venture Capitalists, and government grant schemes (Startup SG Founder, Tech, Equity).
* **API Availability:** **No direct public Open REST API for the directory.** Data is served through internal backend JSON endpoints (e.g., `/api/v0/...`) tied to frontend sessions.
* **Open Data Alternative:** Singapore's central open data repository, [data.gov.sg](https://data.gov.sg), provides Datastore Search APIs (`https://api-production.data.gov.sg/v2/public/api/action/datastore_search`) for official ACRA business entity registrations (UEN, principal activities, registration date).
* **Directory Accessibility:** Free, public, searchable web portal.
* **Data Fields Available:** Startup Name, Description, Industry Vertical, Founders, Funding Stage, Grant Badges (e.g., "Startup SG Tech Grantee"), Official Website.
* **Licensing & Usage:** Singapore Government Copyright. Commercial bulk re-hosting prohibited without written permission; fair dealing for technical research and individual citation permitted.
* **Auditor Recommendation:** **Top Tier for Credibility.** Startups holding "Startup SG" accreditation or government grant badges have passed rigorous government audits. Hand-curate top Singaporean B2B startups (e.g., CyberSierra, Tookitaki, ShipsFocus).

### 2.4 Indonesia: HUB.ID & Komdigi (`hub.id` / `komdigi.go.id`)
* **Managing Entity:** Kementerian Komunikasi dan Digital (Kemkomdigi, formerly Kominfo), Republic of Indonesia.
* **Official URL:** [https://hub.id/](https://hub.id/) and [https://data.komdigi.go.id/](https://data.komdigi.go.id/)
* **Platform Purpose:** Flagship business matchmaking platform connecting Indonesian tech startups with domestic state-owned enterprises (BUMN), corporate partners, and regional VCs.
* **API Availability:** **No developer REST API.**
* **Open Datasets:** Macro ecosystem datasets on `data.komdigi.go.id` and `data.go.id`; individual startup pitch decks and traction metrics are published in annual cohort catalogs and Demo Day program booklets.
* **Directory Accessibility:** Program alumni directories (HUB.ID Accelerator, HUB.ID Summit) are published publicly on `hub.id`.
* **Authenticity:** Startups are vetted by Komdigi committees before cohort admission.
* **Auditor Recommendation:** **Verified Source for Indonesia.** Leverage published HUB.ID accelerator cohort catalogs (e.g., Logisly, Pitik, Feedloop) with links to their official corporate websites.

### 2.5 Thailand: Startup Thailand & National Innovation Agency (`startupthailand.org` / `nia.or.th`)
* **Managing Entity:** National Innovation Agency (NIA), Ministry of Higher Education, Science, Research and Innovation (MHESI).
* **Official URL:** [https://www.startupthailand.org/](https://www.startupthailand.org/) / [https://www.nia.or.th/](https://www.nia.or.th/)
* **Platform Purpose:** National portal for the Thai startup ecosystem, smart visa endorsement, and government innovation grants.
* **API Availability:** **No public developer API for startup querying.** Open government datasets are hosted at [data.go.th](https://data.go.th).
* **Directory Accessibility:** Public directory and annual "Startup Thailand Marketplace" directories.
* **Auditor Recommendation:** Curate prominent NIA-supported Thai enterprise tech startups (e.g., Sertis, Horganice, Evolt).

### 2.6 Vietnam: National Innovation Center (`nic.gov.vn`)
* **Managing Entity:** Ministry of Planning and Investment (MPI) of Vietnam.
* **Official URL:** [https://nic.gov.vn/](https://nic.gov.vn/)
* **Platform Purpose:** State-level innovation hub coordinating national technological transformation, innovation centers, and the Vietnam Innovation Challenge.
* **API Availability:** **No public developer REST API.**
* **Directory Accessibility:** Press announcements, innovation challenge winners, and annual Vietnam Innovation & Tech Investment Reports (co-published with Do Ventures).
* **Auditor Recommendation:** Select verified B2B startups recognized in the Vietnam Innovation Challenge (e.g., VNPT AI, Base.vn, Dat Bike).

### 2.7 Philippines: Startup Philippines (`startup.gov.ph`)
* **Managing Entity:** Joint initiative under the Innovative Startup Act (RA 11337) by DTI, DOST, and DICT.
* **Official URL:** [https://startup.gov.ph/](https://startup.gov.ph/)
* **Ecosystem Databases:** Community-driven repositories like [startupdatabase.ph](https://startupdatabase.ph) and QBO Innovation Hub portfolios.
* **API Availability:** National eGov portal (`e.gov.ph`) offers citizen services APIs, but no public developer API exists for the startup registry.
* **Auditor Recommendation:** Select established B2B startups backed by DOST/DTI grants or QBO cohorts (e.g., NextPay, Packworks, Sprout Solutions).

---

## 3. Real Enterprise Business Challenges (Category C)

A core requirement is eliminating fictional challenge prompts like "Fictional Bank wants AI." Genuine corporate and municipal innovation challenges exist publicly in ASEAN:

| Challenge Platform / Program | Sponsor / Problem Owners | Type of Real Challenge Data Available | Official Portal URL | API Status |
| :--- | :--- | :--- | :--- | :--- |
| **IMDA Open Innovation Platform (OIP)** | PSA Singapore, Changi Airport Group, SMRT, Singtel, CapitaLand, DBS | Exact enterprise problem statements, operational constraints, integration parameters, prize/pilot funding ($20k–$100k SGD). | [https://www.openinnovation.sg/](https://www.openinnovation.sg/) | Public Web Portal; No open REST API (Auth required for proposal submission). |
| **Enterprise Singapore Sustainability Open Innovation Challenge (SOIC)** | Sembcorp, Schneider Electric, L'Oréal, Panasonic, ST Logistics | Decarbonization, Scope 3 supply chain monitoring, sustainable packaging, industrial energy efficiency. | [https://www.startupsg.gov.sg/programmes/soic](https://www.startupsg.gov.sg/programmes/soic) | Published challenge briefs (PDF / Web); No API. |
| **Petronas FutureTech Accelerator (Malaysia)** | Petronas Ventures, Tata Consultancy Services, Tenaga Nasional | Industrial IoT, automated pipeline acoustic monitoring, low-carbon industrial logistics, energy transition. | [https://www.petronas.com/ventures/futuretech](https://www.petronas.com/ventures/futuretech) | Public program announcements and published thematic tracks. |
| **Sunway iLabs Innovation Challenges (Malaysia)** | Sunway Group (Healthcare, Retail, Property, Education) | Hospital appointment queue reduction, retail customer footfall analytics, smart building HVAC energy optimization. | [https://ilabs.sunway.edu.my/](https://ilabs.sunway.edu.my/) | Published corporate challenge briefs. |
| **JTC Open Innovation Calls (Singapore)** | JTC Corporation (Industrial infrastructure statutory board) | Robotics for facade inspection, smart estates IoT, predictive maintenance of district cooling systems. | [https://www.jtc.gov.sg/](https://www.jtc.gov.sg/) | Public tender / challenge specifications. |

---

## 4. Legitimate Startup & Company Information Sources (Category B)

To guarantee that startup capabilities are not fabricated, data must be sourced strictly from verifiable primary and secondary artifacts:

1. **Official Corporate Websites & Technical Documentation:**
   * Products page, API documentation, developer portals (e.g., `docs.company.com`), published security disclosures, terms of service.
   * *Evidence extracted:* Exact API protocols (REST, Webhooks, gRPC), database compatibility, ISO/SOC certifications claimed in trust centers.
2. **Authoritative Government Registries (Entity Existence Verification):**
   * **Singapore ACRA:** Accounting and Corporate Regulatory Authority via [data.gov.sg](https://data.gov.sg). Provides Unique Entity Number (UEN), incorporation date, and standard SSIC industry code.
   * **Malaysia SSM:** Suruhanjaya Syarikat Malaysia (Companies Commission of Malaysia).
3. **Premier Accelerator & Investor Portfolios:**
   * **Y Combinator Directory:** [https://www.ycombinator.com/companies](https://www.ycombinator.com/companies) (Filter by Southeast Asia). Contains verified batch, company website, founder bios, and standardized product summaries.
   * **500 Global Southeast Asia Portfolio:** [https://500.co/](https://500.co/)
   * **Antler Global / SEA Portfolio:** [https://www.antler.co/portfolio](https://www.antler.co/portfolio)
   * **Peak XV (Surge) Portfolio:** [https://www.surgeahead.com/](https://www.surgeahead.com/)
4. **Public Code & Engineering Artifacts:**
   * **GitHub Organization Profiles:** Open-source SDKs, public repos, language/framework metrics, last active commit date (verifies real engineering activity).

---

## 5. Funding, Grants & Regulatory Ecosystem Sources (Category D)

Enterprise POCs in ASEAN frequently depend on co-funding grants and regulatory sandboxes:

| Program / Resource | Governing Authority | Nature of Support | Verification Link |
| :--- | :--- | :--- | :--- |
| **Startup SG Tech Grant** | Enterprise Singapore | POC and POV cash grants up to S$250,000 / S$500,000 for deep-tech IP commercialization. | [EnterpriseSG Startup SG](https://www.startupsg.gov.sg/) |
| **Cradle CIP Spark / CIP Sprint** | Cradle Fund (Malaysia) | Seed grants up to RM150,000 (Spark) and commercialization grants up to RM800,000 (Sprint). | [Cradle Fund Portal](https://cradle.com.my/) |
| **MAS FinTech Regulatory Sandbox** | Monetary Authority of Singapore | Safe harbor experimentation for innovative financial services in Singapore. | [MAS Sandbox Guidelines](https://www.mas.gov.sg/) |
| **BNM Financial Technology Regulatory Sandbox** | Bank Negara Malaysia | Regulatory flexibility for deploying FinTech pilots in Malaysian financial institutions. | [BNM Sandbox](https://www.bnm.gov.my/) |
| **BOI Thailand Tech Startup Incentives** | Thailand Board of Investment | Corporate income tax exemptions and smart visa facilitation for target tech sectors. | [BOI Thailand](https://www.boi.go.th/) |

---

## 6. Comprehensive Source Comparison Table

| Source Name | Jurisdiction | Data Available | API / MCP Availability | Cost | Terms & Licensing | Data Reliability | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Startup ASEAN** | Regional (10 States) | Directory of startups, investors, ecosystem partners. | **No Public API** (Web only). | Free to browse. | Republication restricted. Automated scraping prohibited. | Medium-High (Ministry-backed). | **Secondary Verification**: Use for confirming regional presence. |
| **MYStartup** | Malaysia | Startups, investors, funding programs, accelerator alumni. | **No Open REST API** (Closed API Hub). | Free. | Platform terms restrict automated bulk harvesting. | High (Cradle vetted). | **Primary Seed Source for MY**: Hand-curate verified cohort alumni. |
| **Startup SG** | Singapore | Accredited startups, incubators, government grant recipients. | **No Public API** (Internal JSON only). | Free. | Gov Copyright. Fair dealing for individual reference. | Very High (EnterpriseSG audited). | **Primary Seed Source for SG**: Curate certified grantees. |
| **data.gov.sg** | Singapore | ACRA company registrations, UENs, SSIC industry codes. | **Official Open REST API** (Datastore Search). | Free (Open Gov). | Singapore Open Data License (Permits reuse with attribution). | Absolute (Official Government Register). | **Automated UEN/Legal Entity Validation**: Connect via REST API. |
| **IMDA Open Innovation Platform** | Singapore | Live & past enterprise business challenges, KPIs, pilot budgets. | **No Public API** (Web portal briefs). | Free to view public calls. | Proprietary challenge briefs; IP remains with problem owners. | Very High (Real Fortune 500 / Gov sponsors). | **Primary Source for Real Challenges**: Transcribe genuine problem statements. |
| **HUB.ID / Komdigi** | Indonesia | Indonesian tech startups, BUMN pilot cohorts, demo days. | **No Public API** (Cohort catalogs). | Free. | Government informational publications. | High (Komdigi vetted). | **Primary Seed Source for ID**: Curate HUB.ID accelerator alumni. |
| **Startup Thailand / NIA** | Thailand | Directory of Thai tech companies and innovation grant holders. | **No Public API** (Portal only). | Free. | Information portal terms. | High (NIA vetted). | **Primary Seed Source for TH**: Curate NIA innovation grant winners. |
| **Startup Philippines** | Philippines | Startups under Innovative Startup Act, incubator cohorts. | **No Public API** (Portal only). | Free. | Government portal terms. | High (DTI/DOST vetted). | **Primary Seed Source for PH**: Curate DTI/QBO alumni. |
| **Y Combinator Directory** | Global / ASEAN | Filterable Southeast Asia startups, batch, site, description. | **No Official REST API** (Algolia search backend). | Free to browse. | Personal/educational use; bulk scrapers blocked. | High (Strict due diligence). | **Secondary Cross-Reference**: High-traction regional founders. |
| **GitHub REST API** | Global / Tech | Public repositories, commit recency, languages, open-source SDKs. | **Official REST API & GitHub MCP Server**. | Free (60 req/hr unauth; 5,000 req/hr with token). | GitHub Terms of Service. Permitted developer integration. | Very High (Raw code evidence). | **Automated Tech Stack Verification**: Verify open SDKs via GitHub API/MCP. |

---

## 7. Conclusions & Strategic Finding
1. **The "Open Startup API" Myth:** No ASEAN government or intergovernmental body maintains a public, unauthenticated, self-serve REST API that exposes detailed commercial startup capabilities and technical architectures. Official platforms (`startup-asean.org`, `mystartup.gov.my`, `startupsg.gov.sg`) are designed as human networking and discovery portals.
2. **Where Official APIs Do Exist:** Official APIs exist at the **entity registration level** (e.g., Singapore's `data.gov.sg` ACRA Datastore API) and the **engineering artifact level** (e.g., GitHub REST API).
3. **The Credible Architecture:** The only defensible enterprise path is a **Hybrid Curated & Verified Architecture**:
   * Pre-curate genuine, legally registered ASEAN startups from official government programs.
   * Provide direct source URLs, government program badges, and verified corporate websites.
   * Use live APIs where available (ACRA on `data.gov.sg` for legal entity status; GitHub API for technical code verification).
   * Formally tag any fallback test records as `SYNTHETIC` so enterprise auditors can immediately distinguish verified market data from demo placeholders.
