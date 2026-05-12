import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Activity, School, TrendingUp } from 'lucide-react';
import { districts } from '../../constants';
import DistrictModal from '../modals/DistrictModal';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

interface KashkadaryaMapProps {
  selectedDistrict: string | null;
  setSelectedDistrict: (name: string | null) => void;
}

// Har tuman markazi koordinatasi
const DISTRICT_CENTERS: { name: string; lat: number; lng: number }[] = [
  { name: "Muborak t.",     lat: 38.68, lng: 64.08 },
  { name: "Koson t.",       lat: 38.68, lng: 65.10 },
  { name: "Ko'kdala t.",    lat: 39.05, lng: 65.70 },
  { name: "Chiroqchi t.",   lat: 38.92, lng: 66.55 },
  { name: "Kitob t.",       lat: 39.12, lng: 66.90 },
  { name: "Qarshi sh.",     lat: 38.87, lng: 65.79 },
  { name: "Qarshi t.",      lat: 38.58, lng: 65.70 },
  { name: "Qamashi t.",     lat: 38.62, lng: 66.52 },
  { name: "Shahrisabz sh.", lat: 39.05, lng: 66.83 },
  { name: "Shahrisabz t.",  lat: 38.72, lng: 67.00 },
  { name: "Kasbi t.",       lat: 38.58, lng: 64.52 },
  { name: "Mirishkor t.",   lat: 38.22, lng: 63.98 },
  { name: "Nishon t.",      lat: 38.02, lng: 64.78 },
  { name: "G'uzor t.",      lat: 38.08, lng: 65.68 },
  { name: "Yakkabog' t.",   lat: 38.30, lng: 66.28 },
  { name: "Dehqonobod t.",  lat: 38.10, lng: 66.92 },
];

function createPinIcon(color: string, isSelected: boolean, isCity: boolean) {
  const size = isSelected ? 38 : isCity ? 30 : 26;
  const svg = `
    <svg width="${size}" height="${size * 1.3}" viewBox="0 0 30 39" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <path d="M15 0C7.28 0 1 6.28 1 14c0 9.5 14 25 14 25S29 23.5 29 14C29 6.28 22.72 0 15 0z"
        fill="${color}" filter="url(#shadow)" opacity="${isSelected ? 1 : 0.88}"/>
      <circle cx="15" cy="13" r="5.5" fill="white" opacity="0.95"/>
      ${isSelected ? `<circle cx="15" cy="13" r="3" fill="${color}"/>` : ''}
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size * 1.3],
    iconAnchor: [size / 2, size * 1.3],
    popupAnchor: [0, -size * 1.3],
  });
}

function coverageColor(pct: number): string {
  if (pct >= 80) return '#34d399';
  if (pct >= 65) return '#fbbf24';
  if (pct >= 50) return '#fb923c';
  return '#f87171';
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([[37.85, 63.7], [39.35, 67.4]], { padding: [30, 30] });
  }, [map]);
  return null;
}

function MapClickHandler({ onClose }: { onClose: () => void }) {
  useMapEvents({ click: onClose });
  return null;
}

const KashkadaryaMap: React.FC<KashkadaryaMapProps> = ({ selectedDistrict, setSelectedDistrict }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const closeModal = useCallback(() => {
    setSelectedDistrict(null);
    setHoveredDistrict(null);
  }, [setSelectedDistrict]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeModal]);

  const getDistrictData = useCallback((name: string) => {
    return districts.find(s => s.name === name) || { count: 0, attendance: 0 };
  }, []);

  const totalMTT = districts.reduce((s, d) => s + (d.count || 0), 0);
  const avgCoverage = Math.round(districts.reduce((s, d) => s + (d.attendance || 0), 0) / districts.length);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div className="w-full h-full flex flex-col" onMouseMove={handleMouseMove}>

      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
            <MapPin className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-1">Interaktiv xarita</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Qashqadaryo — <span className="text-indigo-600">tumanlar xaritasi</span>
            </h2>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { icon: MapPin,     label: 'Tumanlar',    value: 16,              color: '#6366f1', bg: '#eef2ff' },
            { icon: School,     label: 'Jami MTT',    value: totalMTT,        color: '#10b981', bg: '#f0fdf4' },
            { icon: Activity,   label: "O'rt qamrov", value: `${avgCoverage}%`, color: '#f59e0b', bg: '#fffbeb' },
            { icon: TrendingUp, label: 'Tanlangan',   value: selectedDistrict ?? '—', color: '#8b5cf6', bg: '#f5f3ff' },
          ].map((s, i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid #e8eaf0', borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <s.icon style={{ width:15, height:15, color:s.color }} />
              </div>
              <div>
                <p style={{ fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#94a3b8', marginBottom:2 }}>{s.label}</p>
                <p style={{ fontSize:13, fontWeight:900, color:'#0f172a', lineHeight:1, maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex:1, minHeight:0, borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
        <MapContainer
          center={[38.6, 65.8]}
          zoom={8}
          style={{ width:'100%', height:'100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          {/* Dark tile */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <FitBounds />
          <MapClickHandler onClose={() => { setSelectedDistrict(null); setHoveredDistrict(null); }} />

          {DISTRICT_CENTERS.map((d) => {
            const info = getDistrictData(d.name);
            const cov = (info as any).attendance || 0;
            const mtt = (info as any).count || 0;
            const isSelected = selectedDistrict === d.name;
            const isCity = d.name.includes('sh.');
            const color = coverageColor(cov);
            const icon = createPinIcon(color, isSelected, isCity);

            return (
              <Marker
                key={d.name}
                position={[d.lat, d.lng]}
                icon={icon}
                eventHandlers={{
                  mouseover: (e) => {
                    setHoveredDistrict({ name: d.name, count: mtt, attendance: cov, details: (info as any).details });
                    setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
                  },
                  mousemove: (e) => {
                    setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
                  },
                  mouseout: () => {
                    setHoveredDistrict(null);
                    setSelectedDistrict(null);
                  },
                  click: (e) => {
                    setSelectedDistrict(isSelected ? null : d.name);
                    setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
                  },
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredDistrict && (
          <DistrictModal district={hoveredDistrict} x={mousePos.x} y={mousePos.y} />
        )}
      </AnimatePresence>

      {/* Selected pill */}
      <AnimatePresence>
        {selectedDistrict && (
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:9000 }}
          >
            <div style={{ background:'rgba(15,23,42,0.95)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:22, padding:'8px 20px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
              <MapPin style={{ width:13, height:13, color:'#818cf8' }} />
              <span style={{ fontSize:12, fontWeight:900, color:'#fff' }}>{selectedDistrict}</span>
              <div style={{ width:1, height:16, background:'rgba(255,255,255,0.15)' }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>
                {(getDistrictData(selectedDistrict) as any).count || 0} MTT · {(getDistrictData(selectedDistrict) as any).attendance || 0}%
              </span>
              <button onClick={() => setSelectedDistrict(null)}
                style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, padding:'3px 10px', color:'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer' }}>✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KashkadaryaMap;
