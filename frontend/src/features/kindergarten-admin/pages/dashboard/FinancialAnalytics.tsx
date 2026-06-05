import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Banknote, Building2, Calculator, CalendarDays, Clock, Coins, Download, Save, Users, Wallet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { apiClient, kindergartenApi } from '@/shared/api';

const DISTRICTS = [
  'Qarshi shahri',
  'Qarshi tumani',
  'Shahrisabz shahri',
  'Shahrisabz tumani',
  'Kitob tumani',
  'Koson tumani',
  'Muborak tumani',
  "G'uzor tumani",
  'Nishon tumani',
  'Dehqonobod tumani',
  'Qamashi tumani',
  'Chiroqchi tumani',
  'Kasbi tumani',
  'Mirishkor tumani',
  "Yakkabog' tumani",
  "Ko'kdala tumani",
];

type DistrictStat = {
  name: string;
  children: number;
  before930: number;
  after930: number;
  present: number;
  absent: number;
  attendance: number;
};

type DailyExpenseEntry = {
  id?: string;
  district: string;
  costPerChild: number;
  note?: string;
};

type WeeklySavingDistrict = {
  name: string;
  absent: number;
  savedAmount: number;
  missingCostDays: number;
  missingCostAbsent: number;
};

type WeeklySavingDay = {
  date: string;
  label: string;
  absent: number;
  savedAmount: number;
  missingCostDistricts: number;
  missingCostAbsent: number;
  districts: WeeklySavingDistrict[];
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};
const childCountOf = (kg: any) => toNumber(kg.actualChildrenCount ?? kg.childrenCount);
const attendancePercent = (present: number, total: number) => total > 0 ? Math.round((present / total) * 100) : 0;
const normalizeDistrict = (value: string) => String(value || '')
  .replace(/[\u2018\u2019\u02bb`]/g, "'")
  .replace(/g'uzor/gi, 'guzor')
  .toLowerCase()
  .trim();
const toInputDate = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};
const addDaysToInputDate = (value: string, days: number) => {
  const [year, month, day] = String(value || toInputDate()).split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
};
const formatShortDate = (value: string) => {
  const [, month, day] = String(value).split('-');
  return `${day}.${month}`;
};
const money = (value: number) => `${Math.round(value).toLocaleString('uz-UZ')} so'm`;
const shortDistrictName = (value: string) => String(value || '')
  .replace(' shahri', ' sh.')
  .replace(' tumani', ' t.');

const entriesToMap = (entries: DailyExpenseEntry[] = []) => entries.reduce<Record<string, DailyExpenseEntry>>((acc, entry) => {
  if (!entry?.district) return acc;
  acc[entry.district] = {
    id: entry.id,
    district: entry.district,
    costPerChild: toNumber((entry as any).costPerChild ?? (entry as any).cost_per_child),
    note: entry.note || '',
  };
  return acc;
}, {});

export const FinancialAnalytics = () => {
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseDate, setExpenseDate] = useState(toInputDate());
  const [expenses, setExpenses] = useState<Record<string, DailyExpenseEntry>>({});
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [weeklyRows, setWeeklyRows] = useState<WeeklySavingDay[]>([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    kindergartenApi.getAll({ date: expenseDate })
      .then((res) => {
        if (mounted) setKindergartens(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setKindergartens([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [expenseDate]);

  useEffect(() => {
    let mounted = true;
    setExpenseLoading(true);

    apiClient.get('/kindergartens/daily-district-expenses', { params: { date: expenseDate } })
      .then((res) => {
        if (mounted) setExpenses(entriesToMap(Array.isArray(res.data?.entries) ? res.data.entries : []));
      })
      .catch(() => {
        if (mounted) {
          setExpenses({});
          toast.error("Kunlik xarajat ma'lumotlari yuklanmadi");
        }
      })
      .finally(() => {
        if (mounted) setExpenseLoading(false);
      });

    return () => { mounted = false; };
  }, [expenseDate]);

  useEffect(() => {
    let mounted = true;
    setWeeklyLoading(true);

    const dates = Array.from({ length: 7 }, (_, index) => addDaysToInputDate(expenseDate, index - 6));

    Promise.all(dates.map(async (date): Promise<WeeklySavingDay> => {
      const [kgResponse, expenseResponse] = await Promise.all([
        kindergartenApi.getAll({ date }),
        apiClient.get('/kindergartens/daily-district-expenses', { params: { date } }),
      ]);

      const expenseMap = entriesToMap(Array.isArray(expenseResponse.data?.entries) ? expenseResponse.data.entries : []);
      const expenseByDistrictForDay = new Map<string, DailyExpenseEntry>();
      Object.values(expenseMap).forEach((entry) => {
        expenseByDistrictForDay.set(normalizeDistrict(entry.district), entry);
      });

      const absentByDistrict = new Map<string, number>();
      (Array.isArray(kgResponse) ? kgResponse : []).forEach((kg) => {
        const key = normalizeDistrict(kg.district || '');
        absentByDistrict.set(key, (absentByDistrict.get(key) || 0) + toNumber(kg.absent));
      });

      let absent = 0;
      let savedAmount = 0;
      let missingCostDistricts = 0;
      let missingCostAbsent = 0;
      const districts: WeeklySavingDistrict[] = [];

      DISTRICTS.forEach((district) => {
        const key = normalizeDistrict(district);
        const districtAbsent = absentByDistrict.get(key) || 0;
        const costPerChild = toNumber(expenseByDistrictForDay.get(key)?.costPerChild);
        const districtSavedAmount = districtAbsent * costPerChild;
        const hasMissingCost = districtAbsent > 0 && costPerChild <= 0;
        absent += districtAbsent;
        savedAmount += districtSavedAmount;
        if (hasMissingCost) {
          missingCostDistricts += 1;
          missingCostAbsent += districtAbsent;
        }
        districts.push({
          name: district,
          absent: districtAbsent,
          savedAmount: districtSavedAmount,
          missingCostDays: hasMissingCost ? 1 : 0,
          missingCostAbsent: hasMissingCost ? districtAbsent : 0,
        });
      });

      return {
        date,
        label: formatShortDate(date),
        absent,
        savedAmount,
        missingCostDistricts,
        missingCostAbsent,
        districts,
      };
    }))
      .then((rows) => {
        if (mounted) setWeeklyRows(rows);
      })
      .catch(() => {
        if (mounted) {
          setWeeklyRows([]);
          toast.error('Haftalik tejam maʼlumotlari yuklanmadi');
        }
      })
      .finally(() => {
        if (mounted) setWeeklyLoading(false);
      });

    return () => { mounted = false; };
  }, [expenseDate]);

  const stats = useMemo(() => {
    const totalChildren = kindergartens.reduce((sum, kg) => sum + childCountOf(kg), 0);
    const before930 = kindergartens.reduce((sum, kg) => sum + toNumber(kg.attendedBefore9), 0);
    const after930 = kindergartens.reduce((sum, kg) => sum + toNumber(kg.attendedAfter9), 0);
    const absent = kindergartens.reduce((sum, kg) => sum + toNumber(kg.absent), 0);
    const present = before930 + after930;

    const districtMap = new Map<string, { name: string; children: number; before930: number; after930: number; present: number; absent: number }>();
    kindergartens.forEach((kg) => {
      const name = kg.district || "Noma'lum tuman";
      const key = normalizeDistrict(name);
      const current = districtMap.get(key) || { name, children: 0, before930: 0, after930: 0, present: 0, absent: 0 };
      const kgBefore930 = toNumber(kg.attendedBefore9);
      const kgAfter930 = toNumber(kg.attendedAfter9);
      current.children += childCountOf(kg);
      current.before930 += kgBefore930;
      current.after930 += kgAfter930;
      current.present += kgBefore930 + kgAfter930;
      current.absent += toNumber(kg.absent);
      districtMap.set(key, current);
    });

    return {
      totalChildren,
      before930,
      after930,
      absent,
      present,
      attendance: attendancePercent(present, totalChildren),
      districts: Array.from(districtMap.values()).map((district): DistrictStat => ({
        ...district,
        attendance: attendancePercent(district.present, district.children)
      }))
    };
  }, [kindergartens]);

  const expenseByDistrict = useMemo(() => {
    const map = new Map<string, DailyExpenseEntry>();
    Object.values(expenses).forEach((entry) => {
      map.set(normalizeDistrict(entry.district), entry);
    });
    return map;
  }, [expenses]);

  const districtStatsByName = useMemo(() => {
    const map = new Map<string, DistrictStat>();
    stats.districts.forEach((district) => {
      map.set(normalizeDistrict(district.name), district);
    });
    return map;
  }, [stats.districts]);

  const dailyRows = useMemo(() => DISTRICTS.map((district) => {
    const stat = districtStatsByName.get(normalizeDistrict(district)) || {
      name: district,
      children: 0,
      before930: 0,
      after930: 0,
      present: 0,
      absent: 0,
      attendance: 0,
    };
    const entry = expenseByDistrict.get(normalizeDistrict(district));
    const costPerChild = toNumber(entry?.costPerChild);

    return {
      ...stat,
      name: district,
      costPerChild,
      totalExpense: costPerChild * stat.children,
      savedAmount: costPerChild * stat.absent,
      note: entry?.note || '',
    };
  }), [districtStatsByName, expenseByDistrict]);

  const dailyExpenseTotal = dailyRows.reduce((sum, row) => sum + row.totalExpense, 0);
  const dailySavedTotal = dailyRows.reduce((sum, row) => sum + row.savedAmount, 0);
  const dailySavedAverage = stats.absent > 0 ? dailySavedTotal / stats.absent : 0;
  const dailyExpenseAverage = stats.totalChildren > 0 ? dailyExpenseTotal / stats.totalChildren : 0;
  const filledDistricts = dailyRows.filter((row) => row.costPerChild > 0).length;
  const coveredChildren = dailyRows.reduce((sum, row) => sum + (row.costPerChild > 0 ? row.children : 0), 0);
  const savingsRows = [...dailyRows].sort((a, b) => (b.savedAmount - a.savedAmount) || (b.absent - a.absent));
  const mostAbsentDistrict = [...dailyRows].sort((a, b) => b.absent - a.absent)[0];
  const topSavingDistrict = savingsRows.find((row) => row.savedAmount > 0) || savingsRows[0];
  const missingCostRows = dailyRows.filter((row) => row.absent > 0 && row.costPerChild <= 0);
  const missingCostAbsent = missingCostRows.reduce((sum, row) => sum + row.absent, 0);
  const weeklySavedTotal = weeklyRows.reduce((sum, row) => sum + row.savedAmount, 0);
  const weeklyAbsentTotal = weeklyRows.reduce((sum, row) => sum + row.absent, 0);
  const weeklyMissingCostDistrictDays = weeklyRows.reduce((sum, row) => sum + row.missingCostDistricts, 0);
  const weeklyMissingCostAbsent = weeklyRows.reduce((sum, row) => sum + row.missingCostAbsent, 0);
  const weeklyDailyAverage = weeklyRows.length > 0 ? weeklySavedTotal / weeklyRows.length : 0;
  const weeklySavedPerAbsent = weeklyAbsentTotal > 0 ? weeklySavedTotal / weeklyAbsentTotal : 0;
  const todayVsWeeklyAverage = weeklyDailyAverage > 0 ? Math.round(((dailySavedTotal - weeklyDailyAverage) * 100) / weeklyDailyAverage) : 0;
  const weeklyDistrictRows = DISTRICTS.map((district) => {
    const rows = weeklyRows.flatMap((row) => row.districts || []).filter((row) => normalizeDistrict(row.name) === normalizeDistrict(district));
    return {
      name: district,
      absent: rows.reduce((sum, row) => sum + row.absent, 0),
      savedAmount: rows.reduce((sum, row) => sum + row.savedAmount, 0),
      missingCostDays: rows.reduce((sum, row) => sum + row.missingCostDays, 0),
      missingCostAbsent: rows.reduce((sum, row) => sum + row.missingCostAbsent, 0),
    };
  }).sort((a, b) => (b.savedAmount - a.savedAmount) || (b.absent - a.absent));

  const kpis = [
    { title: "Jami bolalar", value: stats.totalChildren.toLocaleString(), unit: "ta", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Bugun kelganlar", value: stats.present.toLocaleString(), unit: "ta", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Kelmaganlar", value: stats.absent.toLocaleString(), unit: "ta", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Davomat", value: `${stats.attendance}`, unit: "%", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Bog'chalar", value: kindergartens.length.toLocaleString(), unit: "ta", icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
    { title: "Tejalgan mablag'", value: Math.round(dailySavedTotal).toLocaleString('uz-UZ'), unit: "so'm", icon: Wallet, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const updateExpense = (district: string, changes: Partial<DailyExpenseEntry>) => {
    setExpenses((current) => {
      const normalized = normalizeDistrict(district);
      const existing = Object.values(current).find((entry) => normalizeDistrict(entry.district) === normalized) || {
        district,
        costPerChild: 0,
        note: '',
      };

      return {
        ...current,
        [district]: {
          ...existing,
          district,
          ...changes,
        },
      };
    });
  };

  const saveDailyExpenses = async () => {
    setExpenseSaving(true);
    try {
      const entries = DISTRICTS.map((district) => {
        const entry = expenseByDistrict.get(normalizeDistrict(district)) || expenses[district];
        return {
          district,
          costPerChild: toNumber(entry?.costPerChild),
          note: entry?.note || '',
        };
      });
      const res = await apiClient.post('/kindergartens/daily-district-expenses', { date: expenseDate, entries });
      setExpenses(entriesToMap(Array.isArray(res.data?.entries) ? res.data.entries : entries));
      toast.success('Kunlik real xarajatlar saqlandi');
    } catch {
      toast.error('Kunlik xarajatlarni saqlashda xatolik yuz berdi');
    } finally {
      setExpenseSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white">
              <Coins size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-none">Moliyaviy analitika</h1>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mt-1.5">Real davomat bazasi asosidagi nazorat</p>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={14} className="text-slate-400" /> Export
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-5">
          {kpis.map((kpi, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={kpi.title}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color} mb-4`}>
                <kpi.icon size={18} strokeWidth={2.5} />
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{kpi.title}</p>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">{loading ? "..." : kpi.value}</h3>
                {kpi.unit && <span className="text-[8px] sm:text-[10px] font-bold text-slate-500">{kpi.unit}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7 flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Banknote size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Bir kunlik real xarajat statistikasi</h2>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  14 ta tuman va 2 ta shahar bo'yicha 1 bola / 1 kun xarajat kiritiladi
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                <CalendarDays size={16} className="text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(event) => setExpenseDate(event.target.value)}
                  className="bg-transparent text-xs font-black text-slate-800 outline-none min-w-[140px]"
                />
              </label>
              <button
                type="button"
                onClick={saveDailyExpenses}
                disabled={expenseSaving || expenseLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Save size={15} />
                {expenseSaving ? 'Saqlanmoqda' : 'Saqlash'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100 border-b border-slate-100">
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kunlik jami xarajat</p>
              <p className="text-base sm:text-xl font-black text-slate-900">{money(dailyExpenseTotal)}</p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">O'rtacha 1 bola</p>
              <p className="text-base sm:text-xl font-black text-slate-900">{money(dailyExpenseAverage)}</p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">To'ldirilgan tuman</p>
              <p className="text-base sm:text-xl font-black text-slate-900">{filledDistricts} / {DISTRICTS.length}</p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Qamrab olingan bolalar</p>
              <p className="text-base sm:text-xl font-black text-slate-900">{coveredChildren.toLocaleString()} ta</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tuman</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Umumiy bola</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">09:30 gacha</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">09:30 dan keyin</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami kelgan</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kelmagan</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Davomat</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">1 bola / 1 kun</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kunlik jami</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tejalgan</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Izoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyRows.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-slate-900">{row.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{row.present.toLocaleString()} kelgan, {row.absent.toLocaleString()} kelmagan</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-slate-900">{row.children.toLocaleString()} ta</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-emerald-700">{row.before930.toLocaleString()} ta</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-amber-700">{row.after930.toLocaleString()} ta</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-slate-900">{row.present.toLocaleString()} ta</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-rose-700">{row.absent.toLocaleString()} ta</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black">{row.attendance}%</span>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={row.costPerChild || ''}
                        onChange={(event) => updateExpense(row.name, { costPerChild: toNumber(event.target.value) })}
                        placeholder="0"
                        className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-emerald-700">{money(row.totalExpense)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-amber-700">{money(row.savedAmount)}</td>
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        value={row.note}
                        onChange={(event) => updateExpense(row.name, { note: event.target.value })}
                        placeholder="Masalan: bozor narxi yangilandi"
                        className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Tumanlar bo'yicha real davomat</h2>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Moliyaviy hisoblar shu real sonlarga tayanishi kerak</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 w-fit">
                {stats.present.toLocaleString()} porsiya
              </div>
            </div>

            <div className="h-[380px] min-w-0">
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={dailyRows} margin={{ top: 10, right: 12, left: 0, bottom: 68 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-38}
                    textAnchor="end"
                    height={82}
                    tickMargin={14}
                    tickFormatter={shortDistrictName}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="before930" name="09:30 gacha" stackId="arrivals" fill="#10b981" radius={[0, 0, 4, 4]} barSize={18} />
                  <Bar dataKey="after930" name="09:30 dan keyin" stackId="arrivals" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="absent" name="Kelmaganlar" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <aside className="bg-slate-950 rounded-2xl p-6 text-white shadow-sm">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 mb-5">
              <Calculator size={24} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2">Real moliyaviy hisob</h3>
            <p className="text-sm font-medium text-slate-400 leading-relaxed">
              Kunlik jami xarajat real bolalar soni va admin kiritgan 1 kunlik xarajat asosida hisoblanadi. Saqlangan qiymatlar sana va tuman bo'yicha bazada qoladi.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">09:30 gacha</p>
                <p className="text-xl font-black text-emerald-400">{stats.before930.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">09:30 dan keyin</p>
                <p className="text-xl font-black text-amber-400">{stats.after930.toLocaleString()}</p>
              </div>
            </div>
          </aside>
        </div>

        <section className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 mb-6">
            <div className="max-w-3xl">
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Kelmagan bolalar va tejalgan mablag'</h2>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                14 ta tuman va 2 ta shahar kesimida kelmagan bolalar soni va ular hisobidan tejaladigan summa
              </p>
              <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-black text-amber-900">
                <Calculator size={15} />
                Formula: kelmagan bolalar x 1 bola / 1 kun xarajat = tejalgan mablag'
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:min-w-[720px] xl:grid-cols-3">
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-500">Kelmagan bolalar</p>
                <p className="mt-1 text-xl font-black text-rose-700">{stats.absent.toLocaleString('uz-UZ')} ta</p>
                <p className="mt-1 text-[10px] font-bold text-rose-400">{mostAbsentDistrict?.name || "Ma'lumot yo'q"}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Jami tejalgan mablag'</p>
                <p className="mt-1 text-xl font-black text-amber-700">{money(dailySavedTotal)}</p>
                <p className="mt-1 text-[10px] font-bold text-amber-500">O'rtacha: {money(dailySavedAverage)}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">7 kunlik tejam</p>
                <p className="mt-1 text-xl font-black text-blue-700">{weeklyLoading ? '...' : money(weeklySavedTotal)}</p>
                <p className="mt-1 text-[10px] font-bold text-blue-500">
                  Kunlik o'rtacha: {money(weeklyDailyAverage)} | Bugun {todayVsWeeklyAverage >= 0 ? '+' : ''}{todayVsWeeklyAverage}%
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">7 kunlik kelmaganlar</p>
                <p className="mt-1 text-xl font-black text-indigo-700">{weeklyLoading ? '...' : `${weeklyAbsentTotal.toLocaleString('uz-UZ')} ta`}</p>
                <p className="mt-1 text-[10px] font-bold text-indigo-500">1 bola o'rtacha: {money(weeklySavedPerAbsent)}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Eng katta tejam</p>
                <p className="mt-1 text-xl font-black text-emerald-700">{money(topSavingDistrict?.savedAmount || 0)}</p>
                <p className="mt-1 text-[10px] font-bold text-emerald-500">{topSavingDistrict?.name || "Ma'lumot yo'q"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Xarajatsiz hudud</p>
                <p className="mt-1 text-xl font-black text-slate-900">{missingCostRows.length} ta</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400">{missingCostAbsent.toLocaleString('uz-UZ')} kelmagan bola hisoblanmagan</p>
              </div>
            </div>
          </div>

          {missingCostRows.length > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-950">
              {missingCostRows.length} ta hududda 1 bola / 1 kun xarajat kiritilmagan. Bu hududlarda tejam summasi 0 bo'lib turadi: {missingCostRows.map((row) => shortDistrictName(row.name)).join(', ')}.
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-600">
                  <span className="h-3 w-3 rounded-sm bg-rose-500" /> Kelmagan bolalar
                </span>
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                  <span className="h-3 w-3 rounded-sm bg-amber-500" /> Tejalgan mablag'
                </span>
              </div>
              <div className="h-[640px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsRows} layout="vertical" margin={{ top: 12, right: 42, left: 28, bottom: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                      xAxisId="children"
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    />
                    <XAxis
                      xAxisId="money"
                      type="number"
                      orientation="top"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${Math.round(Number(value || 0) / 1000000)} mln`}
                      tick={{ fontSize: 10, fill: '#b45309', fontWeight: 800 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={132}
                      interval={0}
                      tickFormatter={shortDistrictName}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 800 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "Tejalgan mablag'" ? money(toNumber(value)) : `${toNumber(value).toLocaleString('uz-UZ')} ta`,
                        name,
                      ]}
                      labelFormatter={(label) => String(label)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar xAxisId="children" dataKey="absent" name="Kelmagan bolalar" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={14} />
                    <Bar xAxisId="money" dataKey="savedAmount" name="Tejalgan mablag'" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">TOP tejam hududlari</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Eng katta summa bo'yicha</p>
                  </div>
                  <Banknote size={20} className="text-amber-500" />
                </div>
                <div className="space-y-3">
                  {savingsRows.slice(0, 5).map((row, index) => (
                    <div key={row.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">#{index + 1} {row.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{row.absent.toLocaleString('uz-UZ')} kelmagan x {money(row.costPerChild)}</p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-amber-700">{money(row.savedAmount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-blue-950">Haftalik tejam dinamikasi</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      {formatShortDate(addDaysToInputDate(expenseDate, -6))} - {formatShortDate(expenseDate)}
                    </p>
                  </div>
                  <CalendarDays size={20} className="text-blue-500" />
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Jami</p>
                    <p className="mt-1 text-sm font-black text-blue-900">{weeklyLoading ? '...' : money(weeklySavedTotal)}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Kelmagan</p>
                    <p className="mt-1 text-sm font-black text-blue-900">{weeklyLoading ? '...' : `${weeklyAbsentTotal.toLocaleString('uz-UZ')} ta`}</p>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfdbfe" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#2563eb', fontWeight: 800 }} />
                      <YAxis hide />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "Tejalgan mablag'" ? money(toNumber(value)) : `${toNumber(value).toLocaleString('uz-UZ')} ta`,
                          name,
                        ]}
                        labelFormatter={(label) => `${label} sana`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="savedAmount" name="Tejalgan mablag'" fill="#2563eb" radius={[5, 5, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {weeklyMissingCostDistrictDays > 0 && (
                  <p className="mt-3 text-xs font-bold leading-5 text-blue-700">
                    {weeklyMissingCostDistrictDays} hudud-kunda xarajat kiritilmagan, {weeklyMissingCostAbsent.toLocaleString('uz-UZ')} kelmagan bola haftalik tejamga qo'shilmagan.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Haftalik TOP hududlar</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">7 kunlik tejam bo'yicha</p>
                  </div>
                  <Wallet size={20} className="text-indigo-500" />
                </div>
                <div className="space-y-3">
                  {weeklyDistrictRows.slice(0, 5).map((row, index) => (
                    <div key={row.name} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">#{index + 1} {row.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{row.absent.toLocaleString('uz-UZ')} kelmagan bola</p>
                        </div>
                        <p className="shrink-0 text-sm font-black text-indigo-700">{money(row.savedAmount)}</p>
                      </div>
                      {row.missingCostDays > 0 && (
                        <p className="mt-2 text-[10px] font-bold text-amber-600">
                          {row.missingCostDays} kunda xarajat kiritilmagan, {row.missingCostAbsent.toLocaleString('uz-UZ')} bola hisobdan tashqarida.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-950 p-5 text-white shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle size={20} className="text-rose-300" />
                  <div>
                    <h3 className="text-sm font-black">E'tibor kerak</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Xarajat kiritilmaganlar</p>
                  </div>
                </div>
                {missingCostRows.length === 0 ? (
                  <p className="text-sm font-bold leading-6 text-emerald-200">Barcha hududlarda kunlik xarajat kiritilgan.</p>
                ) : (
                  <div className="space-y-2">
                    {missingCostRows.slice(0, 6).map((row) => (
                      <div key={row.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span className="text-xs font-black text-slate-200">{shortDistrictName(row.name)}</span>
                        <span className="text-xs font-black text-rose-300">{row.absent.toLocaleString('uz-UZ')} kelmagan</span>
                      </div>
                    ))}
                    {missingCostRows.length > 6 && (
                      <p className="text-xs font-bold text-slate-500">Yana {missingCostRows.length - 6} ta hudud bor.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

