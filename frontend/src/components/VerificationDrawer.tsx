import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Check, Calendar, AlertTriangle, FileText, X } from 'lucide-react';

interface ExtractedField<T> {
  value: T | null;
  confidence: number;
  evidence_span: string | null;
}

interface TenderExtraction {
  tender_id: string;
  agency_name: ExtractedField<string>;
  project_type: ExtractedField<string>;
  corridor_name: ExtractedField<string>;
  start_junction: ExtractedField<string>;
  end_junction: ExtractedField<string>;
  projected_start_date: ExtractedField<string>;
  projected_end_date: ExtractedField<string>;
  relative_duration_text: ExtractedField<string>;
  subsurface_depth_meters: ExtractedField<number>;
  raw_summary: string;
}

interface VerificationDrawerProps {
  rawText: string;
  extraction: TenderExtraction;
  onConfirm: (corroboratedData: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const VerificationDrawer: React.FC<VerificationDrawerProps> = ({
  rawText,
  extraction,
  onConfirm,
  onCancel,
  isSubmitting = false
}) => {
  // Form state initialized with extracted data
  const [tenderId, setTenderId] = useState(extraction.tender_id || '');
  const [agencyName, setAgencyName] = useState(extraction.agency_name.value || '');
  const [projectType, setProjectType] = useState(extraction.project_type.value || 'SURFACING');
  const [corridorName, setCorridorName] = useState(extraction.corridor_name.value || '');
  const [startJunction, setStartJunction] = useState(extraction.start_junction.value || '');
  const [endJunction, setEndJunction] = useState(extraction.end_junction.value || '');
  const [subsurfaceDepth, setSubsurfaceDepth] = useState<string>(
    extraction.subsurface_depth_meters.value !== null && extraction.subsurface_depth_meters.value !== undefined
      ? String(extraction.subsurface_depth_meters.value)
      : ''
  );

  // Date management
  const hasExtractedStartDate = Boolean(extraction.projected_start_date.value);
  const [projectedStartDate, setProjectedStartDate] = useState(extraction.projected_start_date.value || '');
  const [projectedEndDate, setProjectedEndDate] = useState(extraction.projected_end_date.value || '');

  // Relative duration parsing: e.g. "within 90 days from letter of intent" -> 90
  const parseDaysFromRelativeText = (relText: string | null): number => {
    if (!relText) return 90;
    const daysMatch = relText.match(/(\d+)\s*days?/i);
    if (daysMatch) return parseInt(daysMatch[1], 10);
    const monthsMatch = relText.match(/(\d+)\s*months?/i);
    if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;
    return 90;
  };

  const initialDays = parseDaysFromRelativeText(extraction.relative_duration_text.value);
  const [durationDays, setDurationDays] = useState<number>(initialDays);
  const [workOrderDate, setWorkOrderDate] = useState<string>('');

  // Automatic computation: Projected End Date = Work Order Date + Extracted Duration Days
  useEffect(() => {
    if (!hasExtractedStartDate && workOrderDate) {
      try {
        const wo = new Date(workOrderDate);
        if (!isNaN(wo.getTime())) {
          const end = new Date(wo);
          end.setDate(end.getDate() + (Number(durationDays) || 0));
          const formattedEnd = end.toISOString().split('T')[0];
          setProjectedEndDate(formattedEnd);
          setProjectedStartDate(workOrderDate);
        }
      } catch (err) {
        console.error('Date computation error:', err);
      }
    }
  }, [workOrderDate, durationDays, hasExtractedStartDate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm({
      tender_id: tenderId,
      agency_name: agencyName,
      project_type: projectType,
      corridor_name: corridorName,
      start_junction: startJunction,
      end_junction: endJunction,
      projected_start_date: projectedStartDate || null,
      projected_end_date: projectedEndDate || null,
      relative_duration_text: extraction.relative_duration_text.value || null,
      subsurface_depth_meters: subsurfaceDepth ? parseFloat(subsurfaceDepth) : null,
      work_order_date: workOrderDate || null,
      calculated_duration_days: durationDays
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #334155',
          borderRadius: '2px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
      >
        {/* Verification Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            color: '#ffffff'
          }}
        >
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em' }}>
              Verify Extracted Municipal Entities
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Review parsed procurement parameters against raw municipal text before spatial road snapping.
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Verification Body: Split Raw Text (Left) & Extracted Fields (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Panel: Raw Municipal Document Text */}
          <div
            style={{
              padding: '20px',
              borderRight: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={16} color="#0f172a" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Source Document Text
              </span>
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                color: '#334155',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                backgroundColor: '#ffffff',
                padding: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '2px',
                maxHeight: '620px',
                overflowY: 'auto'
              }}
            >
              {rawText}
            </pre>
          </div>

          {/* Right Panel: Verified Entities & Missing Date Input */}
          <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Tender ID & Agency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    Tender Reference ID
                  </label>
                  <input
                    type="text"
                    className="input-box"
                    value={tenderId}
                    onChange={(e) => setTenderId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    Executing Agency
                  </label>
                  <input
                    type="text"
                    className="input-box"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    required
                  />
                  {extraction.agency_name.evidence_span && (
                    <div className="evidence-quote">
                      Source: "{extraction.agency_name.evidence_span}"
                    </div>
                  )}
                </div>
              </div>

              {/* Project Type & Depth */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    Infrastructure Classification
                  </label>
                  <select
                    className="input-box"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                  >
                    <option value="SURFACING">SURFACING</option>
                    <option value="PIPELINE">PIPELINE</option>
                    <option value="DUCT">DUCT</option>
                    <option value="SEWER">SEWER</option>
                    <option value="DRAINAGE">DRAINAGE</option>
                  </select>
                  {extraction.project_type.evidence_span && (
                    <div className="evidence-quote">
                      Source: "{extraction.project_type.evidence_span}"
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    Subsurface Depth (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-box"
                    placeholder="e.g. 1.8"
                    value={subsurfaceDepth}
                    onChange={(e) => setSubsurfaceDepth(e.target.value)}
                  />
                  {extraction.subsurface_depth_meters.evidence_span && (
                    <div className="evidence-quote">
                      Source: "{extraction.subsurface_depth_meters.evidence_span}"
                    </div>
                  )}
                </div>
              </div>

              {/* Corridor Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                  Corridor Street Name
                </label>
                <input
                  type="text"
                  className="input-box"
                  value={corridorName}
                  onChange={(e) => setCorridorName(e.target.value)}
                  required
                />
                {extraction.corridor_name.evidence_span && (
                  <div className="evidence-quote">
                    Source: "{extraction.corridor_name.evidence_span}"
                  </div>
                )}
              </div>

              {/* Junction Bounds: Start Junction & End Junction */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    Start Junction
                  </label>
                  <input
                    type="text"
                    className="input-box"
                    value={startJunction}
                    onChange={(e) => setStartJunction(e.target.value)}
                    required
                  />
                  {extraction.start_junction.evidence_span && (
                    <div className="evidence-quote">
                      Source: "{extraction.start_junction.evidence_span}"
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    Termination Junction
                  </label>
                  <input
                    type="text"
                    className="input-box"
                    value={endJunction}
                    onChange={(e) => setEndJunction(e.target.value)}
                    required
                  />
                  {extraction.end_junction.evidence_span && (
                    <div className="evidence-quote">
                      Source: "{extraction.end_junction.evidence_span}"
                    </div>
                  )}
                </div>
              </div>

              {/* Dates & Duration Engine Requirement */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Calendar size={15} color="#0f172a" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    Project Schedule Corroboration
                  </span>
                </div>

                {/* If projected start date was missing, display engineer Work Order datepicker */}
                {!hasExtractedStartDate ? (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '2px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#334155', fontSize: '12px' }}>
                      <AlertTriangle size={14} color="#f59e0b" />
                      <span>Missing Absolute Date: Input Anticipated Work Order Date</span>
                    </div>

                    {extraction.relative_duration_text.evidence_span && (
                      <div className="evidence-quote" style={{ marginBottom: '8px' }}>
                        Source: "{extraction.relative_duration_text.evidence_span}"
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                          Anticipated Work Order Date
                        </label>
                        <input
                          type="date"
                          className="input-box"
                          value={workOrderDate}
                          onChange={(e) => setWorkOrderDate(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                          Extracted Duration (Days)
                        </label>
                        <input
                          type="number"
                          className="input-box"
                          value={durationDays}
                          onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 0)}
                          required
                        />
                      </div>
                    </div>

                    {/* Computed formula display */}
                    {workOrderDate && projectedEndDate && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          fontSize: '11px',
                          color: '#0f172a',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        Projected End Date = {workOrderDate} + {durationDays} Days &rarr; <b>{projectedEndDate}</b>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                        Projected Start Date
                      </label>
                      <input
                        type="date"
                        className="input-box"
                        value={projectedStartDate}
                        onChange={(e) => setProjectedStartDate(e.target.value)}
                        required
                      />
                      {extraction.projected_start_date.evidence_span && (
                        <div className="evidence-quote">
                          Source: "{extraction.projected_start_date.evidence_span}"
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                        Projected End Date
                      </label>
                      <input
                        type="date"
                        className="input-box"
                        value={projectedEndDate}
                        onChange={(e) => setProjectedEndDate(e.target.value)}
                        required
                      />
                      {extraction.projected_end_date.evidence_span && (
                        <div className="evidence-quote">
                          Source: "{extraction.projected_end_date.evidence_span}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Confirm and Plot Corridor */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  <Check size={16} />
                  {isSubmitting ? 'Resolving Geometry...' : 'Confirm and Plot Corridor'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
