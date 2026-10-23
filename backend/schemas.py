from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

class ExtractedField(BaseModel):
    value: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    evidence_span: Optional[str] = None

class ExtractedDateField(BaseModel):
    value: Optional[date] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    evidence_span: Optional[str] = None

class ExtractedFloatField(BaseModel):
    value: Optional[float] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    evidence_span: Optional[str] = None

class TenderExtractionResponse(BaseModel):
    tender_id: str
    agency_name: ExtractedField
    project_type: ExtractedField  # SURFACING, PIPELINE, DUCT, SEWER, DRAINAGE
    corridor_name: ExtractedField
    start_junction: ExtractedField
    end_junction: ExtractedField
    projected_start_date: ExtractedDateField
    projected_end_date: ExtractedDateField
    relative_duration_text: ExtractedField
    subsurface_depth_meters: ExtractedFloatField
    raw_summary: str

class CorroborationRequest(BaseModel):
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
