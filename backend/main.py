import os
from dotenv import load_dotenv
load_dotenv()

import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from backend.schemas import TenderExtractionResponse, CorroborationRequest
    from backend.pdf_extractor import extract_text_from_pdf
    from backend.llm_extractor import parse_tender_text
    from backend.gazetteer import resolve_junction_coordinates, LOCAL_GAZETTEER
    from backend.routing import get_drive_graph, generate_corridor_geojson
    from backend.samples import SAMPLE_TENDERS
    from backend.database import (
        init_db,
        insert_municipal_project,
        get_all_municipal_projects,
        detect_clashes,
        resolve_and_syndicate_clash,
        seed_demo_conflict_pair,
        clear_all_projects
    )
except ImportError:
    from schemas import TenderExtractionResponse, CorroborationRequest
    from pdf_extractor import extract_text_from_pdf
    from llm_extractor import parse_tender_text
    from gazetteer import resolve_junction_coordinates, LOCAL_GAZETTEER
    from routing import get_drive_graph, generate_corridor_geojson
    from samples import SAMPLE_TENDERS
    from database import (
        init_db,
        insert_municipal_project,
        get_all_municipal_projects,
        detect_clashes,
        resolve_and_syndicate_clash,
        seed_demo_conflict_pair,
        clear_all_projects
    )

app = FastAPI(
    title="Dig-Once Municipal Decision Support Service",
    description="Phase 2: 4D Spatio-Temporal De-Confliction Engine with PostGIS Persistence, KPWD Rates Quantification & Resolve/Syndicate Workflow.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("[Dig-Once Backend] Initializing drive graph, gazetteer, and PostGIS database...")
    try:
        init_db()
        print("[Dig-Once Backend] PostGIS connected and initialized successfully.")
    except Exception as e:
        print(f"[Dig-Once Backend Warning] Could not connect to PostGIS on startup: {e}")

    graph = get_drive_graph()
    print(f"[Dig-Once Backend] Kochi road graph loaded ({len(graph.nodes)} nodes, {len(graph.edges)} edges).")

@app.get("/api/health")
def health_check():
    graph = get_drive_graph()
    db_connected = False
    project_count = 0
    active_clashes = 0
    try:
        projects = get_all_municipal_projects()
        db_connected = True
        project_count = len(projects)
        clashes = detect_clashes()
        active_clashes = len(clashes)
    except Exception as e:
        print(f"[Health Check DB Error] {e}")

    return {
        "status": "operational",
        "service": "Dig-Once Phase 2 De-Confliction Engine",
        "postgis_connected": db_connected,
        "persisted_projects": project_count,
        "active_clashes": active_clashes,
        "local_gazetteer_entries": len(LOCAL_GAZETTEER),
        "graph_nodes": len(graph.nodes),
        "graph_edges": len(graph.edges),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "serpapi_configured": bool(os.getenv("SERPAPI_API_KEY"))
    }

@app.get("/api/gazetteer")
def get_gazetteer():
    """Returns local Kochi junctions dictionary for immediate lookup."""
    return {
        "count": len(LOCAL_GAZETTEER),
        "junctions": [
            {"name": name.title(), "latitude": coords[0], "longitude": coords[1]}
            for name, coords in LOCAL_GAZETTEER.items()
        ]
    }

@app.get("/api/samples")
def get_sample_tenders():
    """Returns curated municipal tender notices for testing and demonstration."""
    return SAMPLE_TENDERS

class TextParseRequest(BaseModel):
    raw_text: str
    custom_openai_key: Optional[str] = None

@app.post("/api/extract/text")
def extract_from_text(payload: TextParseRequest):
    """
    Step 2: Parse raw text snippet using LLM with exact evidence quote extraction.
    """
    if not payload.raw_text or not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty.")
    
    extraction = parse_tender_text(payload.raw_text, custom_api_key=payload.custom_openai_key)
    return {
        "raw_text": payload.raw_text,
        "extraction": extraction
    }

@app.post("/api/extract/pdf")
async def extract_from_pdf(
    file: UploadFile = File(...),
    custom_openai_key: Optional[str] = Form(None)
):
    """
    Step 1 & 2: Extract text from uploaded PDF using pdfplumber, then parse entities.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a PDF document.")
    
    file_bytes = await file.read()
    try:
        raw_text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read PDF document: {str(e)}")
    
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in uploaded PDF document.")

    extraction = parse_tender_text(raw_text, custom_api_key=custom_openai_key)
    return {
        "filename": file.filename,
        "raw_text": raw_text,
        "extraction": extraction
    }

class CorroborateAndPlotRequest(BaseModel):
    tender_id: str
    agency_name: str
    project_type: str
    corridor_name: str
    start_junction: str
    end_junction: str
    projected_start_date: Optional[str] = None
    projected_end_date: Optional[str] = None
    relative_duration_text: Optional[str] = None
    subsurface_depth_meters: Optional[float] = None
    work_order_date: Optional[str] = None
    calculated_duration_days: Optional[int] = None
    custom_serp_key: Optional[str] = None

@app.post("/api/corridor/resolve")
def resolve_and_plot_corridor(payload: CorroborateAndPlotRequest):
    """
    Step 4 & 5: Resolve junction coordinates, snap to road graph, compute shortest path,
    and persist directly into municipal_projects table in Docker PostGIS.
    """
    try:
        start_coords = resolve_junction_coordinates(payload.start_junction, custom_serp_key=payload.custom_serp_key)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not resolve start junction: {str(e)}")

    try:
        end_coords = resolve_junction_coordinates(payload.end_junction, custom_serp_key=payload.custom_serp_key)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not resolve end junction: {str(e)}")

    graph = get_drive_graph()
    try:
        geojson_feature = generate_corridor_geojson(graph, start_coords, end_coords)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute corridor polyline: {str(e)}")

    # Calculate effective dates
    effective_start = payload.projected_start_date
    effective_end = payload.projected_end_date

    if payload.work_order_date and not effective_start:
        effective_start = payload.work_order_date
        if payload.calculated_duration_days:
            try:
                wo_dt = datetime.strptime(payload.work_order_date, "%Y-%m-%d")
                end_dt = wo_dt + timedelta(days=payload.calculated_duration_days)
                effective_end = end_dt.strftime("%Y-%m-%d")
            except Exception:
                pass

    if not effective_start:
        effective_start = "2026-10-01"
    if not effective_end:
        effective_end = "2026-11-15"

    corridor_record = {
        "tender_id": payload.tender_id,
        "agency_name": payload.agency_name,
        "project_type": payload.project_type,
        "corridor_name": payload.corridor_name,
        "start_junction": {
            "name": payload.start_junction,
            "latitude": start_coords[0],
            "longitude": start_coords[1]
        },
        "end_junction": {
            "name": payload.end_junction,
            "latitude": end_coords[0],
            "longitude": end_coords[1]
        },
        "effective_start_date": effective_start,
        "effective_end_date": effective_end,
        "projected_start_date": effective_start,
        "projected_end_date": effective_end,
        "work_order_date": payload.work_order_date,
        "calculated_duration_days": payload.calculated_duration_days,
        "relative_duration_text": payload.relative_duration_text,
        "subsurface_depth_meters": payload.subsurface_depth_meters or (1.8 if payload.project_type == "PIPELINE" else 0.05),
        "geometry": geojson_feature["geometry"],
        "route_metrics": geojson_feature["properties"],
        "created_at": datetime.utcnow().isoformat()
    }

    # PERSISTENCE: Write verified entity directly into PostGIS municipal_projects table
    try:
        db_res = insert_municipal_project(corridor_record)
        corridor_record["db_id"] = db_res["id"]
        corridor_record["db_status"] = db_res["status"]
    except Exception as e:
        print(f"[Database Persistence Error] {e}")

    # Check for newly generated clashes
    active_clashes = []
    try:
        active_clashes = detect_clashes()
    except Exception as e:
        print(f"[Clash Check Error] {e}")

    return {
        "status": "success",
        "message": "Corridor Geometry Resolved and Persisted to PostGIS",
        "corridor": corridor_record,
        "geojson": geojson_feature,
        "clashes_detected": len(active_clashes),
        "clashes": active_clashes
    }

@app.get("/api/corridors")
def list_corridors():
    """Returns all corroborated and plotted corridors persisted in Docker PostGIS."""
    try:
        projects = get_all_municipal_projects()
        return {
            "count": len(projects),
            "corridors": projects
        }
    except Exception as e:
        print(f"[Error fetching corridors] {e}")
        return {"count": 0, "corridors": []}

@app.delete("/api/corridors")
def clear_corridors():
    """Clears all saved projects from Docker PostGIS database."""
    try:
        clear_all_projects()
        return {"status": "success", "message": "All municipal corridors cleared from PostGIS."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/demo/seed-conflict")
def seed_conflict():
    """
    Action Plan Item 3: Seed Conflicting PWD & KWA Tenders.
    Seeds:
    1. Project A: Kerala PWD Road Resurfacing (Oct 2026 - Nov 2026, 36m DLP)
    2. Project B: Kerala Water Authority Water Main Replacement (Dec 2026 - Jan 2027, 1.8m depth)
    Both along MG Road (Jos Junction to Padma Junction).
    """
    try:
        clear_all_projects()
        res = seed_demo_conflict_pair()
        projects = get_all_municipal_projects()
        clashes = detect_clashes()
        return {
            "status": "success",
            "message": "Seeded Canonical Civil Engineering Conflict Pair on MG Road",
            "projects": projects,
            "clashes": clashes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed demo pair: {str(e)}")

@app.get("/api/clashes")
def get_clashes(target_month: Optional[str] = Query(None)):
    """
    Executes PostGIS 4D spatial intersection & Defect Liability Period (DLP) violation check.
    Calculates Avoidable Restoration Cost based on Kerala PWD Schedule of Rates.
    """
    try:
        clashes = detect_clashes(target_month=target_month)
        return {
            "count": len(clashes),
            "clashes": clashes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating spatial clashes: {str(e)}")

@app.post("/api/clashes/{clash_id}/resolve")
def resolve_clash_endpoint(clash_id: str):
    """
    Step 5: 'Resolve & Syndicate' Workflow.
    Resequences work based on depth hierarchy (KWA pipes first, PWD wearing course second).
    Shifts corridor polyline to Synchronized (Electric Blue) and generates mayor sign-off audit trail.
    """
    try:
        resolution = resolve_and_syndicate_clash(clash_id)
        projects = get_all_municipal_projects()
        clashes = detect_clashes()
        return {
            "status": "success",
            "resolution": resolution,
            "projects": projects,
            "clashes": clashes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to synchronize projects: {str(e)}")
