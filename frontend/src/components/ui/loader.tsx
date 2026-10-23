import React from 'react';

interface LoaderProps {
  title: string;
  subtitle: string;
}

export const MunicipalLoader: React.FC<LoaderProps> = ({ title, subtitle }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#020617',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Concentric ring animation */}
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '40px' }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: `${i * 14}px`,
              border: `1.5px solid rgba(148, 163, 184, ${0.12 + i * 0.08})`,
              borderRadius: '50%',
              borderTopColor: `rgba(226, 232, 240, ${0.5 - i * 0.08})`,
              animation: `municipal-spin ${1.2 + i * 0.4}s linear infinite`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        ))}
        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            inset: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '50%',
            opacity: 0.9,
          }}
        />
      </div>

      {/* Stage text */}
      <div style={{ textAlign: 'center', maxWidth: '420px', padding: '0 24px' }}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#f1f5f9',
            letterSpacing: '0.02em',
            marginBottom: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'all 0.4s ease',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#64748b',
            lineHeight: '1.6',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'all 0.4s ease',
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: '48px',
          width: '280px',
          height: '1px',
          backgroundColor: 'rgba(51, 65, 85, 0.8)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: '#94a3b8',
            borderRadius: '1px',
            animation: 'municipal-progress 4.5s ease-in-out forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes municipal-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes municipal-progress {
          0% { width: 0%; }
          30% { width: 35%; }
          60% { width: 68%; }
          100% { width: 97%; }
        }
      `}</style>
    </div>
  );
};
