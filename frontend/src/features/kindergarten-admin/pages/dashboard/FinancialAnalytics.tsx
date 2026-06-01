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
  'Beshkent tumani',
];

type DistrictStat = {
  name: string;
  children: number;
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
const money = (value: number) => `${Math.round(value).toLocaleString('uz-UZ')} so'm`;

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

  useEffect(() => {
    let mounted = true;
    kindergartenApi.getAll()
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
  }, []);

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

  const stats = useMemo(() => {
    const totalChildren = kindergartens.reduce((sum, kg) => sum + childCountOf(kg), 0);
    const before9 = kindergartens.reduce((sum, kg) => sum + toNumber(kg.attendedBefore9), 0);
    const after9 = kindergartens.reduce((sum, kg) => sum + toNumber(kg.attendedAfter9), 0);
    const absent = kindergartens.reduce((sum, kg) => sum + toNumber(kg.absent), 0);
    const present = before9 + after9;

    const districtMap = new Map<string, { name: string; children: number; present: number; absent: number }>();
    kindergartens.forEach((kg) => {
      const name = kg.district || "Noma'lum tuman";
      const current = districtMap.get(name) || { name, children: 0, present: 0, absent: 0 };
      current.children += childCountOf(kg);
      current.present += toNumber(kg.attendedBefore9) + toNumber(kg.attendedAfter9);
      current.absent += toNumber(kg.absent);
      districtMap.set(name, current);
    });

    return {
      totalChildren,
      before9,
      after9,
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
      note: entry?.note || '',
    };
  }), [districtStatsByName, expenseByDistrict]);

  const dailyExpenseTotal = dailyRows.reduce((sum, row) => sum + row.totalExpense, 0);
  const dailyExpenseAverage = stats.totalChildren > 0 ? dailyExpenseTotal / stats.totalChildren : 0;
  const filledDistricts = dailyRows.filter((row) => row.costPerChild > 0).length;
  const coveredChildren = dailyRows.reduce((sum, row) => sum + (row.costPerChild > 0 ? row.children : 0), 0);

  const kpis = [
    { title: "Jami bolalar", value: stats.totalChildren.toLocaleString(), unit: "ta", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Bugun kelganlar", value: stats.present.toLocaleString(), unit: "ta", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Kelmaganlar", value: stats.absent.toLocaleString(), unit: "ta", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Davomat", value: `${stats.attendance}`, unit: "%", icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Bog'chalar", value: kindergartens.length.toLocaleString(), unit: "ta", icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
    { title: "Kunlik hisob", value: Math.round(dailyExpenseTotal).toLocaleString('uz-UZ'), unit: "so'm", icon: Wallet, color: "text-amber-600", bg: "bg-amber-50" },
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
                  16 ta tuman bo'yicha 1 bola / 1 kun xarajat kiritiladi
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
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tuman</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bolalar</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Davomat</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">1 bola / 1 kun</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kunlik jami</th>
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

            <div className="h-[320px] min-w-0">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dailyRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="children" name="Jami bolalar" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="present" name="Kelganlar" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
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
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">09:00 gacha</p>
                <p className="text-xl font-black text-emerald-400">{stats.before9.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">09:00 dan keyin</p>
                <p className="text-xl font-black text-amber-400">{stats.after9.toLocaleString()}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

