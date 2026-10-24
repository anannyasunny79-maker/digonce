import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  ShieldAlert
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  title: string;
  description: string;
  keyTakeaway: string;
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'ingest-tender',
    targetSelector: '#tour-ingest-tender',
    badge: 'NLP Ingestion & Triage',
    badgeColor: '#7c3aed',
    icon: Sparkles,
    title: 'Step 1 · Automated Tender Ingestion & Gatekeeping',
    description:
      'Upload statutory municipal tender notices (PDF) or paste raw text snippets. Dig-Once uses LLM document intelligence to classify civil works versus non-civil contracts (filtering supplies and leases) while extracting corridor bounds, subsurface depths, and schedules with verifiable quote spans.',
    keyTakeaway: 'Filters non-civil tenders while extracting exact spatial & depth parameters.',
    preferredPlacement: 'bottom'
  },
  {
    id: 'municipal-registry',
    targetSelector: '#tour-municipal-registry',
    badge: 'Inter-Agency Layers',
    badgeColor: '#2563eb',
    icon: Layers,
    title: 'Step 2 · Multi-Agency Municipal Registry',
    description:
      'Inspect active, scheduled, and proposed public works across Kerala PWD (roads), Kerala Water Authority (water mains), and KSEB (power ducts). Filter corridors by executing agency to monitor inter-departmental Right-of-Way demands in a unified municipal grid.',
    keyTakeaway: 'Brings independent departmental siloes into one shared Right-of-Way register.',
    preferredPlacement: 'right'
  },
  {
    id: 'map-corridor',
    targetSelector: '#tour-map-corridor',
    badge: 'PostGIS Spatial Grid',
    badgeColor: '#059669',
    icon: MapPin,
    title: 'Step 3 · Centerline Routing & 8m Safety Buffers',
    description:
      'Corridors are routed along actual street centerlines using OpenStreetMap graph topologies (OSMnx) rather than straight Euclidean lines. PostGIS automatically generates 8-meter safety buffer polygons to evaluate physical trenching overlaps along shared roadways.',
    keyTakeaway: 'True street centerlines prevent false positives and calculate real trench overlaps.',
    preferredPlacement: 'center'
  },
  {
    id: 'timeline-scrubber',
    targetSelector: '#tour-timeline-scrubber',
    badge: '36-Month DLP Compliance',
    badgeColor: '#ea580c',
    icon: Clock,
    title: 'Step 4 · 4D Spatio-Temporal Timeline & DLP Audit',
    description:
      'Scrub through execution months to simulate temporal clashes. While PWD resurfaces in Oct-Nov 2026, KWA\'s planned December trenching violates Kerala\'s statutory 36-month Defect Liability Period (DLP) warranty on newly laid asphalt.',
    keyTakeaway: 'Flags warranty breaches before physical asphalt destruction occurs.',
    preferredPlacement: 'top'
  },
  {
    id: 'clash-badge',
    targetSelector: '#tour-clash-badge',
    badge: 'KPWD Rate Quantification',
    badgeColor: '#dc2626',
    icon: ShieldAlert,
    title: 'Step 5 · Avoidable Cost & Depth-Hierarchy Resequencing',
    description:
      'The collision engine calculates ₹38,40,000 in avoidable road restoration waste using Kerala PWD Schedules of Rates. Clicking "Resolve & Syndicate" automatically re-sequences schedules by depth hierarchy (KWA 1.8m pipes first, PWD wearing course second)—locking the corridor into Electric Blue synchronized harmony with a verifiable Mayor audit trail.',
    keyTakeaway: 'Turns conflict into scheduled joint execution with 100% cost savings.',
    preferredPlacement: 'left'
  }
];

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepIndex: number, step: TourStep) => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  isOpen,
  onClose,
  onStepChange
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStepIdx];

  // Update target bounding box
  const updateTargetRect = useCallback(() => {
    if (!isOpen) return;
    const currentStep = TOUR_STEPS[currentStepIdx];
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // Fallback rect if element is not in DOM (e.g. center)
      setTargetRect(null);
    }
  }, [isOpen, currentStepIdx]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  // Notify parent on step change
  useEffect(() => {
    if (isOpen) {
      onStepChange?.(currentStepIdx, TOUR_STEPS[currentStepIdx]);
    }
  }, [currentStepIdx, isOpen, onStepChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStepIdx < TOUR_STEPS.length - 1) {
          setCurrentStepIdx((prev) => prev + 1);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIdx > 0) {
          setCurrentStepIdx((prev) => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIdx, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  // Compute tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const cardWidth = 420;
    const cardHeight = 280;
    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!targetRect || step.preferredPlacement === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 10001
      };
    }

    let top = 0;
    let left = 0;

    switch (step.preferredPlacement) {
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
        break;
      case 'top':
        top = targetRect.top - cardHeight - padding;
        left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2;
        left = targetRect.right + padding;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - cardHeight / 2;
        left = targetRect.left - cardWidth - padding;
        break;
    }

    // Clamp inside viewport
    left = Math.max(16, Math.min(left, viewportWidth - cardWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - cardHeight - 16));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      maxWidth: 'calc(100vw - 32px)',
      zIndex: 10001
    };
  };

  const IconComponent = step.icon;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'auto' }}>
      {/* ── 1. Spotlight Cutout Backdrop ── */}
      {targetRect && (
        <motion.div
          key={step.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          style={{
            position: 'fixed',
            borderRadius: '18px',
            border: '2px solid #38bdf8',
            boxShadow:
              '0 0 0 9999px rgba(9, 13, 22, 0.72), 0 0 30px rgba(56, 189, 248, 0.45), inset 0 0 16px rgba(56, 189, 248, 0.15)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Dim overlay if no targetRect */}
      {!targetRect && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 13, 22, 0.72)',
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* ── 2. Tour Floating Tooltip Card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={getTooltipStyle()}
          className="liquid-glass squircle-card"
        >
          <div
            style={{
              padding: '20px 22px 18px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Header: Step Pill & Close */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#0284c7',
                    backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    padding: '3px 9px',
                    borderRadius: '12px'
                  }}
                >
                  Step {currentStepIdx + 1} of {TOUR_STEPS.length}
                </span>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: step.badgeColor,
                    backgroundColor: `${step.badgeColor}15`,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <IconComponent size={12} color={step.badgeColor} />
                  {step.badge}
                </span>
              </div>

              <button
                onClick={onClose}
                title="Exit walkthrough (Esc)"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.3,
                margin: 0,
                letterSpacing: '-0.01em'
              }}
            >
              {step.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '12.5px',
                color: '#475569',
                lineHeight: 1.55,
                margin: 0
              }}
            >
              {step.description}
            </p>

            {/* Key takeaway highlight box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '11.5px',
                color: '#334155',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <CheckCircle size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Takeaway:</strong> {step.keyTakeaway}
              </div>
            </div>

            {/* Footer Navigation & Progress */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid #f1f5f9',
                marginTop: '4px'
              }}
            >
              {/* Step indicator dots */}
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {TOUR_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentStepIdx(idx)}
                    style={{
                      height: '6px',
                      width: idx === currentStepIdx ? '22px' : '6px',
                      borderRadius: '4px',
                      backgroundColor: idx === currentStepIdx ? '#0284c7' : '#cbd5e1',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={onClose}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 10px'
                  }}
                >
                  Skip
                </button>

                {currentStepIdx > 0 && (
                  <button
                    onClick={handleBack}
                    style={{
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>
                )}

                <button
                  onClick={handleNext}
                  style={{
                    backgroundColor: currentStepIdx === TOUR_STEPS.length - 1 ? '#059669' : '#0f172a',
                    border: 'none',
                    color: '#ffffff',
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.18)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{currentStepIdx === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
