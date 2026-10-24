<div align="center">

# Dig-Once

### **AI-Powered Municipal Infrastructure Coordination Platform**

*Plan once. Coordinate before digging. Build smarter cities.*

<br/>

Dig-Once is a civic-tech platform designed to help municipal authorities and public utility agencies identify overlapping roadwork, coordinate infrastructure projects, and reduce avoidable road excavation and restoration costs.

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React and Vite" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%7C%20PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostGIS" />
  <img src="https://img.shields.io/badge/AI-Document%20Intelligence-7C3AED?style=for-the-badge" alt="AI document intelligence" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Domain-Civic%20Tech-blue?style=flat-square" alt="Civic tech" />
  <img src="https://img.shields.io/badge/Focus-Smart%20Infrastructure-green?style=flat-square" alt="Smart infrastructure" />
  <img src="https://img.shields.io/badge/Region-Kerala%2C%20India-orange?style=flat-square" alt="Kerala, India" />
</p>

</div>

---

## The Problem

A municipal road may be resurfaced by the Public Works Department, only to be excavated weeks later for a water pipeline, electrical cable, or telecommunications installation.

* **Fiscal Loss:** Substantial avoidable public expenditure spent repeatedly re-paving the same corridors.
* **Civic Disruption:** Severe traffic congestion, degraded pavement quality, and increased dust and particulate emissions.
* **Agency Silos:** Infrastructure works are planned, budgeted, and tendered independently, making it difficult to detect spatial and temporal overlaps prior to on-site execution.

---

## The Solution

**Dig-Once** establishes a unified spatial and temporal coordination layer across public infrastructure stakeholders.

The platform ingests tender documentation, classifies civil engineering works, maps project corridors onto road network graphs, evaluates spatial and timeline conflicts, quantifies restoration costs at risk, and enables authorities to establish synchronized joint execution schedules.

> **Core Principle:** Coordinate subsurface utility installation prior to completing final surface pavement.

---

## Key Features

* **1. Automated Tender Intelligence**
  * Structured information extraction from municipal tender documents.
  * Identification of project classifications (road resurfacing, water mains, sewerage, utility ducting).
  * Extraction of spatial bounds, projected work periods, subsurface depths, and key milestones.
  * Automated filtering of non-civil and general procurement notices.
  * Confidence scoring and automated triage for items requiring human verification.

* **2. Geospatial Road Network Mapping**
  * Resolution of local landmark descriptions to geographic coordinates via gazetteers and geocoding.
  * Corridor projection along routable street networks derived from OpenStreetMap.
  * True centerline routing using graph algorithms rather than Euclidean approximation.
  * Geospatial footprint analysis across municipal infrastructure projects.

* **3. Spatio-Temporal Conflict Detection**
  * Automated polygon buffering along active work corridors.
  * Overlap length and geometric intersection quantification using PostGIS.
  * Cross-agency timeline comparison to detect concurrent excavation windows.
  * Defect Liability Period (DLP) compliance monitoring for recently paved corridors.

* **4. Restoration Cost Quantification**
  * Standardized economic quantification based on official Schedules of Rates (e.g., KPWD SoR).
  * Parameterized calculation using overlap length, excavation trench width, and restoration unit rates.
  * Identification of avoidable capital expenditure to support capital budgeting and prioritization.

* **5. Coordinated Sequencing and Scheduling**
  * Depth-hierarchy scheduling: prioritizing deep subsurface utilities before surface wearing course installation.
  * Joint excavation window proposals for inter-departmental review.
  * Structured review and sign-off workflows for authorized municipal engineers.

* **6. Municipal Decision Dashboard**
  * Centralized spatial visualization of active, planned, and conflicting corridors.
  * Granular status segmentation (Normal, Active Clash, Review Required, Synchronized).
  * Evidence-backed records to support inter-agency coordination meetings.

---

## System Architecture

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

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Leaflet |
| **Backend** | Python, FastAPI, Uvicorn |
| **Document Processing** | pdfplumber |
| **AI Extraction** | OpenAI API, GPT-4o-mini |
| **Data Validation** | Pydantic |
| **Database** | PostgreSQL, PostGIS |
| **Geospatial Processing** | OSMnx, NetworkX |
| **Spatial Data** | OpenStreetMap (OSM) |
| **Database Infrastructure** | Supabase |
| **Geocoding** | Local Gazetteer, SerpAPI Fallback |

---

## Operational Workflow

1. **Document Ingestion:** Municipal tender notices or scope-of-work documents are submitted in PDF or plain text format.
2. **Classification:** The pipeline evaluates whether the notice pertains to physical civil excavation or surface roadwork.
3. **Entity Extraction:** LLM extraction identifies tender ID, executing agency, project corridor, landmark boundaries, subsurface depth, and schedules.
4. **Verification:** Ambiguous junction names, uncertain dates, or low-confidence outputs are routed for user confirmation.
5. **Spatial Projection:** Verified corridors are matched against the local road network graph and saved as PostGIS geometries.
6. **Conflict Evaluation:** Spatial intersection queries evaluate corridor buffer collisions and active warranty / Defect Liability Period breaches.
7. **Cost Modeling:** Avoidable restoration costs are computed using configured trench dimensions and municipal restoration rate schedules.
8. **Resequencing:** Authorities evaluate suggested execution windows to consolidate separate excavations into a unified digging period.

---

## Getting Started

### Prerequisites
* Python 3.11 or later
* Node.js 18 or later with npm
* PostgreSQL instance with PostGIS extension enabled (e.g., Supabase)
* OpenAI API key
* SerpAPI key (optional fallback for non-gazetteer junction lookup)

---

### 1. Clone the Repository

```bash
git clone https://github.com/anannyasunny79-maker/digonce.git
cd digonce
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create an environment configuration file `.env` inside `backend/`:

```env
DATABASE_URL=postgresql://user:password@host:5432/postgres
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_api_key
```

Start the API service:

```bash
uvicorn main:app --reload --port 8000
```

Interactive OpenAPI documentation is available at:
`http://localhost:8000/docs`

---

### 3. Frontend Setup

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

The application interface will be accessible at:
`http://localhost:5173`

---

### 4. Database Setup

Ensure the PostGIS extension is initialized:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Database tables and indexes are initialized automatically on backend startup via `database.py`.

---

## Reliability and Risk Management

Dig-Once is an advisory decision-support platform designed to assist municipal authorities and licensed engineers; it does not replace statutory permissions or engineering sign-offs.

* **Evidence-Based Extraction:** Extracted attributes maintain traceability to source document text spans.
* **Human-in-the-Loop Review:** Low-confidence extraction outputs require engineer review prior to schedule modification.
* **Procurement Filtering:** Non-civil contracts (e.g., equipment leases, general supplies) are filtered to avoid false positive triggers.
* **Parameter Configurability:** Defect Liability Periods, trench dimensions, and unit restoration rates remain user-configurable against prevailing municipal schedules.
* **Credential Protection:** Secrets and connection URIs are managed through environment variables and excluded from version control.

---

## Current Limitations

* Optical Character Recognition (OCR) is required for scanned, image-only PDF notices lacking digital text layers.
* Ambiguous landmark names may require manual disambiguation.
* Geocoding fallbacks are subject to third-party API availability and rate quotas.
* Geometric overlap indicates potential spatial conflict; engineering feasibility of joint utility trenches remains subject to on-site clearance standards.

---

## Target Use Cases

* Municipal Corporations and Urban Local Bodies (ULBs)
* State Public Works Departments (Roads and Bridges divisions)
* Water Supply and Sewerage Boards
* Electricity Distribution Utilities and Underground Cabling Projects
* Telecom and City Gas Distribution Infrastructure Providers
* Smart City Integrated Command and Control Centers (ICCC)

---

## Project Roadmap

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

**Dig-Once: Municipal Infrastructure Spatial De-Confliction Platform**  
*Developed for coordinated public infrastructure planning.*

</div>
