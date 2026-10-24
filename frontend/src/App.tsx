import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapViewer, type AgencyFilter } from './components/MapViewer';
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
  Play,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://digonce-fn9g.onrender.com';

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
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState<boolean>(false);

  // 4D Spatio-Temporal Timeline Scrubber state
  const [currentMonthKey, setCurrentMonthKey] = useState<string>('2026-12');
  const [filterByMonth, setFilterByMonth] = useState<boolean>(false);
  const [agencyFilter, setAgencyFilter] = useState<AgencyFilter>('ALL');

  // ── URL hash routing for Terms / Privacy ──────────────────────────────────
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#terms') setCurrentView('terms');
      else if (hash === '#privacy') setCurrentView('privacy');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ── Fetch corridors + clashes (console only) ────────────────────────────
  const refreshData = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/health`);
    } catch (_) { }

    try {
      const corrRes = await fetch(`${API_BASE_URL}/api/corridors`);
      const corrData = await corrRes.json();
      if (corrData.corridors) {
        setCorridors(corrData.corridors);
        if (corrData.corridors.length > 0 && !activeCorridor) {
          setActiveCorridor(corrData.corridors[corrData.corridors.length - 1]);
        }
      }
    } catch (_) { }

    try {
      const clashRes = await fetch(`${API_BASE_URL}/api/clashes`);
      const clashData = await clashRes.json();
      if (clashData.clashes) setClashes(clashData.clashes);
    } catch (_) { }
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
    runLoadingSequence(file);
  };

  const handleSeedDemoConflict = async () => {
    setIsSeedingDemo(true);
    setCurrentView('console');
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/seed-conflict`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || 'Failed to seed demo conflict');
      const projects = data.projects || [];
      const clashes = data.clashes || [];
      setCorridors(projects);
      setClashes(clashes);
      if (projects.length > 0) setActiveCorridor(projects[0]);
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
  const primaryClash = clashes[0];
  const isSynchronized =
    primaryClash?.is_synchronized || primaryClash?.severity === 'RESOLVED_JOINT_WINDOW';

  // Filter corridors based on sidebar agency filter
  const displayedCorridors = corridors.filter((c) => {
    if (agencyFilter === 'ALL') return true;
    const keywords: Record<string, string[]> = {
      PWD: ['pwd', 'public works'],
      KWA: ['kwa', 'water authority'],
      KSEB: ['kseb', 'electricity board'],
    };
    const list = keywords[agencyFilter] || [];
    return list.some((kw) => c.agency_name?.toLowerCase().includes(kw));
  });

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {currentView === 'portal' && (
          <LandingPortal
            key="portal"
            onFileUpload={handlePortalFileUpload}
            onLoadDemoConflict={handleSeedDemoConflict}
            onPasteText={handlePasteText}
            onLaunchConsole={() => setCurrentView('console')}
            rejectionBanner={rejectionBanner}
          />
        )}

        {currentView === 'loading' && (
          <div
            key="loading"
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#090d16',
            }}
          >
            <MunicipalLoader
              title={LOADING_STAGES[loadingStageIdx]?.title || 'Processing Tender...'}
              subtitle={LOADING_STAGES[loadingStageIdx]?.subtitle || 'Executing algorithmic triage...'}
            />
          </div>
        )}

        {currentView === 'console' && (
          <motion.div
            key="console"
            initial={{ opacity: 0, scale: 0.985, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#e2e8f0' }}
          >
            {/* ── 1. Floating Liquid Glass Top Header ── */}
            <header
              className="liquid-glass squircle-pill"
              style={{
                position: 'absolute',
                top: '16px',
                left: '20px',
                right: '20px',
                height: '56px',
                zIndex: 1000,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '20px',
              }}
            >
              {/* Left Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => setCurrentView('portal')}
                  className="liquid-glass-button squircle-pill"
                  style={{
                    background: 'rgba(15, 23, 42, 0.06)',
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    color: '#0f172a',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ← Portal
                </button>

                <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(0,0,0,0.1)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Nna-Than-Kuzhik
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                    Command Center
                  </span>
                </div>
              </div>

              {/* Right Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Apple Squircle Load Sample Button (Refined, no saturated red block) */}
                <button
                  onClick={handleSeedDemoConflict}
                  disabled={isSeedingDemo}
                  className="liquid-glass-button squircle-pill"
                  style={{
                    background: 'rgba(220, 38, 38, 0.08)',
                    border: '1px solid rgba(220, 38, 38, 0.25)',
                    color: '#dc2626',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Play size={11} color="#dc2626" style={{ fill: '#dc2626' }} />
                  {isSeedingDemo ? 'Seeding...' : 'Load Demo Conflict'}
                </button>

                {/* Ingest Tender Button */}
                <button
                  onClick={() => setIsIngestModalOpen(true)}
                  className="squircle-pill"
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.18)',
                  }}
                >
                  <FileText size={13} />
                  + Ingest Tender
                </button>

                {corridors.length > 0 && (
                  <button
                    onClick={handleClearCorridors}
                    title="Clear all active layers"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px', marginLeft: '6px' }}>
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = '#terms';
                      setCurrentView('terms');
                    }}
                    style={{ color: '#64748b', textDecoration: 'none' }}
                  >
                    Terms
                  </a>
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = '#privacy';
                      setCurrentView('privacy');
                    }}
                    style={{ color: '#64748b', textDecoration: 'none' }}
                  >
                    Privacy
                  </a>
                </div>
              </div>
            </header>

            {/* ── 2. Full-Bleed Map Canvas ── */}
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
              <MapViewer
                corridors={corridors}
                activeCorridor={activeCorridor}
                onSelectCorridor={(c) => setActiveCorridor(c)}
                clashes={clashes}
                onOpenClashModal={(clash) => setSelectedClash(clash)}
                currentMonthKey={currentMonthKey}
                filterByMonth={filterByMonth}
                agencyFilter={agencyFilter}
              />
            </div>

            {/* ── 3. Floating Liquid Glass Squircle Sidebar ── */}
            <aside
              className="liquid-glass squircle-card"
              style={{
                position: 'absolute',
                top: '88px',
                left: '20px',
                bottom: '96px',
                width: '320px',
                zIndex: 900,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                borderRadius: '24px',
                overflow: 'hidden',
              }}
            >
              {/* Sidebar Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={15} color="#0f172a" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Municipal Registry</span>
                </div>
                <span
                  className="squircle-pill"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 9px',
                    background: clashes.length > 0 && !isSynchronized ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)',
                    color: clashes.length > 0 && !isSynchronized ? '#dc2626' : '#16a34a',
                    border: `1px solid ${clashes.length > 0 && !isSynchronized ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'}`,
                  }}
                >
                  {clashes.length > 0 && !isSynchronized ? '1 Conflict' : `${displayedCorridors.length} Plotted`}
                </span>
              </div>

              {/* Agency Segmented Filter */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '4px',
                  background: 'rgba(0,0,0,0.05)',
                  padding: '3px',
                  borderRadius: '12px',
                  marginBottom: '14px',
                }}
              >
                {(['ALL', 'PWD', 'KWA', 'KSEB'] as const).map((ag) => (
                  <button
                    key={ag}
                    onClick={() => setAgencyFilter(ag)}
                    style={{
                      padding: '5px 0',
                      fontSize: '10.5px',
                      fontWeight: agencyFilter === ag ? 700 : 500,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: agencyFilter === ag ? '#ffffff' : 'transparent',
                      color: agencyFilter === ag ? '#0f172a' : '#64748b',
                      boxShadow: agencyFilter === ag ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {ag}
                  </button>
                ))}
              </div>

              {/* Corridor List */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayedCorridors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b', fontSize: '12px' }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>No projects plotted</p>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Click "Load Demo Conflict" above to inspect MG Road.</span>
                  </div>
                ) : (
                  displayedCorridors.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveCorridor(c)}
                      className="squircle-pill"
                      style={{
                        padding: '12px 14px',
                        background: activeCorridor?.tender_id === c.tender_id ? '#ffffff' : 'rgba(255,255,255,0.5)',
                        border: activeCorridor?.tender_id === c.tender_id ? '1px solid rgba(15,23,42,0.2)' : '1px solid rgba(255,255,255,0.4)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        boxShadow: activeCorridor?.tender_id === c.tender_id ? '0 4px 14px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: c.project_type === 'SURFACING' ? '#16a34a' : '#2563eb' }}>
                          {c.project_type}
                        </span>
                        <span style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {c.tender_id}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
                        {c.corridor_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {c.agency_name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* ── 4. Timeline Scrubber (Docked at Bottom) ── */}
            <TimelineScrubber
              currentMonthKey={currentMonthKey}
              onChangeMonth={(month) => setCurrentMonthKey(month)}
              activeClashCount={clashes.length}
              isSynchronized={isSynchronized}
              filterByMonth={filterByMonth}
              onToggleFilter={(f) => setFilterByMonth(f)}
            />
          </motion.div>
        )}

        {currentView === 'terms' && (
          <TermsPage
            key="terms"
            onBack={() => {
              window.location.hash = '';
              setCurrentView('console');
            }}
          />
        )}
        {currentView === 'privacy' && (
          <PrivacyPage
            key="privacy"
            onBack={() => {
              window.location.hash = '';
              setCurrentView('console');
            }}
          />
        )}
      </AnimatePresence>

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

      {/* Conflict Proposal Drawer */}
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
