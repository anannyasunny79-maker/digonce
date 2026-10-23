import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

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

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '76px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '8px 24px 8px',
        zIndex: 1000,
        color: '#0f172a',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)'
      }}
    >
      {/* Top Status & Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Playback & Step Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              backgroundColor: isPlaying ? '#dc2626' : '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '2px',
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
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
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
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '2px',
              padding: '3px 6px',
              cursor: 'pointer'
            }}
            title="Next Month"
          >
            <ChevronRight size={14} />
          </button>

          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginLeft: '6px' }}>
            {currentMonth.label}
          </div>
        </div>

        {/* Temporal Filter Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
          <span style={{ color: '#64748b' }}>Filter:</span>
          <button
            onClick={() => onToggleFilter(!filterByMonth)}
            style={{
              backgroundColor: filterByMonth ? '#0f172a' : '#f1f5f9',
              color: filterByMonth ? '#ffffff' : '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '2px',
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {filterByMonth ? 'Active Month Only' : 'All Projects'}
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
            backgroundColor: '#e2e8f0',
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
                      ? '#0f172a'
                      : (isDec && !isSynchronized ? '#ef4444' : (isOct ? '#16a34a' : (isNov ? '#d97706' : '#94a3b8'))),
                    border: '1px solid #ffffff',
                    boxShadow: isSelected ? '0 0 6px rgba(15,23,42,0.4)' : 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: '3px'
                  }}
                />

                {/* Month label */}
                <span
                  style={{
                    fontSize: isSelected ? '11px' : '10px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#0f172a' : '#64748b'
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
