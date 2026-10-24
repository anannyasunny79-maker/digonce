import React, { useState } from 'react';
import { FileUpload } from './ui/file-upload';
import {
  Play,
  FileText,
  ArrowRight,
  ShieldCheck,
  X
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
  rejectionBanner
}) => {
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pastedContent, setPastedContent] = useState('');

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background:
          'linear-gradient(180deg, rgba(15,23,42,0.40) 0%, rgba(15,23,42,0.60) 50%, rgba(2,6,23,0.85) 100%), url("/bg.jpeg") center/cover no-repeat fixed',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── 1. Top Glass Header (No KMC Ward 62 tag) ── */}
      <header
        style={{
          padding: '18px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={18} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Nna-Than-Kuzhik
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginLeft: '8px', fontWeight: 400 }}>
              Municipal De-confliction Engine
            </span>
          </div>
        </div>

        {/* Right Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onLaunchConsole}
            className="liquid-glass-button squircle-pill"
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Launch Command Center
            <ArrowRight size={13} />
          </button>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
            <a href="#terms" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Terms</a>
            <a href="#privacy" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Centerpiece & Liquid Glass Upload Box ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 24px 60px',
          textAlign: 'center',
          zIndex: 5
        }}
      >
        {/* Rejection Banner */}
        {rejectionBanner?.show && (
          <div
            className="liquid-glass-dark squircle-pill"
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Non-Civil Procurement: <b>{rejectionBanner.category}</b> — Excluded from road cutting grid.</span>
          </div>
        )}

        <h1
          style={{
            fontSize: 'clamp(36px, 5.5vw, 62px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: 1.1,
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.35)'
          }}
        >
          Coordinate Smarter. Build Once.
        </h1>
        <p
          style={{
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            color: 'rgba(255, 255, 255, 0.78)',
            maxWidth: '620px',
            marginTop: '14px',
            lineHeight: 1.5,
            fontWeight: 400
          }}
        >
          AI-powered 4D municipal infrastructure orchestration. Eliminating redundant road trenching across civil utilities before capital is spent.
        </p>

        {/* ── Liquid Glass Squircle Upload Container ── */}
        <div
          className="liquid-glass-dark squircle-card"
          style={{
            width: '100%',
            maxWidth: '640px',
            marginTop: '32px',
            padding: '24px',
            borderRadius: '28px'
          }}
        >
          <div style={{ textAlign: 'left', marginBottom: '14px', paddingLeft: '4px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
              Statutory Document Ingestion
            </span>
          </div>

          {/* Interactive File Dropzone */}
          <FileUpload onChange={(files) => files[0] && onFileUpload(files[0])} />

          {/* Clean Glass Action Row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {/* Apple Liquid Glass Squircle "Load Sample Data" Button */}
            <button
              onClick={onLoadDemoConflict}
              className="liquid-glass-button squircle-pill"
              style={{
                flex: 1.3,
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Play size={10} color="#ffffff" style={{ marginLeft: '1px' }} />
              </div>
              Load Canonical Conflict (MG Road)
            </button>

            {/* Paste Text Snippet Button */}
            <button
              onClick={() => setIsPasteOpen(true)}
              className="liquid-glass-button squircle-pill"
              style={{
                flex: 0.9,
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FileText size={15} color="rgba(255,255,255,0.7)" />
              Paste Circular Text
            </button>
          </div>
        </div>

        {/* Text Snippet Drawer */}
        {isPasteOpen && (
          <div
            className="liquid-glass-dark squircle-card"
            style={{
              width: '100%',
              maxWidth: '640px',
              marginTop: '16px',
              padding: '20px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>Paste Raw Procurement Text</span>
              <button onClick={() => setIsPasteOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <textarea
              rows={4}
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste Kerala PWD or KWA work order text..."
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '12.5px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'monospace'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => {
                  if (pastedContent.trim()) {
                    onPasteText();
                    setIsPasteOpen(false);
                  }
                }}
                className="liquid-glass-button squircle-pill"
                style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#ffffff', cursor: 'pointer' }}
              >
                Extract Parameters →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── 3. Footer Strip (No active conflict / indicator boxes) ── */}
      <footer
        style={{
          padding: '18px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
          zIndex: 10
        }}
      >
        <span>Nna-Than-Kuzhik © 2026 • Municipal Spatial Infrastructure Synchronization</span>
        <span>Advisory Spatial Decision Support</span>
      </footer>
    </div>
  );
};
