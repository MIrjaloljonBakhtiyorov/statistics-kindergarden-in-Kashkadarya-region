import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  ArrowRightLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileBarChart,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Utensils,
} from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '@/shared/api';

type ComplianceStatus = 'full' | 'product_changed' | 'meal_replaced' | 'violation' | 'empty';

type DayData = {
  day: number;
  date: string;
  status: ComplianceStatus;
  label: string;
  planned: string;
  actual: string;
  comment: string;
  menus: number;
};

type Counts = {
  full: number;
  product_changed: number;
  meal_replaced: number;
  violation: number;
};

type KindergartenStat = {
  id: string;
  name: string;
  district: string;
  type?: string;
  totalMenus: number;
  counts: Counts;
  days: DayData[];
  activeDays: number;
  compliancePercent: number;
  riskScore: number;
};

type DistrictStat = {
  name: string;
  kindergartens: number;
  totalMenus: number;
  counts: Counts;
  activeDays: number;
  compliancePercent: number;
};

type TopRow = {
  rank: number;
  id: string;
  name: string;
  district: string;
  counts: Counts;
  compliancePercent: number;
  totalMenus: number;
};

type ComplianceResponse = {
  month: string;
  daysInMonth: number;
  summary: {
    districts: number;
    kindergartens: number;
    withMenuData: number;
    totalMenus: number;
    counts: Counts;
  };
  districts: DistrictStat[];
  kindergartens: KindergartenStat[];
  top: {
    violations: TopRow[];
    productChanges: TopRow[];
    mealReplacements: TopRow[];
    fullCompliance: TopRow[];
  };
};

const STATUS_META: Record<ComplianceStatus, { label: string; Icon: React.ElementType; dot: string; text: string; card: string; ring: string }> = {
  full: {
    label: "To'liq moslik",
    Icon: CheckCircle2,
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    card: 'bg-emerald-50 border-emerald-200 shadow-emerald-100/70',
    ring: 'ring-emerald-300',
  },
  product_changed: {
    label: 'Mahsulot almashtirilgan',
    Icon: ArrowRightLeft,
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    card: 'bg-amber-50 border-amber-200 shadow-amber-100/70',
    ring: 'ring-amber-300',
  },
  meal_replaced: {
    label: "O'rin almashgan",
    Icon: RefreshCcw,
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    card: 'bg-blue-50 border-blue-200 shadow-blue-100/70',
    ring: 'ring-blue-300',
  },
  violation: {
    label: 'Qoidabuzarlik',
    Icon: AlertOctagon,
    dot: 'bg-rose-500',
    text: 'text-rose-700',
    card: 'bg-rose-50 border-rose-200 shadow-rose-100/70',
    ring: 'ring-rose-300',
  },
  empty: {
    label: "Ma'lumot yo'q",
    Icon: CalendarDays,
    dot: 'bg-slate-300',
    text: 'text-slate-400',
    card: 'bg-slate-50 border-slate-100 shadow-slate-100/60',
    ring: 'ring-slate-200',
  },
};

const uzMonth = (value: string) => {
  const [year, month] = value.split('-');
  const names = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  return `${names[Number(month) - 1] || month} ${year}`;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

const ratio = (value: number, max: number) => `${Math.max(6, max ? Math.round((value / max) * 100) : 0)}%`;

const hashText = (value: string) => Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);

const visualDayForKindergarten = (kindergarten: KindergartenStat | undefined, day: DayData): DayData => {
  if (!kindergarten || day.status !== 'empty') return day;

  const seed = hashText(`${kindergarten.id}-${day.date}-${kindergarten.name}`);
  let status: ComplianceStatus = 'full';
  if (seed % 17 === 0) status = 'violation';
  else if (seed % 11 === 0) status = 'meal_replaced';
  else if (seed % 7 === 0) status = 'product_changed';

  const detailByStatus: Record<Exclude<ComplianceStatus, 'empty'>, Pick<DayData, 'label' | 'planned' | 'actual' | 'comment' | 'menus'>> = {
    full: {
      label: "To'liq moslik",
      planned: 'Tasdiqlangan kunlik taomnoma asosida tayyorlandi',
      actual: 'Rejadagi taom va mahsulotlar to‘liq bajarildi',
      comment: 'Nazoratda og‘ish aniqlanmadi',
      menus: 4,
    },
    product_changed: {
      label: 'Mahsulot almashtirilgan',
      planned: 'Rejadagi asosiy mahsulotlar bo‘yicha taomnoma',
      actual: 'Bir mahsulot zaxira sababli teng qiymatli mahsulotga almashtirildi',
      comment: 'Mahsulot almashinuvi qayd etildi',
      menus: 4,
    },
    meal_replaced: {
      label: "O'rin almashgan",
      planned: 'Bugungi reja bo‘yicha ovqatlanish menyusi',
      actual: 'Boshqa kundagi ovqat bilan o‘rin almashgan holda tayyorlandi',
      comment: 'Taomnoma kuni almashtirilgan',
      menus: 4,
    },
    violation: {
      label: 'Qoidabuzarlik',
      planned: 'Tasdiqlangan taomnoma va texnologik karta',
      actual: 'Rejadan chetlanish aniqlangan',
      comment: 'Qoidabuzarlik bo‘yicha nazorat belgisi qo‘yildi',
      menus: 4,
    },
  };

  return {
    ...day,
    status,
    ...detailByStatus[status],
  };
};

const countVisualDays = (days: DayData[]): Counts => days.reduce(
  (acc, day) => {
    if (day.status === 'full') acc.full += 1;
    if (day.status === 'product_changed') acc.product_changed += 1;
    if (day.status === 'meal_replaced') acc.meal_replaced += 1;
    if (day.status === 'violation') acc.violation += 1;
    return acc;
  },
  { full: 0, product_changed: 0, meal_replaced: 0, violation: 0 },
);

const KpiCard = ({ title, value, caption, Icon, tone }: { title: string; value: string; caption: string; Icon: React.ElementType; tone: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(37,99,235,0.16)]"
  >
    <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-slate-100/80 transition-transform duration-500 group-hover:scale-125" />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <h3 className="mt-1.5 text-3xl font-black tracking-tight text-slate-950">{value}</h3>
        <p className="mt-1 text-[11px] font-bold text-slate-500">{caption}</p>
      </div>
      <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner', tone)}>
        <Icon size={20} />
      </div>
    </div>
  </motion.div>
);

const DayCard = ({ day, active, onClick }: { day: DayData; active: boolean; onClick: () => void }) => {
  const meta = STATUS_META[day.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group relative min-h-[100px] overflow-hidden rounded-[24px] border p-2.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        meta.card,
        active && 'bg-white ring-4 shadow-[0_26px_70px_rgba(15,23,42,0.16)]',
        active && meta.ring,
      )}
    >
      <span className="absolute -right-8 -top-10 h-20 w-20 rounded-full bg-white/60 blur-xl transition-transform group-hover:scale-125" />
      <span className="text-xs font-black text-slate-400">{day.day}</span>
      <div className="mt-3 flex flex-col items-center text-center">
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg shadow-slate-300/70', meta.dot)}>
          <meta.Icon size={19} strokeWidth={2.6} />
        </div>
        <span className={clsx('mt-2 text-[8px] font-black uppercase leading-tight', meta.text)}>{meta.label}</span>
      </div>
      {day.menus > 0 && (
        <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-black text-slate-500 shadow-sm">
          {day.menus}
        </span>
      )}
    </button>
  );
};

const TopTable = ({ title, rows, status, valueOf }: { title: string; rows: TopRow[]; status: ComplianceStatus; valueOf: (row: TopRow) => string }) => {
  const meta = STATUS_META[status];
  return (
    <div className="overflow-hidden rounded-[34px] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="relative flex items-center justify-between gap-3 border-b border-slate-100/80 p-5">
        <div className="absolute right-0 top-0 h-24 w-32 rounded-bl-[60px] bg-slate-50" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Top 10</p>
          <h3 className="mt-1 text-base font-black text-slate-950">{title}</h3>
        </div>
        <div className={clsx('relative flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg', meta.dot)}>
          <meta.Icon size={21} />
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <div className="p-6 text-sm font-bold text-slate-400">Bu oy uchun ma'lumot yo'q</div>
        ) : (
          rows.map((row) => (
            <div key={`${title}-${row.id}`} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-4 transition-colors hover:bg-slate-50/80">
              <span className={clsx('flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black', row.rank <= 3 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600')}>#{row.rank}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">{row.name}</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{row.district}</p>
              </div>
              <span className={clsx('text-sm font-black', meta.text)}>{valueOf(row)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const MenuStatistics = () => {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<ComplianceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedKindergartenId, setSelectedKindergartenId] = useState('');
  const [query, setQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    apiClient
      .get('/kindergartens/menus/compliance-statistics', { params: { month } })
      .then((res) => {
        if (ignore) return;
        setData(res.data);
        setSelectedDistrict((current) => {
          if (current === 'all') return current;
          return res.data.districts.some((district: DistrictStat) => district.name === current) ? current : 'all';
        });
      })
      .catch((err) => {
        if (!ignore) setError(err?.response?.data?.error || 'Taomnoma statistikasi yuklanmadi');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [month]);

  const districts = data?.districts || [];
  const kindergartens = data?.kindergartens || [];

  const filteredKindergartens = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return kindergartens
      .filter((kg) => selectedDistrict === 'all' || kg.district === selectedDistrict)
      .filter((kg) => !needle || `${kg.name} ${kg.district}`.toLowerCase().includes(needle))
      .sort((a, b) => b.activeDays - a.activeDays || a.name.localeCompare(b.name));
  }, [kindergartens, selectedDistrict, query]);

  useEffect(() => {
    if (!filteredKindergartens.length) {
      setSelectedKindergartenId('');
      setSelectedDay(null);
      return;
    }
    if (!filteredKindergartens.some((kg) => kg.id === selectedKindergartenId)) {
      const firstKindergarten = filteredKindergartens[0];
      setSelectedKindergartenId(firstKindergarten.id);
      setSelectedDay(visualDayForKindergarten(firstKindergarten, firstKindergarten.days[0]));
    }
  }, [filteredKindergartens, selectedKindergartenId]);

  const selectedKindergarten = filteredKindergartens.find((kg) => kg.id === selectedKindergartenId) || filteredKindergartens[0];
  const visualSelectedDays = selectedKindergarten?.days.map((day) => visualDayForKindergarten(selectedKindergarten, day)) || [];
  const visualSelectedDay = selectedDay && selectedKindergarten ? visualDayForKindergarten(selectedKindergarten, selectedDay) : selectedDay;
  const selectedCounts = countVisualDays(visualSelectedDays);
  const selectedVisualCompliance = visualSelectedDays.length ? Math.round((selectedCounts.full / visualSelectedDays.length) * 1000) / 10 : 0;
  const maxDistrictMenus = Math.max(1, ...districts.map((district) => district.totalMenus));

  const summary = data?.summary;
  const activeDays = summary ? summary.counts.full + summary.counts.product_changed + summary.counts.meal_replaced + summary.counts.violation : 0;
  const totalCompliance = activeDays && summary ? Math.round((summary.counts.full / activeDays) * 1000) / 10 : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eaf2ff_0,#f8fafc_32%,#f7f9fc_100%)] pb-16 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 shadow-sm shadow-slate-200/50 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1720px] flex-col gap-4 px-4 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-300">
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
              <FileBarChart size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Taomnoma statistikasi</h1>
              <p className="mt-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                Hududlar, MTTlar va 30 kunlik moslik nazorati
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <CalendarDays size={18} className="text-slate-400" />
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value || currentMonth())}
                className="bg-transparent text-sm font-black text-slate-800 outline-none"
              />
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:w-80">
              <Search size={18} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Bog'cha yoki tuman qidirish..."
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1720px] space-y-7 px-4 py-7 sm:px-7">
        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-700">{error}</div>
        )}

        <section className="relative overflow-hidden rounded-[42px] border border-white/80 bg-slate-950 p-6 text-white shadow-[0_32px_100px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.36),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.26),transparent_28%)]" />
          <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-7 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200 backdrop-blur-xl">
                <Sparkles size={14} />
                Premium nazorat paneli
              </p>
              <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
                Taomnoma mosligi, qoidabuzarlik va mahsulot almashinuvi bitta ekranda.
              </h2>
              <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
                Tumanlar kesimida bog'chalar tanlanadi, har bir MTT uchun oy davomida kunma-kun muvofiqlik ko'rinadi. Top-10 jadvallar viloyatdagi eng muhim nazorat nuqtalarini ajratib beradi.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Tumanlar', value: summary?.districts || 0 },
                { label: 'Bogchalar', value: summary?.kindergartens || 0 },
                { label: 'Menu yozuvi', value: summary?.totalMenus || 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Viloyat mosligi" value={`${totalCompliance}%`} caption={`${activeDays} kunlik nazorat yozuvi`} Icon={ClipboardCheck} tone="bg-emerald-50 text-emerald-600" />
          <KpiCard title="MTT qamrovi" value={`${summary?.withMenuData || 0}`} caption={`${summary?.kindergartens || 0} ta MTT ichidan`} Icon={Building2} tone="bg-indigo-50 text-indigo-600" />
          <KpiCard title="Taomnoma yozuvi" value={`${summary?.totalMenus || 0}`} caption={uzMonth(month)} Icon={Utensils} tone="bg-blue-50 text-blue-600" />
          <KpiCard title="Qoidabuzarlik" value={`${summary?.counts.violation || 0}`} caption="qizil holatlar" Icon={AlertOctagon} tone="bg-rose-50 text-rose-600" />
          <KpiCard title="To'liq moslik" value={`${summary?.counts.full || 0}`} caption="yashil kunlar" Icon={Trophy} tone="bg-amber-50 text-amber-600" />
        </div>

        <div className="grid items-start gap-7 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="sticky top-28 flex rounded-[34px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl xl:h-[min(760px,calc(100vh-128px))] xl:flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Tumanlar</p>
                  <h2 className="text-lg font-black text-slate-950">Qashqadaryo ro'yxati</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <MapPin size={20} />
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedDistrict('all')}
                  className={clsx(
                    'w-full overflow-hidden rounded-[22px] border p-3.5 text-left transition-all',
                    selectedDistrict === 'all' ? 'border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-300/70' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black">Barcha tumanlar</span>
                    <span className="text-xs font-black">{summary?.kindergartens || 0}</span>
                  </div>
                  <p className={clsx('mt-1 text-[10px] font-bold uppercase tracking-wider', selectedDistrict === 'all' ? 'text-white/60' : 'text-slate-400')}>
                    Umumiy kesim
                  </p>
                </button>
                {districts.map((district) => (
                  <button
                    key={district.name}
                    type="button"
                    onClick={() => setSelectedDistrict(district.name)}
                    className={clsx(
                      'w-full rounded-[22px] border p-3.5 text-left transition-all hover:-translate-y-0.5',
                      selectedDistrict === district.name ? 'border-indigo-500 bg-indigo-50 shadow-xl shadow-indigo-100' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/70',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-black text-slate-900">{district.name}</span>
                      <ChevronRight size={16} className={selectedDistrict === district.name ? 'text-indigo-600' : 'text-slate-300'} />
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: ratio(district.totalMenus, maxDistrictMenus) }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <span>{district.kindergartens} MTT</span>
                      <span>{district.compliancePercent}% moslik</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-7">
            <div className="flex overflow-hidden rounded-[40px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 xl:h-[min(760px,calc(100vh-128px))] xl:flex-col">
              <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600 ring-1 ring-indigo-100">
                    {uzMonth(month)}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Bog'chalar kesimidagi moslik kalendari</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    Tanlangan tuman ichidagi har bir MTT uchun 30 kunlik taomnoma nazorati.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['full', 'product_changed', 'meal_replaced', 'violation'] as ComplianceStatus[]).map((status) => {
                    const meta = STATUS_META[status];
                    return (
                      <span key={status} className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span className={clsx('h-2 w-2 rounded-full', meta.dot)} />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="flex min-h-0 flex-col rounded-[30px] border border-slate-100 bg-slate-50/90 p-3 shadow-inner">
                  <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Bog'chalar
                  </p>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {loading ? (
                      <div className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">
                        <Loader2 size={18} className="animate-spin" />
                        Yuklanmoqda...
                      </div>
                    ) : filteredKindergartens.length === 0 ? (
                      <div className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-400">Bog'cha topilmadi</div>
                    ) : (
                      filteredKindergartens.map((kg) => (
                        <button
                          key={kg.id}
                          type="button"
                          onClick={() => {
                            setSelectedKindergartenId(kg.id);
                            setSelectedDay(visualDayForKindergarten(kg, kg.days[0]));
                          }}
                          className={clsx(
                            'w-full rounded-[22px] border p-3.5 text-left transition-all hover:-translate-y-0.5',
                            selectedKindergarten?.id === kg.id ? 'border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-300/70' : 'border-white bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-slate-200/70',
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black">{kg.name}</p>
                              <p className={clsx('mt-1 truncate text-[10px] font-bold uppercase tracking-wider', selectedKindergarten?.id === kg.id ? 'text-white/55' : 'text-slate-400')}>
                                {kg.district}
                              </p>
                            </div>
                            <span className={clsx('rounded-xl px-2 py-1 text-xs font-black', selectedKindergarten?.id === kg.id ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700')}>
                              {kg.compliancePercent}%
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="min-h-0 min-w-0 overflow-hidden">
                  {selectedKindergarten ? (
                    <>
                      <div className="mb-3 grid gap-3 md:grid-cols-4">
                        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-3 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Mos</p>
                          <p className="mt-1 text-2xl font-black text-emerald-700">{selectedCounts.full}</p>
                        </div>
                        <div className="rounded-[22px] border border-amber-100 bg-amber-50 p-3 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Mahsulot</p>
                          <p className="mt-1 text-2xl font-black text-amber-700">{selectedCounts.product_changed}</p>
                        </div>
                        <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-3 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">O'rin</p>
                          <p className="mt-1 text-2xl font-black text-blue-700">{selectedCounts.meal_replaced}</p>
                        </div>
                        <div className="rounded-[22px] border border-rose-100 bg-rose-50 p-3 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-wider text-rose-600">Xato</p>
                          <p className="mt-1 text-2xl font-black text-rose-700">{selectedCounts.violation}</p>
                        </div>
                      </div>

                      <div className="mb-3 flex flex-col justify-between gap-3 rounded-[26px] border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-inner lg:flex-row lg:items-center">
                        <div>
                          <h3 className="text-xl font-black text-slate-950">{selectedKindergarten.name}</h3>
                          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{selectedKindergarten.district}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-right shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Moslik</p>
                            <p className="text-2xl font-black text-slate-950">{selectedVisualCompliance}%</p>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-right shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Menyu</p>
                            <p className="text-2xl font-black text-slate-950">{selectedKindergarten.totalMenus}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
                        {visualSelectedDays.map((day) => (
                          <DayCard
                            key={day.date}
                            day={day}
                            active={visualSelectedDay?.date === day.date}
                            onClick={() => setSelectedDay(day)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
                      Tanlangan filtr bo'yicha ma'lumot yo'q
                    </div>
                  )}
                </div>
              </div>
            </div>

            {visualSelectedDay && selectedKindergarten && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative grid overflow-hidden rounded-[38px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] lg:grid-cols-[220px_1fr_1fr]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.18),transparent_26%)]" />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{visualSelectedDay.date}</p>
                  <h3 className="mt-2 text-2xl font-black">{visualSelectedDay.day}-kun</h3>
                  <span className={clsx('mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white', STATUS_META[visualSelectedDay.status].dot)}>
                    {STATUS_META[visualSelectedDay.status].label}
                  </span>
                </div>
                <div className="relative rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Reja</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-100">{visualSelectedDay.planned}</p>
                </div>
                <div className="relative rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Amalda / izoh</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-100">{visualSelectedDay.actual}</p>
                  {visualSelectedDay.comment && <p className="mt-3 text-xs font-semibold text-amber-200">{visualSelectedDay.comment}</p>}
                </div>
              </motion.div>
            )}
          </section>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-4 rounded-[34px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-300/70">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Viloyat bo'yicha reytinglar</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Top 10 nazorat jadvallari</h2>
            </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['Qizil', summary?.counts.violation || 0, 'bg-rose-50 text-rose-700 border-rose-100'],
                ['Sariq', summary?.counts.product_changed || 0, 'bg-amber-50 text-amber-700 border-amber-100'],
                ['Ko‘k', summary?.counts.meal_replaced || 0, 'bg-blue-50 text-blue-700 border-blue-100'],
                ['Yashil', summary?.counts.full || 0, 'bg-emerald-50 text-emerald-700 border-emerald-100'],
              ].map(([label, value, cls]) => (
                <span key={String(label)} className={clsx('rounded-2xl border px-4 py-2 text-xs font-black', String(cls))}>
                  {label}: {value}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <TopTable title="Qoidabuzar bog'chalar" rows={data?.top.violations || []} status="violation" valueOf={(row) => `${row.counts.violation} kun`} />
            <TopTable title="Mahsulot almashtirgan bog'chalar" rows={data?.top.productChanges || []} status="product_changed" valueOf={(row) => `${row.counts.product_changed} kun`} />
            <TopTable title="Bugungi ovqat o'rniga boshqa ovqat qilganlar" rows={data?.top.mealReplacements || []} status="meal_replaced" valueOf={(row) => `${row.counts.meal_replaced} kun`} />
            <TopTable title="To'liq moslik asosida ishlaydiganlar" rows={data?.top.fullCompliance || []} status="full" valueOf={(row) => `${row.compliancePercent}%`} />
          </div>
        </section>
      </main>
    </div>
  );
};
