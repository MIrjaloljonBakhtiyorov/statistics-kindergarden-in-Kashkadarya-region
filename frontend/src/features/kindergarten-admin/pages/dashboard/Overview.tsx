import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, AlertTriangle, ShieldAlert,
  Building2, Home, Filter, TrendingUp, TrendingDown,
  MapPin, X, Zap, Activity, School, LayoutGrid
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { clsx } from 'clsx';
import { StatsModal } from '../../components/StatsModal';
import { kindergartenApi } from '@/shared/api';
import { KINDERGARTEN_TYPES } from '@/shared/lib/kindergartenTypes';

const REGIONAL_STAT_CARDS = [
  { name: "Qoraqalpog'iston Respublikasi", type: "Respublika", slug: "qoraqalpogiston" },
  { name: "Andijon viloyati", type: "Viloyat", slug: "andijon" },
  { name: "Buxoro viloyati", type: "Viloyat", slug: "buxoro" },
  { name: "Farg'ona viloyati", type: "Viloyat", slug: "fargona" },
  { name: "Jizzax viloyati", type: "Viloyat", slug: "jizzax" },
  { name: "Xorazm viloyati", type: "Viloyat", slug: "xorazm" },
  { name: "Namangan viloyati", type: "Viloyat", slug: "namangan" },
  { name: "Navoiy viloyati", type: "Viloyat", slug: "navoiy" },
  { name: "Qashqadaryo viloyati", type: "Viloyat", slug: "qashqadaryo" },
  { name: "Samarqand viloyati", type: "Viloyat", slug: "samarqand" },
  { name: "Sirdaryo viloyati", type: "Viloyat", slug: "sirdaryo" },
  { name: "Surxondaryo viloyati", type: "Viloyat", slug: "surxondaryo" },
  { name: "Toshkent viloyati", type: "Viloyat", slug: "toshkent-viloyati" },
  { name: "Toshkent shahri", type: "Shahar", slug: "toshkent-shahri" },
];

const DISTRICTS = [
  { name: "Qarshi shahri", aliases: ["qarshi sh.", "qarshi shahri"] },
  { name: "Qarshi tumani", aliases: ["qarshi t.", "qarshi tumani"] },
  { name: "Shahrisabz shahri", aliases: ["shahrisabz sh.", "shahrisabz shahri"] },
  { name: "Shahrisabz tumani", aliases: ["shahrisabz t.", "shahrisabz tumani"] },
  { name: "Kitob tumani", aliases: ["kitob", "kitob tumani"] },
  { name: "Koson tumani", aliases: ["koson", "koson tumani"] },
  { name: "Muborak tumani", aliases: ["muborak", "muborak tumani"] },
  { name: "G'uzor tumani", aliases: ["g'uzor", "g'uzor tumani"] },
  { name: "Nishon tumani", aliases: ["nishon", "nishon tumani"] },
  { name: "Dehqonobod tumani", aliases: ["dehqonobod", "dehqonobod tumani"] },
  { name: "Qamashi tumani", aliases: ["qamashi", "qamashi tumani"] },
  { name: "Chiroqchi tumani", aliases: ["chiroqchi", "chiroqchi tumani"] },
  { name: "Kasbi tumani", aliases: ["kasbi", "kasbi tumani"] },
  { name: "Mirishkor tumani", aliases: ["mirishkor", "mirishkor tumani"] },
  { name: "Yakkabog' tumani", aliases: ["yakkabog'", "yakkabog' tumani"] },
  { name: "Ko'kdala tumani", aliases: ["ko'kdala", "ko'kdala tumani", "ko'kdala t."] },
];

const normalizeText = (value: unknown) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\u2018\u2019`]/g, "'")
  .replace(/gРІР‚Вuzor/g, "g'uzor")
  .replace(/gК»uzor/g, "g'uzor")
  .replace(/\s+/g, ' ');
const toNumber = (value: unknown) => Number(value || 0);
const childCountOf = (kg: any) => {
  return toNumber(kg.actualChildrenCount ?? kg.childrenCount);
};
const attendancePercent = (attended: number, total: number) => total > 0 ? Math.round((attended / total) * 100) : 0;
const formatCount = (value: unknown) => Number(value || 0).toLocaleString('uz-UZ');
const matchesDistrict = (kgDistrict: unknown, district: { name: string; aliases: string[] }) => {
  const normalized = normalizeText(kgDistrict);
  if (!normalized) return false;
  return [district.name, ...district.aliases].map(normalizeText).includes(normalized);
};
const formatDistrictTodayTitle = (label: unknown) => {
  const name = String(label || '').trim();
  if (!name) return "Bugungi ma'lumot";
  if (name.endsWith('sh.')) return `${name.replace(/\s*sh\.$/, '')} shahridagi bugungi ma'lumot`;
  if (name.endsWith('t.')) return `${name.replace(/\s*t\.$/, '')} tumanidagi bugungi ma'lumot`;
  if (name.endsWith('shahri') || name.endsWith('tumani')) return `${name}dagi bugungi ma'lumot`;
  return `${name} tumanidagi bugungi ma'lumot`;
};
const attendanceBreakdownOf = (kg: any) => {
  const children = childCountOf(kg);
  const before930 = toNumber(kg.attendedBefore9);
  const after930 = toNumber(kg.attendedAfter9);
  const present = before930 + after930;
  const explicitAbsent = toNumber(kg.absent);
  const absent = Math.max(explicitAbsent, children - present, 0);

  return { children, before930, after930, present, absent };
};

const TYPE_KPI_META: Record<string, { icon: any; color: string; chartColor: string }> = {
  Public: { icon: School, color: 'blue', chartColor: '#6366f1' },
  Private: { icon: Home, color: 'orange', chartColor: '#f59e0b' },
  PPP: { icon: ShieldAlert, color: 'teal', chartColor: '#14b8a6' },
  Home: { icon: Home, color: 'amber', chartColor: '#10b981' },
  Organization: { icon: LayoutGrid, color: 'violet', chartColor: '#8b5cf6' },
};

const DistrictAxisTick = ({ x, y, payload }: any) => {
  const label = String(payload?.value || '');
  const parts = label.split(' ');
  const suffix = parts.length > 1 ? parts.pop() : '';
  const prefix = parts.join(' ') || label;

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#ffffff" fontSize={8.5} fontWeight={900}>
        <tspan x={0} dy={10}>{prefix}</tspan>
        {suffix && <tspan x={0} dy={11}>{suffix}</tspan>}
      </text>
    </g>
  );
};

const KpiCard = ({ kpi }: { kpi: any }) => (
  <div className="bg-[#181b1c] border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm relative overflow-hidden min-h-[116px]">
    <div className="flex justify-between items-start">
      <div className={clsx(
        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
        kpi.color === "indigo" && "bg-indigo-500/15 text-indigo-300",
        kpi.color === "emerald" && "bg-emerald-500/15 text-emerald-300",
        kpi.color === "amber" && "bg-amber-500/15 text-amber-300",
        kpi.color === "rose" && "bg-rose-500/15 text-rose-300",
        kpi.color === "violet" && "bg-violet-500/15 text-violet-300",
        kpi.color === "orange" && "bg-orange-500/15 text-orange-300",
        kpi.color === "blue" && "bg-blue-500/15 text-blue-300",
        kpi.color === "teal" && "bg-teal-500/15 text-teal-300",
      )}>
        <kpi.icon size={19} />
      </div>
      <span className={clsx(
        "text-[11px] font-black flex items-center gap-1",
        kpi.trend > 0 ? "text-emerald-500" : kpi.trend < 0 ? "text-rose-500" : "text-slate-400"
      )}>
        {kpi.trend > 0 ? <TrendingUp size={12} /> : kpi.trend < 0 ? <TrendingDown size={12} /> : null}
        {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
      </span>
    </div>
    <div>
      <p className="mb-1.5 text-[9px] font-black uppercase leading-[1.15] tracking-[0.12em] text-slate-400">{kpi.title}</p>
      <h3 className="text-2xl font-black text-white tracking-tight leading-none">{kpi.val}</h3>
    </div>
    {/* subtle bg icon */}
    <div className="absolute -bottom-4 -right-3 text-white opacity-[0.06]">
      <kpi.icon size={72} />
    </div>
  </div>
);

export const Overview = () => {
  const { regionSlug } = useParams();
  const [showReport, setShowReport] = useState(false);
  const [statsType, setStatsType] = useState<string | null>(null);
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const selectedRegion = REGIONAL_STAT_CARDS.find((region) => region.slug === (regionSlug || 'qashqadaryo')) || REGIONAL_STAT_CARDS.find((region) => region.slug === 'qashqadaryo')!;
  const isQashqadaryoRegion = selectedRegion.slug === 'qashqadaryo';
  const selectedRegionKindergartens = useMemo(() => {
    if (!isQashqadaryoRegion) return [];
    return kindergartens.filter((kg) => {
      const region = normalizeText(kg.region);
      return !region || region.includes('qashqadaryo');
    });
  }, [isQashqadaryoRegion, kindergartens]);

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

  const stats = useMemo(() => {
    const totalChildren = selectedRegionKindergartens.reduce((sum, kg) => sum + attendanceBreakdownOf(kg).children, 0);
    const totalBefore9 = selectedRegionKindergartens.reduce((sum, kg) => sum + attendanceBreakdownOf(kg).before930, 0);
    const totalAfter9 = selectedRegionKindergartens.reduce((sum, kg) => sum + attendanceBreakdownOf(kg).after930, 0);
    const totalAbsent = selectedRegionKindergartens.reduce((sum, kg) => sum + attendanceBreakdownOf(kg).absent, 0);
    const typeCounts = KINDERGARTEN_TYPES.reduce<Record<string, number>>((acc, type) => {
      acc[type.value] = selectedRegionKindergartens.filter(kg => kg.type === type.value).length;
      return acc;
    }, {});
    const districtData = DISTRICTS.map((district) => {
      const districtKindergartens = selectedRegionKindergartens.filter(kg => matchesDistrict(kg.district, district));
      const districtStats = districtKindergartens.reduce((acc, kg) => {
        const breakdown = attendanceBreakdownOf(kg);
        acc.children += breakdown.children;
        acc.before930 += breakdown.before930;
        acc.after930 += breakdown.after930;
        acc.present += breakdown.present;
        acc.absent += breakdown.absent;
        return acc;
      }, { children: 0, before930: 0, after930: 0, present: 0, absent: 0 });

      return {
        name: district.name,
        jami: districtStats.children,
        before930: districtStats.before930,
        after930: districtStats.after930,
        absent: districtStats.absent,
        davomat: attendancePercent(districtStats.present, districtStats.children),
      };
    });
    const districtsWithData = districtData.filter(d => d.jami > 0 || d.before930 > 0 || d.after930 > 0 || d.absent > 0);

    const bottomDistricts = selectedRegionKindergartens
      .map((kg) => {
        const breakdown = attendanceBreakdownOf(kg);
        return {
          name: kg.name || "Noma'lum bog'cha",
          hudud: kg.district || "Noma'lum hudud",
          kechikkan: breakdown.after930,
          davomat: attendancePercent(breakdown.present, breakdown.children),
          hasAttendanceData: breakdown.children > 0 && (breakdown.present > 0 || breakdown.absent > 0),
        };
      })
      .filter(item => item.hasAttendanceData)
      .sort((a, b) => a.davomat - b.davomat)
      .slice(0, 5);

    const reportCounts = selectedRegionKindergartens.reduce((acc, kg) => {
      const breakdown = attendanceBreakdownOf(kg);
      const pct = attendancePercent(breakdown.present, breakdown.children);
      if (!breakdown.children) return acc;
      if (pct >= 90) acc.excellent += 1;
      else if (pct >= 75) acc.average += 1;
      else acc.low += 1;
      return acc;
    }, { excellent: 0, average: 0, low: 0 });

    return {
      kpiRow1: [
        { title: "Jami bolalar", val: totalChildren.toLocaleString(), icon: Users, color: "indigo" },
        { title: "09:30 gacha", val: totalBefore9.toLocaleString(), icon: Clock, color: "emerald" },
        { title: "09:30 dan keyin", val: totalAfter9.toLocaleString(), icon: AlertTriangle, color: "amber" },
        { title: "Kelmaganlar", val: totalAbsent.toLocaleString(), icon: ShieldAlert, color: "rose" },
      ],
      kpiRow2: [
        { title: "Umumiy bog'chalar", val: selectedRegionKindergartens.length.toLocaleString(), icon: Building2, color: "violet" },
        ...KINDERGARTEN_TYPES.map((type) => {
          const meta = TYPE_KPI_META[type.value] || TYPE_KPI_META.Public;
          return {
            title: type.groupLabel,
            val: Number(typeCounts[type.value] || 0).toLocaleString(),
            icon: meta.icon,
            color: meta.color,
          };
        }),
      ],
      pieData: [
        ...KINDERGARTEN_TYPES.map((type) => ({
          name: type.groupLabel,
          value: typeCounts[type.value] || 0,
          color: (TYPE_KPI_META[type.value] || TYPE_KPI_META.Public).chartColor,
        })),
      ],
      districtData,
      bottomDistricts,
      districtMonitor: districtsWithData.map(district => ({ name: district.name, davomat: district.davomat })),
      reportCounts,
    };
  }, [selectedRegionKindergartens]);

  return (
    <div className="space-y-5 pb-12 bg-[#0b0f10] min-h-screen text-slate-100">

      {/* Page Header */}
      <div className="bg-[#181b1c] border border-white/10 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Viloyat statistikasi</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
            {selectedRegion.name} bo'yicha monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setStatsType('Viloyat kesimi')} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/5 transition-all">
            <Filter size={14} /> Filtr
          </button>
          <button onClick={() => setStatsType('Live Report')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20">
            <Activity size={14} /> Live Report
          </button>
        </div>
      </div>

      {!isQashqadaryoRegion && (
        <div className="bg-[#181b1c] border border-white/10 rounded-xl p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
            <MapPin size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedRegion.type}</p>
          <h2 className="mt-2 text-2xl font-black text-white tracking-tight">{selectedRegion.name} statistikasi</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-slate-400">
            Bu hudud uchun alohida statistika menyusi tayyorlanmoqda. Tez kunda ushbu qism qo'shiladi.
          </p>
          <span className="mt-5 inline-flex rounded-full bg-amber-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-100">
            Tez kunda
          </span>
        </div>
      )}

      {/* KPI Row 1 */}
      <div className={clsx("grid grid-cols-2 xl:grid-cols-4 gap-4", !isQashqadaryoRegion && "hidden")}>
        {stats.kpiRow1.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
      </div>

      {/* KPI Row 2 */}
      <div className={clsx("grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4", !isQashqadaryoRegion && "hidden")}>
        {stats.kpiRow2.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
      </div>

      {/* Charts */}
      <div className={clsx("grid grid-cols-1 lg:grid-cols-12 gap-4", !isQashqadaryoRegion && "hidden")}>
        <div className="lg:col-span-8 bg-[#181b1c] border border-white/10 rounded-2xl p-4 pb-3 shadow-sm">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[12px] font-black text-white uppercase tracking-[0.16em]">Tuman kesimida kunlik bolalar davomati</p>
              <p className="mt-1 text-[10px] font-bold text-slate-400">Jami bolalar va bugungi 09:30 chegarasi bo'yicha kelish holati</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-white">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-slate-300" /> Jami</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> 09:30 gacha</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400" /> Keyin</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-500" /> Kelmagan</span>
            </div>
          </div>
          <div className="chart-scroll w-full min-w-0 overflow-x-auto pb-2">
            <div className="min-w-[1120px]">
              <ResponsiveContainer width="100%" height={264} minWidth={0} minHeight={0}>
                <BarChart data={stats.districtData} margin={{ top: 8, right: 12, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a3033" />
                  <XAxis
                    dataKey="name"
                    height={48}
                    interval={0}
                    tickMargin={6}
                    axisLine={false}
                    tickLine={false}
                    tick={<DistrictAxisTick />}
                  />
                  <YAxis
                    fontSize={9}
                    fontWeight={800}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff' }}
                    tickFormatter={(value) => Number(value || 0).toLocaleString('uz-UZ')}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#181b1c', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.28)', fontSize: '11px' }}
                    formatter={(value, name) => [formatCount(value), name]}
                    labelFormatter={formatDistrictTodayTitle}
                  />
                  <Legend
                    verticalAlign="top"
                    height={24}
                    iconType="circle"
                    iconSize={7}
                    formatter={(value) => <span style={{ color: '#ffffff', fontSize: 9, fontWeight: 900, letterSpacing: '0.03em' }}>{value}</span>}
                  />
                  <Bar dataKey="jami" name="Jami bolalar" fill="#cbd5e1" radius={[5, 5, 0, 0]} barSize={16} />
                  <Bar dataKey="before930" name="09:30 gacha kelgan" stackId="daily" fill="#10b981" radius={[0, 0, 5, 5]} barSize={18} />
                  <Bar dataKey="after930" name="09:30 dan keyin kelgan" stackId="daily" fill="#f59e0b" barSize={18} />
                  <Bar dataKey="absent" name="Kelmaganlar" stackId="daily" fill="#f43f5e" radius={[5, 5, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#181b1c] border border-white/10 rounded-2xl p-4 shadow-sm flex flex-col">
          <p className="text-[12px] font-black text-white uppercase tracking-[0.16em] mb-3">Bog'cha turlari</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full min-w-0">
              <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    dataKey="value"
                    cx="50%"
                    cy="45%"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {stats.pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 8.5, fontWeight: 900, color: '#ffffff', letterSpacing: '0.02em' }}>{value}</span>}
                  />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#181b1c', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.28)', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={clsx("grid grid-cols-1 lg:grid-cols-12 gap-4", !isQashqadaryoRegion && "hidden")}>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#181b1c] border border-indigo-400/20 rounded-2xl p-4 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={17} className="text-yellow-300" />
              <h3 className="font-black text-[13px] uppercase tracking-[0.14em]">AI Chuqur Analitika</h3>
            </div>
            <p className="text-[11px] font-semibold text-slate-300 leading-relaxed italic">
              "Viloyat statistikasi real bazaga kiritilgan bog'chalar ma'lumotlari asosida shakllanadi. Davomat ma'lumotlari kiritilmaguncha tegishli ko'rsatkichlar 0 bo'ladi."
            </p>
          </div>

          <div className="bg-[#181b1c] border border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-[12px] font-black text-white uppercase tracking-[0.16em] mb-3">Eng past davomat - TOP 5</p>
            <div className="space-y-2">
              {stats.bottomDistricts.length === 0 && (
                <div className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Ma'lumot yo'q
                </div>
              )}
              {stats.bottomDistricts.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-[10px] font-black text-indigo-300">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-black text-white">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {item.hudud}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-rose-400">{item.kechikkan} kechikkan</p>
                    <p className="text-[10px] font-bold text-slate-400">{item.davomat}% davomat</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#181b1c] border border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-[12px] font-black text-white uppercase tracking-[0.16em] mb-3">Hududiy boshqaruv monitori</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {stats.districtMonitor.length === 0 && (
                <div className="col-span-full py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Real ma'lumot yo'q
                </div>
              )}
              {stats.districtMonitor.map((d: any, i: number) => {
                const barColor = d.davomat >= 93 ? "bg-emerald-500" : d.davomat >= 89 ? "bg-amber-400" : "bg-rose-500";
                return (
                  <div key={i} className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{d.name}</p>
                    <p className="text-[15px] font-black text-white">
                      {d.davomat}%
                      <span className="text-[10px] font-black text-slate-400 ml-1">DAVOMAT</span>
                    </p>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.davomat}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={clsx("h-full rounded-full", barColor)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Command Center */}
        <div className="lg:col-span-4 bg-[#181b1c] border border-white/10 rounded-2xl p-4 text-white flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            <p className="text-[12px] font-black text-white uppercase tracking-[0.16em]">AI boshqaruv markazi</p>
          </div>

          <div className="space-y-2.5 flex-1">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1.5">Urgent Alert</p>
              <p className="text-[11px] font-medium text-slate-300 leading-relaxed">Davomat o'zgarishi real ma'lumotlar asosida hisoblanadi.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1.5">Risk Warning</p>
              <p className="text-[11px] font-medium text-slate-300 leading-relaxed">Ta'minot xavfi real ombor ma'lumotlari asosida hisoblanadi.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Good News</p>
              <p className="text-[11px] font-medium text-slate-300 leading-relaxed">Ijobiy o'zgarishlar real davomat ma'lumotlari asosida ko'rinadi.</p>
            </div>
          </div>

          <button
            onClick={() => setShowReport(true)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-600/20"
          >
            Full Report
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[#181b1c] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setShowReport(false)} className="absolute top-5 right-5 p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={18} className="text-slate-400" />
              </button>
              <h3 className="text-xl font-black text-white mb-1">AI To'liq Hisobot</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-6">May 2026</p>
              <div className="space-y-4">
                {KINDERGARTEN_TYPES.map(type => (
                  <div key={type.value} className="p-4 bg-[#202425] rounded-xl border border-white/10">
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">{type.label}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center"><p className="text-lg font-black text-emerald-600">{stats.reportCounts.excellent}</p><p className="text-[9px] font-black text-slate-400 uppercase">A'lo</p></div>
                      <div className="text-center"><p className="text-lg font-black text-amber-600">{stats.reportCounts.average}</p><p className="text-[9px] font-black text-slate-400 uppercase">O'rta</p></div>
                      <div className="text-center"><p className="text-lg font-black text-rose-600">{stats.reportCounts.low}</p><p className="text-[9px] font-black text-slate-400 uppercase">Past</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <StatsModal isOpen={!!statsType} onClose={() => setStatsType(null)} type={statsType} data={selectedRegionKindergartens} />
    </div>
  );
};

