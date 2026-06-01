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
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
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
  cached?: boolean;
  generatedAt?: string;
  error?: string;
  analysis?: {
    executiveSummary?: string;
    systemStatus?: string;
    currentWeaknesses?: string[];
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

const getStoredInsightTime = () => {
  const key = 'admin_ai_insights_generated_at';
  const now = Date.now();
  const stored = Number(localStorage.getItem(key) || 0);
  const dayMs = 24 * 60 * 60 * 1000;
  if (stored && now - stored < dayMs) return new Date(stored);

  localStorage.setItem(key, String(now));
  return new Date(now);
};

const formatDateTime = (date: Date) => date.toLocaleString('uz-UZ', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const KpiCard = ({ icon: Icon, label, value, sub, tone }: any) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-1 text-xs font-bold text-slate-400">{sub}</p>
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

export const AIInsights = () => {
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<DailyExpenseEntry[]>([]);
  const [aiReport, setAiReport] = useState<AIInsightReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(toInputDate());
  const [generatedAt, setGeneratedAt] = useState(() => getStoredInsightTime());

  const loadData = (forceAI = false) => {
    setLoading(true);
    Promise.all([
      kindergartenApi.getAll(),
      apiClient.get('/kindergartens/daily-district-expenses', { params: { date } }),
      apiClient.get('/kindergartens/ai-insights', { params: { date, refresh: forceAI ? '1' : undefined } }),
    ])
      .then(([kgResponse, expenseResponse, aiResponse]) => {
        setKindergartens(Array.isArray(kgResponse) ? kgResponse : []);
        setExpenses(Array.isArray(expenseResponse.data?.entries) ? expenseResponse.data.entries : []);
        setAiReport(aiResponse.data || null);
      })
      .catch(() => {
        setKindergartens([]);
        setExpenses([]);
        setAiReport(null);
      })
      .finally(() => setLoading(false));
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
        .filter((district) => district.children > 0)
        .sort((a, b) => b.absent - a.absent)
        .slice(0, 8)
        .map((district) => ({
          name: district.name.replace(' tumani', '').replace(' shahri', ''),
          kelgan: district.present,
          kelmagan: district.absent,
          davomat: district.attendance,
        })),
    };
  }, [expenses, kindergartens]);

  const nextRefresh = useMemo(() => new Date(generatedAt.getTime() + 24 * 60 * 60 * 1000), [generatedAt]);
  const primaryRisk = stats.lowDistricts[0];
  const primaryLeader = stats.goodDistricts[0];
  const aiAnalysis = aiReport?.analysis;

  const refreshInsightWindow = () => {
    const now = new Date();
    localStorage.setItem('admin_ai_insights_generated_at', String(now.getTime()));
    setGeneratedAt(now);
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
              {aiAnalysis?.executiveSummary || (
                <>
                  Bugungi real bazaga ko'ra {numberText(stats.totalPresent)} bola bog'chaga kelgan,
                  {stats.totalAbsent > 0 ? ` ${numberText(stats.totalAbsent)} bola kelmagan.` : " kelmaganlar qayd etilmagan."}
                  {primaryRisk ? ` Eng ko'p e'tibor talab qiladigan hudud: ${primaryRisk.name}.` : ' Davomat kiritilganda hududiy xulosa shakllanadi.'}
                </>
              )}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[480px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-indigo-300">
                <CalendarClock size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">Xulosa vaqti</p>
              </div>
              <p className="text-sm font-black">{formatDateTime(generatedAt)}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">Keyingi: {formatDateTime(nextRefresh)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">Manba</p>
              </div>
              <p className="text-sm font-black">{aiReport ? `${aiReport.source} / ${aiReport.model}` : 'Real baza'}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                {aiReport?.cached ? '24 soatlik cached xulosa' : `${toInputDate(new Date(date))} sanasi`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard icon={Users} label="Bugun kelgan" value={numberText(stats.totalPresent)} sub={`${numberText(stats.totalChildren)} boladan`} tone="emerald" />
        <KpiCard icon={ShieldAlert} label="Bugun kelmagan" value={numberText(stats.totalAbsent)} sub={`${stats.attendance}% umumiy davomat`} tone="rose" />
        <KpiCard icon={Banknote} label="Tejalgan mablag'" value={money(stats.totalSaved)} sub={stats.missingExpenseDistricts ? `${stats.missingExpenseDistricts} tumanda xarajat kiritilmagan` : 'Kunlik tuman xarajati asosida'} tone="amber" />
        <KpiCard icon={Sparkles} label="AI signal" value={primaryRisk ? `${primaryRisk.attendance}%` : "Yo'q"} sub={primaryRisk ? `${primaryRisk.name} past zona` : 'Davomat kiritilmagan'} tone="indigo" />
      </div>

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

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chart} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={10} fontWeight={800} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} fontWeight={800} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: 'none', borderRadius: 14, boxShadow: '0 18px 45px rgba(15,23,42,.14)', fontSize: 12 }} />
                <Bar dataKey="kelgan" name="Kelgan" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="kelmagan" name="Kelmagan" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-rose-700">
              <TrendingDown size={18} />
              <h2 className="text-sm font-black uppercase tracking-widest">Past davomat bo'yicha xulosa</h2>
            </div>
            <p className="text-sm font-bold leading-6 text-rose-950">
              {aiAnalysis?.lowAttendanceDistricts?.[0]
                ? `${aiAnalysis.lowAttendanceDistricts[0].name}: ${aiAnalysis.lowAttendanceDistricts[0].reason} ${aiAnalysis.lowAttendanceDistricts[0].action}`
                : primaryRisk
                ? `${primaryRisk.name} hududida davomat ${primaryRisk.attendance}%. Guruh rahbarlari kelmagan bolalar ota-onasi bilan kunlik aloqani kuchaytirishi, transport va sog'liq sabablarini alohida ro'yxatga olishi kerak.`
                : "Davomat ma'lumoti kiritilgandan keyin riskli hududlar avtomatik ko'rsatiladi."}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <TrendingUp size={18} />
              <h2 className="text-sm font-black uppercase tracking-widest">Yaxshi davomat bo'yicha xulosa</h2>
            </div>
            <p className="text-sm font-bold leading-6 text-emerald-950">
              {aiAnalysis?.goodAttendanceDistricts?.[0]
                ? `${aiAnalysis.goodAttendanceDistricts[0].name}: ${aiAnalysis.goodAttendanceDistricts[0].incentive}`
                : primaryLeader
                ? `${primaryLeader.name} hududi ${primaryLeader.attendance}% davomat bilan yetakchi. Eng faol MTTlarni faxriy yorliq, metodik grant yoki ustama reyting ballari bilan rag'batlantirish mumkin.`
                : "Yaxshi hududlar davomat kiritilgandan keyin shakllanadi."}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-700">
              <Banknote size={18} />
              <h2 className="text-sm font-black uppercase tracking-widest">Kelmaganlar hisobidan tejam</h2>
            </div>
            <p className="text-sm font-bold leading-6 text-amber-950">
              {aiAnalysis?.savingsAnalysis || (
                <>
                  Bugun kelmagan bolalar bo'yicha taxminiy tejalgan mablag': {money(stats.totalSaved)}.
                  Xarajat kiritilmagan tumanlarda tejam 0 deb olindi.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

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

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="text-indigo-600" size={18} />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Bolalarni kengroq jalb qilish bo'yicha AI tavsiyalar</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(aiAnalysis?.childEngagementPlan?.length ? aiAnalysis.childEngagementPlan : [
            'Kelmagan bolalar bo\'yicha ota-onaga shu kunning o\'zida telefon yoki SMS orqali sabab so\'rovi yuborish.',
            'Davomadi past tumanlarda transport, sog\'liq va ota-ona bandligi sabablarini alohida belgilab, haftalik reja qilish.',
            'Yaxshi tumanlar tajribasini past tumanlarga ulash: ertalabki qabul tartibi, guruh motivatsiyasi va ota-ona bilan aloqa protokoli.',
          ]).map((text, index) => (
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
    </div>
  );
};
