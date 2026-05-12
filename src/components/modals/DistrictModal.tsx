import React from 'react';
import { motion } from 'motion/react';
import { School, Users, TrendingUp, MapPin } from 'lucide-react';

interface DistrictModalProps {
  district: {
    name: string;
    count: number;
    attendance: number;
    details?: {
      totalChildren3to7: number;
      totalMTT: number;
      totalCoveredChildren: number;
      coveragePercentage: number;
      types: { name: string; count: number; children: number }[];
    };
  } | null;
  x?: number;
  y?: number;
}

const DistrictModal: React.FC<DistrictModalProps> = ({ district, x = 0, y = 0 }) => {
  if (!district) return null;

  const details = district.details;
  const coverage = details?.coveragePercentage ?? district.attendance ?? 0;
  const children = details?.totalChildren3to7 ?? 0;
  const covered = details?.totalCoveredChildren ?? 0;
  const mttCount = details?.totalMTT ?? district.count ?? 0;
  const isCity = district.name.includes('sh.');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 8 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: Math.min(x + 16, window.innerWidth - 280),
        top: Math.min(y - 10, window.innerHeight - 220),
        zIndex: 9999,
        pointerEvents: 'none',
        width: 260,
      }}
    >
      <div style={{
        background: 'rgba(10,14,22,0.96)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}>
        {/* header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isCity ? '#60a5fa' : '#34d399' }} />
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: isCity ? '#60a5fa' : '#34d399' }}>
              {isCity ? 'Shahar' : 'Tuman'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{district.name}</p>
          </div>
        </div>

        {/* stats */}
        <div style={{ padding: '10px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { icon: School, label: 'MTTlar', value: mttCount, accent: '#818cf8' },
              { icon: TrendingUp, label: 'Qamrov', value: `${coverage}%`, accent: '#34d399' },
              { icon: Users, label: '3-7 yosh', value: children.toLocaleString(), accent: '#60a5fa' },
              { icon: Users, label: 'Qamrab', value: covered.toLocaleString(), accent: '#f472b6' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: s.accent }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* coverage bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Qamrov darajasi</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#34d399' }}>{coverage}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(coverage, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 4 }}
              />
            </div>
          </div>
        </div>

        {/* footer hint */}
        <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Batafsil uchun bosing
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DistrictModal;
