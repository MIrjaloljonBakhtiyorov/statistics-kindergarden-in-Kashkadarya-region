import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ChevronRight, Search, Filter, Sparkles,
  TrendingUp, TrendingDown, Users, Activity,
  ArrowUpRight, ShieldAlert, LayoutGrid, Map as MapIcon,
  ArrowLeft, School, Home, Building2, Download, FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { KindergartenType } from '../../types';
import { clsx } from 'clsx';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { kindergartenApi } from '@/shared/api';

const toNumber = (value: unknown) => Number(value || 0);
const attendancePercent = (attended: number, total: number) => total > 0 ? Math.round((attended / total) * 100) : 0;
const normalizeDistrictName = (value: unknown) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[''`]/g, "'")
  .replace(/gРІР‚Вuzor/g, "g'uzor")
  .replace(/gК»uzor/g, "g'uzor")
  .replace(/\s+/g, ' ');
const getRealChildrenCount = (kg: any) => {
  return toNumber(kg.actualChildrenCount ?? kg.actual_children_count ?? kg.childrenCount);
};
const getStaffCount = (kg: any) => {
  return toNumber(kg.staffCount ?? kg.staffcount ?? kg.staff_count);
};
const typeLabels: Record<string, string> = {
  Public: 'Davlat MTT',
  Private: 'Xususiy MTT',
  Home: 'Oilaviy MTT',
};

type DistrictStat = {
  id: string;
  name: string;
  totalMTTs: number;
  totalChildren: number;
  attendedBefore9: number;
  attendedAfter9: number;
  absent: number;
  attendancePercentage: number;
};

const DISTRICT_NAMES = [
  "Qarshi shahri",
  "Qarshi tumani",
  "Shahrisabz shahri",
  "Shahrisabz tumani",
  "Kitob tumani",
  "Koson tumani",
  "Muborak tumani",
  "G'uzor tumani",
  "Nishon tumani",
  "Dehqonobod tumani",
  "Qamashi tumani",
  "Chiroqchi tumani",
  "Kasbi tumani",
  "Mirishkor tumani",
  "Yakkabog' tumani",
  "Beshkent tumani",
];

// в”Ђв”Ђв”Ђ Sparkline в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const Sparkline = ({ color }: { color: string }) => {
  const data = [
    { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 },
    { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 },
  ];
  return (
    <LineChart width={64} height={28} data={data}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
    </LineChart>
  );
};

// в”Ђв”Ђв”Ђ KPI Card в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const KpiCard = ({ title, value, sub, trend, icon: Icon, sparkColor }: any) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden">
    <div className="flex justify-between items-start mb-3">
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
        <Icon size={18} />
      </div>
      <Sparkline color={sparkColor} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
      {trend !== undefined && (
        <span className={clsx("text-[10px] font-bold flex items-center gap-0.5", trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
          {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
  </div>
);

// в”Ђв”Ђв”Ђ District Card в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const DistrictCard = ({ d, onClick }: { d: DistrictStat; onClick: () => void }) => {
  const pct = d.attendancePercentage;
  const isGood = pct >= 88;
  const barColor = pct >= 88 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-rose-500";
  const textColor = pct >= 88 ? "text-emerald-500" : pct >= 80 ? "text-amber-500" : "text-rose-500";
  const topColor = pct >= 88 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-rose-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm cursor-pointer group relative overflow-hidden transition-shadow hover:shadow-lg"
    >
      {/* top color bar */}
      <div className={clsx("h-1 w-full", topColor)} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
              {d.name}
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <MapPin size={8} /> Hududiy boshqaruv
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-indigo-200 group-hover:text-indigo-400 transition-all">
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">MTTlar soni</p>
            <p className="text-xl font-black text-slate-900">{d.totalMTTs}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Davomat</p>
            <p className={clsx("text-xl font-black flex items-center gap-1 justify-end", textColor)}>
              {isGood ? <TrendingUp size={14} /> : <Activity size={14} />}
              {pct}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={clsx("h-full rounded-full", barColor)}
          />
        </div>

        {/* Bolalar / Xavf */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Bolalar</p>
            <p className="text-xs font-black text-emerald-600">{d.totalChildren.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Xavf</p>
            <p className="text-xs font-black text-rose-500">{d.absent.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// в”Ђв”Ђв”Ђ Main Component в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
export const Districts = () => {
  const [selected, setSelected] = useState<DistrictStat | null>(null);
  const [selectedType, setSelectedType] = useState<'Public' | 'Private' | 'Home' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [search, setSearch] = useState('');
  const [aiText, setAiText] = useState('');
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const fullAI = "Tumanlar statistikasi kiritilgan bog'chalar va davomat ma'lumotlari asosida shakllanadi.";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setAiText(fullAI.slice(0, i));
      i++;
      if (i > fullAI.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    kindergartenApi.getAll()
      .then((res) => {
        if (mounted) setKindergartens(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setKindergartens([]);
      });

    return () => { mounted = false; };
  }, []);

  const districtStats = useMemo(() => {
    const statsByDistrict = kindergartens.reduce<Record<string, {
      totalMTTs: number;
      totalChildren: number;
      attendedBefore9: number;
      attendedAfter9: number;
      absent: number;
    }>>((acc, kg) => {
      const key = normalizeDistrictName(kg.district);
      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = {
          totalMTTs: 0,
          totalChildren: 0,
          attendedBefore9: 0,
          attendedAfter9: 0,
          absent: 0,
        };
      }

      acc[key].totalMTTs += 1;
      acc[key].totalChildren += getRealChildrenCount(kg);
      acc[key].attendedBefore9 += toNumber(kg.attendedBefore9);
      acc[key].attendedAfter9 += toNumber(kg.attendedAfter9);
      acc[key].absent += toNumber(kg.absent);

      return acc;
    }, {});

    return DISTRICT_NAMES.map((name, index) => ({
      id: String(index + 1),
      name,
      totalMTTs: statsByDistrict[normalizeDistrictName(name)]?.totalMTTs || 0,
      totalChildren: statsByDistrict[normalizeDistrictName(name)]?.totalChildren || 0,
      attendedBefore9: statsByDistrict[normalizeDistrictName(name)]?.attendedBefore9 || 0,
      attendedAfter9: statsByDistrict[normalizeDistrictName(name)]?.attendedAfter9 || 0,
      absent: statsByDistrict[normalizeDistrictName(name)]?.absent || 0,
      attendancePercentage: (() => {
        const stats = statsByDistrict[normalizeDistrictName(name)];
        return attendancePercent(stats?.attendedBefore9 || 0, stats?.totalChildren || 0);
      })(),
    }));
  }, [kindergartens]);

  const filtered = districtStats.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const total = districtStats.reduce((a, d) => a + d.totalChildren, 0);
  const districtsWithData = districtStats.filter(d => d.totalMTTs > 0 || d.totalChildren > 0 || d.attendedBefore9 > 0 || d.absent > 0);
  const avg = districtsWithData.length > 0 ? Math.round(districtsWithData.reduce((a, d) => a + d.attendancePercentage, 0) / districtsWithData.length) : 0;
  const sorted = [...districtsWithData].sort((a, b) => b.attendancePercentage - a.attendancePercentage);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const selectedKindergartens = selected
    ? kindergartens.filter(kg => normalizeDistrictName(kg.district) === normalizeDistrictName(selected.name))
    : [];
  const selectedTypeStats = {
    Public: selectedKindergartens.filter(kg => kg.type === 'Public'),
    Private: selectedKindergartens.filter(kg => kg.type === 'Private'),
    Home: selectedKindergartens.filter(kg => kg.type === 'Home'),
  };
  const activeTypeKindergartens = selectedType ? selectedTypeStats[selectedType] : [];
  const getTypeAttendance = (items: any[]) => {
    const children = items.reduce((sum, kg) => sum + getRealChildrenCount(kg), 0);
    const attended = items.reduce((sum, kg) => sum + toNumber(kg.attendedBefore9), 0);
    return attendancePercent(attended, children);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Hududlar monitoringi hisoboti", 14, 15);
    (doc as any).autoTable({
      head: [["Hudud", "MTT", "Bolalar", "Davomat"]],
      body: districtStats.map(d => [d.name, d.totalMTTs, d.totalChildren, d.attendancePercentage + "%"]),
      startY: 25,
    });
    doc.save("hududlar.pdf");
  };

  // в”Ђв”Ђ Detail view в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (selected) {
    return (
      <div className="space-y-6 pb-20">
        <button
          onClick={() => {
            setSelected(null);
            setSelectedType(null);
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Tumanlar ro'yxatiga qaytish
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{selected.name}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hududiy muassasalar tahlili</p>
          </div>
          <div className="flex gap-6 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Davomat</p>
              <p className={clsx("text-2xl font-black", selected.attendancePercentage >= 88 ? "text-emerald-600" : "text-amber-500")}>
                {selected.attendancePercentage}%
              </p>
            </div>
            <div className="border-l border-slate-100 pl-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MTTlar</p>
              <p className="text-2xl font-black text-slate-900">{selected.totalMTTs}</p>
            </div>
            <div className="border-l border-slate-100 pl-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bolalar</p>
              <p className="text-2xl font-black text-slate-900">{selected.totalChildren.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { type: KindergartenType.PUBLIC, key: 'Public' as const, icon: Building2, label: "Davlat MTT", count: selectedTypeStats.Public.length, attend: getTypeAttendance(selectedTypeStats.Public), color: "indigo" },
            { type: KindergartenType.PRIVATE, key: 'Private' as const, icon: School, label: "Xususiy MTT", count: selectedTypeStats.Private.length, attend: getTypeAttendance(selectedTypeStats.Private), color: "emerald" },
            { type: KindergartenType.HOME, key: 'Home' as const, icon: Home, label: "Oilaviy MTT", count: selectedTypeStats.Home.length, attend: getTypeAttendance(selectedTypeStats.Home), color: "amber" },
          ].map(cat => (
            <motion.div
              key={cat.type}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedType(cat.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setSelectedType(cat.key);
              }}
              className={clsx(
                "bg-white border rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-lg transition-all group",
                selectedType === cat.key ? "border-indigo-300 ring-4 ring-indigo-50" : "border-slate-100"
              )}
            >
              <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg",
                cat.color === "indigo" ? "bg-indigo-600" : cat.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"
              )}>
                <cat.icon size={24} />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">{cat.label}</h3>
              <div className="flex justify-between items-center mt-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">Muassasalar</span>
                <span className="text-sm font-black text-slate-800">{cat.count} ta</span>
              </div>
              <div className="flex justify-between items-center mt-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">Davomat</span>
                <span className={clsx("text-sm font-black", cat.attend >= 88 ? "text-emerald-600" : "text-amber-500")}>{cat.attend}%</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Batafsil <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedType && (
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{typeLabels[selectedType]} ro'yxati</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {selected.name} bo'yicha {activeTypeKindergartens.length} ta muassasa
                  </p>
                </div>
                <button
                  onClick={() => setSelectedType(null)}
                  className="self-start md:self-auto px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Yopish
                </button>
              </div>

              {activeTypeKindergartens.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {activeTypeKindergartens.map((kg) => (
                    <div key={kg.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_repeat(2,0.55fr)] gap-4 xl:items-center">
                        <div>
                          <p className="text-base font-black text-slate-900 leading-tight">{kg.name || "Nomsiz bog'cha"}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">
                            {kg.directorName ? `Direktor: ${kg.directorName}` : "Direktor kiritilmagan"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Manzil</p>
                          <p className="text-sm font-bold text-slate-700 leading-snug">{kg.address || kg.district || "Manzil kiritilmagan"}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bolalar</p>
                          <p className="text-xl font-black text-slate-900 mt-1">{getRealChildrenCount(kg).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ishchilar</p>
                          <p className="text-xl font-black text-slate-900 mt-1">{getStaffCount(kg).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-black text-slate-500">{typeLabels[selectedType]} topilmadi</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Bu tuman uchun ushbu turdagi bog'cha bazaga kiritilmagan.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // в”Ђв”Ђ Main grid в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  return (
    <div className="space-y-6 pb-20 bg-[#f4f6fb] min-h-screen">

      {/* Header bar */}
      <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Hududiy boshqaruv markazi</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jonli hudud tahlili</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Grid / Map toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'grid' ? "bg-slate-900 text-white shadow" : "text-slate-500")}
            >
              <LayoutGrid size={12} /> Jadval
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'map' ? "bg-slate-900 text-white shadow" : "text-slate-500")}
            >
              <MapIcon size={12} /> Xarita
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hudud qidirish..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-50 transition-all">
            <Filter size={13} />
          </button>

          <button onClick={exportPDF} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Jami bolalar" value={total.toLocaleString()} sub="Bugungi umumiy ko'rsatkich" trend={0} icon={Users} sparkColor="#6366f1" />
        <KpiCard title="Avg Davomat" value={`${avg}%`} sub="Viloyat bo'yicha o'rtacha" trend={0} icon={TrendingUp} sparkColor="#10b981" />
        <KpiCard title="Eng yaxshi" value={best ? best.name.split(' ').slice(0, 2).join(' ') : "Ma'lumot yo'q"} sub={best ? `${best.attendancePercentage}% davomat` : "Real data kutilmoqda"} icon={ArrowUpRight} sparkColor="#6366f1" />
        <KpiCard title="Eng past" value={worst ? worst.name.split(' ').slice(0, 2).join(' ') : "Ma'lumot yo'q"} sub={worst ? `${worst.attendancePercentage}% davomat` : "Real data kutilmoqda"} icon={TrendingDown} sparkColor="#f43f5e" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left: cards or map */}
        <div className="col-span-12 lg:col-span-8">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(d => (
                  <DistrictCard key={d.id} d={d} onClick={() => {
                    setSelected(d);
                    setSelectedType(null);
                  }} />
                ))}
              </motion.div>
            ) : (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm min-h-[500px] flex flex-col items-center justify-center">
                <h3 className="text-xl font-black text-slate-900 mb-2">Interaktiv Xarita</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tez orada qo'shiladi</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

          {/* AI Insights Node */}
          <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col gap-5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-700 border border-white/10 rounded-xl flex items-center justify-center">
                  <Sparkles size={16} className="text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black">AI tahlil markazi</h4>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">District Pulse Analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
              </div>
            </div>

            {/* Typing AI text */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={12} className="text-amber-400" />
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Tizim xavf tekshiruvi</span>
              </div>
              <p className="text-xs font-mono text-slate-200 leading-relaxed min-h-[56px]">
                {aiText}<span className="inline-block w-0.5 h-3 bg-indigo-400 ml-0.5 animate-pulse" />
              </p>
            </div>

            {/* Alert items */}
            <div className="space-y-2 relative z-10">
              {[
                "Davomat ogohlantirishlari real ma'lumotlar asosida shakllanadi.",
                "High Risk holatlari real audit ma'lumotlari asosida ko'rinadi.",
              ].map((msg, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white/5 border border-white/5 rounded-xl p-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <p className="text-[11px] font-medium text-slate-300 leading-snug">{msg}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 relative z-10">
              <button onClick={exportPDF} className="w-full py-3 bg-white text-indigo-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all shadow-xl">
                Analitika PDF yuklash
              </button>
              <button className="w-full py-2.5 bg-indigo-800 text-indigo-200 font-bold text-[9px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all">
                Tizim loglari
              </button>
            </div>
          </div>

          {/* District Performance */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={16} className="text-indigo-500" />
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Hudud samaradorligi</h4>
            </div>
            <div className="space-y-4">
              {sorted.length === 0 && (
                <div className="py-6 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                  Real ma'lumot yo'q
                </div>
              )}
              {sorted.slice(0, 3).map(d => (
                <div key={d.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider truncate mr-2">{d.name}</span>
                    <span className="text-[10px] font-black text-emerald-600 shrink-0">{d.attendancePercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.attendancePercentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">O'rtacha javob vaqti</p>
              <p className="text-xl font-black text-indigo-800">Real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

