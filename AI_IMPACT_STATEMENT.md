# AI Impact Statement — Nna-Than-Kuzhik

**Event:** AIBoomi Startup Weekend  
**Team:** Nfinits (Sreehari K & Anannya Sunny)  
**Word Count:** 172 words (Strictly under 200 words limit)

---

### AI Impact Statement

**Tasks Automated & Augmented:**  
Nna-Than-Kuzhik automates the extraction of complex municipal civil tender notices (corridors, bounding junctions, subsurface depths, and timelines) and augments city engineers' decision-making by autonomously identifying multi-agency spatial clashes and Defect Liability Period (DLP) warranty violations.

**Models Used & Justification:**  
We employ OpenAI GPT-4o-mini with structured JSON outputs. Its high instruction-following capability, low latency, and cost-efficiency make it ideal for parsing multi-page bureaucratic tender PDFs in real time without heavy infrastructure overhead.

**Data Provenance & Licenses:**  
- Road network data: OpenStreetMap contributors under the Open Database License (ODbL).  
- Tenders: Public domain municipal e-procurement notifications.  
- Standard cost metrics: Official Kerala Public Works Department (KPWD) Schedule of Rates.

**Guardrails & Evaluation:**  
Strict Pydantic schema validation requires verifiable citation quotes from source texts, eliminating hallucinations. Non-civil tenders are classified and filtered out automatically. Deterministic spatial routing (OSMnx/NetworkX) and buffering are strictly computed in PostGIS, not by LLMs.

**Expected Outcomes:**  
Prevents premature destruction of freshly paved roads, eliminates millions of rupees in redundant excavation costs, preserves contractor warranties, and minimizes citywide traffic disruption.
