import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ChevronUp, ChevronDown, UtensilsCrossed, Droplets, Shield, ClipboardX, Activity, Camera, SearchX } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { districts } from '../constants';

const MAX_BALL = 3100;

const JARIMALAR = [
  { id: 'taomnoma', label: 'Taomnoma', ball: 20, icon: UtensilsCrossed, color: '#dc2626', grad: 'from-red-600 to-red-700' },
  { id: 'gigiyena', label: 'Gigiyena', ball: 15, icon: Droplets, color: '#ea580c', grad: 'from-orange-600 to-orange-700' },
  { id: 'sanitariya', label: 'Sanitariya', ball: 10, icon: Shield, color: '#ca8a04', grad: 'from-yellow-500 to-yellow-700' },
  { id: 'operatsion', label: 'Operatsion', ball: 5, icon: ClipboardX, color: '#7c3aed', grad: 'from-violet-600 to-violet-800' },
  { id: 'davomat', label: 'Davomat', ball: 20, icon: Activity, color: '#1d4ed8', grad: 'from-blue-700 to-indigo-700' },
  { id: 'foto', label: 'Foto-dalil', ball: 5, icon: Camera, color: '#db2777', grad: 'from-pink-600 to-pink-700' },
];

const MTT_TURLARI = [
  { id: 'barchasi', label: 'Barchasi' },
  { id: 'davlat', label: 'Davlat' },
  { id: 'nodavlat', label: 'Nodavlat' },
  { id: 'dxsh', label: 'DXSh' },
  { id: 'oilaviy', label: 'Oilaviy' },
  { id: 'tashkilot', label: 'Tashkilotga qarashli' },
];

const SHAHARLAR = [
  { name: 'Qarshi sh.', short: 'Qarshi sh.' },
  { name: 'Shahrisabz sh.', short: 'Shahrisabz sh.' },
];

const TUMANLAR = [
  { name: 'Qarshi t.', short: 'Qarshi' },
  { name: 'Shahrisabz t.', short: 'Shahrisabz' },
  { name: 'Kitob t.', short: 'Kitob' },
  { name: 'Koson t.', short: 'Koson' },
  { name: 'Muborak t.', short: 'Muborak' },
  { name: "G'uzor t.", short: "G'uzor" },
  { name: 'Nishon t.', short: 'Nishon' },
  { name: 'Dehqonobod t.', short: 'Dehqonobod' },
  { name: 'Qamashi t.', short: 'Qamashi' },
  { name: 'Chiroqchi t.', short: 'Chiroqchi' },
  { name: 'Kasbi t.', short: 'Kasbi' },
  { name: 'Mirishkor t.', short: 'Mirishkor' },
  { name: "Yakkabog' t.", short: "Yakkabog'" },
  { name: "Ko'kdala t.", short: "Ko'kdala" },
];

const TUR_MAP: Record<string, string> = {
  davlat: 'Davlat MTTlar',
  nodavlat: 'Nodavlat xususiy MTTlar',
  dxsh: 'Davlat-xususiy sheriklik asosidagi MTTlar',
  oilaviy: 'Oilaviy nodavlat MTTlar',
  tashkilot: 'Tashkilotga qarashli MTTlar',
};

function getMTTCount(hududName: string, tur: string): number {
  if (tur === 'barchasi') return 10;
  const district = districts.find(d => d.name === hududName);
  if (!district) return 10;
  const typeName = TUR_MAP[tur];
  const found = district.details.types.find(t => t.name === typeName);
  return found ? found.count : 0;
}

function r(n: number) { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); }

function generateMTTsForHudud(hudud: string, tur: string) {
  const realCount = getMTTCount(hudud, tur);
  if (realCount === 0) return [];
  const count = Math.min(realCount, 10);
  const turIdx = MTT_TURLARI.findIndex(t => t.id === tur);
  return Array.from({ length: count }, (_, i) => {
    const seed = hudud.length * 7 + i * 13 + (tur === 'barchasi' ? 0 : turIdx * 5);
    const jarima = Math.round(r(seed) * 900 + r(seed + 2) * 300);
    const ball = Math.max(800, MAX_BALL - jarima);
    return {
      name: `MTT-${hudud.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
      short: `MTT-${String(i + 1).padStart(2, '0')}`,
      ball, jarima,
    };
  });
}

function generateHududData(tur: string) {
  return [...SHAHARLAR, ...TUMANLAR].map((h, i) => {
    const turIdx = MTT_TURLARI.findIndex(t => t.id === tur);
    const seed = i * 17 + (tur === 'barchasi' ? 0 : turIdx * 3);
    const jarima = Math.round(r(seed) * 800 + r(seed + 1) * 400);
    const ball = Math.max(900, MAX_BALL - jarima);
    return { ...h, ball, jarima };
  });
}

function getBallColor(ball: number) {
  const p = (ball / MAX_BALL) * 100;
  if (p >= 90) return '#059669';
  if (p >= 75) return '#1d4ed8';
  if (p >= 60) return '#ea580c';
  return '#dc2626';
}

function getBallGrade(ball: number) {
  const p = (ball / MAX_BALL) * 100;
  if (p >= 90) return { text: 'A+', color: '#059669', bg: '#ecfdf5' };
  if (p >= 75) return { text: 'A', color: '#1d4ed8', bg: '#eff6ff' };
  if (p >= 60) return { text: 'B', color: '#ea580c', bg: '#fff7ed' };
  return { text: 'C', color: '#dc2626', bg: '#fef2f2' };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0f172a] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 min-w-[160px]">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black">{payload[0].value.toLocaleString()} <span className="text-xs text-slate-400">/ {MAX_BALL.toLocaleString()}</span></p>
      </div>
    );
  }
  return null;
};

function Dropdown({ label, items, selected, onSelect }: {
  label: string;
  items: { name: string; short: string }[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const active = items.find(i => i.name === selected);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
          selected ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
        }`}
      >
        {active ? active.short : label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 min-w-[190px] overflow-hidden py-1"
          >
            {selected && (
              <button
                onClick={() => { onSelect(null); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-50 border-b border-slate-50 transition-all"
              >
                ← Barchasi
              </button>
            )}
            {items.map(item => (
              <button
                key={item.name}
                onClick={() => { onSelect(item.name); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                  selected === item.name ? 'bg-[#0f172a] text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MTTReyting() {
  const [selectedTur, setSelectedTur] = useState('barchasi');
  const [selectedShahar, setSelectedShahar] = useState<string | null>(null);
  const [selectedTuman, setSelectedTuman] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const chartData = useMemo(() => {
    const hudud = selectedShahar || selectedTuman;
    return hudud ? generateMTTsForHudud(hudud, selectedTur) : generateHududData(selectedTur);
  }, [selectedShahar, selectedTuman, selectedTur]);

  const sorted = useMemo(() =>
    [...chartData].sort((a, b) => sortDir === 'desc' ? b.ball - a.ball : a.ball - b.ball),
    [chartData, sortDir]
  );

  const activeHudud = selectedShahar || selectedTuman;
  const isEmpty = sorted.length === 0;

  const handleShaharSelect = (name: string | null) => { setSelectedShahar(name); if (name) setSelectedTuman(null); };
  const handleTumanSelect = (name: string | null) => { setSelectedTuman(name); if (name) setSelectedShahar(null); };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            MTT <span className="text-indigo-600">Reyting</span>
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Qashqadaryo viloyati — oylik ball tizimi
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#0f172a] rounded-2xl px-5 py-3.5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Oylik max ball</p>
            <p className="text-2xl font-black text-amber-400 leading-none">{MAX_BALL.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Formula</p>
            <p className="text-sm font-black text-white leading-none">100 × 31 kun</p>
          </div>
        </div>
      </div>

      {/* Jarima metodikasi */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {JARIMALAR.map((j, i) => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${j.grad} flex items-center justify-center shadow-sm`}>
              <j.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{j.label}</p>
              <p className="text-2xl font-black" style={{ color: j.color }}>-{j.ball}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl px-6 py-5 shadow-sm flex flex-wrap items-center gap-6">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Hudud</p>
          <div className="flex gap-2">
            <Dropdown label="Shaharlar" items={SHAHARLAR} selected={selectedShahar} onSelect={handleShaharSelect} />
            <Dropdown label="Tumanlar" items={TUMANLAR} selected={selectedTuman} onSelect={handleTumanSelect} />
          </div>
        </div>

        <div className="w-px h-10 bg-slate-100 hidden md:block" />

        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">MTT turi</p>
          <div className="flex gap-1.5 flex-wrap">
            {MTT_TURLARI.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTur(t.id)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedTur === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {activeHudud && (
          <div className="ml-auto flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3.5 py-2">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">{activeHudud}</span>
            <button onClick={() => { setSelectedShahar(null); setSelectedTuman(null); }} className="text-indigo-300 hover:text-indigo-700 transition-colors font-black text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Chart + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 pt-8 pb-0">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              <span className="text-indigo-600">{activeHudud ?? 'Barcha hududlar'}</span>
              {activeHudud ? ' — MTTlar' : ' natijalari'}
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">
              {isEmpty ? '0' : sorted.length} ta {activeHudud ? 'MTT' : 'hudud'} · Max: {MAX_BALL.toLocaleString()} ball
            </p>
          </div>

          {isEmpty ? (
            <div className="h-72 flex flex-col items-center justify-center gap-4 px-8 pb-8">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <SearchX className="w-7 h-7 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Ma'lumot topilmadi</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">
                  {activeHudud} da {MTT_TURLARI.find(t => t.id === selectedTur)?.label} MTT mavjud emas
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 48 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="short" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 800 }} height={56} angle={-40} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} domain={[0, MAX_BALL]} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                  <Bar dataKey="ball" radius={[8, 8, 4, 4]} barSize={28}>
                    {sorted.map((d, i) => <Cell key={i} fill={getBallColor(d.ball)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Ranking */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Reyting jadvali</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {activeHudud ?? 'Barchasi'} · {MTT_TURLARI.find(t => t.id === selectedTur)?.label}
              </p>
            </div>
            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all"
            >
              {sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              Ball
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[380px]">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 py-12">
                <SearchX className="w-8 h-8 text-slate-200" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ma'lumot topilmadi</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {sorted.map((d, idx) => {
                  const grade = getBallGrade(d.ball);
                  const isTop = idx === 0;
                  const pct = Math.round((d.ball / MAX_BALL) * 100);
                  return (
                    <motion.div
                      key={d.name}
                      layout
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.025 }}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all group cursor-default ${
                        isTop ? 'bg-[#0f172a]' : 'bg-slate-50/60 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isTop ? 'bg-amber-400 text-[#0f172a]' : 'bg-white border border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-black uppercase tracking-tight truncate ${isTop ? 'text-white' : 'text-slate-900'}`}>{d.short}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className={`w-20 h-[3px] rounded-full ${isTop ? 'bg-white/15' : 'bg-slate-100'}`}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isTop ? '#fbbf24' : getBallColor(d.ball) }} />
                          </div>
                          {d.jarima > 0 && <p className="text-[9px] font-bold text-red-400">-{d.jarima}</p>}
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ backgroundColor: grade.bg, color: grade.color }}>{grade.text}</span>
                      <p className="text-sm font-black w-14 text-right shrink-0 tabular-nums" style={{ color: isTop ? '#fbbf24' : getBallColor(d.ball) }}>
                        {d.ball.toLocaleString()}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="px-4 py-4 border-t border-slate-50">
            <div className="grid grid-cols-4 gap-2">
              {[
                { text: 'A+', label: '≥90%', color: '#059669', bg: '#ecfdf5' },
                { text: 'A', label: '75–89%', color: '#1d4ed8', bg: '#eff6ff' },
                { text: 'B', label: '60–74%', color: '#ea580c', bg: '#fff7ed' },
                { text: 'C', label: '<60%', color: '#dc2626', bg: '#fef2f2' },
              ].map(g => (
                <div key={g.text} className="flex flex-col items-center py-2 rounded-xl" style={{ backgroundColor: g.bg }}>
                  <p className="text-sm font-black" style={{ color: g.color }}>{g.text}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{g.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
