import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ChevronRight, Search, Filter, Sparkles,
  TrendingUp, TrendingDown, Activity,
  ArrowUpRight, LayoutGrid, Map as MapIcon,
  ArrowLeft, School, Home, Building2, Download, List, ShieldCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { clsx } from 'clsx';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { kindergartenApi } from '@/shared/api';
import { KINDERGARTEN_TYPES, KINDERGARTEN_TYPE_LABELS, type KindergartenTypeValue } from '@/shared/lib/kindergartenTypes';
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
const typeLabels: Record<string, string> = KINDERGARTEN_TYPE_LABELS;
const typeCardMeta: Record<string, { icon: any; color: string }> = {
  Public: { icon: Building2, color: 'indigo' },
  Private: { icon: School, color: 'emerald' },
  PPP: { icon: ShieldCheck, color: 'teal' },
  Home: { icon: Home, color: 'amber' },
  Organization: { icon: LayoutGrid, color: 'sky' },
};
const typeAccentClass = (color: string) => {
  if (color === 'emerald') return 'bg-emerald-500';
  if (color === 'teal') return 'bg-teal-500';
  if (color === 'amber') return 'bg-amber-500';
  if (color === 'sky') return 'bg-sky-500';
  return 'bg-indigo-600';
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
  <div className="min-h-[136px] rounded-2xl border border-white/10 bg-[#181b1c] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.22)] relative overflow-hidden">
    <div className="absolute inset-x-4 top-0 h-px rounded-full" style={{ backgroundColor: sparkColor }} />
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.035]" />
    <div className="flex justify-between items-start mb-3 relative">
      <div className="w-9 h-9 rounded-xl bg-white/[0.045] border border-white/10 flex items-center justify-center text-slate-200 shadow-sm">
        <Icon size={18} />
      </div>
      <div className="opacity-90">
        <Sparkline color={sparkColor} />
      </div>
    </div>
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.14em] mb-1.5 relative">{title}</p>
    <div className="flex items-baseline gap-2 relative">
      <span className="text-[30px] leading-none font-black text-white tracking-tight">{value}</span>
      {trend !== undefined && trend !== 0 && (
        <span className={clsx("text-[10px] font-bold flex items-center gap-0.5", trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
          {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    {sub && <p className="text-[10px] text-slate-300/85 font-semibold mt-2 relative">{sub}</p>}
  </div>
);

// в”Ђв”Ђв”Ђ District Card в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const DistrictCard = ({ d, onClick }: { d: DistrictStat; onClick: () => void }) => {
  const pct = d.attendancePercentage;
  const isGood = pct >= 88;
  const hasKindergartens = d.totalMTTs > 0;
  const barColor = pct >= 88 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-slate-500";
  const textColor = pct >= 88 ? "text-emerald-400" : pct >= 80 ? "text-amber-400" : "text-slate-300";
  const topColor = hasKindergartens
    ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400"
    : "bg-gradient-to-r from-slate-600 via-slate-500 to-teal-500";
  const iconColor = hasKindergartens
    ? "bg-indigo-500/15 text-indigo-300 border-indigo-400/20"
    : "bg-white/[0.045] text-slate-300 border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="min-h-[206px] rounded-2xl border border-white/10 bg-[#181b1c] shadow-[0_16px_40px_rgba(0,0,0,0.22)] cursor-pointer group relative overflow-hidden transition-all hover:border-emerald-400/25 hover:shadow-[0_24px_55px_rgba(0,0,0,0.34)]"
    >
      {/* top color bar */}
      <div className={clsx("h-0.5 w-full", topColor)} />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/[0.035] transition-colors group-hover:bg-emerald-400/[0.06]" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={clsx("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", iconColor)}>
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-black text-white uppercase tracking-[0.06em] group-hover:text-emerald-200 transition-colors leading-tight">
                {d.name}
              </h3>
              <p className="text-[9px] font-black text-slate-300/80 uppercase tracking-widest mt-1">
                Hududiy boshqaruv
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.035] flex items-center justify-center text-slate-300 shadow-sm group-hover:border-emerald-400/25 group-hover:text-white transition-all">
            <ChevronRight size={14} />
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">MTTlar soni</p>
            <p className="text-[28px] font-black text-white leading-none">{d.totalMTTs}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Davomat</p>
            <p className={clsx("text-[22px] font-black flex items-center gap-1 justify-end leading-none", textColor)}>
              {isGood ? <TrendingUp size={14} /> : <Activity size={14} />}
              {pct}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${hasKindergartens ? Math.max(pct, 8) : 0}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={clsx("h-full rounded-full", barColor)}
          />
        </div>

        {/* Mahallalar / Bog'chalar */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/[0.045] rounded-xl p-3 text-center border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Mahallalar</p>
            <p className="text-[15px] font-black text-indigo-300">{d.totalMahallas.toLocaleString()}</p>
          </div>
          <div className="bg-white/[0.045] rounded-xl p-3 text-center border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Bog'chalar</p>
            <p className="text-[15px] font-black text-emerald-300">{d.totalMTTs.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// в”Ђв”Ђв”Ђ Main Component в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
export const Districts = () => {
  const [selected, setSelected] = useState<DistrictStat | null>(null);
  const [selectedType, setSelectedType] = useState<KindergartenTypeValue | null>(null);
  const [selectedMahallaName, setSelectedMahallaName] = useState('');
  const [mahallaDetailOpen, setMahallaDetailOpen] = useState(false);
  const [kindergartenSearch, setKindergartenSearch] = useState('');
  const [kindergartenTypeFilter, setKindergartenTypeFilter] = useState<'all' | KindergartenTypeValue>('all');
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
  const selectedTypeStats = KINDERGARTEN_TYPES.reduce<Record<KindergartenTypeValue, any[]>>((acc, type) => {
    acc[type.value] = selectedKindergartens.filter(kg => kg.type === type.value);
    return acc;
  }, {} as Record<KindergartenTypeValue, any[]>);
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
      <div className="districts-dark space-y-6 pb-20 bg-[#0b0f10] text-white">
        <button
          onClick={() => {
            setMahallaDetailOpen(false);
            setKindergartenSearch('');
            setKindergartenTypeFilter('all');
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Mahallalar sahifasiga qaytish
        </button>

        <div className="bg-[#181b1c] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{selected.name}</p>
              <h2 className="text-2xl font-black text-white leading-tight">
                {selectedMahalla?.name || "Mahalla tanlanmagan"} bog'chalari
              </h2>
              <p className="text-[10px] font-bold text-slate-300/85 uppercase tracking-widest mt-1">
                {selectedMahalla?.code ? `${selectedMahalla.code} kodi` : "Mahalla kodi mavjud emas"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-indigo-500/15 border border-indigo-400/20 rounded-2xl px-5 py-3">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">MTTlar</p>
                <p className="text-2xl font-black text-white">{selectedMahalla?.kindergartens.length || 0}</p>
              </div>
              <div className="bg-emerald-500/15 border border-emerald-400/20 rounded-2xl px-5 py-3">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Bolalar</p>
                <p className="text-2xl font-black text-white">{(selectedMahalla?.totalChildren || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-white/10 grid grid-cols-1 md:grid-cols-[1fr_1fr_220px] gap-3 bg-[#202425]">
            <label className="block">
              <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Mahalla filter</span>
              <select
                value={selectedMahallaName}
                onChange={(event) => {
                  setSelectedMahallaName(event.target.value);
                  setKindergartenSearch('');
                  setKindergartenTypeFilter('all');
                }}
                className="w-full h-11 rounded-xl border border-white/10 bg-[#101415] px-3 text-sm font-bold text-white outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
              >
                {selectedMahallaStats.map((mahalla) => (
                  <option key={mahalla.code || mahalla.name} value={mahalla.name}>
                    {mahalla.name} - {mahalla.kindergartens.length} MTT
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Bog'cha qidirish</span>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={kindergartenSearch}
                  onChange={(event) => setKindergartenSearch(event.target.value)}
                  placeholder="Nomi, manzili yoki direktor..."
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#101415] pl-10 pr-3 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Turi</span>
              <select
                value={kindergartenTypeFilter}
                onChange={(event) => setKindergartenTypeFilter(event.target.value as typeof kindergartenTypeFilter)}
                className="w-full h-11 rounded-xl border border-white/10 bg-[#101415] px-3 text-sm font-bold text-white outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">Barchasi</option>
                {KINDERGARTEN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
          </div>

          {filteredMahallaKindergartens.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filteredMahallaKindergartens.map((kg) => (
                <div key={kg.id || kg.systemId || kg.name} className="px-6 py-5 hover:bg-white/[0.035] transition-colors">
                  <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr_repeat(3,0.55fr)] gap-4 xl:items-center">
                    <div className="min-w-0">
                      <p className="text-base font-black text-white leading-tight">{kg.name || "Nomsiz bog'cha"}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1">
                        {kg.directorName ? `Direktor: ${kg.directorName}` : "Direktor kiritilmagan"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Manzil</p>
                      <p className="text-sm font-bold text-white leading-snug">{kg.address || selectedMahalla?.name || "Manzil kiritilmagan"}</p>
                    </div>
                    <div className="bg-white/[0.045] rounded-xl px-4 py-3 border border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Turi</p>
                      <p className="text-sm font-black text-white mt-1">{typeLabels[kg.type] || kg.type || "Kiritilmagan"}</p>
                    </div>
                    <div className="bg-white/[0.045] rounded-xl px-4 py-3 border border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bolalar</p>
                      <p className="text-xl font-black text-white mt-1">{getRealChildrenCount(kg).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/[0.045] rounded-xl px-4 py-3 border border-white/10">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ishchilar</p>
                      <p className="text-xl font-black text-white mt-1">{getStaffCount(kg).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="w-14 h-14 bg-white/[0.045] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <School size={26} />
              </div>
              <p className="text-sm font-black text-white">Bu filter bo'yicha bog'cha topilmadi</p>
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
      <div className="districts-dark min-h-screen space-y-6 bg-[#0b0f10] pb-20 text-white">
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
          className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Tumanlar ro'yxatiga qaytish
        </button>

        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-white">{selected.name}</h2>
            <p className="text-[10px] font-bold text-slate-300/85 uppercase tracking-widest mt-1">Hududiy muassasalar tahlili</p>
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
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101415] pl-10 pr-3 text-sm font-bold text-white shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-500 px-5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-900/25 transition-all hover:from-indigo-500 hover:to-teal-400"
            >
              <Search size={15} />
              Qidirish
            </button>
          </form>

          <div className="flex gap-6 bg-[#181b1c] border border-white/10 rounded-2xl px-6 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Davomat</p>
              <p className={clsx("text-2xl font-black", selected.attendancePercentage >= 88 ? "text-emerald-300" : "text-amber-400")}>
                {selected.attendancePercentage}%
              </p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">MTTlar</p>
              <p className="text-2xl font-black text-white">{selected.totalMTTs}</p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Bolalar</p>
              <p className="text-2xl font-black text-white">{selected.totalChildren.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          {KINDERGARTEN_TYPES.map((type) => {
            const meta = typeCardMeta[type.value] || typeCardMeta.Public;
            const items = selectedTypeStats[type.value] || [];
            const cat = {
              key: type.value,
              icon: meta.icon,
              label: type.label,
              count: items.length,
              attend: getTypeAttendance(items),
              color: meta.color,
            };
            return (
            <motion.div
              key={cat.key}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedType(cat.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setSelectedType(cat.key);
              }}
              className={clsx(
                "bg-[#181b1c] border rounded-2xl p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] cursor-pointer hover:border-emerald-400/25 transition-all group",
                selectedType === cat.key ? "border-indigo-400/50 ring-2 ring-indigo-500/20" : "border-white/10"
              )}
            >
              <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg",
                typeAccentClass(cat.color)
              )}>
                <cat.icon size={24} />
              </div>
              <h3 className="text-base font-black text-white mb-1 leading-snug">{cat.label}</h3>
              <div className="flex justify-between items-center mt-4 bg-white/[0.045] px-4 py-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] font-black text-slate-300 uppercase">Muassasalar</span>
                <span className="text-sm font-black text-white">{cat.count} ta</span>
              </div>
              <div className="flex justify-between items-center mt-2 bg-white/[0.045] px-4 py-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] font-black text-slate-300 uppercase">Davomat</span>
                <span className={clsx("text-sm font-black", cat.attend >= 88 ? "text-emerald-300" : "text-amber-400")}>{cat.attend}%</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Batafsil <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
            );
          })}
        </div>

        {selectedMahallaStats.length > 0 && (
          <div id="district-mahallas-section" className="space-y-5">
            <div className="bg-[#181b1c] border border-white/10 rounded-2xl shadow-[0_24px_65px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">Mahallalar</h3>
                  <p className="text-[10px] font-bold text-slate-300/85 uppercase tracking-widest mt-1">
                    {selected.name} bo'yicha {selectedMahallaStats.length} ta mahalla. Card ustiga bosing.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-emerald-300">
                    <MapPin size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {filteredSelectedMahallas.length}/{selectedMahallaStats.length} ko'rsatildi
                    </span>
                  </div>
                  <div className="flex rounded-xl border border-white/10 bg-[#101415] p-1">
                    <button
                      type="button"
                      onClick={() => setMahallaViewMode('cards')}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                        mahallaViewMode === 'cards' ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/5"
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
                        mahallaViewMode === 'list' ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/5"
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
                              ? "bg-[#241f65] border-indigo-400/50 text-white ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-900/20"
                              : "bg-[#101415] border-white/10 text-white hover:border-emerald-400/25 hover:bg-[#151a1b]"
                          )}
                        >
                          <div className={clsx(
                            "absolute right-0 top-0 h-20 w-20 rounded-bl-full transition-colors",
                            active ? "bg-white/10" : hasMtt ? "bg-emerald-500/10" : "bg-white/[0.035]"
                          )} />
                          <div className="relative flex h-full flex-col justify-between gap-4">
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className={clsx(
                                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                  active ? "bg-white/15 text-white" : hasMtt ? "bg-emerald-500/10 text-emerald-300" : "bg-white/[0.045] text-slate-300"
                                )}>
                                  <MapPin size={17} />
                                </div>
                                <span className={clsx(
                                  "min-w-9 h-8 px-2 rounded-full inline-flex items-center justify-center text-xs font-black",
                                  active ? "bg-gradient-to-r from-indigo-400 to-teal-300 text-[#101415]" : hasMtt ? "bg-emerald-500/15 text-white" : "bg-white/10 text-white"
                                )}>
                                  {mahalla.kindergartens.length}
                                </span>
                              </div>
                              <p className="text-sm font-black leading-snug line-clamp-2 text-white">
                                {mahalla.name}
                              </p>
                              <p className={clsx("text-[10px] font-bold mt-1", active ? "text-indigo-100" : "text-slate-300/80")}>
                                {mahalla.code ? `${mahalla.code} kodi` : "Kod kiritilmagan"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className={clsx("rounded-xl px-3 py-3 border", active ? "bg-white/10 border-white/10" : "bg-indigo-500/10 border-indigo-400/20")}>
                                <p className={clsx("text-[8px] font-black uppercase tracking-widest", active ? "text-indigo-100" : "text-slate-300")}>MTT</p>
                                <p className="text-xl font-black leading-none mt-1 text-white">{mahalla.kindergartens.length}</p>
                              </div>
                              <div className={clsx("rounded-xl px-3 py-3 border", active ? "bg-white/10 border-white/10" : "bg-emerald-500/10 border-emerald-400/20")}>
                                <p className={clsx("text-[8px] font-black uppercase tracking-widest", active ? "text-indigo-100" : "text-slate-300")}>Bolalar</p>
                                <p className="text-xl font-black leading-none mt-1 text-white">{mahalla.totalChildren.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <div className="grid grid-cols-[minmax(0,1.5fr)_140px_110px_110px_100px] gap-3 bg-[#101415] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                      <span>Mahalla</span>
                      <span>Kod</span>
                      <span className="text-center">MTT</span>
                      <span className="text-center">Bolalar</span>
                      <span className="text-right">Ochish</span>
                    </div>
                    <div className="divide-y divide-white/10">
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
                              "grid w-full grid-cols-1 gap-3 px-4 py-3 text-left transition-all hover:bg-white/[0.035] md:grid-cols-[minmax(0,1.5fr)_140px_110px_110px_100px] md:items-center",
                              active ? "bg-indigo-500/15" : "bg-[#181b1c]"
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className={clsx(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                hasMtt ? "bg-emerald-500/10 text-emerald-300" : "bg-white/[0.045] text-slate-300"
                              )}>
                                <MapPin size={16} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-white">{mahalla.name}</p>
                                <p className="mt-0.5 text-[10px] font-bold text-slate-300/80 md:hidden">{mahalla.code ? `${mahalla.code} kodi` : "Kod kiritilmagan"}</p>
                              </div>
                            </div>
                            <span className="hidden text-xs font-black text-slate-300 md:block">{mahalla.code || '-'}</span>
                            <span className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-center text-sm font-black text-white">{mahalla.kindergartens.length}</span>
                            <span className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-center text-sm font-black text-white">{mahalla.totalChildren.toLocaleString()}</span>
                            <span className="inline-flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                              Batafsil <ChevronRight size={13} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredSelectedMahallas.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.035] px-6 py-10 text-center">
                    <p className="text-sm font-black text-white">Mahalla topilmadi</p>
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
              className="bg-[#181b1c] border border-white/10 rounded-2xl shadow-[0_24px_65px_rgba(0,0,0,0.25)] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">{typeLabels[selectedType]} ro'yxati</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {selected.name} bo'yicha {activeTypeKindergartens.length} ta muassasa
                  </p>
                </div>
                <button
                  onClick={() => setSelectedType(null)}
                  className="self-start md:self-auto px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  Yopish
                </button>
              </div>

              {activeTypeKindergartens.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {activeTypeKindergartens.map((kg) => (
                    <div key={kg.id} className="px-6 py-5 hover:bg-white/[0.035] transition-colors">
                      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_repeat(2,0.55fr)] gap-4 xl:items-center">
                        <div>
                          <p className="text-base font-black text-white leading-tight">{kg.name || "Nomsiz bog'cha"}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">
                            {kg.directorName ? `Direktor: ${kg.directorName}` : "Direktor kiritilmagan"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Manzil</p>
                          <p className="text-sm font-bold text-white leading-snug">{kg.address || kg.district || "Manzil kiritilmagan"}</p>
                        </div>
                        <div className="bg-white/[0.045] rounded-xl px-4 py-3 border border-white/10">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bolalar</p>
                          <p className="text-xl font-black text-white mt-1">{getRealChildrenCount(kg).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/[0.045] rounded-xl px-4 py-3 border border-white/10">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ishchilar</p>
                          <p className="text-xl font-black text-white mt-1">{getStaffCount(kg).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm font-black text-white">{typeLabels[selectedType]} topilmadi</p>
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
    <div className="districts-dark space-y-4 pb-20 bg-[#0b0f10] min-h-screen text-white">

      {/* Header bar */}
      <div className="bg-[#181b1c] border border-white/10 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
            <LayoutGrid size={18} />
          </div>
          <div>
            <h2 className="text-[17px] font-black text-white tracking-tight">Hududiy boshqaruv markazi</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jonli hudud tahlili</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Grid / Map toggle */}
          <div className="flex p-1 bg-[#101415] rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'grid' ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow" : "text-slate-300 hover:text-white")}
            >
              <LayoutGrid size={12} /> Jadval
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'map' ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow" : "text-slate-300 hover:text-white")}
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
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hudud qidirish..."
                className="h-10 w-56 rounded-xl border border-white/10 bg-[#101415] pl-9 pr-4 text-[12px] font-semibold text-white shadow-sm outline-none placeholder:text-slate-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-900/25 transition-all hover:from-indigo-500 hover:to-teal-400"
            >
              <Search size={14} />
              Qidirish
            </button>
          </form>

          <button className="flex h-10 items-center gap-1.5 px-3 border border-white/10 bg-[#101415] rounded-xl text-[10px] font-black text-slate-300 hover:text-white transition-all shadow-sm">
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
      <div className="grid grid-cols-12 gap-4">

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
                className="bg-[#181b1c] border border-white/10 rounded-2xl p-8 shadow-sm min-h-[500px] flex flex-col items-center justify-center">
                <h3 className="text-xl font-black text-white mb-2">Interaktiv Xarita</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tez orada qo'shiladi</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* AI Insights Node */}
          <div className="bg-[#181b1c] border border-white/10 rounded-2xl p-4 text-white relative overflow-hidden flex flex-col gap-4 shadow-[0_24px_65px_rgba(0,0,0,0.28)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center">
                  <Sparkles size={16} className="text-teal-200 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[14px] font-black">AI tahlil markazi</h4>
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
              <p className="text-[12px] font-mono text-slate-200 leading-relaxed min-h-[64px]">
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
              <button onClick={exportPDF} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:from-indigo-500 hover:to-teal-400 transition-all shadow-xl shadow-indigo-900/25">
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

