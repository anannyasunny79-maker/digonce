import { useState, useEffect, useRef } from 'react';
import { MapViewer } from './components/MapViewer';
import { VerificationDrawer } from './components/VerificationDrawer';
import { IngestModal } from './components/IngestModal';
import { TimelineScrubber } from './components/TimelineScrubber';
import { ConflictProposalDrawer } from './components/ConflictProposalDrawer';
import { LandingPortal } from './components/LandingPortal';
import { MunicipalLoader } from './components/ui/loader';
import { TermsPage } from './pages/Terms';
import { PrivacyPage } from './pages/Privacy';
import {
  FileText,
  Layers,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Database,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

type AppView = 'portal' | 'loading' | 'console' | 'terms' | 'privacy';

const LOADING_STAGES = [
  {
    title: 'Extracting Procurement Circular...',
    subtitle: 'Parsing text streams and administrative metadata via pdfplumber',
  },
  {
    title: 'Executing Civil Triage Gatekeeper...',
    subtitle: 'Validating physical road-cut criteria and screening non-excavation tenders',
  },
  {
    title: 'Snapping to Kochi Road Graph...',
    subtitle: 'Resolving arterial nodes and buffering 8m corridor geometry in PostGIS',
  },
];

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('portal');
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const [rejectionBanner, setRejectionBanner] = useState<{ show: boolean; category: string } | null>(null);

  // Console-level state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<{ rawText: string; extraction: any } | null>(null);

  const [corridors, setCorridors] = useState<any[]>([]);
  const [activeCorridor, setActiveCorridor] = useState<any | null>(null);
  const [clashes, setClashes] = useState<any[]>([]);
  const [selectedClash, setSelectedClash] = useState<any | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState<boolean>(false);

  // 4D Spatio-Temporal Timeline Scrubber state
  const [currentMonthKey, setCurrentMonthKey] = useState<string>('2026-12');
  const [filterByMonth, setFilterByMonth] = useState<boolean>(false);

  // Pending file for upload-then-transition flow
  const pendingFileRef = useRef<File | null>(null);

  // ── URL hash routing for Terms / Privacy ──────────────────────────────────
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#terms') setCurrentView('terms');
      else if (hash === '#privacy') setCurrentView('privacy');
      else if (currentView === 'terms' || currentView === 'privacy') setCurrentView('portal');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ── Fetch health + corridors + clashes (console only) ────────────────────
  const refreshData = async () => {
    try {
      const healthRes = await fetch(`${API_BASE_URL}/api/health`);
      setSystemStatus(await healthRes.json());
    } catch (_) {}

    try {
      const corrRes = await fetch(`${API_BASE_URL}/api/corridors`);
      const corrData = await corrRes.json();
      if (corrData.corridors) {
        setCorridors(corrData.corridors);
        if (corrData.corridors.length > 0 && !activeCorridor) {
          setActiveCorridor(corrData.corridors[corrData.corridors.length - 1]);
        }
      }
    } catch (_) {}

    try {
      const clashRes = await fetch(`${API_BASE_URL}/api/clashes`);
      const clashData = await clashRes.json();
      if (clashData.clashes) setClashes(clashData.clashes);
    } catch (_) {}
  };

  useEffect(() => {
    if (currentView === 'console') refreshData();
  }, [currentView]);

  // ── Stage-cycling loader ──────────────────────────────────────────────────
  const runLoadingSequence = (file: File) => {
    setLoadingStageIdx(0);
    setCurrentView('loading');

    const timings = [0, 1800, 3200]; // ms offsets for each stage
    timings.forEach((t, i) => {
      setTimeout(() => setLoadingStageIdx(i), t);
    });

    // Actual API call after first stage paint
    setTimeout(async () => {
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${API_BASE_URL}/api/extract/pdf`, {
          method: 'POST',
          body: form,
        });
        const data = await res.json();

        const isCivil = data.extraction?.classification?.is_civil_infrastructure !== false;

        // Wait until animation is at least 4.5s total
        setTimeout(() => {
          if (isCivil) {
            setVerificationData({ rawText: data.raw_text, extraction: data.extraction });
            setCurrentView('console');
          } else {
            const category = data.extraction?.classification?.category || 'Unknown';
            setRejectionBanner({ show: true, category });
            setCurrentView('portal');
          }
        }, 1200);
      } catch (err) {
        // On error fall back to portal
        setTimeout(() => setCurrentView('portal'), 1500);
      }
    }, 300);
  };

  // ── Landing Portal callbacks ──────────────────────────────────────────────
  const handlePortalFileUpload = (file: File) => {
    pendingFileRef.current = file;
    runLoadingSequence(file);
  };

  const handleSeedDemoConflict = async () => {
    setIsSeedingDemo(true);
    setCurrentView('console');
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/seed-conflict`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to seed demo conflict');
      const data = await response.json();
      setCorridors(data.projects);
      setClashes(data.clashes);
      if (data.projects.length > 0) setActiveCorridor(data.projects[0]);
      setCurrentMonthKey('2026-12');
      refreshData();
    } catch (err: any) {
      alert(`Demo seeding error: ${err.message}`);
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handlePasteText = () => {
    setCurrentView('console');
    setIsIngestModalOpen(true);
  };

  // ── Console callbacks ─────────────────────────────────────────────────────
  const handleExtractionReady = (rawText: string, extraction: any) => {
    setVerificationData({ rawText, extraction });
  };

  const handleConfirmAndPlot = async (corroboratedData: any) => {
    setIsResolving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/corridor/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corroboratedData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to resolve corridor geometry');
      }
      const data = await response.json();
      setCorridors((prev) => {
        const filtered = prev.filter((p) => p.tender_id !== data.corridor.tender_id);
        return [...filtered, data.corridor];
      });
      setActiveCorridor(data.corridor);
      if (data.clashes) setClashes(data.clashes);
      setVerificationData(null);
      refreshData();
    } catch (err: any) {
      alert(`Spatial Resolution Error: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  const handleResolveClash = async (clashId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/clashes/${clashId}/resolve`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to syndicate projects');
    }
    const data = await response.json();
    setCorridors(data.projects);
    setClashes(data.clashes);
    refreshData();
    return data;
  };

  const handleClearCorridors = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/corridors`, { method: 'DELETE' });
      setCorridors([]);
      setActiveCorridor(null);
      setClashes([]);
      setSelectedClash(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Route: Legal pages ────────────────────────────────────────────────────
  if (currentView === 'terms') {
    return (
      <TermsPage
        onBack={() => {
          window.location.hash = '';
          setCurrentView('portal');
        }}
      />
    );
  }
  if (currentView === 'privacy') {
    return (
      <PrivacyPage
        onBack={() => {
          window.location.hash = '';
          setCurrentView('portal');
        }}
      />
    );
  }

  // ── Route: Landing Portal ─────────────────────────────────────────────────
  if (currentView === 'portal') {
    return (
      <LandingPortal
        onFileUpload={handlePortalFileUpload}
        onLoadDemoConflict={handleSeedDemoConflict}
        onPasteText={handlePasteText}
        onLaunchConsole={() => setCurrentView('console')}
        rejectionBanner={rejectionBanner}
      />
    );
  }

  // ── Route: Loading Screen ─────────────────────────────────────────────────
  if (currentView === 'loading') {
    const stage = LOADING_STAGES[loadingStageIdx] || LOADING_STAGES[0];
    return <MunicipalLoader title={stage.title} subtitle={stage.subtitle} />;
  }

  // ── Route: 4D De-Confliction Command Center ───────────────────────────────
  const primaryClash = clashes[0];
  const isSynchronized =
    primaryClash?.is_synchronized || primaryClash?.severity === 'RESOLVED_JOINT_WINDOW';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>

      {/* ── Top Administrative Header ── */}
      <header
        style={{
          height: '56px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* ← Back to Portal breadcrumb */}
          <button
            onClick={() => setCurrentView('portal')}
            style={{
              backgroundColor: 'rgba(30,41,59,0.9)',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '5px 11px',
              fontSize: '11.5px',
              fontWeight: 500,
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e293b';
              (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(30,41,59,0.9)';
              (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
            }}
            title="Return to Landing Portal"
          >
            <ArrowLeft size={12} />
            Portal
          </button>

          <div style={{ height: '18px', width: '1px', backgroundColor: '#334155' }} />

          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="none">
              <rect width="32" height="32" rx="4" fill="#0F172A" />
              <path d="M16 4V28M4 16H28" stroke="#94A3B8" strokeWidth="2" strokeDasharray="2 2" />
              <path d="M10 8L22 24" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="square" />
              <circle cx="10" cy="8" r="2.5" fill="#38BDF8" />
              <circle cx="22" cy="24" r="2.5" fill="#EF4444" />
            </svg>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Dig-Once
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>
                | 4D Command Center
              </span>
            </div>
          </div>

          <div style={{ height: '18px', width: '1px', backgroundColor: '#334155', margin: '0 4px' }} />

          <span style={{ fontSize: '11px', backgroundColor: '#1e293b', color: '#cbd5e1', padding: '3px 8px', borderRadius: '2px', fontWeight: 500 }}>
            Kochi Municipal Corporation (KMC)
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#94a3b8' }}>
            <Database size={13} color={systemStatus?.postgis_connected ? '#22c55e' : '#f59e0b'} />
            <span>PostGIS: {systemStatus?.postgis_connected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Load Demo Conflict Pair */}
          <button
            onClick={handleSeedDemoConflict}
            disabled={isSeedingDemo}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: '1px solid #b91c1c',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 4px rgba(220,38,38,0.3)',
              transition: 'all 0.15s ease',
            }}
            title="Seeds the canonical PWD resurfacing vs KWA water main conflict pair on MG Road"
          >
            <Sparkles size={14} />
            {isSeedingDemo ? 'Seeding...' : 'Load Demo Conflict Pair'}
          </button>

          {/* Clash badge */}
          {clashes.length > 0 && !isSynchronized && (
            <button
              onClick={() => setSelectedClash(primaryClash)}
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #f87171',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={14} color="#dc2626" />
              <span>1 Statutory Conflict (₹38.4L Risk)</span>
            </button>
          )}

          {isSynchronized && (
            <button
              onClick={() => setSelectedClash(primaryClash)}
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #7dd3fc',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} color="#0284c7" />
              <span>Joint Window Locked (Electric Blue)</span>
            </button>
          )}

          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="btn-primary"
            style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#ffffff', padding: '6px 12px', fontSize: '12px' }}
          >
            <FileText size={14} />
            Ingest Document
          </button>

          {corridors.length > 0 && (
            <button
              onClick={handleClearCorridors}
              className="btn-secondary"
              style={{ backgroundColor: '#1e293b', color: '#cbd5e1', borderColor: '#334155', padding: '6px 10px', fontSize: '12px' }}
              title="Clear all plotted corridors from PostGIS"
            >
              <Trash2 size={13} />
              Reset Map
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px', marginLeft: '6px' }}>
            <a href="#terms" onClick={() => setCurrentView('terms')} style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</a>
            <a href="#privacy" onClick={() => setCurrentView('privacy')} style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Left Sidebar */}
        <aside
          style={{
            width: '320px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
              <Layers size={15} />
              <span>Municipal Registry ({corridors.length})</span>
            </div>
            {clashes.length > 0 && !isSynchronized ? (
              <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                1 Conflict
              </span>
            ) : (
              corridors.length > 0 && (
                <span className="badge badge-surfacing">{corridors.length} Persisted</span>
              )
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {corridors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>No Active Projects Plotted</div>
                <p style={{ lineHeight: '1.5', marginBottom: '16px' }}>
                  Click <b>[Load Demo Conflict Pair]</b> to see the PWD vs KWA conflict, or return to the Portal to ingest a tender.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={handleSeedDemoConflict}
                    style={{
                      width: '100%', backgroundColor: '#dc2626', color: '#ffffff',
                      border: 'none', padding: '8px 14px', borderRadius: '2px',
                      fontWeight: 700, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <Sparkles size={14} />
                    Load Demo Conflict Pair
                  </button>
                  <button
                    onClick={() => setCurrentView('portal')}
                    style={{
                      width: '100%', backgroundColor: '#f8fafc', color: '#475569',
                      border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '2px',
                      fontWeight: 600, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px',
                    }}
                  >
                    <ArrowLeft size={13} />
                    Back to Portal
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {corridors.map((c, idx) => {
                  const isSelected = activeCorridor?.tender_id === c.tender_id;
                  const isSurfacing = c.project_type === 'SURFACING';
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveCorridor(c)}
                      style={{
                        padding: '12px',
                        border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                        borderRadius: '2px',
                        backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: isSurfacing ? '#f0fdf4' : '#eff6ff',
                            color: isSurfacing ? '#16a34a' : '#1d4ed8',
                            border: `1px solid ${isSurfacing ? '#bbf7d0' : '#bfdbfe'}`,
                          }}
                        >
                          {c.project_type}
                        </span>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>{c.tender_id}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>{c.corridor_name}</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>{c.agency_name}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '6px' }}>
                        {c.start_junction?.name || 'Start'} &rarr; {c.end_junction?.name || 'End'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                        <span>Depth: {c.subsurface_depth_meters ?? 0}m</span>
                        <span>{c.effective_start_date || c.projected_start_date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '11px', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <ShieldCheck size={13} color="#16a34a" />
              <span style={{ fontWeight: 600, color: '#0f172a' }}>PostGIS Spatial Persistence</span>
            </div>
            Pre-buffered 8m corridors with ST_Intersects &amp; 36-month DLP conflict checks.
          </div>
        </aside>

        {/* Map + Timeline */}
        <main style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
          <MapViewer
            corridors={corridors}
            activeCorridor={activeCorridor}
            onSelectCorridor={(c) => setActiveCorridor(c)}
            clashes={clashes}
            onOpenClashModal={(clash) => setSelectedClash(clash)}
            currentMonthKey={currentMonthKey}
            filterByMonth={filterByMonth}
          />
          <TimelineScrubber
            currentMonthKey={currentMonthKey}
            onChangeMonth={(month) => setCurrentMonthKey(month)}
            activeClashCount={clashes.length}
            isSynchronized={isSynchronized}
            filterByMonth={filterByMonth}
            onToggleFilter={(f) => setFilterByMonth(f)}
          />
        </main>
      </div>

      {/* Ingest Modal */}
      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onExtractionReady={handleExtractionReady}
        apiBaseUrl={API_BASE_URL}
      />

      {/* Verification Drawer */}
      {verificationData && (
        <VerificationDrawer
          rawText={verificationData.rawText}
          extraction={verificationData.extraction}
          onConfirm={handleConfirmAndPlot}
          onCancel={() => setVerificationData(null)}
          isSubmitting={isResolving}
        />
      )}

      {/* Conflict Drawer */}
      {selectedClash && (
        <ConflictProposalDrawer
          isOpen={Boolean(selectedClash)}
          onClose={() => setSelectedClash(null)}
          clash={selectedClash}
          onResolve={handleResolveClash}
        />
      )}
    </div>
  );
}

export default App;
