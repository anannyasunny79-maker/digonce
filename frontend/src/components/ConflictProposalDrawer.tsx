import React, { useState } from 'react';
import { CheckCircle2, RefreshCw, X, Zap, ShieldAlert, FileCheck } from 'lucide-react';
import { ProposalViewer } from './ProposalViewer';

interface ConflictProposalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clash: any;
  onResolve: (clashId: string) => Promise<any>;
}

export const ConflictProposalDrawer: React.FC<ConflictProposalDrawerProps> = ({
  isOpen,
  onClose,
  clash,
  onResolve
}) => {
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolutionResult, setResolutionResult] = useState<any | null>(null);
  const [isProposalViewerOpen, setIsProposalViewerOpen] = useState<boolean>(false);

  if (!isOpen || !clash) return null;

  const isAlreadySynced = clash.is_synchronized || clash.severity === 'RESOLVED_JOINT_WINDOW' || Boolean(resolutionResult);

  const handleAutoResolve = async () => {
    setIsResolving(true);
    try {
      const res = await onResolve(clash.id);
      setResolutionResult(res?.resolution || res);
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  const costFormatted = clash.avoidable_restoration_cost_formatted || '₹38,40,000';
  const overlapM = clash.overlap_length_meters || 1280;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          zIndex: 2500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: isAlreadySynced ? '2px solid #0284c7' : '2px solid #dc2626',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: isAlreadySynced ? '#0284c7' : '#dc2626',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isAlreadySynced ? (
                <CheckCircle2 size={22} color="#ffffff" />
              ) : (
                <ShieldAlert size={22} color="#ffffff" />
              )}
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>
                  {isAlreadySynced
                    ? 'Joint Infrastructure Synchronization Locked (Electric Blue)'
                    : 'Critical 4D Civil Infrastructure Conflict Detected'}
                </h2>
                <div style={{ fontSize: '11.5px', opacity: 0.9 }}>
                  {isAlreadySynced
                    ? 'Depth-hierarchy execution window scheduled & locked under Dig-Once Mandate'
                    : 'Statutory Defect Liability Period (DLP) Violation on MG Road Corridor'}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Grounded Economic Quantification Banner */}
            <div
              style={{
                backgroundColor: isAlreadySynced ? '#f0f9ff' : '#fef2f2',
                border: isAlreadySynced ? '1px solid #bae6fd' : '1px solid #fecaca',
                padding: '14px 18px',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: isAlreadySynced ? '#0369a1' : '#b91c1c' }}>
                  {isAlreadySynced ? 'Avoidable Taxpayer Reconstruction Waste Prevented' : 'Avoidable Public Reconstruction Waste'}
                </div>
                <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '2px' }}>
                  Formula: L ({overlapM} m) &times; W (1.2 m trench) &times; R (₹2,500/m² KPWD composite WMM+BC)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: isAlreadySynced ? '#0284c7' : '#dc2626',
                    display: 'block'
                  }}
                >
                  {costFormatted}
                </span>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                  {isAlreadySynced ? '100% Capital Saved' : 'KPWD Schedule of Rates Grounded'}
                </span>
              </div>
            </div>

            {/* Conflicting Projects Breakdown (Project A vs Project B) */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '10px' }}>
                Conflicting Civil Works & Schedule Collision
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                
                {/* Project A: Kerala PWD Surfacing */}
                <div
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '2px',
                    padding: '14px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge badge-surfacing" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                      {clash.project_a.project_type}
                    </span>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                      {clash.project_a.tender_id}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    {clash.project_a.agency_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    Corridor: {clash.corridor_name} &bull; Depth: <b>{clash.project_a.depth_meters} m</b> (Milling & Wearing Course)
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '2px', fontSize: '11px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#475569' }}>Scheduled Work Window:</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {clash.project_a.start_date} to {clash.project_a.end_date}
                    </div>
                    <div style={{ marginTop: '4px', color: '#d97706', fontWeight: 600 }}>
                      Defect Liability Period (DLP): <b>{clash.project_a.dlp_months} Months Statutory Warranty</b>
                    </div>
                  </div>
                </div>

                {/* Project B: Kerala Water Authority Pipeline */}
                <div
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '2px',
                    padding: '14px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge badge-pipeline" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      {clash.project_b.project_type}
                    </span>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                      {clash.project_b.tender_id}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    {clash.project_b.agency_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    Corridor: {clash.corridor_name} &bull; Subsurface Depth: <b>{clash.project_b.depth_meters} m</b> (Trenching)
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '2px', fontSize: '11px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#475569' }}>Scheduled Work Window:</div>
                    <div style={{ fontWeight: 700, color: isAlreadySynced ? '#0284c7' : '#dc2626' }}>
                      {clash.project_b.start_date} to {clash.project_b.end_date}
                    </div>
                    <div style={{ marginTop: '4px', color: '#dc2626', fontWeight: 600 }}>
                      Hazard: {isAlreadySynced ? 'Sequenced Subsurface Pipe First' : 'Destroys newly paved road within 15 days!'}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Depth Hierarchy Resolution Explanation */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '14px',
                borderRadius: '2px',
                fontSize: '12px'
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#0284c7" />
                <span>Dig-Once Autonomous Depth-Hierarchy Resolution Principle</span>
              </div>
              <p style={{ color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Civil engineering laws dictate that deeper utility infrastructure must be installed prior to surface paving:
                <b> Phase 1 (Subsurface Pipe Installation at 1.8m depth)</b> takes precedence.
                <b> Phase 2 (Road Surfacing at 0.05m depth)</b> occurs only after pipe jointing, backfilling, and sub-base compaction are complete.
              </p>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div>
                {isAlreadySynced && (
                  <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={15} />
                    Synchronized Proposal Generated & Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>

                {!isAlreadySynced ? (
                  <button
                    type="button"
                    onClick={handleAutoResolve}
                    disabled={isResolving}
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '2px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(220,38,38,0.25)'
                    }}
                  >
                    <RefreshCw size={15} className={isResolving ? 'animate-spin' : ''} />
                    {isResolving ? 'Resequencing Schedules...' : 'Auto-Resolve & Merge'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsProposalViewerOpen(true)}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '2px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(2,132,199,0.25)'
                    }}
                  >
                    <FileCheck size={15} />
                    Export Joint Proposal (PDF / Print)
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mayoral Proposal Viewer Modal */}
      <ProposalViewer
        isOpen={isProposalViewerOpen}
        onClose={() => setIsProposalViewerOpen(false)}
        clashData={clash}
        resolutionData={resolutionResult}
      />
    </>
  );
};
