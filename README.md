<div align="center">

# Nna-Than-Kuzhik

### **AI-Powered 4D Municipal Infrastructure Orchestration & Spatial De-Confliction Platform**

*Plan once. Coordinate before digging. Build smarter cities.*

<br/>

<p align="center">
  <a href="https://digonce-fn9g.onrender.com/api/health">
    <img src="https://img.shields.io/badge/Live%20API-Operational-success?style=for-the-badge&logo=render&logoColor=white" alt="Live API" />
  </a>
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React and Vite" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%7C%20PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostGIS" />
  <img src="https://img.shields.io/badge/AI-GPT--4o--mini-7C3AED?style=for-the-badge" alt="AI document intelligence" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Domain-Civic%20Tech-blue?style=flat-square" alt="Civic tech" />
  <img src="https://img.shields.io/badge/Focus-Smart%20Infrastructure-green?style=flat-square" alt="Smart infrastructure" />
  <img src="https://img.shields.io/badge/Hackathon-AIBoomi%20Startup%20Weekend-blueviolet?style=flat-square" alt="AIBoomi Startup Weekend" />
  <img src="https://img.shields.io/badge/Status-MVP%20Ready-success?style=flat-square" alt="Status" />
</p>

[Live API Health](https://digonce-fn9g.onrender.com/api/health) • [Active Corridors](https://digonce-fn9g.onrender.com/api/corridors) • [Evaluated Clashes](https://digonce-fn9g.onrender.com/api/clashes)

</div>

---

## Problem Statement

City roads are frequently resurfaced by public works authorities, only to be excavated weeks later by water, power, or telecommunications agencies. This lack of inter-agency synchronization voids road warranties, wastes millions in public taxpayer funds, and causes severe traffic gridlock.

---

## Users & Context

* **Municipal Commissioners & Urban Planners:** Overseeing civic capital budgets, road-cutting permits, and enforcing municipal de-confliction policies.
* **Utility Agency Engineers (PWD, KWA, KSEB, Telecom):** Uploading tender notices, identifying planned works by other agencies, and scheduling synchronized excavation windows.
* **Citizens & Commuters:** Benefiting from reduced traffic bottlenecks, preserved road surfaces, and minimized civic disruption.

---

## Solution Overview

**Nna-Than-Kuzhik** is an enterprise-grade 4D spatio-temporal infrastructure orchestration platform that ingests unstructured municipal tender PDFs, projects planned works onto routable road graphs, identifies subsurface overlaps before work orders are executed, and automatically reschedules projects into unified joint digging windows.

The platform is designed around three core operational pillars:
1. **Automated NLP Ingestion:** Extraction of tender boundaries, chainages, subsurface depths, and execution schedules from unstructured PDFs.
2. **PostGIS 4D Spatial De-confliction:** Automated 8-meter corridor polygon buffering and intersection queries across routable road graphs (OSMnx/NetworkX) to flag temporal and warranty clashes.
3. **Autonomous Cost Avoidance & Synchronization:** Enforcing statutory 36-month Defect Liability Period (DLP) guardrails and sequencing works by physical depth hierarchy (deep utilities first, surface wearing course second).

### System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React + Vite UI                      │
│               Dashboard / Project Map                  │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API
┌──────────────────────────▼─────────────────────────────┐
│                   FastAPI Backend                      │
│                                                        │
│  • PDF Text Extraction       • Structured Data Parsing │
│  • AI Classification         • Conflict Analysis       │
│  • OSMnx Road Routing        • Cost & Schedule Logic   │
└──────────────────────────┬─────────────────────────────┘
                           │ SQL / PostGIS
┌──────────────────────────▼─────────────────────────────┐
│                 PostgreSQL + PostGIS                   │
│                                                        │
│  • Project Records           • Spatial Buffers (8m)    │
│  • Spatial Geometries        • Spatial GIST Indexes    │
│  • Intersection Queries      • Defect Liability Audit  │
└────────────────────────────────────────────────────────┘

Supporting frameworks: OpenAI API (GPT-4o-mini), pdfplumber, OSMnx, NetworkX
```

---

## Setup & Run

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm
* PostgreSQL 15+ with PostGIS extension enabled (or Supabase)
* OpenAI API Key
* SerpAPI Key (optional fallback for non-gazetteer landmark resolution)

### 1. Clone the Repository
```bash
git clone https://github.com/anannyasunny79-maker/nna-than-kuzhik.git
cd nna-than-kuzhik
```

### 2. Backend Setup (`/backend`)
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` inside `backend/`:
```env
DATABASE_URL=postgresql://user:password@host:5432/postgres
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_api_key
```

Run the backend server:
```bash
uvicorn main:app --reload --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

### 3. Frontend Setup (`/frontend`)
```bash
cd ../frontend
npm install
npm run dev
```
Access the application dashboard at `http://localhost:5173`.

---

## Models & Data

* **Document Intelligence Model:** OpenAI GPT-4o-mini structured entity extraction pipeline parsing unstructured PDF tender notices with strict Pydantic schemas.
* **Spatial Road Graph:** Routable road network for Kochi generated via OSMnx and NetworkX, serialized as GraphML (`kochi_drive.graphml`).
* **Spatial Database:** PostgreSQL 15 with PostGIS spatial extension utilizing GIST spatial indexing (`USING GIST(geom_buffer)`).
* **Data Sources & Licenses:**
  * OpenStreetMap contributors (ODbL) for street network graph data.
  * Public municipal tender sample notices (open government notices).
  * Kerala PWD Schedule of Rates (KPWD SoR) for standard asphalt restoration metrics.

---

## Evaluation & Guardrails

* **Hallucination Mitigation:** Strict Pydantic schema validation forces the extraction model to cite exact textual evidence quotes from the source document. Extractions failing validation or confidence thresholds are flagged for human triage.
* **Non-Civil Procurement Filtering:** Automated binary classification filters out non-civil procurement (e.g., equipment leases, office supplies) to prevent false-positive excavation triggers.
* **Deterministic Spatial Geometry:** Spatial calculations are executed deterministically in PostGIS (using `ST_Intersects`, `ST_Buffer`, and `ST_Length`) rather than relying on LLMs for geometric calculations.
* **Connection Security:** Uses Supabase connection pooling with strict environment variable management to prevent credential exposure.

---

## Known Limitations & Risks

* **Image-Only Scans:** Scanned or low-resolution image-based PDFs without digital text layers require an OCR preprocessing stage prior to text parsing.
* **Landmark Ambiguity:** Unindexed colloquial junction names require geocoding confirmation or human verification.
* **External API Latencies:** Geocoding fallback services are subject to third-party rate quotas; mitigated by an internal high-speed local gazetteer.
* **Engineering Feasibility:** The system flags potential spatial clashes; final joint utility trench construction feasibility remains subject to site-level engineering clearance.

---

## Team

**Team Nfinits** (Built for AIBoomi Startup Weekend):

| Name | Role | Responsibilities | Contact |
| :--- | :--- | :--- | :--- |
| **Sreehari K** | Full-Stack Architecture & Backend Lead | Spatial GIS Engine, PostGIS Integration, OSMnx Graph Routing, API Services | Phone: `+91 8075342892`<br>Email: `ksreehari84m@gmail.com` |
| **Anannya Sunny** | UI/UX & Frontend Integration Lead | Product Design, Map Viewer, Frontend State Management, NLP Pipeline | Phone: `+91 9496209573`<br>Email: `anannyasunny79@gmail.com` |

---

## Product Demo

* **Live API Backend:** [https://digonce-fn9g.onrender.com/api/health](https://digonce-fn9g.onrender.com/api/health)
* **Corridor Endpoint:** [https://digonce-fn9g.onrender.com/api/corridors](https://digonce-fn9g.onrender.com/api/corridors)
* **Clashes Endpoint:** [https://digonce-fn9g.onrender.com/api/clashes](https://digonce-fn9g.onrender.com/api/clashes)

### Feature Roadmap

- [x] Automated civil tender classification and structured data extraction
- [x] Text citation extraction and confidence indicators
- [x] Local road network gazetteer and OSMnx graph routing
- [x] PostGIS corridor buffering and spatial intersection analysis
- [x] Schedule of Rates cost quantification model
- [ ] Visual project synchronization calendar and Gantt viewer
- [ ] Automated inter-agency joint coordination proposal exports
- [ ] Versioned audit logs with municipal commissioner sign-off tracking
- [ ] Multi-city graph ingestion across Indian urban centers

---

## Submission & Demo Links

* **Repository:** [https://github.com/anannyasunny79-maker/digonce](https://github.com/anannyasunny79-maker/digonce)
* **Live Demo App:** `http://localhost:5173` (Local Prototype) / Cloud Demo
* **Product Demo Video:** [Watch Prototype Demo](https://github.com/anannyasunny79-maker/digonce)
* **Team:** **Nfinits** (AIBoomi Startup Weekend)

---

## Pitch Deck (6 Slides)

### Slide 1: Problem & Who's Affected
* **The Urban Dilemma:** In Indian Tier-1/Tier-2 cities (e.g., Kochi), the Public Works Department (PWD) completes a road resurfacing project, only for the Water Authority (KWA) or Electricity Board (KSEB) to trench through the freshly laid asphalt weeks later.
* **Who is Affected:**
  * **Municipal Authorities:** Bleeding crores in avoidable restoration costs and pavement warranty claims.
  * **Citizens & Commuters:** Trapped in repeated gridlocks, hazardous potholes, and construction dust.
  * **Utility Contractors:** Facing inter-agency delays, permit freezes, and public litigation.

### Slide 2: The Insight (Why Now & Why Us)
* **Why Now:** 
  1. Municipalities are moving toward digital e-tender portals, generating massive unstructured document streams.
  2. Foundation models now enable reliable structured extraction with verifiable evidence citations.
  3. GIS tooling (OSMnx/PostGIS) allows real-time street centerline graph alignment without expensive surveyor overhead.
* **Our Edge:** Deep civil engineering domain modeling: combining 4D spatio-temporal corridor buffering, Kerala PWD Schedule of Rates economic quantification, and Depth-Hierarchy Resequencing.

### Slide 3: Solution Demo (Screens & Core Flow)
1. **Document Ingestion:** Drag-and-drop raw tender PDF or paste tender notice text.
2. **AI Gatekeeper & Entity Extractor:** Classifies civil vs non-civil work; extracts corridor bounds, depth, and dates with evidence quote spans.
3. **High-Fidelity GIS Alignment:** Snaps landmark junctions to OpenStreetMap road graph centerlines with 8m safety buffers.
4. **4D Spatio-Temporal Collision Engine:** Detects overlapping excavation footprints and statutory Defect Liability Period (DLP) violations.
5. **Restoration Cost Modeling:** Quantifies exact avoidable reconstruction loss (e.g., ₹38,40,000 on MG Road).
6. **One-Click Resequence & Syndicate:** Re-orders schedules by depth hierarchy (subsurface utilities first, surface pavement second) and shifts corridor status to *Synchronized* (Electric Blue) with a cryptographic Mayor sign-off audit hash.

### Slide 4: Technical Approach (Models, Data & Architecture)
* **Document Intelligence:** OpenAI GPT-4o-mini with Pydantic JSON schemas, constrained classification, and span-level evidence attribution.
* **Spatial GIS Engine:** OSMnx road graph routing (Dijkstra shortest path along drivable street centerlines), Shapely geometry, and PostGIS spatial intersections.
* **Persistence & Resilience:** PostgreSQL/PostGIS (Supabase/Docker) with spatial GIST indexes and an automatic, zero-downtime in-memory fallback layer.
* **Frontend:** React + Vite + Tailwind CSS + Leaflet with real-time timeline filtering and visual corridor inspection.

### Slide 5: Value & Go-to-Market (Who Pays & Adoption)
* **Value Delivered:** 100% savings on avoidable pavement destruction (averaging ₹25–40 Lakhs saved per overlapping kilometer).
* **Who Pays:**
  * **B2G (Direct Government):** Smart City Integrated Command and Control Centers (ICCC), Urban Local Bodies (Corporations/Municipalities), and State PWDs under municipal IT modernization grants.
  * **B2B Infrastructure Providers:** City Gas Distribution (CGD) and Telecom companies seeking streamlined Right-of-Way (RoW) approvals.
* **GTM Strategy:** Grassroots pilot with Kochi Municipal Corporation & Kerala PWD Roads Division; land-and-expand to statewide K-DISC and national Gati Shakti city grids.

### Slide 6: Next Steps (Roadmap & Risk Mitigation)
* **Roadmap:**
  * **Q1 2027:** Multi-city graph expansion (Bengaluru, Chennai, Thiruvananthapuram).
  * **Q2 2027:** Integration with state e-procurement (GeM / Kerala e-GP) webhooks for real-time tender intake.
  * **Q3 2027:** Mobile app for on-site municipal road inspectors with GPS geotagging.
* **Risks & Mitigation:**
  * *Missing Landmark Coordinates:* Hybrid Local Gazetteer + geocoding fallback.
  * *Scanned PDFs:* OCR ingestion layer.
  * *Inter-agency Politics:* Verifiable audit trails that guarantee shared credit and zero pavement warranty voiding.

---

## AI Impact Statement

**Dig-Once** utilizes OpenAI GPT-4o-mini for specialized municipal infrastructure intelligence. The AI pipeline performs two tasks: (1) a statutory gatekeeper classification to filter non-civil procurement (supplies, leases) from the municipal Right-of-Way grid, and (2) structured extraction of civil engineering parameters (corridors, boundary junctions, subsurface depths, and execution schedules).

**Data Provenance & Licenses:** Models are prompted strictly against publicly published municipal e-tender notices under open government data mandates. Street graph topologies derive from OpenStreetMap (ODbL licensed). Rates adhere to the Kerala PWD Schedule of Rates.

**Hallucination & Bias Mitigations:** The system enforces strict Pydantic schemas, temperature=0.0 deterministic parsing, and mandatory text span attribution—every extracted date, junction, and depth must cite the exact quote from the source tender. Low-confidence extractions are flagged for human-in-the-loop engineering verification.

**Expected Outcomes:** Prevents crores of rupees in repetitive pavement destruction, reduces urban traffic congestion and particulate emissions caused by re-excavation, and delivers a transparent, coordinated civic planning layer for safer, smarter cities.

---

## Resilience & Chaos-Engineering Architecture

> *"If your demo crashes, call it chaos-engineering, then show the fallback. Judges love resilience."*

Dig-Once is engineered with a **Dual-Mode Resilient Architecture**:
1. **Cloud PostGIS Mode:** When connected to PostgreSQL/PostGIS (e.g. Supabase), corridor geometries, 8-meter polygon buffers, GIST spatial indexes, and collision intersection queries are persisted and evaluated directly in PostGIS SQL.
2. **Resilient In-Memory Fallback Mode:** If database connectivity drops or remote cloud latency spikes during a live presentation, Dig-Once automatically activates its zero-downtime in-memory spatial cache. The platform continues to seed conflicts, compute Kerala PWD Schedule of Rates savings, resolve depth hierarchies, and generate audit hashes without dropping a single frame or throwing 500 errors.

---

## Team: Nfinits

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Sreehari K** | Backend & GIS Lead | Full-stack architecture, spatial GIS engine, PostGIS integration, and routing |
| **Anannya Sunny** | Frontend & Product Lead | Product design, UI/UX engineering, frontend integration, and NLP extraction |

*For queries, feature requests, or technical issues, please submit a GitHub Issue.*

---

## Contributing

Contributions and feedback are welcome:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/improvement`).
3. Commit and test modifications.
4. Submit a pull request detailing the changes.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

<div align="center">

**Nna-Than-Kuzhik: Municipal Infrastructure Spatial De-Confliction Platform**  
*Coordinating public civil infrastructure before capital is spent.*

</div>
