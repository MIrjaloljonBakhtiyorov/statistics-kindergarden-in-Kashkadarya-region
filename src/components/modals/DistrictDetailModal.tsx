import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, School, Users, Baby, CheckCircle2,
  MapPin, LayoutGrid, Target, Zap, AlertCircle,
} from 'lucide-react';

type DistrictTypeRow = { name: string; count: number; children: number };
type DistrictDetails = {
  totalChildren3to7: number;
  totalMTT: number;
  totalCoveredChildren: number;
  coveragePercentage: number;
  types: DistrictTypeRow[];
};

interface DistrictDetailModalProps {
  district: any;
  onClose: () => void;
}

const TYPE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'];

const DistrictDetailModal: React.FC<DistrictDetailModalProps> = ({ district, onClose }) => {
  const hasDetails = !!district?.details;
  const details: DistrictDetails = district?.details || {
    totalChildren3to7: 0,
    totalMTT: district?.count || 0,
    totalCoveredChildren: 0,
    coveragePercentage: district?.attendance || 0,
    types: [],
  };
  const isCity = district?.name?.includes('sh.');
  const accentColor = isCity ? '#6366f1' : '#10b981';
  const coverage = details.coveragePercentage;

  return (
    <AnimatePresence>
      {district && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'transparent' }}
          />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9991,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px', pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '100%', maxWidth: 900, height: '80vh', maxHeight: 680,
              display: 'flex', borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset',
              pointerEvents: 'auto',
            }}>

              {/* ── LEFT PANEL ── */}
              <div style={{
                width: 260, flexShrink: 0, position: 'relative',
                background: '#080f1a', display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                {/* glow */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 0, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* close */}
                <div style={{ padding: '20px 20px 0' }}>
                  <button onClick={onClose} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '7px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                  }}>
                    <X style={{ width: 13, height: 13 }} />
                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Yopish</span>
                  </button>
                </div>

                {/* title block */}
                <div style={{ padding: '24px 20px 0', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${accentColor}22`, border: `1px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin style={{ width: 13, height: 13, color: accentColor }} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: accentColor }}>Qashqadaryo</span>
                  </div>

                  <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 6 }}>
                    {district.name}
                  </h2>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    {isCity ? 'Shahar statistikasi' : 'Tuman statistikasi'}
                  </p>

                  {/* big metrics */}
                  <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: "3-7 yoshli bolalar", value: details.totalChildren3to7.toLocaleString(), color: '#60a5fa' },
                      { label: "Qamrab olingan", value: details.totalCoveredChildren.toLocaleString(), color: '#34d399' },
                      { label: "MTT muassasalar", value: details.totalMTT, color: '#a78bfa' },
                    ].map((m, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px' }}>
                        <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 4 }}>{m.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: m.color, letterSpacing: '-0.03em' }}>{m.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* coverage bar */}
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Qamrov darajasi</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: accentColor }}>{coverage}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(coverage, 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${accentColor}99, ${accentColor})`, borderRadius: 6 }}
                    />
                  </div>
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* right header */}
                <div style={{ padding: '20px 28px', background: '#fff', borderBottom: '1px solid #eef0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Batafsil tahlil</h3>
                    <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>Hududiy kengaytirilgan hisobot</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
                    <Zap style={{ width: 12, height: 12, color: '#16a34a' }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Jonli ma'lumot</span>
                  </div>
                </div>

                {/* scrollable body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }} className="custom-scrollbar">
                  {hasDetails ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                      {/* KPI cards */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target style={{ width: 14, height: 14, color: '#6366f1' }} />
                          </div>
                          <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asosiy ko'rsatkichlar</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                          {[
                            { label: '3-7 Yoshli', value: details.totalChildren3to7, suffix: 'nafar', icon: Baby, accent: '#6366f1', bg: '#eef2ff', br: '#e0e7ff' },
                            { label: 'Qamrab olingan', value: details.totalCoveredChildren, suffix: 'nafar', icon: Users, accent: '#10b981', bg: '#f0fdf4', br: '#bbf7d0' },
                            { label: 'Muassasalar', value: details.totalMTT, suffix: 'ta', icon: School, accent: '#8b5cf6', bg: '#faf5ff', br: '#e9d5ff' },
                          ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                              style={{ background: '#fff', border: `1px solid ${s.br}`, borderRadius: 16, padding: '16px' }}>
                              <div style={{ width: 32, height: 32, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                <s.icon style={{ width: 15, height: 15, color: s.accent }} />
                              </div>
                              <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                {s.value.toLocaleString()}
                              </p>
                              <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>{s.label}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* MTT types */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutGrid style={{ width: 14, height: 14, color: '#f59e0b' }} />
                          </div>
                          <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MTT turlari</h4>
                        </div>

                        {/* table header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px', padding: '0 14px 8px', gap: 8 }}>
                          {['Tur nomi', 'Soni', 'Bolalar'].map(h => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{h}</span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {details.types.map((type, i) => {
                            const pct = details.totalCoveredChildren > 0 ? (type.children / details.totalCoveredChildren) * 100 : 0;
                            return (
                              <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 80px 90px', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[i % TYPE_COLORS.length], flexShrink: 0 }} />
                                  <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{type.name}</p>
                                    <div style={{ height: 3, background: '#f1f5f9', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.06 + 0.3, duration: 0.5 }}
                                        style={{ height: '100%', background: TYPE_COLORS[i % TYPE_COLORS.length], borderRadius: 3 }} />
                                    </div>
                                  </div>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', textAlign: 'center' }}>{type.count}</span>
                                <span style={{ fontSize: 14, fontWeight: 900, color: TYPE_COLORS[i % TYPE_COLORS.length], textAlign: 'right' }}>{type.children.toLocaleString()}</span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
                      <div style={{ width: 56, height: 56, background: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle style={{ width: 28, height: 28, color: '#cbd5e1' }} />
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{"Ma'lumotlar to'ldirilmoqda"}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', maxWidth: 260, textAlign: 'center' }}>Ushbu hudud bo'yicha ma'lumotlar yaqin orada kiritiladi.</p>
                    </div>
                  )}
                </div>

                {/* footer */}
                <div style={{ padding: '16px 28px', background: '#fff', borderTop: '1px solid #eef0f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{"Ma'lumotlar yangilangan"}</span>
                  </div>
                  <button onClick={onClose} style={{
                    padding: '10px 24px', background: '#0f172a', color: '#fff',
                    border: 'none', borderRadius: 12, fontSize: 10, fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <X style={{ width: 12, height: 12 }} />
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DistrictDetailModal;
