import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ChevronRight, Search, Filter, Sparkles,
  TrendingUp, TrendingDown, Activity,
  ArrowUpRight, LayoutGrid, Map as MapIcon,
  ArrowLeft, School, Home, Building2, Download, List
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { KindergartenType } from '../../types';
import { clsx } from 'clsx';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { kindergartenApi } from '@/shared/api';
import { getMahallasByDistrict, type MahallaOption } from '../../data/qashqadaryoMahallas';

const toNumber = (value: unknown) => Number(value || 0);
const attendancePercent = (attended: number, total: number) => total > 0 ? Math.round((attended / total) * 100) : 0;
const normalizeDistrictName = (value: unknown) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\u2018\u2019`]/g, "'")
  .replace(/gРІР‚Вuzor/g, "g'uzor")
  .replace(/gК»uzor/g, "g'uzor")
  .replace(/\./g, '')
  .replace(/\s+/g, ' ');
const getRealChildrenCount = (kg: any) => {
  return toNumber(kg.actualChildrenCount ?? kg.actual_children_count ?? kg.childrenCount);
};
const getStaffCount = (kg: any) => {
  return toNumber(kg.staffCount ?? kg.staffcount ?? kg.staff_count);
};
const normalizeMahallaName = (value: unknown) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\u2018\u2019`]/g, "'")
  .replace(/\s+/g, ' ');
const getKindergartenMahallaCode = (kg: any) => kg.mahallaCode ?? kg.mahalla_code ?? kg.mahallacode;
const typeLabels: Record<string, string> = {
  Public: 'Davlat MTT',
  Private: 'Xususiy MTT',
  Home: 'Oilaviy MTT',
};

type DistrictStat = {
  id: string;
  name: string;
  totalMTTs: number;
  totalMahallas: number;
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
  "Ko'kdala tumani",
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
  <div className="min-h-[148px] bg-gradient-to-br from-white via-white to-slate-50 rounded-2xl border border-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] relative overflow-hidden">
    <div className="absolute inset-x-5 top-0 h-0.5 rounded-full" style={{ backgroundColor: sparkColor }} />
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-100/70" />
    <div className="flex justify-between items-start mb-4 relative">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/70 flex items-center justify-center text-slate-600 shadow-sm">
        <Icon size={18} />
      </div>
      <div className="opacity-90">
        <Sparkline color={sparkColor} />
      </div>
    </div>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 relative">{title}</p>
    <div className="flex items-baseline gap-2 relative">
      <span className="text-[34px] leading-none font-black text-slate-950 tracking-tight">{value}</span>
      {trend !== undefined && trend !== 0 && (
        <span className={clsx("text-[10px] font-bold flex items-center gap-0.5", trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
          {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    {sub && <p className="text-[12px] text-slate-400 font-semibold mt-2.5 relative">{sub}</p>}
  </div>
);

// в”Ђв”Ђв”Ђ District Card в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const DistrictCard = ({ d, onClick }: { d: DistrictStat; onClick: () => void }) => {
  const pct = d.attendancePercentage;
  const isGood = pct >= 88;
  const hasKindergartens = d.totalMTTs > 0;
  const barColor = pct >= 88 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-slate-300";
  const textColor = pct >= 88 ? "text-emerald-500" : pct >= 80 ? "text-amber-500" : "text-slate-500";
  const topColor = hasKindergartens
    ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400"
    : "bg-gradient-to-r from-slate-300 via-slate-200 to-teal-200";
  const iconColor = hasKindergartens
    ? "bg-indigo-50 text-indigo-600 border-indigo-100"
    : "bg-slate-50 text-slate-500 border-slate-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="min-h-[220px] bg-gradient-to-br from-white via-white to-slate-50 rounded-2xl border border-white/80 shadow-[0_16px_40px_rgba(15,23,42,0.08)] cursor-pointer group relative overflow-hidden transition-all hover:shadow-[0_24px_55px_rgba(79,70,229,0.14)] hover:border-indigo-100"
    >
      {/* top color bar */}
      <div className={clsx("h-0.5 w-full", topColor)} />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-slate-100/60 transition-colors group-hover:bg-indigo-50" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={clsx("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", iconColor)}>
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight group-hover:text-indigo-700 transition-colors leading-tight">
                {d.name}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Hududiy boshqaruv
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg border border-slate-200/70 bg-white flex items-center justify-center text-slate-300 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all">
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MTTlar soni</p>
            <p className="text-[30px] font-black text-slate-950 leading-none">{d.totalMTTs}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Davomat</p>
            <p className={clsx("text-2xl font-black flex items-center gap-1 justify-end leading-none", textColor)}>
              {isGood ? <TrendingUp size={14} /> : <Activity size={14} />}
              {pct}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${hasKindergartens ? Math.max(pct, 8) : 0}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={clsx("h-full rounded-full", barColor)}
          />
        </div>

        {/* Mahallalar / Bog'chalar */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/90 rounded-xl p-3 text-center border border-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Mahallalar</p>
            <p className="text-base font-black text-indigo-600">{d.totalMahallas.toLocaleString()}</p>
          </div>
          <div className="bg-white/90 rounded-xl p-3 text-center border border-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Bog'chalar</p>
            <p className="text-base font-black text-emerald-600">{d.totalMTTs.toLocaleString()}</p>
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
  const [selectedMahallaName, setSelectedMahallaName] = useState('');
  const [mahallaDetailOpen, setMahallaDetailOpen] = useState(false);
  const [kindergartenSearch, setKindergartenSearch] = useState('');
  const [kindergartenTypeFilter, setKindergartenTypeFilter] = useState<'all' | 'Public' | 'Private' | 'Home'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [search, setSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [mahallaSearchInput, setMahallaSearchInput] = useState('');
  const [mahallaSearch, setMahallaSearch] = useState('');
  const [mahallaViewMode, setMahallaViewMode] = useState<'cards' | 'list'>('cards');
  const [aiText, setAiText] = useState('');
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const fullAI = "Tumanlar statistikasi kiritilgan bog'chalar va davomat ma'lumotlari asosida shakllanadi.";

  const showAllMahallas = () => {
    setSelectedType(null);
    setMahallaSearchInput('');
    setMahallaSearch('');
    setMahallaDetailOpen(false);
    window.setTimeout(() => {
      document.getElementById('district-mahallas-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

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
      totalMahallas: getMahallasByDistrict(name).length,
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

  const filtered = districtStats.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()));
  const totalKindergartens = districtStats.reduce((a, d) => a + d.totalMTTs, 0);
  const totalMahallas = districtStats.reduce((a, d) => a + d.totalMahallas, 0);
  const districtsWithData = districtStats.filter(d => d.totalMTTs > 0 || d.totalChildren > 0 || d.attendedBefore9 > 0 || d.absent > 0);
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
  const selectedMahallaStats = useMemo(() => {
    if (!selected) return [];

    const knownMahallas = getMahallasByDistrict(selected.name);
    const knownByName = new Map(knownMahallas.map((mahalla) => [normalizeMahallaName(mahalla.name), mahalla]));
    const byMahalla = new Map<string, {
      name: string;
      code?: string;
      kindergartens: any[];
      totalChildren: number;
      attendance: number;
    }>();

    knownMahallas.forEach((mahalla: MahallaOption) => {
      byMahalla.set(mahalla.name, {
        name: mahalla.name,
        code: mahalla.code,
        kindergartens: [],
        totalChildren: 0,
        attendance: 0,
      });
    });

    kindergartens
      .filter(kg => normalizeDistrictName(kg.district) === normalizeDistrictName(selected.name))
      .forEach((kg) => {
        const rawName = String(kg.mahalla || '').trim();
        const known = knownByName.get(normalizeMahallaName(rawName));
        const key = known?.name || rawName || "Mahalla kiritilmagan";
        const current = byMahalla.get(key) || {
          name: key,
          code: known?.code || getKindergartenMahallaCode(kg),
          kindergartens: [] as any[],
          totalChildren: 0,
          attendance: 0,
        };

        current.kindergartens.push(kg);
        current.totalChildren += getRealChildrenCount(kg);
        current.attendance += toNumber(kg.attendedBefore9);
        byMahalla.set(key, current);
      });

    return Array.from(byMahalla.values())
      .map((mahalla) => ({
        ...mahalla,
        attendancePercentage: attendancePercent(mahalla.attendance, mahalla.totalChildren),
      }))
      .sort((a, b) => b.kindergartens.length - a.kindergartens.length || a.name.localeCompare(b.name));
  }, [selected, kindergartens]);
  const selectedMahalla = selectedMahallaStats.find((mahalla) => mahalla.name === selectedMahallaName) || selectedMahallaStats[0];
  const filteredSelectedMahallas = useMemo(() => {
    const query = normalizeMahallaName(mahallaSearch);
    if (!query) return selectedMahallaStats;

    return selectedMahallaStats.filter((mahalla) => {
      const name = normalizeMahallaName(mahalla.name);
      const code = String(mahalla.code || '').toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [selectedMahallaStats, mahallaSearch]);

  useEffect(() => {
    if (!selected) {
      setSelectedMahallaName('');
      return;
    }

    const firstWithMtt = selectedMahallaStats.find((mahalla) => mahalla.kindergartens.length > 0) || selectedMahallaStats[0];
    setSelectedMahallaName(firstWithMtt?.name || '');
  }, [selected?.name, selectedMahallaStats]);

  const filteredMahallaKindergartens = useMemo(() => {
    const items = selectedMahalla?.kindergartens || [];
    const searchValue = kindergartenSearch.trim().toLowerCase();

    return items.filter((kg) => {
      const matchesType = kindergartenTypeFilter === 'all' || kg.type === kindergartenTypeFilter;
      const searchText = [
        kg.name,
        kg.address,
        kg.directorName,
        kg.systemId,
        kg.system_id,
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesType && (!searchValue || searchText.includes(searchValue));
    });
  }, [selectedMahalla, kindergartenSearch, kindergartenTypeFilter]);

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

  if (selected && mahallaDetailOpen) {
    return (
      <div className="space-y-6 pb-20">
        <button
          onClick={() => {
            setMahallaDetailOpen(false);
            setKindergartenSearch('');
            setKindergartenTypeFilter('all');
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Mahallalar sahifasiga qaytish
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{selected.name}</p>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {selectedMahalla?.name || "Mahalla tanlanmagan"} bog'chalari
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {selectedMahalla?.code ? `${selectedMahalla.code} kodi` : "Mahalla kodi mavjud emas"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">MTTlar</p>
                <p className="text-2xl font-black text-indigo-700">{selectedMahalla?.kindergartens.length || 0}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Bolalar</p>
                <p className="text-2xl font-black text-emerald-700">{(selectedMahalla?.totalChildren || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-[1fr_1fr_220px] gap-3 bg-slate-50/60">
            <label className="block">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mahalla filter</span>
              <select
                value={selectedMahallaName}
                onChange={(event) => {
                  setSelectedMahallaName(event.target.value);
                  setKindergartenSearch('');
                  setKindergartenTypeFilter('all');
                }}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              >
                {selectedMahallaStats.map((mahalla) => (
                  <option key={mahalla.code || mahalla.name} value={mahalla.name}>
                    {mahalla.name} - {mahalla.kindergartens.length} MTT
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bog'cha qidirish</span>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={kindergartenSearch}
                  onChange={(event) => setKindergartenSearch(event.target.value)}
                  placeholder="Nomi, manzili yoki direktor..."
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Turi</span>
              <select
                value={kindergartenTypeFilter}
                onChange={(event) => setKindergartenTypeFilter(event.target.value as typeof kindergartenTypeFilter)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="all">Barchasi</option>
                <option value="Public">Davlat MTT</option>
                <option value="Private">Xususiy MTT</option>
                <option value="Home">Oilaviy MTT</option>
              </select>
            </label>
          </div>

          {filteredMahallaKindergartens.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredMahallaKindergartens.map((kg) => (
                <div key={kg.id || kg.systemId || kg.name} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                  <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr_repeat(3,0.55fr)] gap-4 xl:items-center">
                    <div className="min-w-0">
                      <p className="text-base font-black text-slate-900 leading-tight">{kg.name || "Nomsiz bog'cha"}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1">
                        {kg.directorName ? `Direktor: ${kg.directorName}` : "Direktor kiritilmagan"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Manzil</p>
                      <p className="text-sm font-bold text-slate-700 leading-snug">{kg.address || selectedMahalla?.name || "Manzil kiritilmagan"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Turi</p>
                      <p className="text-sm font-black text-slate-900 mt-1">{typeLabels[kg.type] || kg.type || "Kiritilmagan"}</p>
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
            <div className="px-6 py-16 text-center">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <School size={26} />
              </div>
              <p className="text-sm font-black text-slate-500">Bu filter bo'yicha bog'cha topilmadi</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Mahalla, bog'cha nomi yoki turi filterini o'zgartirib ko'ring.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ Detail view в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (selected) {
    return (
      <div className="space-y-6 pb-20">
        <button
          onClick={() => {
            setSelected(null);
            setSelectedType(null);
            setSelectedMahallaName('');
            setMahallaSearchInput('');
            setMahallaSearch('');
            setMahallaDetailOpen(false);
            setKindergartenSearch('');
            setKindergartenTypeFilter('all');
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Tumanlar ro'yxatiga qaytish
        </button>

        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-slate-900">{selected.name}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hududiy muassasalar tahlili</p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMahallaSearch(mahallaSearchInput.trim());
            }}
            className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row 2xl:mx-auto"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={mahallaSearchInput}
                onChange={(event) => setMahallaSearchInput(event.target.value)}
                placeholder="Mahalla nomi yoki kodi..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-bold text-slate-700 shadow-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-indigo-700"
            >
              <Search size={15} />
              Qidirish
            </button>
          </form>

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
              onClick={showAllMahallas}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') showAllMahallas();
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

        {selectedMahallaStats.length > 0 && (
          <div id="district-mahallas-section" className="space-y-5">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Mahallalar</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {selected.name} bo'yicha {selectedMahallaStats.length} ta mahalla. Card ustiga bosing.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-600">
                    <MapPin size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {filteredSelectedMahallas.length}/{selectedMahallaStats.length} ko'rsatildi
                    </span>
                  </div>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setMahallaViewMode('cards')}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                        mahallaViewMode === 'cards' ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-white"
                      )}
                    >
                      <LayoutGrid size={13} />
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setMahallaViewMode('list')}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                        mahallaViewMode === 'list' ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-white"
                      )}
                    >
                      <List size={13} />
                      Ro'yxat
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {mahallaViewMode === 'cards' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {filteredSelectedMahallas.map((mahalla) => {
                      const active = selectedMahalla?.name === mahalla.name;
                      const hasMtt = mahalla.kindergartens.length > 0;
                      return (
                        <motion.button
                          key={`${mahalla.code || mahalla.name}`}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedMahallaName(mahalla.name);
                            setSelectedType(null);
                            setKindergartenSearch('');
                            setKindergartenTypeFilter('all');
                            setMahallaDetailOpen(true);
                          }}
                          className={clsx(
                            "group min-h-[138px] rounded-2xl p-4 text-left border shadow-sm transition-all relative overflow-hidden",
                            active
                              ? "bg-indigo-600 border-indigo-500 text-white ring-4 ring-indigo-100 shadow-lg shadow-indigo-600/20"
                              : "bg-white border-slate-100 text-slate-900 hover:border-indigo-200 hover:shadow-md"
                          )}
                        >
                          <div className={clsx(
                            "absolute right-0 top-0 h-20 w-20 rounded-bl-full transition-colors",
                            active ? "bg-white/10" : hasMtt ? "bg-emerald-50" : "bg-slate-50"
                          )} />
                          <div className="relative flex h-full flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className={clsx(
                                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                  active ? "bg-white/15 text-white" : hasMtt ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                )}>
                                  <MapPin size={17} />
                                </div>
                                <span className={clsx(
                                  "min-w-9 h-8 px-2 rounded-full inline-flex items-center justify-center text-xs font-black",
                                  active ? "bg-white text-indigo-700" : hasMtt ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                )}>
                                  {mahalla.kindergartens.length}
                                </span>
                              </div>
                              <p className={clsx("text-sm font-black leading-snug line-clamp-2", active ? "text-white" : "text-slate-900")}>
                                {mahalla.name}
                              </p>
                              <p className={clsx("text-[10px] font-bold mt-1", active ? "text-indigo-100" : "text-slate-400")}>
                                {mahalla.code ? `${mahalla.code} kodi` : "Kod kiritilmagan"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className={clsx("rounded-xl px-3 py-3 border", active ? "bg-white/10 border-white/10" : "bg-indigo-50 border-indigo-100")}>
                                <p className={clsx("text-[8px] font-black uppercase tracking-widest", active ? "text-indigo-100" : "text-slate-400")}>MTT</p>
                                <p className={clsx("text-xl font-black leading-none mt-1", active ? "text-white" : "text-indigo-700")}>{mahalla.kindergartens.length}</p>
                              </div>
                              <div className={clsx("rounded-xl px-3 py-3 border", active ? "bg-white/10 border-white/10" : "bg-emerald-50 border-emerald-100")}>
                                <p className={clsx("text-[8px] font-black uppercase tracking-widest", active ? "text-indigo-100" : "text-slate-400")}>Bolalar</p>
                                <p className={clsx("text-xl font-black leading-none mt-1", active ? "text-white" : "text-emerald-700")}>{mahalla.totalChildren.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-[minmax(0,1.5fr)_140px_110px_110px_100px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Mahalla</span>
                      <span>Kod</span>
                      <span className="text-center">MTT</span>
                      <span className="text-center">Bolalar</span>
                      <span className="text-right">Ochish</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {filteredSelectedMahallas.map((mahalla) => {
                        const active = selectedMahalla?.name === mahalla.name;
                        const hasMtt = mahalla.kindergartens.length > 0;
                        return (
                          <button
                            key={`${mahalla.code || mahalla.name}-list`}
                            type="button"
                            onClick={() => {
                              setSelectedMahallaName(mahalla.name);
                              setSelectedType(null);
                              setKindergartenSearch('');
                              setKindergartenTypeFilter('all');
                              setMahallaDetailOpen(true);
                            }}
                            className={clsx(
                              "grid w-full grid-cols-1 gap-3 px-4 py-3 text-left transition-all hover:bg-indigo-50/50 md:grid-cols-[minmax(0,1.5fr)_140px_110px_110px_100px] md:items-center",
                              active ? "bg-indigo-50" : "bg-white"
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className={clsx(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                hasMtt ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                              )}>
                                <MapPin size={16} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-900">{mahalla.name}</p>
                                <p className="mt-0.5 text-[10px] font-bold text-slate-400 md:hidden">{mahalla.code ? `${mahalla.code} kodi` : "Kod kiritilmagan"}</p>
                              </div>
                            </div>
                            <span className="hidden text-xs font-black text-slate-500 md:block">{mahalla.code || '-'}</span>
                            <span className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-center text-sm font-black text-indigo-700">{mahalla.kindergartens.length}</span>
                            <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-sm font-black text-emerald-700">{mahalla.totalChildren.toLocaleString()}</span>
                            <span className="inline-flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                              Batafsil <ChevronRight size={13} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredSelectedMahallas.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <p className="text-sm font-black text-slate-500">Mahalla topilmadi</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">Qidiruvni o'zgartiring yoki bo'sh qoldirib Qidirish bosing.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

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
    <div className="space-y-6 pb-20 bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)] min-h-screen">

      {/* Header bar */}
      <div className="bg-white/[0.92] border border-white/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
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
          <div className="flex p-1 bg-slate-100/80 rounded-xl border border-white">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'grid' ? "bg-slate-950 text-white shadow" : "text-slate-500 hover:text-slate-800")}
            >
              <LayoutGrid size={12} /> Jadval
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'map' ? "bg-slate-950 text-white shadow" : "text-slate-500 hover:text-slate-800")}
            >
              <MapIcon size={12} /> Xarita
            </button>
          </div>

          {/* Search */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setDistrictSearch(search.trim());
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hudud qidirish..."
                className="h-10 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-indigo-700"
            >
              <Search size={14} />
              Qidirish
            </button>
          </form>

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={13} />
          </button>

          <button onClick={exportPDF} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-xl text-[10px] font-black hover:from-indigo-700 hover:to-teal-600 transition-all shadow-lg shadow-indigo-600/20">
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Jami bog'chalar" value={totalKindergartens.toLocaleString()} sub="Kiritilgan MTTlar bo'yicha" trend={0} icon={School} sparkColor="#4f46e5" />
        <KpiCard title="Jami mahallalar" value={totalMahallas.toLocaleString()} sub="Kiritilgan hududlar bo'yicha" trend={0} icon={MapPin} sparkColor="#0f766e" />
        <KpiCard title="Eng yaxshi" value={best ? best.name.split(' ').slice(0, 2).join(' ') : "Ma'lumot yo'q"} sub={best ? `${best.attendancePercentage}% davomat` : "Real data kutilmoqda"} icon={ArrowUpRight} sparkColor="#7c3aed" />
        <KpiCard title="Eng past" value={worst ? worst.name.split(' ').slice(0, 2).join(' ') : "Ma'lumot yo'q"} sub={worst ? `${worst.attendancePercentage}% davomat` : "Real data kutilmoqda"} icon={TrendingDown} sparkColor="#64748b" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left: cards or map */}
        <div className="col-span-12 lg:col-span-8">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(d => (
                  <DistrictCard key={d.id} d={d} onClick={() => {
                    setSelected(d);
                    setSelectedType(null);
                    setMahallaSearchInput('');
                    setMahallaSearch('');
                    setMahallaDetailOpen(false);
                    setKindergartenSearch('');
                    setKindergartenTypeFilter('all');
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
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_50%,#0f766e_100%)] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col gap-5 shadow-[0_24px_65px_rgba(15,23,42,0.22)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center">
                  <Sparkles size={16} className="text-teal-200 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-black">AI tahlil markazi</h4>
                  <p className="text-[10px] font-bold text-teal-200/80 uppercase tracking-widest">District Pulse Analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
              </div>
            </div>

            {/* Typing AI text */}
            <div className="bg-white/[0.08] border border-white/10 rounded-xl p-4 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={12} className="text-teal-300" />
                <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Ma'lumotlar sinxron</span>
              </div>
              <p className="text-sm font-mono text-slate-200 leading-relaxed min-h-[64px]">
                {aiText}<span className="inline-block w-0.5 h-3 bg-teal-300 ml-0.5 animate-pulse" />
              </p>
            </div>

            {/* Alert items */}
            <div className="space-y-2 relative z-10">
              {[
                `${totalMahallas.toLocaleString()} ta mahalla bazaga ulangan.`,
                `${totalKindergartens.toLocaleString()} ta bog'cha statistikada hisoblanmoqda.`,
              ].map((msg, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white/[0.07] border border-white/10 rounded-xl p-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-300 mt-1.5 shrink-0" />
                  <p className="text-xs font-semibold text-slate-300 leading-snug">{msg}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 relative z-10">
              <button onClick={exportPDF} className="w-full py-3.5 bg-white text-slate-950 font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-xl">
                Analitika PDF yuklash
              </button>
              <button className="w-full py-3 bg-white/10 text-teal-100 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/15 transition-all border border-white/10">
                Tizim loglari
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

