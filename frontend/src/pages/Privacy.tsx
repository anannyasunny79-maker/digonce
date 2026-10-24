import React from 'react';
import { Shield, ArrowLeft, Lock, Database, EyeOff, FileText } from 'lucide-react';

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background:
          'linear-gradient(180deg, rgba(15,23,42,0.50) 0%, rgba(15,23,42,0.85) 100%), url("/bg.jpeg") center/cover no-repeat fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* ── Liquid Glass Squircle Container ── */}
      <div
        className="liquid-glass squircle-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          padding: '40px 48px',
          borderRadius: '32px',
          position: 'relative'
        }}
      >
        {/* Top Breadcrumb & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <button
            onClick={onBack}
            className="liquid-glass-button squircle-pill"
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={13} />
            Return to Console
          </button>

          <span
            className="squircle-pill"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
              background: 'rgba(0,0,0,0.04)',
              padding: '4px 12px'
            }}
          >
            Statutory Document • Oct 2026
          </span>
        </div>

        {/* Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(15,23,42,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield size={24} color="#0f172a" />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Privacy & Data Policy
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
              Governance framework for municipal tender ingestion and spatial telemetry.
            </p>
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '24px 0 28px' }} />

        {/* Sections Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {[
            {
              icon: Database,
              title: '1. Ingestion of Public Procurement Notices',
              text: 'Nna-Than-Kuzhik operates exclusively on publicly accessible municipal e-procurement gazettes, statutory Right-of-Way (RoW) permit queues, and open geographic layers. The system does not harvest, store, or profile confidential private citizen records.'
            },
            {
              icon: EyeOff,
              title: '2. Personal Identity Non-Retention',
              text: 'Administrative user sessions are strictly sandboxed. Engineering access credentials and official municipal emails are utilized solely for audit logging of joint synchronization proposals under the Kerala Highway Protection Act.'
            },
            {
              icon: Lock,
              title: '3. Model Inference & Non-Training Guarantees',
              text: 'Statutory tender documents processed via partner LLM inference endpoints operate under zero-retention enterprise agreements. Public sector civil specifications are never utilized for model training or commercial data syndication.'
            },
            {
              icon: FileText,
              title: '4. Immutable Audit Ledger',
              text: 'Draft synchronization proposals and cost avoidance calculations are cryptographically hashed (e.g., KOCHI-SYNC-...) to preserve inter-agency transparency between PWD, KWA, KSEB, and municipal executive leadership.'
            }
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="squircle-pill"
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Icon size={16} color="#0f172a" />
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {title}
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0, paddingLeft: '26px' }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
