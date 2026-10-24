<div align="center">

# Dig-Once

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

**Dig-Once** is an enterprise-grade 4D spatio-temporal infrastructure orchestration platform that ingests unstructured municipal tender PDFs, projects planned works onto routable road graphs, identifies subsurface overlaps before work orders are executed, and automatically reschedules projects into unified joint digging windows.

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
git clone https://github.com/anannyasunny79-maker/digonce.git
cd digonce
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

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

<div align="center">

**Dig-Once: Municipal Infrastructure Spatial De-Confliction Platform**  
*Coordinating public civil infrastructure before capital is spent.*

</div>
