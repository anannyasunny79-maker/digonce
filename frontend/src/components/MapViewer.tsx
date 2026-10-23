import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface JunctionInfo {
  name: string;
  latitude: number;
  longitude: number;
}

export interface CorridorRecord {
  id?: number;
  tender_id: string;
  agency_name: string;
  project_type: string;
  corridor_name: string;
  start_junction: JunctionInfo;
  end_junction: JunctionInfo;
  effective_start_date?: string;
  effective_end_date?: string;
  projected_start_date?: string;
  projected_end_date?: string;
  dlp_months?: number;
  subsurface_depth_meters?: number;
  status?: string;
  geometry: any;
  route_metrics?: {
    length_meters?: number;
    length_km?: number;
    node_count?: number;
  };
}

interface MapViewerProps {
  corridors: CorridorRecord[];
  activeCorridor: CorridorRecord | null;
  onSelectCorridor?: (c: CorridorRecord) => void;
  clashes: any[];
  onOpenClashModal?: (clash: any) => void;
  currentMonthKey?: string;
  filterByMonth?: boolean;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  corridors,
  activeCorridor,
  onSelectCorridor,
  clashes,
  onOpenClashModal,
  currentMonthKey,
  filterByMonth = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Central Kochi (MG Road & Padma Junction)
    const map = L.map(mapContainerRef.current, {
      center: [9.9754, 76.2828],
      zoom: 14,
      zoomControl: true
    });

    // Clean standard OpenStreetMap style without watermark
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const featureGroup = L.featureGroup().addTo(map);
    layersGroupRef.current = featureGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map features whenever corridors, clashes, or timeline month changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Check if there is an active clash on the corridor
    const hasActiveClash = clashes.length > 0;
    const primaryClash = clashes[0];
    const isSynchronized = primaryClash?.is_synchronized || primaryClash?.severity === 'RESOLVED_JOINT_WINDOW';

    // Determine temporal state based on currentMonthKey
    // In October: PWD Resurfacing active (Green)
    // In November: PWD completed, entering DLP warranty (Amber)
    // In December / Jan: KWA Trenching commences -> Snaps to Crimson Red Clash
    let isClashActiveInTimeline = false;
    if (hasActiveClash && !isSynchronized) {
      if (!filterByMonth || currentMonthKey === '2026-12' || currentMonthKey === '2027-01') {
        isClashActiveInTimeline = true;
      }
    }

    // Filter corridors if filterByMonth is active
    let displayCorridors = corridors;
    if (filterByMonth && currentMonthKey) {
      displayCorridors = corridors.filter(c => {
        const start = c.effective_start_date || c.projected_start_date || '2026-10-01';
        const end = c.effective_end_date || c.projected_end_date || '2027-01-15';
        const startMonth = start.substring(0, 7);
        const endMonth = end.substring(0, 7);
        return currentMonthKey >= startMonth && currentMonthKey <= endMonth;
      });

      // Also include PWD under DLP in November if KWA hasn't started
      if (currentMonthKey === '2026-11' && displayCorridors.length === 0) {
        displayCorridors = corridors.filter(c => c.project_type === 'SURFACING');
      }
    }

    if (displayCorridors.length === 0 && corridors.length > 0 && filterByMonth) {
      // If nothing directly active in that month, show lighter baseline
      displayCorridors = corridors;
    }

    const bounds = L.latLngBounds([]);

    // 1. Draw Overlap Geometry / Clash Layer if Clash is Active
    if (isClashActiveInTimeline && primaryClash?.overlap_geometry) {
      const clashGeoLayer = L.geoJSON(primaryClash.overlap_geometry, {
        style: {
          color: '#dc2626',
          weight: 8,
          opacity: 0.95,
          dashArray: '10, 6'
        }
      });

      clashGeoLayer.bindPopup(`
        <div style="font-family: -apple-system, sans-serif; font-size: 12.5px; line-height: 1.4; min-width: 260px;">
          <div style="display: flex; align-items: center; gap: 6px; color: #dc2626; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">
            <span>⚠️ CRITICAL 4D CLASH DETECTED</span>
          </div>
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${primaryClash.corridor_name} &bull; ${primaryClash.overlap_length_meters}m Overlap
          </div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 6px;">
            <b>PWD Road Resurfacing</b> breached by <b>KWA Pipeline Trenching</b> within 36-Month Warranty.
          </div>
          <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 6px 10px; border-radius: 2px; margin-bottom: 8px;">
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #b91c1c;">
              Avoidable Restoration Cost
            </div>
            <div style="font-size: 15px; font-weight: 900; color: #dc2626;">
              ${primaryClash.avoidable_restoration_cost_formatted || '₹38,40,000'}
            </div>
          </div>
          <button id="btn-popup-inspect" style="width: 100%; background-color: #dc2626; color: white; border: none; padding: 6px 10px; font-weight: 700; border-radius: 2px; cursor: pointer; font-size: 11px;">
            Inspect & Auto-Resolve Conflict →
          </button>
        </div>
      `);

      clashGeoLayer.on('popupopen', () => {
        const btn = document.getElementById('btn-popup-inspect');
        if (btn && onOpenClashModal) {
          btn.onclick = () => onOpenClashModal(primaryClash);
        }
      });

      clashGeoLayer.on('click', () => {
        if (onOpenClashModal) onOpenClashModal(primaryClash);
      });

      group.addLayer(clashGeoLayer);
    }

    // 2. Render Corridors
    corridors.forEach((corr) => {
      const isSelected = activeCorridor?.tender_id === corr.tender_id;

      // Color logic:
      // If synchronized -> Electric Blue
      // If clash active on MG Road in timeline -> Crimson Red
      // Else -> Green for Surfacing, Blue for Pipeline
      let strokeColor = '#475569';
      let strokeWidth = 5;
      let strokeDash = undefined;

      if (isSynchronized) {
        strokeColor = '#0284c7'; // Electric Blue
        strokeWidth = 7;
      } else if (isClashActiveInTimeline && corr.corridor_name.includes('MG Road')) {
        strokeColor = '#ef4444'; // Crimson Red Clash
        strokeWidth = 7;
        strokeDash = '8, 6';
      } else if (corr.project_type === 'SURFACING') {
        strokeColor = currentMonthKey === '2026-11' ? '#f59e0b' : '#16a34a'; // Emerald Green / Warranty Amber
        strokeWidth = 5;
      } else if (corr.project_type === 'PIPELINE') {
        strokeColor = '#2563eb'; // Royal Blue
        strokeWidth = 5;
      }

      if (isSelected) {
        strokeWidth += 2;
      }

      if (corr.geometry) {
        const geoLayer = L.geoJSON(corr.geometry as any, {
          style: {
            color: strokeColor,
            weight: strokeWidth,
            opacity: 0.9,
            dashArray: strokeDash
          }
        });

        geoLayer.bindPopup(`
          <div style="font-family: -apple-system, sans-serif; font-size: 12px; line-height: 1.4; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-weight: 700; color: #0f172a;">${corr.tender_id}</span>
              <span style="font-size: 10px; font-weight: 700; color: ${strokeColor};">${corr.project_type}</span>
            </div>
            <div style="font-size: 11px; color: #475569;">${corr.agency_name}</div>
            <div style="margin-top: 4px; font-weight: 600;">${corr.corridor_name}</div>
            <div style="color: #64748b; font-size: 11px;">${corr.start_junction.name} &rarr; ${corr.end_junction.name}</div>
            <div style="margin-top: 4px; font-size: 11px; color: #334155;">
              <b>Window:</b> ${corr.effective_start_date || corr.projected_start_date} to ${corr.effective_end_date || corr.projected_end_date}
            </div>
            ${corr.subsurface_depth_meters ? `<div style="font-size: 10.5px; color: #64748b;">Depth: ${corr.subsurface_depth_meters}m</div>` : ''}
            ${corr.dlp_months ? `<div style="font-size: 10.5px; color: #d97706; font-weight: 600;">Defect Liability Period: ${corr.dlp_months} Mos</div>` : ''}
          </div>
        `);

        geoLayer.on('click', () => {
          if (isClashActiveInTimeline && onOpenClashModal && primaryClash) {
            onOpenClashModal(primaryClash);
          } else if (onSelectCorridor) {
            onSelectCorridor(corr);
          }
        });

        group.addLayer(geoLayer);
      }

      // Add Start Marker Pin
      if (corr.start_junction && typeof corr.start_junction.latitude === 'number' && !isNaN(corr.start_junction.latitude)) {
        const startIcon = L.divIcon({
          className: 'custom-pin-icon',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: #0284c7; color: white; padding: 2px 6px; font-size: 9.5px; font-weight: 700; border-radius: 2px; white-space: nowrap; border: 1px solid #0369a1; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                ${corr.start_junction.name || 'Start'}
              </div>
              <div style="width: 8px; height: 8px; background-color: #0284c7; border: 2px solid #ffffff; border-radius: 50%; margin-top: -2px;"></div>
            </div>
          `,
          iconSize: [80, 28],
          iconAnchor: [40, 22]
        });

        const startMarker = L.marker([corr.start_junction.latitude, corr.start_junction.longitude], {
          icon: startIcon
        });
        group.addLayer(startMarker);
        bounds.extend([corr.start_junction.latitude, corr.start_junction.longitude]);
      }

      // Add End Marker Pin
      if (corr.end_junction && typeof corr.end_junction.latitude === 'number' && !isNaN(corr.end_junction.latitude)) {
        const endIcon = L.divIcon({
          className: 'custom-pin-icon',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: #dc2626; color: white; padding: 2px 6px; font-size: 9.5px; font-weight: 700; border-radius: 2px; white-space: nowrap; border: 1px solid #b91c1c; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                ${corr.end_junction.name || 'End'}
              </div>
              <div style="width: 8px; height: 8px; background-color: #dc2626; border: 2px solid #ffffff; border-radius: 50%; margin-top: -2px;"></div>
            </div>
          `,
          iconSize: [80, 28],
          iconAnchor: [40, 22]
        });

        const endMarker = L.marker([corr.end_junction.latitude, corr.end_junction.longitude], {
          icon: endIcon
        });
        group.addLayer(endMarker);
        bounds.extend([corr.end_junction.latitude, corr.end_junction.longitude]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    }
  }, [corridors, activeCorridor, clashes, currentMonthKey, filterByMonth]);

  const hasActiveClash = clashes.length > 0;
  const primaryClash = clashes[0];
  const isSynchronized = primaryClash?.is_synchronized || primaryClash?.severity === 'RESOLVED_JOINT_WINDOW';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Map Status Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 900,
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '2px',
          padding: '8px 12px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '3px', backgroundColor: '#16a34a' }} />
          <span style={{ color: '#334155', fontWeight: 600 }}>PWD Paving (Oct)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '3px', backgroundColor: '#2563eb' }} />
          <span style={{ color: '#334155', fontWeight: 600 }}>KWA Water Main (Dec)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '4px', backgroundColor: '#dc2626' }} />
          <span style={{ color: '#dc2626', fontWeight: 700 }}>Active Clash</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '4px', backgroundColor: '#0284c7' }} />
          <span style={{ color: '#0284c7', fontWeight: 700 }}>Synchronized (Locked)</span>
        </div>
      </div>

      {/* Floating Clash Alert Badge with Grounded Economic Quantification (₹38,40,000) */}
      {hasActiveClash && !isSynchronized && (
        <div
          onClick={() => onOpenClashModal && onOpenClashModal(primaryClash)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 900,
            backgroundColor: '#ffffff',
            border: '2px solid #dc2626',
            borderRadius: '2px',
            padding: '10px 14px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(220,38,38,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'pulse 2s infinite'
          }}
        >
          <div style={{ backgroundColor: '#fee2e2', padding: '8px', borderRadius: '50%' }}>
            <ShieldAlert size={20} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 800, color: '#dc2626', letterSpacing: '0.04em' }}>
              Statutory Conflict Detected &bull; MG Road
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Avoidable Restoration Cost: <span style={{ color: '#dc2626' }}>{primaryClash.avoidable_restoration_cost_formatted || '₹38,40,000'}</span>
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              Click to Inspect & Auto-Resolve via Depth Hierarchy &rarr;
            </div>
          </div>
        </div>
      )}

      {/* Floating Synchronized Success Badge */}
      {isSynchronized && (
        <div
          onClick={() => onOpenClashModal && onOpenClashModal(primaryClash)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 900,
            backgroundColor: '#ffffff',
            border: '2px solid #0284c7',
            borderRadius: '2px',
            padding: '10px 14px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2,132,199,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '50%' }}>
            <CheckCircle2 size={20} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 800, color: '#0284c7', letterSpacing: '0.04em' }}>
              Electric Blue Locked &bull; Joint Sync Active
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              ₹38,40,000 Reconstruction Waste Prevented
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              Click to view Mayoral Proposal & Sign-off Audit Trail &rarr;
            </div>
          </div>
        </div>
      )}

      {/* Active Corridor Card */}
      {activeCorridor && !hasActiveClash && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '20px',
            zIndex: 900,
            backgroundColor: '#ffffff',
            border: '1px solid #0f172a',
            borderRadius: '2px',
            padding: '12px 16px',
            width: '340px',
            boxShadow: '0 4px 12px rgba(15,23,42,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span className="badge badge-pipeline" style={{ fontSize: '10px' }}>
              {activeCorridor.project_type}
            </span>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
              {activeCorridor.tender_id}
            </span>
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
            {activeCorridor.corridor_name}
          </h3>
          <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
            {activeCorridor.agency_name}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', fontSize: '10.5px' }}>
            <div>
              <div style={{ color: '#64748b' }}>Extent:</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                {activeCorridor.start_junction.name} &rarr; {activeCorridor.end_junction.name}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Length:</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                {activeCorridor.route_metrics?.length_km || 1.28} km
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
