import React from 'react';
import { Printer, X, FileCheck } from 'lucide-react';

interface ProposalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  clashData?: any;
  resolutionData: any;
}

export const ProposalViewer: React.FC<ProposalViewerProps> = ({
  isOpen,
  onClose,
  clashData: _clashData,
  resolutionData
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const auditRef = resolutionData?.proposal_ref || `KOCHI-SYNC-P1P2-${new Date().getFullYear()}`;
  const timestamp = resolutionData?.audit_timestamp || new Date().toISOString();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 3000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '94vh',
          borderRadius: '2px',
          border: '1px solid #334155',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Top Control Bar (Non-printable) */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <FileCheck size={16} color="#38bdf8" />
            <span>Official Joint Synchronization Proposal — Ready for Mayoral Sign-off</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '2px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Proposal Document Body */}
        <div
          id="printable-proposal"
          style={{
            padding: '40px 48px',
            overflowY: 'auto',
            fontFamily: '"Times New Roman", Times, serif',
            color: '#0f172a',
            lineHeight: 1.6
          }}
        >
          {/* Official Civic Letterhead Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase', color: '#334155' }}>
              Government of Kerala &bull; Kochi Municipal Corporation
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', margin: '4px 0 2px', letterSpacing: '0.04em' }}>
              Municipal Infrastructure Coordination Directorate
            </h1>
            <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
              Statutory De-Confliction Cell &bull; Ernakulam, Kochi - 682011 &bull; Under Kerala Highway Protection Act
            </div>
          </div>

          {/* Reference & Metadata Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
            <div>
              <div><b>Proposal File No:</b> KMC/INFRA-SYNC/2026/MG-01</div>
              <div><b>Corridor:</b> MG Road (Jos Junction to Padma Junction &bull; 1,280 Meters)</div>
              <div><b>Audit Hash:</b> <span style={{ fontFamily: 'monospace' }}>{auditRef}</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><b>Date of Generation:</b> 23 October 2026</div>
              <div><b>Classification:</b> STATUTORY JOINT ORDER</div>
              <div><b>Engine Status:</b> <span style={{ color: '#16a34a', fontWeight: 700 }}>SYNCHRONIZED (LOCKED)</span></div>
            </div>
          </div>

          {/* Document Title */}
          <div style={{ textAlign: 'center', margin: '20px 0 16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', textDecoration: 'underline' }}>
              Draft Joint Infrastructure Synchronization Proposal
            </h2>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              For Approval of the Worshipful Mayor & Executive Engineer (PWD & KWA)
            </div>
          </div>

          {/* Preamble */}
          <div style={{ fontSize: '13px', textAlign: 'justify', marginBottom: '16px' }}>
            <b>WHEREAS</b>, Kerala PWD Roads Division scheduled periodic dense bituminous macadam resurfacing on MG Road
            (Tender No: <i>PWD/EKM/2026/RD-412</i>) carrying a statutory <b>36-Month Defect Liability Period (DLP)</b>; and
            simultaneously Kerala Water Authority (KWA) scheduled water main pipeline replacement (Tender No: <i>KWA/PHD/CHN/2026/W-104</i>)
            along the identical 1,280-meter corridor;
            <br />
            <b>WHEREAS</b>, spatial-temporal analysis detected that uncoordinated execution would result in destructive trench cutting through
            newly laid bituminous macadam within 15 calendar days of resurfacing, causing a total avoidable reconstruction waste of:
          </div>

          {/* Economic Quantification Callout */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #0f172a',
              borderRadius: '2px',
              padding: '12px 16px',
              margin: '16px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>
                Avoidable Restoration Cost Quantification (Kerala PWD Schedule of Rates)
              </div>
              <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>
                Overlap Length: <b>1,280 m</b> &times; Trench Width: <b>1.2 m</b> &times; Rate: <b>₹2,500/m²</b> (WMM + BC composite)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a' }}>
                ₹38,40,000
              </div>
              <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>
                100% Taxpayer Funds Saved
              </div>
            </div>
          </div>

          {/* Resequenced Depth-Hierarchy Execution Mandate */}
          <div style={{ margin: '20px 0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              Statutory Resequenced Execution Schedule (Depth Hierarchy)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Phase</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Executing Agency</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Civil Work Scope</th>
                  <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Depth</th>
                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Mandated Calendar Window</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Phase 1</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Kerala Water Authority (KWA)</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Subsurface Trenching & 450mm Ductile Iron Pipeline installation; compaction to 98% Proctor Density.</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>1.8 m</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0284c7' }}>
                    01 October 2026 &ndash; 15 November 2026
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Phase 2</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Public Works Department (PWD)</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Milling, prime coat, Dense Bituminous Macadam (DBM) and 40mm Bituminous Concrete wearing course.</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>0.05 m</td>
                  <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#16a34a' }}>
                    16 November 2026 &ndash; 31 December 2026
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Road Protection Mandate */}
          <div style={{ fontSize: '12px', textAlign: 'justify', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '10px 14px', borderLeft: '4px solid #0f172a' }}>
            <b>Statutory Road Protection Condition:</b> Upon completion of Phase 2 on 31 December 2026, an absolute moratorium
            on road cuts shall take effect on MG Road for a period of <b>36 Months (until 31 December 2029)</b> under the provisions
            of the <i>Kerala Highway Protection Act</i>. No utility authority shall be granted road opening sanctions during this warranty.
          </div>

          {/* Immutable Sign-off Block */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', fontSize: '11px' }}>
              <div>
                <div style={{ height: '50px', borderBottom: '1px dashed #475569', marginBottom: '6px' }} />
                <b>Executive Engineer</b><br />
                Public Health Division<br />
                Kerala Water Authority (KWA)
              </div>

              <div>
                <div style={{ height: '50px', borderBottom: '1px dashed #475569', marginBottom: '6px' }} />
                <b>Executive Engineer</b><br />
                Roads Division<br />
                Public Works Department (PWD)
              </div>

              <div>
                <div style={{ height: '50px', borderBottom: '1px dashed #475569', marginBottom: '6px' }} />
                <b>Worshipful Mayor</b><br />
                Kochi Municipal Corporation<br />
                (Statutory Approval Sealed)
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
              Certified and cryptographically logged by Dig-Once Municipal Spatial Decision Support System &bull; System Timestamp: {timestamp}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
