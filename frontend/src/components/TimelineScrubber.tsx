import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Calendar, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface TimelineMonth {
  key: string;       // e.g. "2026-10"
  label: string;     // e.g. "Oct 2026"
  shortName: string; // e.g. "Oct"
  year: number;
}

export const TIMELINE_MONTHS: TimelineMonth[] = [
  { key: '2026-01', label: 'January 2026', shortName: 'Jan', year: 2026 },
  { key: '2026-02', label: 'February 2026', shortName: 'Feb', year: 2026 },
  { key: '2026-03', label: 'March 2026', shortName: 'Mar', year: 2026 },
  { key: '2026-04', label: 'April 2026', shortName: 'Apr', year: 2026 },
  { key: '2026-05', label: 'May 2026', shortName: 'May', year: 2026 },
  { key: '2026-06', label: 'June 2026', shortName: 'Jun', year: 2026 },
  { key: '2026-07', label: 'July 2026', shortName: 'Jul', year: 2026 },
  { key: '2026-08', label: 'August 2026', shortName: 'Aug', year: 2026 },
  { key: '2026-09', label: 'September 2026', shortName: 'Sep', year: 2026 },
  { key: '2026-10', label: 'October 2026', shortName: 'Oct', year: 2026 },
  { key: '2026-11', label: 'November 2026', shortName: 'Nov', year: 2026 },
  { key: '2026-12', label: 'December 2026', shortName: 'Dec', year: 2026 },
  { key: '2027-01', label: 'January 2027', shortName: 'Jan 27', year: 2027 }
];

interface TimelineScrubberProps {
  currentMonthKey: string;
  onChangeMonth: (monthKey: string) => void;
  activeClashCount: number;
  isSynchronized?: boolean;
  filterByMonth: boolean;
  onToggleFilter: (filter: boolean) => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentMonthKey,
  onChangeMonth,
  activeClashCount,
  isSynchronized = false,
  filterByMonth,
  onToggleFilter
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const currentIndex = Math.max(0, TIMELINE_MONTHS.findIndex(m => m.key === currentMonthKey));

  // Auto-play animation through months
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onChangeMonth(TIMELINE_MONTHS[(currentIndex + 1) % TIMELINE_MONTHS.length].key);
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, onChangeMonth]);

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + TIMELINE_MONTHS.length) % TIMELINE_MONTHS.length;
    onChangeMonth(TIMELINE_MONTHS[nextIdx].key);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % TIMELINE_MONTHS.length;
    onChangeMonth(TIMELINE_MONTHS[nextIdx].key);
  };

  const currentMonth = TIMELINE_MONTHS[currentIndex] || TIMELINE_MONTHS[9];

  // Derive civil engineering status message based on active month
  let statusBadge = {
    text: 'Baseline Municipal Planning Window',
    color: '#64748b',
    bgColor: '#f1f5f9',
    icon: <Calendar size={13} color="#64748b" />
  };

  if (isSynchronized) {
    statusBadge = {
      text: 'Synchronized Joint Infrastructure Window Locked (KWA Pipes Oct-Nov → PWD Paving Nov-Dec)',
      color: '#0284c7',
      bgColor: '#e0f2fe',
      icon: <CheckCircle2 size={13} color="#0284c7" />
    };
  } else if (currentMonthKey === '2026-10') {
    statusBadge = {
      text: 'Phase A Active: Kerala PWD Road Resurfacing on MG Road (Paving Course underway)',
      color: '#16a34a',
      bgColor: '#dcfce7',
      icon: <CheckCircle2 size={13} color="#16a34a" />
    };
  } else if (currentMonthKey === '2026-11') {
    statusBadge = {
      text: 'Phase A Completed: PWD 36-Month Defect Liability Period (DLP Statutory Warranty Activated)',
      color: '#d97706',
      bgColor: '#fef3c7',
      icon: <ShieldAlert size={13} color="#d97706" />
    };
  } else if (currentMonthKey === '2026-12' || currentMonthKey === '2027-01') {
    if (activeClashCount > 0) {
      statusBadge = {
        text: 'CRITICAL CLASH: KWA Water Main Trenching breaches PWD 36-Month Statutory Warranty! (Destruction of New Asphalt)',
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: <AlertOctagon size={13} color="#dc2626" />
      };
    } else {
      statusBadge = {
        text: 'Phase B Active: Kerala Water Authority Water Main Replacement',
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <Calendar size={13} color="#0284c7" />
      };
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '84px',
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '8px 24px 10px',
        zIndex: 1000,
        color: '#ffffff',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
      }}
    >
      {/* Top Status & Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Playback & Step Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              backgroundColor: isPlaying ? '#ef4444' : '#38bdf8',
              color: isPlaying ? '#ffffff' : '#0f172a',
              border: 'none',
              borderRadius: '3px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={isPlaying ? 'Pause 4D Timeline' : 'Play 4D Timeline Animation'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY 4D'}</span>
          </button>

          <button
            onClick={handlePrev}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #475569',
              borderRadius: '2px',
              padding: '3px 6px',
              cursor: 'pointer'
            }}
            title="Previous Month"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            onClick={handleNext}
            style={{
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #475569',
              borderRadius: '2px',
              padding: '3px 6px',
              cursor: 'pointer'
            }}
            title="Next Month"
          >
            <ChevronRight size={14} />
          </button>

          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginLeft: '6px' }}>
            {currentMonth.label}
          </div>
        </div>

        {/* Civil Operations Real-time Status Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: statusBadge.bgColor,
            color: statusBadge.color,
            padding: '3px 10px',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 600,
            border: `1px solid ${statusBadge.color}40`,
            maxWidth: '650px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {statusBadge.icon}
          <span>{statusBadge.text}</span>
        </div>

        {/* Temporal Filter Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>Filter Mode:</span>
          <button
            onClick={() => onToggleFilter(!filterByMonth)}
            style={{
              backgroundColor: filterByMonth ? '#0284c7' : '#334155',
              color: '#ffffff',
              border: 'none',
              borderRadius: '2px',
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {filterByMonth ? 'Month Active Only' : 'All Projects Plotted'}
          </button>
        </div>

      </div>

      {/* Interactive Month Tick Scrubber Slider */}
      <div style={{ position: 'relative', width: '100%', marginTop: '6px' }}>
        
        {/* Track Line */}
        <div
          style={{
            position: 'absolute',
            top: '7px',
            left: '0',
            right: '0',
            height: '3px',
            backgroundColor: '#334155',
            borderRadius: '2px'
          }}
        />

        {/* Key Milestone Highlights on Track (Oct - Dec) */}
        <div
          style={{
            position: 'absolute',
            top: '7px',
            left: `${(9 / (TIMELINE_MONTHS.length - 1)) * 100}%`,
            width: `${(3 / (TIMELINE_MONTHS.length - 1)) * 100}%`,
            height: '3px',
            backgroundColor: isSynchronized ? '#0284c7' : '#ef4444',
            opacity: 0.85
          }}
          title="Critical Conflict Zone (Oct-Dec 2026)"
        />

        {/* Month Markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          {TIMELINE_MONTHS.map((m, idx) => {
            const isSelected = idx === currentIndex;
            const isOct = m.key === '2026-10';
            const isNov = m.key === '2026-11';
            const isDec = m.key === '2026-12';

            return (
              <div
                key={m.key}
                onClick={() => onChangeMonth(m.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                {/* Tick dot */}
                <div
                  style={{
                    width: isSelected ? '14px' : '9px',
                    height: isSelected ? '14px' : '9px',
                    borderRadius: '50%',
                    backgroundColor: isSelected
                      ? '#38bdf8'
                      : (isDec && !isSynchronized ? '#ef4444' : (isOct ? '#22c55e' : (isNov ? '#f59e0b' : '#64748b'))),
                    border: isSelected ? '2px solid #ffffff' : '1px solid #0f172a',
                    boxShadow: isSelected ? '0 0 10px #38bdf8' : 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: '4px'
                  }}
                />

                {/* Month label */}
                <span
                  style={{
                    fontSize: isSelected ? '11px' : '10px',
                    fontWeight: isSelected ? 700 : (isOct || isNov || isDec ? 600 : 400),
                    color: isSelected ? '#38bdf8' : (isDec ? '#f87171' : (isOct ? '#86efac' : '#94a3b8'))
                  }}
                >
                  {m.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
