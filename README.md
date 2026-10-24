<div align="center">

# ⚡ Dig-Once

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

## 📌 The Problem

A city road may be resurfaced by the Public Works Department, only to be excavated weeks later for a water pipeline, electrical cable, or telecommunications installation.

* **Fiscal Loss:** Massive avoidable taxpayer expense spent repeatedly re-paving the same corridors.
* **Civic Chaos:** Traffic disruption, ruined road surfaces, and severe dust pollution.
* **Agency Silos:** Infrastructure projects are planned, budgeted, and tendered independently, making it difficult to identify overlaps before work begins on the ground.

---

## 💡 The Solution

**Dig-Once** brings infrastructure projects into a shared spatial and temporal planning system.

It analyzes tender documents, identifies relevant civil works, maps their locations along real road networks, checks for potential conflicts, estimates restoration costs at risk, and helps authorities explore coordinated execution schedules.

> **Core Objective:** Coordinate underground utility work *before* completing the road above it.

---

## ✨ Key Features

* 📄 **1. AI-Powered Tender Intelligence**
  * Extract structured information from municipal tender documents.
  * Identify project types such as road resurfacing, water pipelines, sewerage, and utility ducts.
  * Extract relevant locations, work durations, depths, and project dates where available.
  * Filter out unrelated procurement notices.
  * Flag missing, uncertain, or low-confidence information for human review.

* 🗺️ **2. Geospatial Road Mapping**
  * Convert road landmarks into geographic locations via local gazetteer and geocoding.
  * Represent road corridors using spatial geometries.
  * Use OpenStreetMap-based road networks for real centerline route analysis.
  * Compare infrastructure projects based on their geographic footprints.

* ⚠️ **3. Spatial and Temporal Conflict Detection**
  * Identify projects that overlap geographically with configurable corridor buffers.
  * Measure the extent of potential corridor overlap in meters.
  * Compare proposed work periods to detect scheduling conflicts.
  * Flag resurfaced roads that may be subject to applicable maintenance or Defect-Liability Period (DLP) conditions.

* 💰 **4. Restoration Cost Analysis**
  * Estimate potential road restoration costs associated with overlapping works.
  * Present assumptions and cost breakdowns for review based on standard Schedule of Rates.
  * Help authorities prioritize coordination opportunities.
  * *Cost-at-risk estimates are planning indicators, not guaranteed savings.*

* 📅 **5. Coordinated Scheduling**
  * Explore alternative execution windows for conflicting projects.
  * Prioritize underground utility work before final road resurfacing where technically appropriate (depth hierarchy).
  * Present recommendations for review and approval by authorized engineers and agencies.

* 📊 **6. Municipal Dashboard**
  * View project information and potential conflicts in a clean, interactive map interface.
  * Distinguish normal projects from conflicts and review-required cases.
  * Support evidence-based infrastructure planning.

---

## 🏗️ System Architecture

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

Supporting tools: OpenAI API (GPT-4o-mini), pdfplumber, OSMnx and NetworkX
```

---

## 🧰 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Leaflet |
| **Backend** | Python, FastAPI, Uvicorn |
| **PDF Processing** | pdfplumber |
| **AI Extraction** | OpenAI API, GPT-4o-mini |
| **Data Validation** | Pydantic |
| **Database** | PostgreSQL, PostGIS |
| **Geospatial Analysis** | OSMnx, NetworkX |
| **Mapping Data** | OpenStreetMap (OSM) |
| **Database Hosting** | Supabase |
| **Geocoding Fallback** | SerpAPI, Local Gazetteer |

*The technologies listed describe the intended project stack. Individual integrations may require configuration or verification in the current repository.*

---

## 🔄 How It Works

1. **Upload:** A user provides a tender notice PDF or raw text project document.
2. **Classify:** The system determines whether the document describes relevant civil infrastructure work.
3. **Extract:** AI identifies project details (agency, corridor, junctions, depth, timelines) and returns structured data.
4. **Review:** Missing dates, uncertain locations, and low-confidence fields are flagged for human confirmation.
5. **Map:** Project corridors are snapped to routable road networks and converted into spatial linestrings.
6. **Compare:** Spatial and temporal analysis identifies potential conflicts with other active or planned projects.
7. **Estimate:** The system calculates indicative restoration costs using standard rate formulas and assumptions.
8. **Coordinate:** Authorities review suggested schedules and decide whether projects can be synchronized into a joint execution window.

---

## 🚀 Getting Started

### Prerequisites
* Python 3.11 or later
* Node.js 18 or later and npm
* A Supabase project with PostgreSQL and PostGIS enabled
* An OpenAI API key
* A SerpAPI key (optional fallback for unindexed junctions)

---

### 1. Clone the Repository

```bash
git clone https://github.com/anannyasunny79-maker/digonce.git
cd digonce
```

---

### 2. Configure the Backend

```bash
cd backend
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL=your_supabase_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_api_key
```

*Replace example values with your actual credentials. Never commit `.env` files or API keys to GitHub.*

Start the API server:

```bash
uvicorn main:app --reload --port 8000
```

FastAPI interactive documentation will be available at:
`http://localhost:8000/docs`

---

### 3. Configure the Frontend

Open another terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL in your browser:
`http://localhost:5173`

---

### 4. Database Configuration

Ensure PostGIS is enabled in your PostgreSQL database (`CREATE EXTENSION IF NOT EXISTS postgis;`) and that the backend schema and required tables have been initialized according to the repository's database setup.

---

## 🧪 Reliability and Safety

*Dig-Once is intended to support municipal decision-making, not replace engineering judgment or statutory approvals.*

* **Evidence-Based Extraction:** Extracted fields are traceable to source document text wherever possible with citation quotes.
* **Human Review:** Uncertain dates, project locations, and technical details must be confirmed before they influence scheduling.
* **Procurement Filtering:** Non-civil tenders do not create excavation conflicts simply because they mention a road or locality.
* **Configurable Rules:** Maintenance periods, restoration rates, trench depths, and engineering requirements must be verified against the applicable contract, official schedule of rates, and technical standards.
* **Advisory Scheduling:** Final decisions remain with the responsible authorities and qualified engineers.
* **Credential Security:** API keys and database credentials are stored in environment variables and never exposed in source control.

---

## ⚠️ Current Limitations

* Scanned PDFs may require OCR before text extraction.
* Landmark-based geocoding can be ambiguous and requires validation.
* External geocoding services may impose rate limits or usage fees.
* Spatial overlap does not automatically mean two projects are incompatible; engineering context and timing matter.
* Accurate cost estimates depend on verified restoration rates, quantities, and project-specific conditions.
* Integration and deployment status depends on the components configured in the repository.

---

## 🗺️ Potential Applications

* Municipal corporations and local self-government institutions
* Public Works Department (PWD) road resurfacing and widening projects
* Water supply and sewerage infrastructure (e.g., KWA)
* Electricity (KSEB) and telecommunications ducting utilities
* Smart-city infrastructure coordination
* Civic infrastructure planning and tender analysis

---

## 🛣️ Roadmap

- [x] Automated tender classification and structured extraction
- [x] Document evidence spans and confidence indicators
- [x] Local road and landmark gazetteer for Kochi
- [x] PostGIS-based corridor conflict queries and spatial buffering
- [x] Configurable restoration cost models (KPWD rates)
- [ ] Project synchronization calendar & Gantt visualizer
- [ ] Reviewable joint coordination proposals with one-click sign-off
- [ ] Versioned audit records and municipal approval workflows
- [ ] Multi-city road network federation across India

---

## 👥 Team — **Nfinits**

| Contributor | Focus |
| :--- | :--- |
| **Sreehari K** | Backend architecture, spatial GIS engine, and system integration |
| **Anannya Sunny** | UI/UX engineering, frontend integration, and NLP pipeline |

*For questions, collaboration, or bug reports, feel free to open a GitHub Issue in this repository.*

---

## 🤝 Contributing

Contributions and suggestions are welcome!
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/NewFeature`).
3. Make and test your changes.
4. Submit a pull request describing the change.

---

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

<div align="center">

**Dig-Once — Better coordination. Fewer road cuts. Smarter public infrastructure.**  
*Built for more coordinated civic infrastructure planning in Kerala, India.*

</div>
