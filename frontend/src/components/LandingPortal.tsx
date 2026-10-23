import React, { useState } from 'react';
import { FileUpload } from './ui/file-upload';
import {
  Layers,
  ShieldAlert,
  GitMerge,
  IndianRupee,
  Zap,
  FileText,
  ArrowRight,
  MapPin,
  Circle,
} from 'lucide-react';

interface LandingPortalProps {
  onFileUpload: (file: File) => void;
  onLoadDemoConflict: () => void;
  onPasteText: () => void;
  onLaunchConsole: () => void;
  rejectionBanner?: { show: boolean; category: string } | null;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({
  onFileUpload,
  onLoadDemoConflict,
  onPasteText,
  onLaunchConsole,
  rejectionBanner,
}) => {
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) onFileUpload(files[0]);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        background:
          'linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.96) 60%, rgba(2,6,23,1) 100%), url("https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=80") center/cover no-repeat',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(51,65,85,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(51,65,85,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* ── HEADER NAV ── */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid rgba(51,65,85,0.4)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(15,23,42,0.5)',
        }}
      >
        {/* Left: Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Road-curve glyph badge */}
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1.5px solid rgba(148,163,184,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(30,41,59,0.8)',
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M4 20 Q8 4 20 4"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="4" cy="20" r="2" fill="#38bdf8" />
              <circle cx="20" cy="4" r="2" fill="#ef4444" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#f8fafc',
                lineHeight: 1,
              }}
            >
              DigOnce AI
            </div>
            <div
              style={{
                fontSize: '10px',
                color: '#64748b',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              Municipal Infrastructure De-confliction
            </div>
          </div>
        </div>

        {/* Right: Ward badge + Launch button + links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Ward badge with green pulse */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: 'rgba(30,41,59,0.9)',
              border: '1px solid rgba(51,65,85,0.7)',
              padding: '5px 12px',
              borderRadius: '3px',
              fontSize: '11px',
              color: '#94a3b8',
            }}
          >
            <div style={{ position: 'relative', display: 'flex' }}>
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  animation: 'portal-pulse 2s ease-in-out infinite',
                }}
              />
            </div>
            <MapPin size={11} color="#64748b" />
            <span>Kochi Municipal Corporation (KMC) · Ward 62</span>
          </div>

          {/* Launch Command Center button */}
          <button
            onClick={onLaunchConsole}
            style={{
              backgroundColor: 'rgba(30,41,59,0.9)',
              border: '1px solid rgba(71,85,105,0.7)',
              color: '#e2e8f0',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'rgba(51,65,85,0.9)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'rgba(30,41,59,0.9)')
            }
          >
            Launch Command Center
            <ArrowRight size={13} />
          </button>

          <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px' }}>
            <a href="#terms" style={{ color: '#475569', textDecoration: 'none' }}>
              Terms
            </a>
            <a href="#privacy" style={{ color: '#475569', textDecoration: 'none' }}>
              Privacy
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO CENTERPIECE ── */}
      <main
        style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '64px',
          paddingBottom: '32px',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        {/* Emblem */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '1.5px solid rgba(148,163,184,0.25)',
            backgroundColor: 'rgba(15,23,42,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: '0 0 40px rgba(56,189,248,0.08)',
          }}
        >
          <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
            <circle cx="20" cy="20" r="18" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
            <circle cx="20" cy="20" r="12" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
            <path
              d="M8 32 Q14 8 32 8"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="8" cy="32" r="2.5" fill="#38bdf8" />
            <circle cx="32" cy="8" r="2.5" fill="#ef4444" />
          </svg>
        </div>

        {/* Rejection banner */}
        {rejectionBanner?.show && (
          <div
            style={{
              marginBottom: '20px',
              backgroundColor: 'rgba(120,53,15,0.3)',
              border: '1px solid rgba(217,119,6,0.4)',
              borderRadius: '3px',
              padding: '10px 18px',
              fontSize: '12.5px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '640px',
              textAlign: 'center',
            }}
          >
            <ShieldAlert size={15} color="#f59e0b" />
            Non-Civil Tender:{' '}
            <strong>{rejectionBanner.category}</strong> — Excluded from RoW Grid. Only
            physical road-cut tenders are eligible.
          </div>
        )}

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '14px',
          }}
        >
          Coordinate Smarter.{' '}
          <span style={{ color: '#e2e8f0', fontWeight: 300 }}>Build Once.</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(13px, 1.4vw, 15px)',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '580px',
            lineHeight: '1.7',
            marginBottom: '44px',
          }}
        >
          AI-powered spatio-temporal roadwork coordination to eliminate redundant road cutting
          across PWD, KWA, and KSEB — enforcing the Dig-Once statutory mandate across Kochi's
          municipal corridors.
        </p>

        {/* ── GLASSMORPHIC UPLOAD CARD ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            backgroundColor: 'rgba(15,23,42,0.75)',
            border: '1px solid rgba(51,65,85,0.7)',
            borderRadius: '6px',
            padding: '28px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#475569',
              marginBottom: '14px',
            }}
          >
            Ingest Tender Document
          </div>

          <FileUpload onChange={handleFileChange} />

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '20px 0 18px',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(51,65,85,0.5)' }} />
            <span style={{ fontSize: '11px', color: '#334155', whiteSpace: 'nowrap' }}>
              or quick-start
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(51,65,85,0.5)' }} />
          </div>

          {/* Demo fast-path row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Primary: Load sample conflict */}
            <button
              onClick={onLoadDemoConflict}
              style={{
                flex: 1,
                backgroundColor: 'rgba(220,38,38,0.12)',
                border: '1px solid rgba(220,38,38,0.35)',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'rgba(220,38,38,0.22)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'rgba(220,38,38,0.12)')
              }
            >
              <Zap size={14} />
              Load Sample Conflict: MG Road PWD vs KWA
            </button>

            {/* Secondary: Paste text */}
            <button
              onClick={() => setIsPasteOpen(true)}
              style={{
                backgroundColor: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(51,65,85,0.6)',
                color: '#94a3b8',
                padding: '10px 16px',
                borderRadius: '4px',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'rgba(51,65,85,0.7)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'rgba(30,41,59,0.7)')
              }
            >
              <FileText size={14} />
              Paste Raw Text Circular
            </button>
          </div>
        </div>

        {/* ── BOTTOM FEATURE STRIP ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '900px',
            marginTop: '52px',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: '16px',
            alignItems: 'stretch',
          }}
        >
          {/* Left: Smart City Ready */}
          <div
            style={{
              backgroundColor: 'rgba(15,23,42,0.65)',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: '4px',
              padding: '18px 20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#e2e8f0',
                letterSpacing: '0.04em',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              <Circle size={8} color="#22c55e" fill="#22c55e" />
              Smart City Ready
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              Statutory Right-of-Way coordination aligned with Kerala PWD Defect Liability Period
              norms and KMC Dig-Once Policy 2026.
            </p>
          </div>

          {/* Center: 4 indicators */}
          <div
            style={{
              backgroundColor: 'rgba(15,23,42,0.65)',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: '4px',
              padding: '18px 24px',
              backdropFilter: 'blur(10px)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
            }}
          >
            {[
              { Icon: Layers, label: 'Layered Asset Ingestion', sub: 'PWD · KWA · KSEB · KMC' },
              { Icon: ShieldAlert, label: '4D Moratorium Clashes', sub: 'Spatio-temporal detection' },
              { Icon: GitMerge, label: 'Depth Hierarchy Order', sub: 'Pipe-first sequencing' },
              { Icon: IndianRupee, label: 'Avoidable Cost Prevention', sub: 'KPWD SoR quantification' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '3px',
                    border: '1px solid rgba(51,65,85,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: 'rgba(15,23,42,0.6)',
                  }}
                >
                  <Icon size={14} color="#64748b" />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#cbd5e1' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px' }}>
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Active Conflict Preview Card */}
          <div
            onClick={onLoadDemoConflict}
            style={{
              backgroundColor: 'rgba(15,23,42,0.65)',
              border: '1px solid rgba(51,65,85,0.5)',
              borderRadius: '4px',
              padding: '18px 20px',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(220,38,38,0.4)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(51,65,85,0.5)')
            }
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#dc2626',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  animation: 'portal-pulse 1.5s ease-in-out infinite',
                }}
              />
              Active Corridor Conflict
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginBottom: '2px' }}>
              MG Road
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
              Jos Junction → Padma Junction
            </div>
            <div
              style={{
                backgroundColor: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '3px',
                padding: '7px 10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#f87171', fontWeight: 600 }}>
                Avoidable Cost at Risk
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444' }}>
                ₹38.40 Lakhs
              </div>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Inspect Clash <ArrowRight size={11} />
            </div>
          </div>
        </div>
      </main>

      {/* ── PASTE TEXT DRAWER ── */}
      {isPasteOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2,6,23,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(51,65,85,0.7)',
              borderRadius: '6px',
              padding: '28px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                  Paste Raw Tender Circular
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  Copy and paste any PWD / KWA / KSEB work circular text
                </div>
              </div>
              <button
                onClick={() => setIsPasteOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '20px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste tender text here — e.g. PWD G.O. reference, KWA work order, KSEB RoW application..."
              style={{
                width: '100%',
                height: '220px',
                backgroundColor: 'rgba(2,6,23,0.8)',
                border: '1px solid rgba(51,65,85,0.6)',
                borderRadius: '4px',
                color: '#e2e8f0',
                fontSize: '12.5px',
                padding: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                lineHeight: '1.6',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setIsPasteOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(51,65,85,0.6)',
                  color: '#64748b',
                  padding: '8px 18px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pasteText.trim()) {
                    setIsPasteOpen(false);
                    onPasteText();
                  }
                }}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(71,85,105,0.7)',
                  color: '#e2e8f0',
                  padding: '8px 18px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              >
                Analyse Circular →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes portal-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
};
