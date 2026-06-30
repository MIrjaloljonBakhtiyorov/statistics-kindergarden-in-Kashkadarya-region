import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Box, CalendarDays, Database, Download, Package, Save, Search, TrendingUp, Wallet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { apiClient } from '@/shared/api';

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

const PRODUCTS = [
  { name: "1-sort bug'doy noni", unit: 'kg' },
  { name: "1-sort bug'doy uni", unit: 'kg' },
  { name: 'Kisel', unit: 'kg' },
  { name: 'Yorma, makaron mahsulotlari', unit: 'kg' },
  { name: 'Shakar', unit: 'kg' },
  { name: 'Qandolat mahsulotlari', unit: 'kg' },
  { name: "Sariyog'", unit: 'kg' },
  { name: "O'simlik yog'i", unit: 'kg' },
  { name: 'Sut', unit: 'kg' },
  { name: 'Kefir', unit: 'kg' },
  { name: 'Smetana', unit: 'kg' },
  { name: 'Tvorog', unit: 'kg' },
  { name: 'Pishloq', unit: 'kg' },
  { name: "Go'sht, parranda go'shti", unit: 'kg' },
  { name: 'Baliq', unit: 'kg' },
  { name: 'Tuxum', unit: 'dona' },
  { name: 'Kartoshka', unit: 'kg' },
  { name: 'Sabzavot, shu jumladan tomat', unit: 'kg' },
  { name: 'Mevalar, rezavorlar va sharbatlar', unit: 'kg' },
  { name: 'Quruq mevalar', unit: 'kg' },
  { name: 'Choy', unit: 'kg' },
  { name: 'Kakao', unit: 'kg' },
  { name: 'Yodlangan tuz', unit: 'kg' },
  { name: 'Xamirturush', unit: 'kg' },
];

type WarehouseEntry = {
  id?: string;
  date?: string;
  district: string;
  productName: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  note?: string;
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
};

const toInputDate = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const quarterRangeOf = (value: string) => {
  const [yearValue, monthValue] = String(value || toInputDate()).split('-').map(Number);
  const year = Number.isFinite(yearValue) ? yearValue : new Date().getFullYear();
  const monthIndex = Number.isFinite(monthValue) ? monthValue - 1 : new Date().getMonth();
  const quarterIndex = Math.floor(monthIndex / 3);
  const start = new Date(year, quarterIndex * 3, 1);
  const end = new Date(year, quarterIndex * 3 + 3, 0);
  return {
    label: `${year}-yil ${quarterIndex + 1}-chorak`,
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
};

const normalizeKey = (value: string) => String(value || '')
  .replace(/[\u2018\u2019\u02bb`]/g, "'")
  .replace(/g'uzor/gi, 'guzor')
  .toLowerCase()
  .trim();

const entryKey = (district: string, productName: string) => `${normalizeKey(district)}::${normalizeKey(productName)}`;
const money = (value: number) => `${Math.round(value).toLocaleString('uz-UZ')} so'm`;
const shortDistrictName = (value: string) => String(value || '').replace(' shahri', ' sh.').replace(' tumani', ' t.');

const entriesToMap = (entries: WarehouseEntry[] = []) => entries.reduce<Record<string, WarehouseEntry>>((acc, entry: any) => {
  const district = String(entry?.district || '').trim();
  const productName = String(entry?.productName ?? entry?.product_name ?? '').trim();
  if (!district || !productName) return acc;
  acc[entryKey(district, productName)] = {
    id: entry.id,
    date: entry.date,
    district,
    productName,
    unit: entry.unit || 'kg',
    quantity: toNumber(entry.quantity),
    pricePerUnit: toNumber(entry.pricePerUnit ?? entry.price_per_unit),
    note: entry.note || '',
  };
  return acc;
}, {});

export const WarehouseCommandCenter = () => {
  const [date, setDate] = useState(toInputDate());
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState<Record<string, WarehouseEntry>>({});
  const [quarterEntries, setQuarterEntries] = useState<WarehouseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [quarterLoading, setQuarterLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const quarterRange = useMemo(() => quarterRangeOf(date), [date]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    apiClient.get('/kindergartens/district-warehouse-purchases', { params: { date } })
      .then((res) => {
        if (mounted) setEntries(entriesToMap(Array.isArray(res.data?.entries) ? res.data.entries : []));
      })
      .catch(() => {
        if (mounted) {
          setEntries({});
          toast.error("Ombor xarid ma'lumotlari yuklanmadi");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [date]);

  useEffect(() => {
    let mounted = true;
    setQuarterLoading(true);

    apiClient.get('/kindergartens/district-warehouse-purchases', {
      params: { startDate: quarterRange.startDate, endDate: quarterRange.endDate },
    })
      .then((res) => {
        if (mounted) setQuarterEntries(Array.isArray(res.data?.entries) ? res.data.entries : []);
      })
      .catch(() => {
        if (mounted) {
          setQuarterEntries([]);
          toast.error('Choraklik ombor hisoboti yuklanmadi');
        }
      })
      .finally(() => {
        if (mounted) setQuarterLoading(false);
      });

    return () => { mounted = false; };
  }, [quarterRange.endDate, quarterRange.startDate]);

  const selectedRows = useMemo(() => PRODUCTS
    .filter((product) => normalizeKey(product.name).includes(normalizeKey(search)))
    .map((product) => {
      const entry = entries[entryKey(selectedDistrict, product.name)];
      const quantity = toNumber(entry?.quantity);
      const pricePerUnit = toNumber(entry?.pricePerUnit);
      return {
        ...product,
        quantity,
        pricePerUnit,
        totalAmount: quantity * pricePerUnit,
        note: entry?.note || '',
      };
    }), [entries, search, selectedDistrict]);

  const districtRows = useMemo(() => DISTRICTS.map((district) => {
    const rows = PRODUCTS.map((product) => {
      const entry = entries[entryKey(district, product.name)];
      const quantity = toNumber(entry?.quantity);
      const pricePerUnit = toNumber(entry?.pricePerUnit);
      return { quantity, totalAmount: quantity * pricePerUnit, unit: entry?.unit || product.unit };
    });
    return {
      name: district,
      filledProducts: rows.filter((row) => row.quantity > 0 || row.totalAmount > 0).length,
      kgQuantity: rows.filter((row) => row.unit !== 'dona').reduce((sum, row) => sum + row.quantity, 0),
      itemQuantity: rows.filter((row) => row.unit === 'dona').reduce((sum, row) => sum + row.quantity, 0),
      totalAmount: rows.reduce((sum, row) => sum + row.totalAmount, 0),
    };
  }), [entries]);

  const productRows = useMemo(() => PRODUCTS.map((product) => {
    const rows = DISTRICTS.map((district) => {
      const entry = entries[entryKey(district, product.name)];
      const quantity = toNumber(entry?.quantity);
      const pricePerUnit = toNumber(entry?.pricePerUnit);
      return { quantity, totalAmount: quantity * pricePerUnit };
    });
    return {
      ...product,
      quantity: rows.reduce((sum, row) => sum + row.quantity, 0),
      totalAmount: rows.reduce((sum, row) => sum + row.totalAmount, 0),
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount), [entries]);

  const quarterlyProductRows = useMemo(() => PRODUCTS.map((product) => {
    const rows = quarterEntries.filter((entry) => normalizeKey(entry.productName) === normalizeKey(product.name));
    return {
      ...product,
      quantity: rows.reduce((sum, row) => sum + toNumber(row.quantity), 0),
      totalAmount: rows.reduce((sum, row) => sum + (toNumber(row.quantity) * toNumber(row.pricePerUnit)), 0),
      districts: new Set(rows.filter((row) => toNumber(row.quantity) > 0 || toNumber(row.pricePerUnit) > 0).map((row) => normalizeKey(row.district))).size,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount || b.quantity - a.quantity), [quarterEntries]);

  const selectedTotal = selectedRows.reduce((sum, row) => sum + row.totalAmount, 0);
  const totalAmount = districtRows.reduce((sum, row) => sum + row.totalAmount, 0);
  const totalKg = districtRows.reduce((sum, row) => sum + row.kgQuantity, 0);
  const filledDistricts = districtRows.filter((row) => row.filledProducts > 0).length;
  const topDistrict = [...districtRows].sort((a, b) => b.totalAmount - a.totalAmount)[0];
  const topProduct = productRows[0];
  const quarterlyTotalAmount = quarterlyProductRows.reduce((sum, row) => sum + row.totalAmount, 0);
  const quarterlyTotalKg = quarterlyProductRows.filter((row) => row.unit !== 'dona').reduce((sum, row) => sum + row.quantity, 0);
  const quarterlyActiveProducts = quarterlyProductRows.filter((row) => row.quantity > 0 || row.totalAmount > 0).length;
  const quarterlyTopProduct = quarterlyProductRows[0];

  const updateEntry = (productName: string, changes: Partial<WarehouseEntry>) => {
    const product = PRODUCTS.find((item) => item.name === productName);
    setEntries((current) => {
      const key = entryKey(selectedDistrict, productName);
      const existing = current[key] || {
        district: selectedDistrict,
        productName,
        unit: product?.unit || 'kg',
        quantity: 0,
        pricePerUnit: 0,
        note: '',
      };
      return {
        ...current,
        [key]: {
          ...existing,
          district: selectedDistrict,
          productName,
          unit: product?.unit || existing.unit || 'kg',
          ...changes,
        },
      };
    });
  };

  const saveSelectedDistrict = async () => {
    setSaving(true);
    try {
      const payload = PRODUCTS.map((product) => {
        const entry = entries[entryKey(selectedDistrict, product.name)];
        return {
          id: entry?.id,
          district: selectedDistrict,
          productName: product.name,
          unit: product.unit,
          quantity: toNumber(entry?.quantity),
          pricePerUnit: toNumber(entry?.pricePerUnit),
          note: entry?.note || '',
        };
      });
      const res = await apiClient.post('/kindergartens/district-warehouse-purchases', { date, entries: payload });
      setEntries((current) => ({ ...current, ...entriesToMap(Array.isArray(res.data?.entries) ? res.data.entries : payload) }));
      setQuarterEntries((current) => {
        const withoutDistrictDay = current.filter((entry) => !(entry.date === date && normalizeKey(entry.district) === normalizeKey(selectedDistrict)));
        const savedEntries = Array.isArray(res.data?.entries) ? res.data.entries : payload.map((entry) => ({ ...entry, date }));
        return [...withoutDistrictDay, ...savedEntries];
      });
      toast.success(`${selectedDistrict} ombor xaridlari saqlandi`);
    } catch {
      toast.error("Ombor xaridlarini saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Sana', 'Tuman', 'Mahsulot', 'Birlik', 'Miqdor', '1 birlik narx', 'Jami xarid', 'Izoh'];
    const rows = DISTRICTS.flatMap((district) => PRODUCTS.map((product) => {
      const entry = entries[entryKey(district, product.name)];
      const quantity = toNumber(entry?.quantity);
      const pricePerUnit = toNumber(entry?.pricePerUnit);
      return [date, district, product.name, product.unit, quantity, pricePerUnit, quantity * pricePerUnit, entry?.note || ''];
    }));
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ombor-xaridlari-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { title: 'Jami xarid', value: money(totalAmount), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Mahsulot miqdori', value: `${Math.round(totalKg).toLocaleString('uz-UZ')} kg`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: "To'ldirilgan hudud", value: `${filledDistricts} / ${DISTRICTS.length}`, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Tanlangan tuman', value: money(selectedTotal), icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-20 font-sans text-slate-900">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Box className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-none">Omborxona Markazi</h1>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                16 hudud bo'yicha 24 turdagi mahsulot xaridi
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full xl:w-auto">
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
              <CalendarDays size={16} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 outline-none min-w-[140px]"
              />
            </label>
            <select
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 outline-none min-w-[220px]"
            >
              {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color} mb-4`}>
                <kpi.icon size={19} />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{kpi.title}</p>
              <h3 className="text-base sm:text-xl font-black text-slate-900 truncate">{loading ? '...' : kpi.value}</h3>
            </motion.div>
          ))}
        </div>

        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7 flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Package size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">{selectedDistrict} ombor xaridi</h2>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Miqdor x 1 birlik narx = jami xarid summasi
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Mahsulot qidirish"
                  className="w-full sm:w-64 pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              <button
                type="button"
                onClick={saveSelectedDistrict}
                disabled={saving || loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Save size={15} />
                {saving ? 'Saqlanmoqda' : 'Tumanni saqlash'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100 border-b border-slate-100">
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanlangan tuman xaridi</p>
              <p className="text-base sm:text-xl font-black text-slate-900">{money(selectedTotal)}</p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Eng katta hudud</p>
              <p className="text-base sm:text-xl font-black text-slate-900 truncate">{topDistrict?.name || "Yo'q"}</p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Eng katta mahsulot</p>
              <p className="text-base sm:text-xl font-black text-slate-900 truncate">{topProduct?.name || "Yo'q"}</p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mahsulot turlari</p>
              <p className="text-base sm:text-xl font-black text-slate-900">{PRODUCTS.length} ta</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mahsulot</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Birlik</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Berilgan miqdor</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">1 birlik narx</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami xarid</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Izoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedRows.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-slate-900">{row.name}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">{row.unit}</span>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min={0}
                        step={row.unit === 'dona' ? 1 : 0.1}
                        value={row.quantity || ''}
                        onChange={(event) => updateEntry(row.name, { quantity: toNumber(event.target.value) })}
                        placeholder="0"
                        className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={row.pricePerUnit || ''}
                        onChange={(event) => updateEntry(row.name, { pricePerUnit: toNumber(event.target.value) })}
                        placeholder="0"
                        className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-emerald-700">{money(row.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <input
                        type="text"
                        value={row.note}
                        onChange={(event) => updateEntry(row.name, { note: event.target.value })}
                        placeholder="Yetkazib beruvchi yoki hujjat raqami"
                        className="w-72 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
          <section className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Tumanlar bo'yicha jami xarid</h2>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Har bir hududga berilgan mahsulotlar summasi</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 w-fit">
                {money(totalAmount)}
              </div>
            </div>

            <div className="h-[430px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtRows} margin={{ top: 10, right: 14, left: 0, bottom: 72 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-38}
                    textAnchor="end"
                    height={86}
                    tickMargin={14}
                    tickFormatter={shortDistrictName}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(Number(value || 0) / 1000000)} mln`} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                  <Tooltip
                    formatter={(value) => [money(toNumber(value)), 'Jami xarid']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="totalAmount" name="Jami xarid" fill="#4f46e5" radius={[5, 5, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-slate-950 border border-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-xl font-black tracking-tight">Mahsulotlar reytingi</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Jami xarid summasi bo'yicha</p>
              </div>
              <BarChart3 size={22} className="text-indigo-300" />
            </div>

            <div className="space-y-3">
              {productRows.slice(0, 10).map((product, index) => (
                <div key={product.name} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">#{index + 1} {product.name}</p>
                      <p className="text-[10px] font-bold text-slate-500">
                        {product.quantity.toLocaleString('uz-UZ')} {product.unit}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-emerald-300">{money(product.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7 flex flex-col xl:flex-row xl:items-start justify-between gap-5 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <BarChart3 size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Choraklik mahsulot xaridi hisoboti</h2>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {quarterRange.label}: {quarterRange.startDate} dan {quarterRange.endDate} gacha
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 w-full xl:w-auto xl:min-w-[760px]">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Chorak jami</p>
                <p className="mt-1 text-lg font-black text-emerald-700">{quarterLoading ? '...' : money(quarterlyTotalAmount)}</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Jami miqdor</p>
                <p className="mt-1 text-lg font-black text-indigo-700">{quarterLoading ? '...' : `${Math.round(quarterlyTotalKg).toLocaleString('uz-UZ')} kg`}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Mahsulot turi</p>
                <p className="mt-1 text-lg font-black text-blue-700">{quarterLoading ? '...' : `${quarterlyActiveProducts} / ${PRODUCTS.length}`}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Eng katta mahsulot</p>
                <p className="mt-1 text-sm font-black text-amber-700 truncate">{quarterLoading ? '...' : (quarterlyTopProduct?.name || "Yo'q")}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="p-5 sm:p-7 border-b border-slate-100">
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">Mahsulotlar bo'yicha xarid summasi</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Chorak kesimida 24 ta mahsulot to'liq ko'rinadi</p>
              </div>
              <div className="h-[560px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyProductRows} margin={{ top: 12, right: 14, left: 0, bottom: 150 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-54}
                      textAnchor="end"
                      height={152}
                      tickMargin={14}
                      tickFormatter={(value) => String(value).length > 20 ? `${String(value).slice(0, 20)}...` : String(value)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 800 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${Math.round(Number(value || 0) / 1000000)} mln`}
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    />
                    <Tooltip
                      formatter={(value) => [money(toNumber(value)), 'Chorak jami']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="totalAmount" name="Chorak jami" fill="#059669" radius={[5, 5, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mahsulot</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Birlik</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Chorak miqdori</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Qamralgan hudud</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Chorak jami xarid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quarterlyProductRows.map((product) => (
                    <tr key={product.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-slate-900">{product.name}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">{product.unit}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                        {quarterLoading ? '...' : `${product.quantity.toLocaleString('uz-UZ')} ${product.unit}`}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-blue-700">
                        {quarterLoading ? '...' : `${product.districts} / ${DISTRICTS.length}`}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-emerald-700">
                        {quarterLoading ? '...' : money(product.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
