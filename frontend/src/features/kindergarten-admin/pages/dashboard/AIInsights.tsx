import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  Banknote,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  LineChart,
  MapPinned,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Utensils,
  Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiClient, kindergartenApi } from '@/shared/api';
import { clsx } from 'clsx';

type DailyExpenseEntry = {
  district: string;
  costPerChild: number;
};
type DistrictInsight = {
  name: string;
  kindergartens: number;
  children: number;
  present: number;
  before9: number;
  late: number;
  absent: number;
  attendance: number;
  costPerChild: number;
  savedAmount: number;
};

type AIInsightReport = {
  source: string;
  model: string;
  providerResults?: Array<{ source: string; model: string }>;
  cached?: boolean;
  generatedAt?: string;
  error?: string;
  warning?: string;
  providerError?: string;
  analysis?: {
    executiveSummary?: string;
    systemStatus?: string;
    currentWeaknesses?: string[];
    attendanceAnalysis?: {
      decliningKindergartens?: Array<{ name: string; district: string; currentAttendance: number; previousAttendance: number; decline: number; advice: string }>;
      highestDistrict?: { name: string; attendance: number; advice: string } | null;
      lowAgeGroups?: Array<{ name: string; attendance: number; advice: string }>;
      weakWeekdays?: Array<{ day: string; attendance: number; advice: string }>;
      seasonalPatterns?: Array<{ season: string; attendance: number }>;
    };
    coverageAnalysis?: {
      summary?: string;
      lowCoverageDistricts?: Array<{ name: string; coverage: number; freeSeats: number; advice: string }>;
      dataGap?: string;
    };
    parentActivityAnalysis?: {
      summary?: string;
      risks?: Array<{ name: string; district: string; parentAccounts: number; messages: number; unreadNotifications: number }>;
    };
    financialAnalysis?: {
      summary?: string;
      outliers?: Array<{ name: string; district: string; budgetPerChild: number; salaryShare: number; advice: string }>;
      dataGap?: string;
    };
    staffAnalysis?: {
      summary?: string;
      shortages?: Array<{ name: string; district: string; children: number; actualEducators: number; requiredEducators: number; educatorShortage: number; childrenPerEducator: number }>;
    };
    nutritionAnalysis?: {
      summary?: string;
      averageCalories?: number;
      averageProtein?: number;
      dataGap?: string;
    };
    healthAnalysis?: {
      summary?: string;
      riskGroups?: Array<{ name: string; sickChildren: number; checks: number }>;
    };
    ratingAnalysis?: {
      topKindergartens?: Array<{ name: string; district: string; rating: number; attendance: number; coverage: number }>;
      problematicKindergartens?: Array<{ name: string; district: string; rating: number; attendance: number; dataCompleteness: number; educatorShortage: number }>;
    };
    forecastAnalysis?: {
      summary?: string;
      advice?: string;
    };
    strategicQuestions?: string[];
    roadmap?: {
      stage1Now?: string[];
      stage2Next?: string[];
      stage3Later?: string[];
    };
    lowAttendanceDistricts?: Array<{ name: string; attendance: number; reason: string; action: string }>;
    goodAttendanceDistricts?: Array<{ name: string; attendance: number; incentive: string }>;
    kindergartenFocus?: Array<{ name: string; district: string; attendance: number; issue: string; action: string }>;
    childEngagementPlan?: string[];
    savingsAnalysis?: string;
    next24HourActions?: string[];
  };
};

const toInputDate = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeDistrict = (value: unknown) => String(value || "Noma'lum tuman")
  .replace(/[\u2018\u2019\u02bb`]/g, "'")
  .replace(/g'uzor/gi, 'guzor')
  .trim()
  .toLowerCase();

const childCountOf = (kg: any) => toNumber(kg.actualChildrenCount ?? kg.childrenCount ?? kg.currentChildren);
const attendancePercent = (present: number, total: number) => total > 0 ? Math.round((present / total) * 100) : 0;
const money = (value: number) => `${Math.round(value).toLocaleString('uz-UZ')} so'm`;
const numberText = (value: number) => Math.round(value).toLocaleString('uz-UZ');
const uzMonths = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

const parseInputDate = (value: string) => {
  const [year, month, day] = String(value || toInputDate()).split('-').map(Number);
  return {
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    month: Number.isFinite(month) ? month : new Date().getMonth() + 1,
    day: Number.isFinite(day) ? day : new Date().getDate(),
  };
};

const addDaysToInputDate = (value: string, days: number) => {
  const { year, month, day } = parseInputDate(value);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
};

const formatReportDateTime = (value: string, time = '08:00') => {
  const { year, month, day } = parseInputDate(value);
  return `${year}-yil ${day}-${uzMonths[Math.max(0, month - 1)]}, ${time} holati bo'yicha`;
};

const formatSourceName = (source?: string) => {
  const value = String(source || '').toLowerCase();
  if (!value) return 'OpenAI + Gemini kutilmoqda';
  if (value.includes('local-fallback')) return 'Lokal DB tahlil';
  if (value === 'ensemble') return 'OpenAI + Gemini';
  return value
    .split('+')
    .map((item) => item === 'openai' ? 'OpenAI' : item === 'gemini' ? 'Gemini' : item)
    .join(' + ');
};

const formatModelName = (model?: string) => {
  if (!model) return 'AI xulosa hali shakllanmagan';
  if (model === 'local-snapshot-analysis') return 'Ichki snapshot tahlili';
  return model;
};

const sanitizeAIMessage = (message?: string) => {
  const text = String(message || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (/quota|billing|rate.?limit|limit/i.test(text)) {
    return 'Tashqi AI provider quota yoki billing limiti sabab javob bermadi. Hozir lokal DB tahlili koʼrsatilmoqda.';
  }
  if (/api key|permission|unauthorized|forbidden|invalid/i.test(text)) {
    return 'AI provider kaliti yoki ruxsatida muammo bor. Sozlamani tekshiring.';
  }
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
};

const KpiCard = ({ icon: Icon, label, value, sub, tone }: any) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-1 max-h-12 overflow-hidden break-words text-xs font-bold leading-4 text-slate-400">{sub}</p>
      </div>
      <div className={clsx(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
        tone === 'emerald' && 'bg-emerald-50 text-emerald-600',
        tone === 'rose' && 'bg-rose-50 text-rose-600',
        tone === 'amber' && 'bg-amber-50 text-amber-600',
        tone === 'indigo' && 'bg-indigo-50 text-indigo-600',
      )}>
        <Icon size={21} />
      </div>
    </div>
  </div>
);

const DistrictRow = ({ item, rank, mode }: { item: DistrictInsight; rank: number; mode: 'low' | 'good' }) => (
  <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-[44px_1fr_auto] sm:items-center">
    <div className={clsx(
      'flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black',
      mode === 'good' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
    )}>
      #{rank}
    </div>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-black text-slate-950">{item.name}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
          {item.kindergartens} MTT
        </span>
      </div>
      <p className="mt-1 text-xs font-bold text-slate-400">
        {numberText(item.present)} keldi, {numberText(item.absent)} kelmadi, {numberText(item.late)} kechikdi
      </p>
    </div>
    <div className="text-left sm:text-right">
      <p className={clsx('text-lg font-black', mode === 'good' ? 'text-emerald-600' : 'text-rose-600')}>{item.attendance}%</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Davomat</p>
    </div>
  </div>
);

const StageCard = ({ title, items, tone }: { title: string; items?: string[]; tone: 'indigo' | 'emerald' | 'amber' }) => (
  <div className={clsx(
    'rounded-2xl border p-5 shadow-sm',
    tone === 'indigo' && 'border-indigo-100 bg-indigo-50',
    tone === 'emerald' && 'border-emerald-100 bg-emerald-50',
    tone === 'amber' && 'border-amber-100 bg-amber-50',
  )}>
    <p className={clsx(
      'mb-3 text-[10px] font-black uppercase tracking-widest',
      tone === 'indigo' && 'text-indigo-700',
      tone === 'emerald' && 'text-emerald-700',
      tone === 'amber' && 'text-amber-700',
    )}>
      {title}
    </p>
    <div className="flex flex-wrap gap-2">
      {(items?.length ? items : ['Maʼlumot shakllanmoqda']).map((item) => (
        <span key={item} className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-black text-slate-700 shadow-sm">
          {item}
        </span>
      ))}
    </div>
  </div>
);

const InsightPanel = ({ icon: Icon, title, summary, items, tone = 'slate' }: any) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <div className={clsx(
        'flex h-10 w-10 items-center justify-center rounded-2xl',
        tone === 'rose' && 'bg-rose-50 text-rose-600',
        tone === 'emerald' && 'bg-emerald-50 text-emerald-600',
        tone === 'amber' && 'bg-amber-50 text-amber-600',
        tone === 'indigo' && 'bg-indigo-50 text-indigo-600',
        tone === 'slate' && 'bg-slate-100 text-slate-600',
      )}>
        <Icon size={19} />
      </div>
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">{title}</h2>
    </div>
    {summary && <p className="mb-4 text-sm font-bold leading-6 text-slate-700">{summary}</p>}
    <div className="space-y-2">
      {(items?.length ? items : ['AI xulosa uchun maʼlumot yigʻilmoqda']).slice(0, 5).map((item: string, index: number) => (
        <div key={`${title}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-600">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export const AIInsights = () => {
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<DailyExpenseEntry[]>([]);
  const [aiReport, setAiReport] = useState<AIInsightReport | null>(null);
  const [aiError, setAiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(toInputDate());

  const loadData = async (forceAI = false) => {
    setLoading(true);
    setAiError('');
    try {
      const [kgResponse, expenseResponse] = await Promise.all([
        kindergartenApi.getAll(),
        apiClient.get('/kindergartens/daily-district-expenses', { params: { date } }),
      ]);
      setKindergartens(Array.isArray(kgResponse) ? kgResponse : []);
      setExpenses(Array.isArray(expenseResponse.data?.entries) ? expenseResponse.data.entries : []);

      try {
        const aiResponse = await apiClient.get('/kindergartens/ai-insights', { params: { date, refresh: forceAI ? '1' : undefined } });
        setAiReport(aiResponse.data || null);
      } catch (error: any) {
        setAiReport(null);
        setAiError(sanitizeAIMessage(error?.response?.data?.error || error?.response?.data?.providerError) || 'OpenAI va Gemini API xulosasi olinmadi');
      }
    } catch {
      setKindergartens([]);
      setExpenses([]);
      setAiReport(null);
      setAiError('Real baza maʼlumotlarini yuklab boʼlmadi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const stats = useMemo(() => {
    const expenseByDistrict = new Map<string, number>();
    expenses.forEach((entry: any) => {
      expenseByDistrict.set(normalizeDistrict(entry.district), toNumber(entry.costPerChild ?? entry.cost_per_child));
    });

    const districtMap = new Map<string, DistrictInsight>();
    kindergartens.forEach((kg) => {
      const name = String(kg.district || "Noma'lum tuman").trim() || "Noma'lum tuman";
      const key = normalizeDistrict(name);
      const current = districtMap.get(key) || {
        name,
        kindergartens: 0,
        children: 0,
        present: 0,
        before9: 0,
        late: 0,
        absent: 0,
        attendance: 0,
        costPerChild: expenseByDistrict.get(key) || 0,
        savedAmount: 0,
      };

      const before9 = toNumber(kg.attendedBefore9);
      const late = toNumber(kg.attendedAfter9);
      const absent = toNumber(kg.absent);
      current.kindergartens += 1;
      current.children += childCountOf(kg);
      current.before9 += before9;
      current.late += late;
      current.present += before9 + late;
      current.absent += absent;
      current.costPerChild = expenseByDistrict.get(key) || current.costPerChild || 0;
      districtMap.set(key, current);
    });

    const districts = Array.from(districtMap.values()).map((district) => ({
      ...district,
      attendance: attendancePercent(district.present, district.children),
      savedAmount: district.absent * district.costPerChild,
    }));

    const withAttendance = districts.filter((district) => district.children > 0 && (district.present > 0 || district.absent > 0));
    const lowDistricts = [...withAttendance].sort((a, b) => a.attendance - b.attendance).slice(0, 5);
    const goodDistricts = [...withAttendance].sort((a, b) => b.attendance - a.attendance).slice(0, 5);
    const totalChildren = districts.reduce((sum, district) => sum + district.children, 0);
    const totalPresent = districts.reduce((sum, district) => sum + district.present, 0);
    const totalAbsent = districts.reduce((sum, district) => sum + district.absent, 0);
    const totalSaved = districts.reduce((sum, district) => sum + district.savedAmount, 0);
    const missingExpenseDistricts = districts.filter((district) => district.absent > 0 && district.costPerChild <= 0).length;

    return {
      districts,
      lowDistricts,
      goodDistricts,
      totalChildren,
      totalPresent,
      totalAbsent,
      totalSaved,
      missingExpenseDistricts,
      attendance: attendancePercent(totalPresent, totalChildren),
      chart: districts
        .sort((a, b) => a.name.localeCompare(b.name, 'uz'))
        .map((district) => ({
          name: district.name.replace(' tumani', '').replace(' shahri', ''),
          fullName: district.name,
          kelgan: district.present,
          kelmagan: district.absent,
          davomat: district.attendance,
        })),
    };
  }, [expenses, kindergartens]);

  const primaryRisk = stats.lowDistricts[0];
  const primaryLeader = stats.goodDistricts[0];
  const aiAnalysis = aiReport?.analysis;
  const hasAIAnalysis = Boolean(aiAnalysis);
  const reportTimeText = formatReportDateTime(date);
  const nextReportTimeText = formatReportDateTime(addDaysToInputDate(date, 1));
  const chartHeight = Math.max(380, stats.chart.length * 42 + 90);
  const sourceName = formatSourceName(aiReport?.source);
  const modelName = formatModelName(aiReport?.model);
  const cacheText = aiReport?.cached ? 'Bugungi xulosa keshdan olindi' : hasAIAnalysis ? 'Yangi xulosa shakllantirildi' : 'AI xulosa berilmadi';
  const providerWarning = sanitizeAIMessage(aiReport?.warning || aiReport?.providerError);

  const attendanceItems = [
    ...(aiAnalysis?.attendanceAnalysis?.decliningKindergartens || []).map((item) =>
      `${item.name} (${item.district}): davomat ${item.previousAttendance}% dan ${item.currentAttendance}% ga tushgan, pasayish ${item.decline}%. ${item.advice}`
    ),
    ...(aiAnalysis?.attendanceAnalysis?.lowAgeGroups || []).map((item) =>
      `${item.name}: davomat ${item.attendance}%. ${item.advice}`
    ),
    ...(aiAnalysis?.attendanceAnalysis?.weakWeekdays || []).map((item) =>
      `${item.day}: ${item.attendance}% davomat. ${item.advice}`
    ),
  ];

  const coverageItems = [
    ...(aiAnalysis?.coverageAnalysis?.lowCoverageDistricts || []).map((item) =>
      `${item.name}: qamrov ${item.coverage}%, bo'sh o'rin ${numberText(item.freeSeats)}. ${item.advice}`
    ),
    aiAnalysis?.coverageAnalysis?.dataGap,
  ].filter(Boolean) as string[];

  const financeItems = [
    ...(aiAnalysis?.financialAnalysis?.outliers || []).map((item) =>
      `${item.name} (${item.district}): bola boshiga ${money(item.budgetPerChild)}, ish haqi ulushi ${item.salaryShare}%. ${item.advice}`
    ),
    aiAnalysis?.financialAnalysis?.dataGap,
  ].filter(Boolean) as string[];

  const staffItems = (aiAnalysis?.staffAnalysis?.shortages || []).map((item) =>
    `${item.name} (${item.district}): kerak ${item.requiredEducators}, mavjud ${item.actualEducators}, yetishmovchilik ${item.educatorShortage}, yuklama ${item.childrenPerEducator} bola/tarbiyachi.`
  );

  const parentItems = [
    aiAnalysis?.parentActivityAnalysis?.summary,
    ...(aiAnalysis?.parentActivityAnalysis?.risks || []).map((item) =>
      `${item.name}: parent akkaunt ${item.parentAccounts}, murojaat/xabar ${item.messages}, o'qilmagan bildirishnoma ${item.unreadNotifications}.`
    ),
  ].filter(Boolean) as string[];

  const nutritionItems = [
    `O'rtacha kaloriya: ${numberText(aiAnalysis?.nutritionAnalysis?.averageCalories || 0)}, protein: ${aiAnalysis?.nutritionAnalysis?.averageProtein || 0}.`,
    aiAnalysis?.nutritionAnalysis?.dataGap,
  ].filter(Boolean) as string[];

  const healthItems = [
    ...(aiAnalysis?.healthAnalysis?.riskGroups || []).map((item) =>
      `${item.name}: ${item.sickChildren} kasallik signali, ${item.checks} tekshiruv.`
    ),
  ];

  const ratingItems = [
    ...(aiAnalysis?.ratingAnalysis?.topKindergartens || []).slice(0, 3).map((item) =>
      `TOP: ${item.name} (${item.district}) reyting ${item.rating}, davomat ${item.attendance}%, qamrov ${item.coverage}%.`
    ),
    ...(aiAnalysis?.ratingAnalysis?.problematicKindergartens || []).slice(0, 3).map((item) =>
      `Muammoli: ${item.name} (${item.district}) reyting ${item.rating}, davomat ${item.attendance}%, data ${item.dataCompleteness}%.`
    ),
  ];

  const refreshInsightWindow = () => {
    loadData(true);
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#f4f6fb] pb-20">
      <section className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                <BrainCircuit size={27} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">AI xulosalari</h1>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">
                  24 soatlik davomat, jalb qilish va moliyaviy tejamkorlik tahlili
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm font-medium leading-6 text-slate-300">
              {aiAnalysis?.executiveSummary || sanitizeAIMessage(aiError) || 'AI xulosa faqat davomat maʼlumotlari va OpenAI + Gemini API javobi mavjud boʼlganda koʼrsatiladi.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[480px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-indigo-300">
                <CalendarClock size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">Xulosa vaqti</p>
              </div>
              <p className="text-sm font-black leading-5">{reportTimeText}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">Keyingi xulosa: {nextReportTimeText}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">Manba</p>
              </div>
              <p className="text-sm font-black leading-5">{sourceName}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                {cacheText} - {modelName}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard icon={Users} label="Bugun kelgan" value={numberText(stats.totalPresent)} sub={`${numberText(stats.totalChildren)} boladan`} tone="emerald" />
        <KpiCard icon={ShieldAlert} label="Bugun kelmagan" value={numberText(stats.totalAbsent)} sub={`${stats.attendance}% umumiy davomat`} tone="rose" />
        <KpiCard icon={Banknote} label="Tejalgan mablag'" value={money(stats.totalSaved)} sub={stats.missingExpenseDistricts ? `${stats.missingExpenseDistricts} tumanda xarajat kiritilmagan` : 'Kunlik tuman xarajati asosida'} tone="amber" />
        <KpiCard icon={Sparkles} label="AI holati" value={hasAIAnalysis ? 'Tayyor' : 'Yoʼq'} sub={hasAIAnalysis ? (providerWarning || sourceName) : (sanitizeAIMessage(aiError) || 'AI xulosa berilmadi')} tone="indigo" />
      </div>

      {hasAIAnalysis && providerWarning && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm font-bold leading-6 text-indigo-950">
          {providerWarning}
        </section>
      )}

      {!hasAIAnalysis && (
        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm font-bold leading-6 text-amber-950">
          {sanitizeAIMessage(aiError) || 'AI xulosa shakllantirilmadi. Davomat kiritilgandan va OpenAI + Gemini API sozlangandan keyin bu qism avtomatik chiqadi.'}
        </section>
      )}

      {hasAIAnalysis && (
        <section className="grid gap-4 xl:grid-cols-3">
          <StageCard title="1-bosqich: hozir" items={aiAnalysis?.roadmap?.stage1Now} tone="indigo" />
          <StageCard title="2-bosqich: keyingi" items={aiAnalysis?.roadmap?.stage2Next} tone="emerald" />
          <StageCard title="3-bosqich: strategik" items={aiAnalysis?.roadmap?.stage3Later} tone="amber" />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Davomat grafigi</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Kelgan va kelmagan bolalar</h2>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={refreshInsightWindow}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-indigo-700"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Yangilash
              </button>
            </div>
          </div>

          <div className="pb-2">
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chart} layout="vertical" margin={{ top: 10, right: 18, left: 12, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={10} fontWeight={800} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    interval={0}
                    width={118}
                    fontSize={10}
                    fontWeight={800}
                    tick={{ fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                    contentStyle={{ border: 'none', borderRadius: 14, boxShadow: '0 18px 45px rgba(15,23,42,.14)', fontSize: 12 }}
                  />
                  <Bar dataKey="kelgan" name="Kelgan" fill="#10b981" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="kelmagan" name="Kelmagan" fill="#f43f5e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {hasAIAnalysis && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-rose-700">
              <TrendingDown size={18} />
              <h2 className="text-sm font-black uppercase tracking-widest">Past davomat bo'yicha xulosa</h2>
            </div>
            <p className="text-sm font-bold leading-6 text-rose-950">
              {aiAnalysis?.lowAttendanceDistricts?.[0] ? `${aiAnalysis.lowAttendanceDistricts[0].name}: ${aiAnalysis.lowAttendanceDistricts[0].reason} ${aiAnalysis.lowAttendanceDistricts[0].action}` : ''}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <TrendingUp size={18} />
              <h2 className="text-sm font-black uppercase tracking-widest">Yaxshi davomat bo'yicha xulosa</h2>
            </div>
            <p className="text-sm font-bold leading-6 text-emerald-950">
              {aiAnalysis?.goodAttendanceDistricts?.[0] ? `${aiAnalysis.goodAttendanceDistricts[0].name}: ${aiAnalysis.goodAttendanceDistricts[0].incentive}` : ''}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-700">
              <Banknote size={18} />
              <h2 className="text-sm font-black uppercase tracking-widest">Kelmaganlar hisobidan tejam</h2>
            </div>
            <p className="text-sm font-bold leading-6 text-amber-950">
              {aiAnalysis?.savingsAnalysis || ''}
            </p>
          </div>
        </div>
        )}
      </section>

      {hasAIAnalysis && (
      <section className="grid gap-5 xl:grid-cols-2">
        <InsightPanel
          icon={LineChart}
          title="Davomat tahlili"
          summary={aiAnalysis?.attendanceAnalysis?.highestDistrict
            ? `Eng yuqori davomat: ${aiAnalysis.attendanceAnalysis.highestDistrict.name} (${aiAnalysis.attendanceAnalysis.highestDistrict.attendance}%). ${aiAnalysis.attendanceAnalysis.highestDistrict.advice}`
            : 'Davomat signallari bugungi va 120 kunlik bazadan shakllanadi.'}
          items={attendanceItems}
          tone="rose"
        />
        <InsightPanel
          icon={MapPinned}
          title="Qamrov tahlili"
          summary={aiAnalysis?.coverageAnalysis?.summary || `Joriy qamrov ${stats.attendance}% davomat signallari bilan birga ko'rilmoqda.`}
          items={coverageItems}
          tone="indigo"
        />
        <InsightPanel
          icon={MessageCircle}
          title="Ota-onalar faolligi"
          summary={aiAnalysis?.parentActivityAnalysis?.summary}
          items={parentItems}
          tone="emerald"
        />
        <InsightPanel
          icon={Banknote}
          title="Moliyaviy tahlil"
          summary={aiAnalysis?.financialAnalysis?.summary || aiAnalysis?.savingsAnalysis}
          items={financeItems}
          tone="amber"
        />
        <InsightPanel
          icon={GraduationCap}
          title="Kadrlar tahlili"
          summary={aiAnalysis?.staffAnalysis?.summary}
          items={staffItems}
          tone="indigo"
        />
        <InsightPanel
          icon={Utensils}
          title="Ovqatlanish tahlili"
          summary={aiAnalysis?.nutritionAnalysis?.summary}
          items={nutritionItems}
          tone="emerald"
        />
        <InsightPanel
          icon={HeartPulse}
          title="Sog'liq tahlili"
          summary={aiAnalysis?.healthAnalysis?.summary}
          items={healthItems}
          tone="rose"
        />
        <InsightPanel
          icon={Star}
          title="Reyting va prognoz"
          summary={aiAnalysis?.forecastAnalysis?.summary || aiAnalysis?.forecastAnalysis?.advice}
          items={[...ratingItems, aiAnalysis?.forecastAnalysis?.advice].filter(Boolean)}
          tone="amber"
        />
      </section>
      )}

      {hasAIAnalysis && Boolean(aiAnalysis?.strategicQuestions?.length) && (
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="text-indigo-600" size={18} />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Rahbar savollariga AI javob signallari</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(aiAnalysis?.strategicQuestions || []).slice(0, 6).map((text, index) => (
            <div key={`${text}-${index}`} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">
              {text}
            </div>
          ))}
        </div>
      </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-rose-600" size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Davomadi past tumanlar</h2>
          </div>
          {stats.lowDistricts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">
              Davomat ma'lumoti yo'q
            </div>
          )}
          {stats.lowDistricts.map((item, index) => <DistrictRow key={item.name} item={item} rank={index + 1} mode="low" />)}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="text-emerald-600" size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Davomadi yaxshi tumanlar</h2>
          </div>
          {stats.goodDistricts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">
              Davomat ma'lumoti yo'q
            </div>
          )}
          {stats.goodDistricts.map((item, index) => <DistrictRow key={item.name} item={item} rank={index + 1} mode="good" />)}
        </div>
      </section>

      {hasAIAnalysis && Boolean(aiAnalysis?.childEngagementPlan?.length) && (
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="text-indigo-600" size={18} />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Bolalarni kengroq jalb qilish bo'yicha AI tavsiyalar</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(aiAnalysis?.childEngagementPlan || []).map((text, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">Tavsiya {index + 1}</p>
              <p className="text-sm font-bold leading-6 text-slate-700">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>
      )}
    </div>
  );
};
