# API_AND_MCP_FEASIBILITY.md
## ASEAN POC-Architect — API, MCP & Data Integration Feasibility Study
**Author:** Senior API Integration Specialist & Data Systems Architect  
**Date:** October 31, 2026  
**Status:** Approved Feasibility Assessment (Phase 3)  
**Target Platform:** ASEAN POC-Architect

---

### Executive Summary
A core failure mode of hackathon prototypes is making unrealistic architectural claims—such as assuming that national startup directories possess public, open-ended developer APIs or that AI agent "Model Context Protocol (MCP)" servers can magically bypass authentication and terms of service. 

This document evaluates the concrete feasibility of integrating real-world APIs, existing MCP servers, government open datasets, and structured feeds into **ASEAN POC-Architect**. It clearly separates confirmed technical reality from wishful thinking.

---

## 1. Evaluation Matrix of Integration Candidates

| Candidate Source | Integration Mechanism | Official API? | MCP Server Available? | Cost Tier | Auth / Key Required | Rate Limits | Commercial & Caching Rights | Data Format | Attribution Reliability | Feasibility Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Singapore Data.gov.sg (ACRA Dataset)** | HTTP REST / CKAN Datastore API | **Yes** (Official V2 API) | Feasible via generic REST MCP | **Free** (Government Open Data) | None for basic public endpoints | Standard gov rate limits (~100 req/min) | Permitted under Singapore Open Data License; caching permitted | Structured JSON | 100% (Statutory Authority) | **FEASIBLE & RECOMMENDED** |
| **GitHub REST API & GitHub MCP** | GitHub REST API v3 / Official GitHub MCP | **Yes** (Official) | **Yes** (Registered in environment) | **Free** (Personal Access Token) | Optional (60 req/hr unauth; 5,000 req/hr with PAT) | 5,000 req/hr authenticated | Permitted under GitHub Developer Terms; caching permitted | Structured JSON | 100% (Commit / Repo metadata) | **FEASIBLE & RECOMMENDED** |
| **Startup ASEAN (`startup-asean.org`)** | Web Portal (No Developer API) | **No** | **No** | Free (Web viewing) | Account login for portal features | Web session limits | Terms prohibit automated scraping and data republishing | HTML Pages | High (Cradle/MOSTI) | **NOT FEASIBLE VIA API** (Curated static seed only) |
| **MYStartup Malaysia (`mystartup.gov.my`)** | Web Portal / Closed Partner API Hub | **No Public API** | **No** | Free (Web viewing) | Restricted partner credentials | Partner-specific | Republication restricted; fair-dealing citation allowed | HTML Pages | High (Cradle Fund) | **NOT FEASIBLE VIA API** (Curated static seed only) |
| **Startup SG (`startupsg.gov.sg`)** | Web Portal / Internal JSON | **No Public API** | **No** | Free (Web viewing) | No public API keys issued | Cloudflare protection / WAF | Government copyright; bulk redistribution prohibited | Dynamic HTML | Very High (EnterpriseSG) | **NOT FEASIBLE VIA API** (Curated static seed only) |
| **IMDA Open Innovation Platform (`openinnovation.sg`)** | Web Portal / PDF Briefs | **No Public API** | **No** | Free (Web viewing) | Portal user login for challenge briefs | N/A | Problem owner proprietary IP | HTML & PDF Briefs | Very High (IMDA / Corporate) | **NOT FEASIBLE VIA API** (Curated manual challenge seed) |
| **Commercial Startup APIs (Crunchbase / Tracxn)** | Proprietary REST API | **Yes** | 3rd party community wrappers | **Paid** ($49/mo - $10,000+/yr) | Proprietary API Key | Strict quota tiers | Commercial license required; strict anti-caching clauses | Structured JSON | High | **IMPRACTICAL FOR HACKATHON** (Cost/licensing barrier) |
| **Google Search API / Brave Search API** | Web Search REST API | **Yes** | Compatible with web search MCP | Paid / Freemium (Free tier ~100-2,000 calls/mo) | API Key Required | Per-second / Per-day quotas | Permitted for real-time snippets | JSON Search Results | Variable | **FEASIBLE AS LIVE ENRICHMENT** |

---

## 2. In-Depth Technical Analysis of Promising Candidates

### 2.1 Singapore Data.gov.sg (ACRA Corporate Entities API)
* **API Documentation:** `https://data.gov.sg/` and `https://api-production.data.gov.sg/`
* **Available Endpoint:**
  ```http
  GET https://api-production.data.gov.sg/v2/public/api/action/datastore_search?resource_id=d_688b934f82c1059ed0a6993d2a829089&q=CYBERSIERRA
  ```
* **Data Returned:**
  * `uen`: Unique Entity Number (Singapore registered business ID)
  * `entity_name`: Official legal entity name
  * `entity_status_description`: e.g., "LIVE COMPANY"
  * `primary_ssic_code` & `primary_ssic_description`: Official Singapore Standard Industrial Classification (e.g., "62011 - Software and programming activities")
  * `registration_incorporation_date`: Legal founding date
* **Commercial Terms & Rights:** Singapore Open Data License allows commercial exploitation, modification, and integration provided attribution is displayed: *"Contains information from ACRA accessed on [date] from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0"*.
* **Implementation Role:** Real-time or build-time verification badge: confirming whether a Singaporean startup is an active, legally incorporated business entity.

### 2.2 GitHub REST API & GitHub MCP Server
* **Current Environment Status:** The `github` MCP server is registered in the Antigravity IDE environment (`create_or_update_file`, `get_file_contents`, `list_commits`, etc.). In addition, standard GitHub REST v3 is callable via node/fetch.
* **Available Endpoint:**
  ```http
  GET https://api.github.com/orgs/{org_name}/repos
  GET https://api.github.com/repos/{org_name}/{repo_name}/languages
  ```
* **Technical Evidence Provided:**
  * Primary programming languages (e.g., Python 74%, Go 26%)
  * Last commit date (verifies active software engineering vs. abandoned entity)
  * Open source SDKs or API client libraries (e.g., official Python client, Helm charts)
  * License type (e.g., Apache 2.0, MIT)
* **Rate Limits:** 60 requests/hour unauthenticated; 5,000 requests/hour with standard developer Personal Access Token (`GITHUB_TOKEN`).
* **Implementation Role:** Grounded technical capability evidence. When matching on "Apache Kafka" or "Python SDK", the system can cite the startup's verified public GitHub repository.

### 2.3 Government Open Data Portals: Malaysia (`data.gov.my`)
* **API Documentation:** `https://data.gov.my/docs`
* **Architecture:** Modern OpenAPI-compliant portal maintained by the Malaysian Ministry of Economy and Department of Statistics Malaysia (DOSM).
* **Data Nature:** Broad economic indices, district-level demographics, and public spending datasets.
* **Limitation:** Does not host an unredacted registry of all private technology startup balance sheets or capabilities. Useful for macroeconomic contextual indicators (e.g., digital trade volume, state technology employment).

---

## 3. Model Context Protocol (MCP) Server Reality Check

The project environment has several MCP servers registered:
* `github`: Lazy-loaded, provides repository inspection, code search, and file manipulation.
* `Neon`: Lazy-loaded PostgreSQL cloud management.
* `StitchMCP`: Lazy-loaded UI design/screen generation.
* `UpworkMCP`: Lazy-loaded freelance platform integration.
* `reddit`: Lazy-loaded community research integration.

### What MCP Can Do in ASEAN POC-Architect:
1. **GitHub MCP:** Can be used in an automated background pipeline to inspect a startup's public codebase, extract supported API protocols from OpenAPI specs in their public repos, and verify commit activity without scraping.
2. **Neon MCP:** Can be used to provision a dedicated serverless PostgreSQL database to house verified ASEAN startup profiles, relational provenance tables, and audit logs.

### What MCP CANNOT Do (Critical Auditor Warning):
1. **MCP cannot bypass website paywalls or anti-bot protections.** An MCP server cannot connect to `mystartup.gov.my` or `startupsg.gov.sg` if the underlying platform has no API.
2. **MCP cannot legally license proprietary data.** Siphoning data through an automated browser subagent or unapproved MCP scraper violates platform Terms of Service and intellectual property protections.
3. **MCP is not an API directory.** MCP is an open protocol for AI assistants to talk to tools and data servers; it requires an active backend server implementing the MCP specification.

---

## 4. Alternative Legitimate Data Channels

### 4.1 Government & Ecosystem RSS Feeds
* **Enterprise Singapore News & Tenders RSS:** Many government procurement and innovation calls publish RSS/Atom feeds for public tender notifications (e.g., GeBIZ Singapore, MyProcurement Malaysia).
* **Use Case:** Automatically monitoring new public sector innovation challenges.

### 4.2 Public Downloadable Government CSV / JSON Datasets
* **Data.gov.sg:** Provides complete downloadable CSV snapshots of registered entities, accredited training organizations, and research grants.
* **Data.gov.my:** Provides direct API queries and bulk parquet/CSV downloads for Malaysian national indicators.
* **Use Case:** Seed an authoritative reference table of registered entities to check whether startup legal names exist in national registers.

### 4.3 Permitted Website Curation vs. Prohibited Scraping
* **Permitted:** Visiting a startup's public `about.html`, `security.html`, or `pricing.html` where permitted by `robots.txt` to verify whether they hold an ISO 27001 certificate or offer a REST API.
* **Prohibited:** Writing a headless browser script to scrape the entirety of `startup-asean.org`, `startupsg.gov.sg`, or `crunchbase.com`, which explicitly prohibit unauthorized automated scraping in their terms of service.

---

## 5. Strategic Integration Recommendation

For the hackathon and enterprise pilot MVP, we recommend a **Tri-Source Hybrid Architecture**:

```
[ Tier 1: Verified Base ]
Curated High-Integrity Local Dataset (15-20 Real Startups)
Sourced from: Cradle MYStartup Cohorts, EnterpriseSG Grantees, HUB.ID Catalogs, YC SEA
   ↓ (Contains verified URLs, Program Badges, Source URLs)

[ Tier 2: Live Government Legal Verification ]
data.gov.sg ACRA Datastore API (Live REST)
   ↓ (Confirms UEN, Legal Entity Status, Incorporation Year, Official SSIC)

[ Tier 3: Live Engineering Capability Verification ]
GitHub REST API / MCP (Live Code Inspection)
   ↓ (Confirms real public repos, open SDKs, active programming languages)

[ Tier 4: Real Enterprise Challenge Source ]
IMDA Open Innovation Platform (OIP) & SOIC
   ↓ (Real Fortune 500 / Government problem owner statements transcribed with citation)
```

This architecture is 100% compliant with legal terms, costs $0 in commercial API licenses, does not depend on brittle scrapers, and can be tested live in under 500ms using local caching.
