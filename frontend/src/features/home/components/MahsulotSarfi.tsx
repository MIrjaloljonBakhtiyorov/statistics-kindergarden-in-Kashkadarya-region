import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area,
} from 'recharts';
import { TrendingUp, Search, Package, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Wheat, Milk, Beef, Carrot, Coffee, Egg, Fish, Apple, Droplets, Leaf, CheckCircle2, CalendarDays, Archive } from 'lucide-react';
import { apiClient } from '@/shared/api';
import { getDistrictNameKey } from '../../../constants';

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

const WAREHOUSE_PRODUCTS = [
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

const PRODUCT_COLORS = ['#2563eb', '#059669', '#7c3aed', '#dc2626', '#d97706', '#0891b2', '#9333ea', '#16a34a'];
const PRODUCT_GRADS = [
  'from-blue-600 to-blue-700',
  'from-emerald-600 to-emerald-700',
  'from-violet-600 to-violet-700',
  'from-red-600 to-red-700',
  'from-amber-600 to-amber-700',
  'from-cyan-600 to-cyan-700',
  'from-purple-600 to-purple-700',
  'from-green-600 to-green-700',
];

const iconForProduct = (name: string) => {
  const text = name.toLowerCase();
  if (text.includes('sut') || text.includes('kefir') || text.includes('smetana') || text.includes('tvorog') || text.includes('pishloq')) return Milk;
  if (text.includes('go')) return Beef;
  if (text.includes('baliq')) return Fish;
  if (text.includes('tuxum')) return Egg;
  if (text.includes('sabzavot') || text.includes('kartoshka')) return Carrot;
  if (text.includes('meva') || text.includes('sharbat')) return Apple;
  if (text.includes('choy') || text.includes('kakao') || text.includes('kisel')) return Coffee;
  if (text.includes('yog')) return Droplets;
  if (text.includes('non') || text.includes('bug') || text.includes('yorma') || text.includes('makaron') || text.includes('xamir')) return Wheat;
  return Package;
};

const productId = (name: string) => name
  .toLowerCase()
  .replace(/[\u2018\u2019`']/g, '')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const normalizeKey = (value: unknown) => String(value || '')
  .replace(/[\u2018\u2019\u02bb`]/g, "'")
  .replace(/g'uzor/gi, 'guzor')
  .toLowerCase()
  .trim();

const toNumber = (value: unknown) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
};

const toInputDate = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const quarterRangeOf = (value = toInputDate()) => {
  const [yearValue, monthValue] = value.split('-').map(Number);
  const year = Number.isFinite(yearValue) ? yearValue : new Date().getFullYear();
  const monthIndex = Number.isFinite(monthValue) ? monthValue - 1 : new Date().getMonth();
  const quarterIndex = Math.floor(monthIndex / 3);
  const start = new Date(year, quarterIndex * 3, 1);
  const end = new Date(year, quarterIndex * 3 + 3, 0);
  return { startDate: toInputDate(start), endDate: toInputDate(end) };
};

const weekRangeOf = (value = toInputDate()) => {
  const date = new Date(`${value}T00:00:00`);
  const day = date.getDay() || 7;
  const start = new Date(date);
  start.setDate(date.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: toInputDate(start), endDate: toInputDate(end) };
};

const shortDistrictName = (value: string) => String(value || '').replace(' shahri', ' sh.').replace(' tumani', ' t.');

type WarehouseEntry = {
  district: string;
  productName: string;
  unit: string;
  quantity: number;
  pricePerUnit?: number;
  totalAmount?: number;
};

const CustomBarTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[160px]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-2xl font-black tracking-tight">{payload[0].value} <span className="text-sm font-bold text-slate-400">{unit}</span></p>
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[160px]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-2xl font-black tracking-tight">{payload[0].value} <span className="text-sm font-bold text-slate-400">{unit}</span></p>
      </div>
    );
  }
  return null;
};

export default function MahsulotSarfi() {
  const { t } = useTranslation();
  const warehouseProducts = useMemo(() => WAREHOUSE_PRODUCTS.map((product, index) => ({
    ...product,
    id: productId(product.name),
    label: product.name,
    color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
    grad: PRODUCT_GRADS[index % PRODUCT_GRADS.length],
    icon: iconForProduct(product.name),
  })), []);
  const [activeProduct, setActiveProduct] = useState(warehouseProducts[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [warehouseEntries, setWarehouseEntries] = useState<WarehouseEntry[]>([]);
  const [weekDate, setWeekDate] = useState(toInputDate());
  const [weeklyEntries, setWeeklyEntries] = useState<WarehouseEntry[]>([]);
  const productRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const quarterRange = quarterRangeOf();
    apiClient.get('/kindergartens/district-warehouse-purchases', {
      params: { startDate: quarterRange.startDate, endDate: quarterRange.endDate },
    })
      .then((res) => {
        if (!mounted) return;
        const entries = Array.isArray(res.data?.entries) ? res.data.entries : [];
        setWarehouseEntries(entries.map((entry: any) => ({
          district: String(entry?.district || '').trim(),
          productName: String(entry?.productName ?? entry?.product_name ?? '').trim(),
          unit: String(entry?.unit || 'kg').trim() || 'kg',
          quantity: toNumber(entry?.quantity),
          pricePerUnit: toNumber(entry?.pricePerUnit ?? entry?.price_per_unit),
          totalAmount: toNumber(entry?.totalAmount ?? entry?.total_amount),
        })));
      })
      .catch(() => {
        if (mounted) setWarehouseEntries([]);
      });

    return () => { mounted = false; };
  }, []);

  const weekRange = useMemo(() => weekRangeOf(weekDate), [weekDate]);

  useEffect(() => {
    let mounted = true;
    apiClient.get('/kindergartens/district-warehouse-purchases', {
      params: { startDate: weekRange.startDate, endDate: weekRange.endDate },
    })
      .then((res) => {
        if (!mounted) return;
        const entries = Array.isArray(res.data?.entries) ? res.data.entries : [];
        setWeeklyEntries(entries.map((entry: any) => ({
          district: String(entry?.district || '').trim(),
          productName: String(entry?.productName ?? entry?.product_name ?? '').trim(),
          unit: String(entry?.unit || 'kg').trim() || 'kg',
          quantity: toNumber(entry?.quantity),
          pricePerUnit: toNumber(entry?.pricePerUnit ?? entry?.price_per_unit),
          totalAmount: toNumber(entry?.totalAmount ?? entry?.total_amount),
        })));
      })
      .catch(() => {
        if (mounted) setWeeklyEntries([]);
      });

    return () => { mounted = false; };
  }, [weekRange.endDate, weekRange.startDate]);

  const productEntries = warehouseEntries.filter((entry) => normalizeKey(entry.productName) === normalizeKey(activeProduct.name));
  const districtRows = DISTRICTS.map((district) => {
    const rows = productEntries.filter((entry) => normalizeKey(entry.district) === normalizeKey(district));
    return {
      name: shortDistrictName(district),
      quantity: rows.reduce((sum, row) => sum + toNumber(row.quantity), 0),
    };
  });

  const filteredData = districtRows
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.quantity - a.quantity);

  const totalConsumption = districtRows.reduce((acc, curr) => acc + curr.quantity, 0);
  const averageConsumption = Math.round(totalConsumption / Math.max(districtRows.length, 1));
  const maxVal = filteredData[0]?.quantity || 0;
  const minVal = filteredData[filteredData.length - 1]?.quantity || 0;

  const topDistrict = filteredData[0];
  const bottomDistrict = filteredData[filteredData.length - 1];
  const activeUnit = activeProduct.unit;
  const districtName = (name: string) => t(getDistrictNameKey(name), { defaultValue: name });
  const chartData = filteredData.map(d => ({ ...d, nameLabel: districtName(d.name) }));
  const productTotals = warehouseProducts.map((product) => ({
    ...product,
    quantity: warehouseEntries
      .filter((entry) => normalizeKey(entry.productName) === normalizeKey(product.name))
      .reduce((sum, entry) => sum + toNumber(entry.quantity), 0),
  }));
  const weeklyProductTotals = warehouseProducts.map((product) => ({
    ...product,
    quantity: weeklyEntries
      .filter((entry) => normalizeKey(entry.productName) === normalizeKey(product.name))
      .reduce((sum, entry) => sum + toNumber(entry.quantity), 0),
    totalAmount: weeklyEntries
      .filter((entry) => normalizeKey(entry.productName) === normalizeKey(product.name))
      .reduce((sum, entry) => sum + (toNumber(entry.totalAmount) || toNumber(entry.quantity) * toNumber(entry.pricePerUnit)), 0),
    districts: new Set(weeklyEntries
      .filter((entry) => normalizeKey(entry.productName) === normalizeKey(product.name) && toNumber(entry.quantity) > 0)
      .map((entry) => normalizeKey(entry.district))).size,
  })).sort((a, b) => b.quantity - a.quantity);
  const weeklyKgTotal = weeklyProductTotals.filter((product) => product.unit !== 'dona').reduce((sum, product) => sum + product.quantity, 0);
  const weeklyItemTotal = weeklyProductTotals.filter((product) => product.unit === 'dona').reduce((sum, product) => sum + product.quantity, 0);
  const weeklyActiveProducts = weeklyProductTotals.filter((product) => product.quantity > 0).length;
  const weeklyTopProduct = weeklyProductTotals.find((product) => product.quantity > 0);
  const visibleProducts = warehouseProducts.filter((product) => normalizeKey(product.label).includes(normalizeKey(productSearchTerm)));
  const scrollProductRail = (direction: 'left' | 'right') => {
    productRailRef.current?.scrollBy({ left: direction === 'left' ? -520 : 520, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Product Tabs */}
      <div className="rounded-[2rem] border border-slate-100 bg-white/90 shadow-sm shadow-slate-100 p-5 md:p-6 overflow-hidden dark:bg-slate-900/90 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm dark:bg-emerald-500/15 dark:border-emerald-400/20">
              <Leaf className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Mahsulotlar</h2>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-300">Omborxona markazidagi mahsulotlarni tanlang</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full lg:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={productSearchTerm}
                onChange={(event) => setProductSearchTerm(event.target.value)}
                placeholder="Mahsulot qidirish..."
                className="w-full h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => scrollProductRail('left')}
              className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-emerald-300"
              aria-label="Oldingi mahsulotlar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollProductRail('right')}
              className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-emerald-300"
              aria-label="Keyingi mahsulotlar"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={productRailRef}
          className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory custom-scrollbar"
        >
          {visibleProducts.map((p) => {
            const isActive = activeProduct.id === p.id;
            return (
              <motion.button
                key={p.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveProduct(p)}
                className={`relative h-[188px] w-[112px] md:w-[120px] shrink-0 snap-start rounded-[1.35rem] border transition-all duration-300 overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-b from-emerald-400 to-emerald-700 border-transparent shadow-xl shadow-emerald-200'
                    : 'bg-white border-slate-100 shadow-sm hover:border-emerald-100 hover:shadow-lg hover:shadow-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-emerald-500/30'
                }`}
              >
                {isActive && <CheckCircle2 className="absolute right-2.5 top-2.5 h-5 w-5 text-white" />}
                <div className="h-full px-3 py-4 flex flex-col items-center justify-between text-center">
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isActive ? 'text-white/75' : 'text-slate-400'}`}>{p.unit}</p>
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/15 ring-1 ring-white/20' : 'bg-slate-50 group-hover:bg-emerald-50 dark:bg-slate-900 dark:group-hover:bg-emerald-500/15'
                  }`}>
                    <p.icon className={`h-7 w-7 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600 dark:text-slate-300 dark:group-hover:text-emerald-300'}`} />
                  </div>
                  <p className={`text-[12px] font-black uppercase leading-[1.12] line-clamp-3 ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{p.label}</p>
                </div>
              </motion.button>
            );
          })}

          {visibleProducts.length === 0 && (
            <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm font-bold text-slate-400 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300">
              Mahsulot topilmadi
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
        {[
          {
            label: t('product.totalConsumption'),
            value: totalConsumption.toLocaleString(),
            unit: activeUnit,
            icon: Package,
            trend: null,
            dark: true,
            accent: null,
          },
          {
            label: t('product.averageConsumption'),
            value: averageConsumption.toLocaleString(),
            unit: activeUnit,
            icon: TrendingUp,
            trend: null,
            dark: false,
            accent: '#3f41db',
          },
          {
            label: t('product.highest'),
            value: maxVal?.toLocaleString(),
            unit: activeUnit,
            sub: topDistrict ? districtName(topDistrict.name) : undefined,
            icon: ChevronUp,
            trend: 'up',
            dark: false,
            accent: '#09865d',
          },
          {
            label: t('product.lowest'),
            value: minVal?.toLocaleString(),
            unit: activeUnit,
            sub: bottomDistrict ? districtName(bottomDistrict.name) : undefined,
            icon: ChevronDown,
            trend: 'down',
            dark: false,
            accent: '#c42b2b',
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-3xl p-4 border flex flex-col justify-between min-h-[112px] ${
              kpi.dark
                ? 'bg-[#0f172a] border-[#1e293b]'
                : 'bg-white border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${kpi.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {kpi.label}
              </p>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: kpi.dark ? 'rgba(255,255,255,0.08)' : (kpi.accent ? kpi.accent + '18' : '#f1f5f9') }}
              >
                <kpi.icon
                  className="w-4.5 h-4.5"
                  style={{ color: kpi.dark ? 'rgba(255,255,255,0.4)' : (kpi.accent ?? '#94a3b8') }}
                />
              </div>
            </div>
            <div>
              <p
                className="text-5xl font-black tracking-tighter leading-none"
                style={{ color: kpi.dark ? '#ffffff' : (kpi.accent ?? '#0f172a') }}
              >
                {kpi.value}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-sm font-bold uppercase tracking-widest ${kpi.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {kpi.unit}
                </span>
                {kpi.sub && (
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    — {kpi.sub}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Archive Report */}
      <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-6 md:px-7 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center dark:bg-indigo-500/15 dark:border-indigo-400/20">
              <Archive className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500 mb-1">Bir haftalik hisobot</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight dark:text-white">
                {weekRange.startDate} - {weekRange.endDate}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-1 dark:text-slate-300">Arxivdagi ombor yozuvlari asosida jami sarflangan mahsulotlar</p>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:bg-slate-950 dark:border-slate-700">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Hafta sanasi</p>
              <input
                type="date"
                value={weekDate}
                onChange={(event) => setWeekDate(event.target.value)}
                className="bg-transparent text-sm font-black text-slate-800 outline-none dark:text-white"
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="p-6 grid grid-cols-2 gap-3 content-start">
            {[
              { label: 'Jami kg', value: Math.round(weeklyKgTotal).toLocaleString('uz-UZ'), sub: 'kilogram', icon: Package, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Jami dona', value: Math.round(weeklyItemTotal).toLocaleString('uz-UZ'), sub: 'dona', icon: Egg, color: '#d97706', bg: '#fffbeb' },
              { label: 'Mahsulot turi', value: weeklyActiveProducts.toLocaleString('uz-UZ'), sub: 'faol tur', icon: Leaf, color: '#059669', bg: '#ecfdf5' },
              { label: 'Eng ko‘p', value: weeklyTopProduct ? Math.round(weeklyTopProduct.quantity).toLocaleString('uz-UZ') : '0', sub: weeklyTopProduct?.label || '-', icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:bg-slate-950/70 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                </div>
                <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{item.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 line-clamp-1">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="p-5">
            <div className="max-h-[330px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {weeklyProductTotals.map((product, index) => {
                const pct = weeklyTopProduct?.quantity ? Math.round((product.quantity / weeklyTopProduct.quantity) * 100) : 0;
                return (
                  <div key={product.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition-colors dark:bg-slate-950/80 dark:border-slate-800 dark:hover:bg-slate-800/80">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[11px] font-black text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black uppercase tracking-tight text-slate-900 truncate dark:text-white">{product.label}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product.districts} hudud</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-black text-[#003580]">{Math.round(product.quantity).toLocaleString('uz-UZ')}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product.unit}</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart Panel */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-8 pb-0">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase dark:text-white">
                  {activeProduct.label} <span className="text-indigo-600">{t('product.consumption')}</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('product.comparative')}
                </p>
              </div>
              {/* Chart type toggle */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
                {(['bar', 'area'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      chartType === type
                        ? 'bg-white shadow-sm text-slate-900 border border-slate-100 dark:bg-slate-800 dark:text-white dark:border-slate-700'
                        : 'text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {type === 'bar' ? t('product.bar') : t('product.area')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeProduct.id}-${chartType}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-8"
            >
              <ResponsiveContainer width="100%" height={380} minWidth={0} minHeight={0}>
                {chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 82 }} barCategoryGap="22%">
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeProduct.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={activeProduct.color} stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="nameLabel"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-40}
                      textAnchor="end"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                      height={82}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomBarTooltip unit={activeUnit} />} cursor={{ fill: 'rgba(148, 163, 184, 0.12)', radius: 8 }} />
                    <Bar dataKey="quantity" fill={activeProduct.color} radius={[8, 8, 4, 4]} barSize={28}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={activeProduct.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 82 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeProduct.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={activeProduct.color} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="nameLabel"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-40}
                      textAnchor="end"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                      height={82}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomAreaTooltip unit={activeUnit} />} cursor={{ stroke: activeProduct.color, strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="quantity"
                      stroke={activeProduct.color}
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={{ fill: activeProduct.color, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: activeProduct.color, strokeWidth: 0 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ranking Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col dark:bg-slate-900 dark:border-slate-800">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight dark:text-white">{t('footer.districts')}</h3>
              <Search className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('product.consumption')}</p>
            <div className="mt-4">
              <input
                type="text"
                placeholder={t('product.searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all dark:bg-slate-950 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[440px]">
            <AnimatePresence mode="popLayout">
              {filteredData.map((d, index) => {
                const val = d.quantity;
                const pct = Math.round((val / maxVal) * 100);
                const isTop = index === 0;
                return (
                  <motion.div
                    key={d.name}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.025 }}
                    className={`p-3.5 rounded-2xl transition-all group cursor-pointer ${
                      isTop
                        ? 'bg-[#0f172a] text-white'
                        : 'bg-slate-50/60 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                          isTop ? 'bg-white/15 text-white' : 'bg-white border border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                        <span className={`font-black uppercase tracking-tight text-[11px] ${isTop ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                          {districtName(d.name)}
                        </span>
                      </div>
                      <span className={`font-black text-sm ${isTop ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {val} <span className={`text-[9px] font-bold ${isTop ? 'text-white/50' : 'text-slate-400'}`}>{activeUnit}</span>
                      </span>
                    </div>
                    <div className={`w-full h-1 rounded-full ${isTop ? 'bg-white/15' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: index * 0.03 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: isTop ? 'white' : activeProduct.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-slate-50 dark:border-slate-800">
            <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center gap-3 dark:bg-slate-950">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: activeProduct.color + '20' }}>
                <activeProduct.icon className="w-4 h-4" style={{ color: activeProduct.color }} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                {t('product.comparative')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {productTotals.map((p, i) => {
          const total = p.quantity;
          const isActive = p.id === activeProduct.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => setActiveProduct(p)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-br ${p.grad} border-transparent shadow-md`
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-950'}`}>
                  <p.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-300'}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{p.label}</span>
              </div>
              <p className={`text-xl font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {total.toLocaleString()}
              </p>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                {t('stats.total')} {p.unit}
              </p>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
