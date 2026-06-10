import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Apple,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Database,
  Flame,
  History,
  LayoutGrid,
  MapPin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Utensils,
  Users,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '@/shared/api';

const TABS = [
  { id: 'today', label: 'Bugungi menyu', icon: Clock },
  { id: 'archive', label: 'Arxiv', icon: History },
  { id: 'database', label: 'Taomlar bazasi', icon: Database },
];

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Nonushta',
  LUNCH: 'Tushlik',
  TEA: 'Poldnik',
  DINNER: 'Kechki ovqat',
  Nonushta: 'Nonushta',
  Tushlik: 'Tushlik',
  Poldnik: 'Poldnik',
  'Kechki ovqat': 'Kechki ovqat',
};

const MEAL_ORDER = ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'];
const MEAL_TIME_META: Record<string, { time: string; accent: string; soft: string }> = {
  BREAKFAST: { time: '08:30', accent: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700 border-amber-100' },
  LUNCH: { time: '12:30', accent: 'bg-indigo-600', soft: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  TEA: { time: '16:00', accent: 'bg-rose-500', soft: 'bg-rose-50 text-rose-700 border-rose-100' },
  DINNER: { time: '18:30', accent: 'bg-slate-900', soft: 'bg-slate-100 text-slate-700 border-slate-200' },
};
const WORK_HOUR_GROUPS = [
  { id: 'SHORT_4', label: '4 soatlik', description: 'Qisqa guruhlar', hours: [4], meals: ['BREAKFAST'] },
  { id: 'DAY_9_105', label: '9-10.5 soatlik', description: 'Kunduzgi guruhlar', hours: [9, 9.5, 10.5], meals: ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'] },
  { id: 'LONG_12', label: '12 soatlik', description: 'Uzaytirilgan kun', hours: [12], meals: ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'] },
  { id: 'FULL_24', label: '24 soatlik', description: 'Tun-u kun guruhlar', hours: [24], meals: ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'] },
];
type MealDraft = {
  dish_id?: string;
  meal_name: string;
  composition: string;
  products: string;
  image_url: string;
  calories: string;
  protein: string;
  fat: string;
  carbohydrates: string;
  vitamins: string;
};
const toLocalIso = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const todayIso = () => toLocalIso(new Date());
const toNumber = (value: unknown) => Number(value || 0);
const normalizeWorkHour = (value: unknown) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};
const workHourGroupFor = (value: unknown) => {
  const hours = normalizeWorkHour(value);
  return WORK_HOUR_GROUPS.find((group) => group.id !== 'ALL' && group.hours.includes(hours)) || WORK_HOUR_GROUPS[2];
};
const mealTypesForWorkHours = (value: unknown) => workHourGroupFor(value).meals;
const mealTypesForTarget = (target: string) => {
  const group = WORK_HOUR_GROUPS.find((item) => item.id === target);
  return group?.meals || MEAL_ORDER;
};

const formatDateLabel = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
};
const formatShortDay = (date: Date) => {
  const month = date.toLocaleDateString('uz-UZ', { month: 'long' });
  return `${date.getDate()} ${month} ${date.getFullYear()} yil`;
};

const statusLabel = (row: any) => row.is_approved ? 'Tasdiqlangan' : 'Kutilmoqda';
const completionStatus = (menu: any) => {
  if (!menu.meal_name || !menu.meal_type) return { label: 'To\'ldirish kerak', cls: 'bg-rose-50 text-rose-600 border-rose-100' };
  if (!toNumber(menu.calories)) return { label: 'Kaloriya yo\'q', cls: 'bg-amber-50 text-amber-600 border-amber-100' };
  return { label: 'To\'liq', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
};
const nutritionPartsOf = (menu: any) => String(menu.vitamins || '')
  .split('|')
  .map((part) => part.trim())
  .filter(Boolean);
const productsOf = (menu: any) => {
  if (menu.products) return String(menu.products);
  const productsPart = nutritionPartsOf(menu).find((part) => part.toLowerCase().startsWith('mahsulotlar:'));
  return productsPart ? productsPart.replace(/^Mahsulotlar:\s*/i, '').trim() : '';
};
const compositionOf = (menu: any) => {
  if (menu.composition) return String(menu.composition);
  const compositionPart = nutritionPartsOf(menu).find((part) => part.toLowerCase().startsWith('taomlar:'));
  return compositionPart ? compositionPart.replace(/^Taomlar:\s*/i, '').trim() : '';
};
const toAbsoluteAssetUrl = (url: string) => {
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
  const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return encodeURI(`${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`);
};
const displayAssetUrl = (url?: string | null) => {
  if (!url) return '';
  return url.startsWith('data:') ? url : encodeURI(toAbsoluteAssetUrl(url));
};
const parseDishIngredients = (value: unknown) => {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    if (!Array.isArray(parsed)) return '';
    return parsed
      .map((item) => {
        const name = item?.name || '';
        const weight = item?.age37Weight || item?.age13Weight || '';
        const net = item?.age37Net || item?.age13Net || '';
        return [name, weight || net].filter(Boolean).join(' | ');
      })
      .filter(Boolean)
      .join('\n');
  } catch {
    return '';
  }
};
const createEmptyMealDraft = (): MealDraft => ({
  dish_id: '',
  meal_name: '',
  composition: '',
  products: '',
  image_url: '',
  calories: '',
  protein: '',
  fat: '',
  carbohydrates: '',
  vitamins: '',
});

const dishToMealDraft = (dish: any): MealDraft => ({
  dish_id: dish.id,
  meal_name: dish.name || '',
  composition: dish.technology || dish.quality_requirements || dish.name || '',
  products: parseDishIngredients(dish.ingredients),
  image_url: dish.image || dish.image_2 || '',
  calories: String(dish.kcal_3_7 || dish.kcal || dish.kcal_1_3 || ''),
  protein: '',
  fat: '',
  carbohydrates: String(dish.carbs || ''),
  vitamins: dish.vitamins || '',
});

const CircularMetric = ({ label, value, total, tone }: { label: string; value: number; total: number; tone: 'emerald' | 'indigo' | 'rose' }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = tone === 'emerald' ? '#10b981' : tone === 'rose' ? '#f43f5e' : '#6366f1';
  const bg = tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : tone === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600';
  const circumference = 2 * Math.PI * 38;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:shadow-xl hover:-translate-y-0.5 transition-all">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#eef2f7" strokeWidth="10" />
          <motion.circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
            strokeDasharray={circumference}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-slate-900">{pct}%</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <span className={clsx("inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-2", bg)}>
          {label}
        </span>
        <p className="text-2xl font-black text-slate-900">{value}<span className="text-xs text-slate-400"> / {total}</span></p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real bazadan</p>
        <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
};

const TenDayMenuPlannerModal = ({
  isOpen,
  onClose,
  kindergartens,
  dishes,
  initialDate,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  kindergartens: any[];
  dishes: any[];
  initialDate: string;
  onSaved: (startDate: string) => void;
}) => {
  const [startDate, setStartDate] = useState(initialDate);
  const [planMode, setPlanMode] = useState<'single' | 'ten'>('ten');
  const [targetGroup, setTargetGroup] = useState('DAY_9_105');
  const [selectedPlanDate, setSelectedPlanDate] = useState(initialDate);
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, MealDraft>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStartDate(initialDate);
    setSelectedPlanDate(initialDate);
    setError('');
  }, [initialDate, isOpen]);

  const days = useMemo(() => {
    const base = new Date(`${startDate}T00:00:00`);
    const length = planMode === 'single' ? 1 : 10;
    return Array.from({ length }).map((_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      const iso = toLocalIso(date);
      return {
        iso,
        day: date.getDate(),
        weekday: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
        label: formatShortDay(date),
      };
    });
  }, [planMode, startDate]);

  const filledCount = days.reduce((sum, day) => {
    return sum + mealTypesForTarget(targetGroup).filter((mealType) => Boolean(mealPlan[day.iso]?.[mealType]?.meal_name?.trim())).length;
  }, 0);
  const activeDay = days.find((day) => day.iso === selectedPlanDate) || days[0];
  const selectedTargetCount = useMemo(() => {
    if (targetGroup === 'ALL') return kindergartens.length;
    const group = WORK_HOUR_GROUPS.find((item) => item.id === targetGroup);
    return kindergartens.filter((kg) => group?.hours.includes(normalizeWorkHour(kg.workHours))).length;
  }, [kindergartens, targetGroup]);
  const selectedMealTypes = mealTypesForTarget(targetGroup);

  const updateMealField = (date: string, mealType: string, field: keyof MealDraft, value: string) => {
    setMealPlan((prev) => {
      const currentDraft = prev[date]?.[mealType] || createEmptyMealDraft();
      return {
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [mealType]: {
            ...currentDraft,
            [field]: value,
          },
        },
      };
    });
  };

  const applyDishToMeal = (date: string, mealType: string, dishId: string) => {
    const dish = dishes.find((item) => String(item.id) === String(dishId));
    setMealPlan((prev) => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [mealType]: dish ? dishToMealDraft(dish) : {
          dish_id: '',
          meal_name: '',
          composition: '',
          products: '',
          image_url: '',
          calories: '',
          protein: '',
          fat: '',
          carbohydrates: '',
          vitamins: '',
        },
      },
    }));
  };

  const handleImageUpload = async (date: string, mealType: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Faqat rasm faylini yuklang');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5 MB dan oshmasin');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateMealField(date, mealType, 'image_url', toAbsoluteAssetUrl(response.data?.url || ''));
      setError('');
    } catch {
      setError('Rasmni yuklashda xatolik yuz berdi');
    }
  };

  const handleSave = async () => {
    setError('');
    if (selectedTargetCount === 0) {
      setError("Tanlangan tur bo'yicha MTT topilmadi");
      return;
    }
    if (filledCount === 0) {
      setError("Kamida bitta taom nomi kiriting");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/kindergartens/menus/ten-day', {
        targetWorkHourGroup: targetGroup,
        days: days.map((day) => ({
          date: day.iso,
          meals: selectedMealTypes.reduce((acc, mealType) => {
            const draft = mealPlan[day.iso]?.[mealType];
            acc[mealType] = {
              dish_id: draft?.dish_id || '',
              meal_name: draft?.meal_name || '',
              age_group: 'ALL',
              diet_type: 'REGULAR',
              image_url: draft?.image_url || '',
              calories: draft?.calories || 0,
              carbohydrates: draft?.carbohydrates || 0,
              composition: draft?.composition || '',
              products: draft?.products || '',
              protein: draft?.protein || 0,
              fat: draft?.fat || 0,
              vitamins: draft?.vitamins || '',
            };
            return acc;
          }, {} as Record<string, any>),
        })),
      });
      onSaved(startDate);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "10 kunlik taomnoma saqlanmadi");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-2 sm:p-4 pointer-events-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="relative bg-white w-full max-w-7xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] rounded-[1px] shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-slate-200"
      >
        <div className="p-5 sm:p-7 bg-slate-950 text-white relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_34%,rgba(16,185,129,0.1)_100%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                <Calendar size={26} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Taomnoma kiritish</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Kun va ish soati tanlanadi, menyu Aqlvoy oshpaz bazasidan kiritiladi
                </p>
              </div>
            </div>

            <button onClick={onClose} className="absolute top-5 right-5 lg:static w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="relative mt-6 grid grid-cols-1 xl:grid-cols-[1fr_1.4fr_auto] gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex gap-1">
              {[
                { id: 'ten', label: '10 kunlik' },
                { id: 'single', label: '1 kunlik' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPlanMode(mode.id as 'single' | 'ten')}
                  className={clsx(
                    "flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    planMode === mode.id ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <select
                value={targetGroup}
                onChange={(event) => setTargetGroup(event.target.value)}
                className="w-full h-full min-h-[54px] px-4 pr-10 bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white outline-none appearance-none [color-scheme:dark]"
              >
                {WORK_HOUR_GROUPS.map((type) => (
                  <option key={type.id} value={type.id} className="bg-white text-slate-900">
                    {type.label} | {type.description}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-xs font-black outline-none [color-scheme:dark] min-w-[150px]"
            />
          </div>

        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#F6F8FB]">
          <div className="space-y-5">
            <div className="bg-white border border-slate-100 rounded-[1px] p-4 shadow-sm">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((day, index) => {
                  const active = activeDay?.iso === day.iso;
                  const dayFilled = selectedMealTypes.filter((mealType) => Boolean(mealPlan[day.iso]?.[mealType]?.meal_name?.trim())).length;
                  return (
                    <button
                      key={day.iso}
                      onClick={() => setSelectedPlanDate(day.iso)}
                      className={clsx(
                        "min-w-[104px] border rounded-[1px] px-3 py-3 text-left transition-all",
                        active ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-200"
                      )}
                    >
                      <p className="text-[8px] font-black uppercase tracking-widest">{index + 1}-kun</p>
                      <p className="text-base font-black mt-1">{day.label}</p>
                      <p className={clsx("text-[8px] font-black uppercase tracking-widest mt-1", active ? "text-slate-300" : "text-slate-400")}>{dayFilled}/{selectedMealTypes.length} mahal</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeDay && (
              <div className="space-y-4">
                <div className="bg-[#fff7ed] border border-amber-200 rounded-[1px] p-5">
                  <h3 className="text-sm font-black text-slate-900">
                    {activeDay.label} uchun kunlik menyu
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                    Ish soati segmentiga mos ovqatlanish vaqtlari chiqadi, taomlar Aqlvoy oshpaz bazasidan tanlanadi
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {selectedMealTypes.map((mealType) => {
                    const draft = mealPlan[activeDay.iso]?.[mealType];
                    return (
                      <div key={`${activeDay.iso}-${mealType}`} className="bg-white border border-slate-100 rounded-[1px] shadow-sm overflow-hidden">
                        <div className={clsx("px-4 py-3 border-b flex items-center justify-between", MEAL_TIME_META[mealType].soft)}>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{MEAL_LABELS[mealType]}</h4>
                            <p className="text-[8px] font-black uppercase tracking-widest mt-0.5">Bolalar uchun mos porsiya</p>
                          </div>
                          <span className="text-[10px] font-black">{MEAL_TIME_META[mealType].time}</span>
                        </div>

                        <div className="p-4 space-y-4">
                          <label className="block cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => handleImageUpload(activeDay.iso, mealType, event.target.files?.[0])}
                            />
                            <div className="h-32 rounded-[1px] border border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                              {draft?.image_url ? (
                                <img src={displayAssetUrl(draft.image_url)} alt={draft.meal_name || MEAL_LABELS[mealType]} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center px-4">
                                  <Apple className="mx-auto text-slate-300 mb-2" size={28} />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ovqat rasmini yuklash</p>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1">JPG, PNG yoki WEBP</p>
                                </div>
                              )}
                            </div>
                          </label>

                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Aqlvoy oshpaz taomi</label>
                            <select
                              value={draft?.dish_id || ''}
                              onChange={(event) => applyDishToMeal(activeDay.iso, mealType, event.target.value)}
                              className="w-full border border-slate-200 rounded-[1px] px-3 py-2.5 text-xs font-black outline-none focus:border-indigo-400"
                            >
                              <option value="">Taom tanlang</option>
                              {dishes.map((dish) => (
                                <option key={dish.id} value={dish.id}>
                                  {dish.name}{dish.category ? ` | ${dish.category}` : ''}
                                </option>
                              ))}
                            </select>
                            <input
                              value={draft?.meal_name || ''}
                              onChange={(event) => updateMealField(activeDay.iso, mealType, 'meal_name', event.target.value)}
                              placeholder="Tanlangan taom nomi"
                              className="w-full border border-slate-200 rounded-[1px] px-3 py-2.5 text-xs font-black outline-none focus:border-indigo-400"
                            />
                            <textarea
                              value={draft?.composition || ''}
                              onChange={(event) => updateMealField(activeDay.iso, mealType, 'composition', event.target.value)}
                              placeholder="Har qatorga bitta taom: choy, non, salat..."
                              rows={4}
                              className="w-full resize-none border border-slate-200 rounded-[1px] px-3 py-2.5 text-xs font-bold outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className={clsx("grid grid-cols-3 px-3 py-2 text-[8px] font-black uppercase tracking-widest text-white", MEAL_TIME_META[mealType].accent)}>
                              <span>Mahsulot</span>
                              <span>Vazn</span>
                              <span>Kkal</span>
                            </div>
                            <textarea
                              value={draft?.products || ''}
                              onChange={(event) => updateMealField(activeDay.iso, mealType, 'products', event.target.value)}
                              placeholder={"Guruch | 25 g | 82.5 kcal\nSut | 150 g | 76 kcal"}
                              rows={6}
                              className="w-full resize-none border border-slate-200 rounded-[1px] px-3 py-2.5 text-[11px] font-bold outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tabiiy qiymati</p>
                            <div className="grid grid-cols-2 gap-2">
                              <input value={draft?.calories || ''} onChange={(event) => updateMealField(activeDay.iso, mealType, 'calories', event.target.value)} placeholder="Kaloriya" className="min-w-0 bg-slate-50 border border-slate-200 rounded-[1px] px-3 py-2 text-[11px] font-black outline-none" />
                              <input value={draft?.protein || ''} onChange={(event) => updateMealField(activeDay.iso, mealType, 'protein', event.target.value)} placeholder="Oqsil" className="min-w-0 bg-slate-50 border border-slate-200 rounded-[1px] px-3 py-2 text-[11px] font-black outline-none" />
                              <input value={draft?.fat || ''} onChange={(event) => updateMealField(activeDay.iso, mealType, 'fat', event.target.value)} placeholder="Yog'" className="min-w-0 bg-slate-50 border border-slate-200 rounded-[1px] px-3 py-2 text-[11px] font-black outline-none" />
                              <input value={draft?.carbohydrates || ''} onChange={(event) => updateMealField(activeDay.iso, mealType, 'carbohydrates', event.target.value)} placeholder="Uglevod" className="min-w-0 bg-slate-50 border border-slate-200 rounded-[1px] px-3 py-2 text-[11px] font-black outline-none" />
                            </div>
                            <input value={draft?.vitamins || ''} onChange={(event) => updateMealField(activeDay.iso, mealType, 'vitamins', event.target.value)} placeholder="Vitamin/mineral izohi" className="w-full bg-slate-50 border border-slate-200 rounded-[1px] px-3 py-2 text-[11px] font-black outline-none" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {error ? <span className="text-rose-500">{error}</span> : "Saqlashda shu 10 kun oralig'idagi eski menyular almashtiriladi"}
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest">
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-7 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send size={15} /> {saving ? 'Saqlanmoqda...' : '10 kunni saqlash'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const NutritionMenu = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [now, setNow] = useState(new Date());
  const [menus, setMenus] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [menuRefreshKey, setMenuRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dishSearch, setDishSearch] = useState('');

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = activeTab === 'archive'
      ? { archive: 'true' }
      : { date: selectedDate };

    apiClient.get('/kindergartens/menus/all', { params })
      .then((res: any) => {
        if (mounted) setMenus(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (mounted) setMenus([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [activeTab, selectedDate, menuRefreshKey]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get('/kindergartens/dishes/all'),
      apiClient.get('/kindergartens'),
    ])
      .then(([dishesRes, kindergartensRes]) => {
        if (!mounted) return;
        setDishes(Array.isArray(dishesRes.data) ? dishesRes.data : []);
        setKindergartens(Array.isArray(kindergartensRes.data) ? kindergartensRes.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setDishes([]);
        setKindergartens([]);
      });

    return () => { mounted = false; };
  }, []);

  const dateOptions = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 15 }).map((_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() - 7 + index);
      const iso = toLocalIso(date);
      return {
        iso,
        day: date.getDate(),
        weekday: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
        month: date.toLocaleDateString('uz-UZ', { month: 'long' }),
        full: date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' }),
      };
    });
  }, []);

  const filteredMenus = useMemo(() => {
    const query = search.toLowerCase();
    return menus.filter((menu) => {
      const text = [
        menu.meal_name,
        menu.kindergartenName,
        menu.district,
        menu.meal_type,
        menu.age_group,
        menu.diet_type
      ].join(' ').toLowerCase();
      return text.includes(query);
    });
  }, [menus, search]);

  const regionalDailyMenus = useMemo(() => {
    const groups = new Map<string, { date: string; rows: any[] }>();
    filteredMenus.forEach((menu) => {
      const key = menu.date || selectedDate;
      const current: { date: string; rows: any[] } = groups.get(key) || {
        date: menu.date || selectedDate,
        rows: [],
      };
      if (!current.rows.some((row) => row.meal_type === menu.meal_type)) {
        current.rows.push(menu);
      }
      groups.set(key, current);
    });
    return Array.from(groups.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [filteredMenus, selectedDate]);

  const regionalMenuRows = useMemo(() => regionalDailyMenus.flatMap((group) => group.rows), [regionalDailyMenus]);

  const archiveDateCount = useMemo(() => new Set(menus.map((menu) => menu.date).filter(Boolean)).size, [menus]);

  const stats = useMemo(() => {
    const approved = regionalMenuRows.filter((menu) => menu.is_approved).length;
    const kindergartens = new Set(menus.map((menu) => menu.kindergarten_id).filter(Boolean)).size;
    const violations = regionalMenuRows.filter((menu) => !menu.meal_name || !menu.meal_type).length;
    const avgCalories = regionalMenuRows.length
      ? Math.round(regionalMenuRows.reduce((sum, menu) => sum + toNumber(menu.calories), 0) / regionalMenuRows.length)
      : 0;

    const completed = regionalMenuRows.filter((menu) => menu.meal_name && menu.meal_type && toNumber(menu.calories) > 0).length;

    return { approved, kindergartens, violations, avgCalories, completed };
  }, [menus, regionalMenuRows]);

  const filteredDishes = useMemo(() => {
    const query = dishSearch.toLowerCase();
    return dishes.filter((dish) => {
      const text = [dish.name, dish.kindergartenName, dish.district].join(' ').toLowerCase();
      return text.includes(query);
    });
  }, [dishes, dishSearch]);

  const timeText = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dayText = now.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' });
  const clockPct = ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100;
  const clockCirc = 2 * Math.PI * 42;
  const currentMeal = (() => {
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes < 10 * 60) return 'BREAKFAST';
    if (minutes < 15 * 60) return 'LUNCH';
    if (minutes < 18 * 60) return 'TEA';
    return 'DINNER';
  })();

  const shiftDate = (days: number) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + days);
    setSelectedDate(toLocalIso(date));
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] pb-20 font-sans text-slate-900">
      <main className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div className="flex gap-2 p-1 bg-white/90 w-full sm:w-fit rounded-2xl border border-slate-200/70 shadow-sm overflow-x-auto no-scrollbar sticky top-0 z-30 backdrop-blur-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-slate-950 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <section className="bg-slate-950 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/70 overflow-hidden relative">
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_32%,rgba(16,185,129,0.08)_100%)]" />
          <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20">
                <Utensils size={26} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Taomnoma nazorati</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Barcha bog'chalar bo'yicha real menyu monitoringi
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Real DB
                  </span>
                  <span className="px-3 py-1.5 bg-white/5 text-slate-300 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {formatDateLabel(selectedDate)}
                  </span>
                  <span className="px-3 py-1.5 bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {MEAL_LABELS[currentMeal]} vaqti
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => setIsPlannerOpen(true)}
                className="h-full min-h-[76px] px-5 py-4 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-950/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                10 kunlik reja
              </button>
              <div className="bg-white/8 border border-white/10 rounded-3xl p-4 flex items-center gap-4 min-w-[260px] shadow-inner">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={clockCirc}
                      strokeDashoffset={clockCirc - (clockPct / 100) * clockCirc}
                    />
                  </svg>
                  <Clock className="absolute inset-0 m-auto text-emerald-300" size={22} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white tabular-nums">{timeText}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{dayText}</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white outline-none [color-scheme:dark]"
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Bog'cha yoki taom..."
                    className="w-full sm:w-72 pl-9 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-xs font-bold outline-none focus:border-indigo-400 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MEAL_ORDER.map((mealKey) => {
              const mealRows = regionalMenuRows.filter((item) => item.meal_type === mealKey || MEAL_LABELS[item.meal_type] === MEAL_LABELS[mealKey]);
              const active = currentMeal === mealKey;
              return (
                <div
                  key={mealKey}
                  className={clsx(
                    "rounded-2xl border p-4 transition-all",
                    active ? "bg-white text-slate-950 border-white shadow-xl" : "bg-white/5 text-white border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={clsx("text-[9px] font-black uppercase tracking-widest", active ? "text-slate-400" : "text-slate-500")}>{MEAL_TIME_META[mealKey].time}</p>
                      <p className="text-sm font-black mt-1">{MEAL_LABELS[mealKey]}</p>
                    </div>
                    <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", active ? MEAL_TIME_META[mealKey].soft : "bg-white/10 text-white border border-white/10")}>
                      {active ? <Flame size={16} /> : <Clock size={16} />}
                    </div>
                  </div>
                  <p className={clsx("mt-3 text-2xl font-black", active ? "text-slate-950" : "text-white")}>{mealRows.length}</p>
                  <p className={clsx("text-[9px] font-black uppercase tracking-widest", active ? "text-slate-400" : "text-slate-500")}>yozuv</p>
                </div>
              );
            })}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {(activeTab === 'today' || activeTab === 'archive') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {activeTab === 'today' ? (
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Kalendar nazorati</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Lokal sana bo'yicha aniq tanlov</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => shiftDate(-1)} className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setSelectedDate(todayIso())} className="px-4 h-10 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest">
                      Bugun
                    </button>
                    <button onClick={() => shiftDate(1)} className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(15,minmax(92px,1fr))] gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {dateOptions.map((date) => {
                    const selected = selectedDate === date.iso;
                    const isToday = todayIso() === date.iso;
                    return (
                      <button
                        key={date.iso}
                        onClick={() => setSelectedDate(date.iso)}
                        className={clsx(
                          "min-w-[92px] py-4 rounded-2xl border flex flex-col items-center transition-all relative overflow-hidden",
                          selected ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.03]" : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                        )}
                      >
                        {selected && <div className="absolute inset-x-4 top-0 h-1 bg-white/70 rounded-b-full" />}
                        <span className="text-[8px] font-black uppercase tracking-widest">{date.weekday}</span>
                        <span className="text-2xl font-black">{date.day}</span>
                        <span className="text-[8px] font-black uppercase text-center leading-tight px-1">{isToday ? 'Bugun' : date.month}</span>
                        <span className={clsx(
                          "mt-2 h-1.5 w-8 rounded-full",
                          selected ? "bg-white/70" : isToday ? "bg-emerald-400" : "bg-slate-100"
                        )} />
                      </button>
                    );
                  })}
                </div>
              </div>
              ) : (
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Arxivdagi taomnomalar</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      Bugundan boshqa barcha sanalardagi menyular saqlanadi
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sanalar</p>
                      <p className="text-xl font-black text-slate-900">{archiveDateCount}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Yozuvlar</p>
                      <p className="text-xl font-black text-slate-900">{regionalMenuRows.length}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <CircularMetric label="Tasdiq" value={stats.approved} total={regionalMenuRows.length} tone="emerald" />
                <CircularMetric label="To'liqlik" value={stats.completed} total={regionalMenuRows.length} tone="indigo" />
                <CircularMetric label="Xato" value={stats.violations} total={regionalMenuRows.length} tone="rose" />
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                {[
                  { label: "Viloyat menyulari", value: regionalMenuRows.length, icon: LayoutGrid, color: "text-indigo-600 bg-indigo-50" },
                  { label: "Qamrov MTT", value: stats.kindergartens, icon: Users, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Tasdiqlangan", value: stats.approved, icon: CheckCircle2, color: "text-blue-600 bg-blue-50" },
                  { label: "Xatoliklar", value: stats.violations, icon: AlertTriangle, color: "text-rose-600 bg-rose-50" },
                ].map((card) => (
                  <div key={card.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-4", card.color)}>
                      <card.icon size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                    <p className="text-2xl font-black text-slate-900">{loading ? "..." : card.value}</p>
                  </div>
                ))}
              </div>

              <section className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 shadow-sm space-y-7">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                      {activeTab === 'archive' ? 'Arxiv menyulari' : `${formatDateLabel(selectedDate)} menyusi`}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      {activeTab === 'archive' ? "Bugundan boshqa kunlar `menus` jadvalidan olinmoqda" : "Ma'lumotlar `menus` jadvalidan olinmoqda"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {stats.violations === 0 ? 'Nazorat toza' : `${stats.violations} ta tekshiruv kerak`}
                    </span>
                  </div>
                </div>

                {filteredMenus.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="text-slate-300" size={34} />
                    </div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        {activeTab === 'archive' ? "Arxivda taomnoma yo'q" : 'Bu sanaga real taomnoma kiritilmagan'}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">
                      {activeTab === 'archive' ? '10 kunlik reja kiritilganda qolgan sanalar shu yerda saqlanadi.' : "Bog'cha ichida menyu kiritilgandan keyin admin panelda ko'rinadi."}
                    </p>
                  </div>
                )}

                <div className="space-y-5">
                  {regionalDailyMenus.map((group) => (
                    <article key={group.date} className="border border-slate-100 rounded-3xl bg-white shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900">Qashqadaryo viloyati taomnomasi</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                            <MapPin size={11} className="text-slate-300" />
                            {activeTab === 'archive' ? `${formatDateLabel(group.date)} | ` : ''}Ish soatiga mos umumiy menyu
                          </p>
                        </div>
                        <span className="w-fit px-3 py-1.5 rounded-xl bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest">
                          Ish soatiga mos menyu
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-0">
                        {MEAL_ORDER.map((mealType) => {
                          const menu = group.rows.find((row) => row.meal_type === mealType);
                          return (
                            <div key={`${group.date}-${mealType}`} className="relative p-4 border-b md:border-r border-slate-100 last:border-r-0 min-h-[280px]">
                              <div className={clsx("absolute left-0 top-0 h-full w-1", MEAL_TIME_META[mealType]?.accent || "bg-slate-300")} />
                              <div className="flex items-center justify-between gap-2 mb-3 pl-2">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{MEAL_TIME_META[mealType]?.time}</p>
                                  <h4 className="text-sm font-black text-slate-900">{MEAL_LABELS[mealType]}</h4>
                                </div>
                                <span className={clsx("px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest", MEAL_TIME_META[mealType]?.soft || "bg-slate-50 text-slate-600 border-slate-100")}>
                                  {menu ? 'Menyu' : "Bo'sh"}
                                </span>
                              </div>

                              {menu ? (
                                <div className="pl-2 space-y-3">
                                  {menu.image_url && (
                                    <img
                                      src={displayAssetUrl(menu.image_url)}
                                      alt={menu.meal_name || "Taom rasmi"}
                                      className="w-full h-28 object-cover rounded-2xl border border-slate-100"
                                    />
                                  )}
                                  <div>
                                    <h5 className="text-sm font-black text-slate-900 line-clamp-2">{menu.meal_name || "Nomi kiritilmagan"}</h5>
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1">{toNumber(menu.calories)} kkal</p>
                                  </div>
                                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarkibi</p>
                                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed whitespace-pre-line line-clamp-4">
                                      {compositionOf(menu) || menu.meal_name || "-"}
                                    </p>
                                  </div>
                                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mahsulotlar</p>
                                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed whitespace-pre-line line-clamp-4">
                                      {productsOf(menu) || "-"}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full min-h-[180px] ml-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 flex items-center justify-center text-center px-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Kiritilmagan</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div
              key="database"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-7"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900">Taomlar bazasi</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Real `dishes` jadvalidagi retseptlar</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    value={dishSearch}
                    onChange={(event) => setDishSearch(event.target.value)}
                    placeholder="Taom qidirish..."
                    className="w-full sm:w-80 pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {filteredDishes.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Database className="text-slate-300" size={34} />
                  </div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Real taomlar bazasi bo'sh</h3>
                  <p className="text-xs font-bold text-slate-400 mt-2">Bog'cha retsept qo'shgandan keyin shu yerda ko'rinadi.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDishes.map((dish) => (
                  <article key={dish.id} className="border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all bg-white">
                    {dish.image && (
                      <img
                        src={displayAssetUrl(dish.image)}
                        alt={dish.name || 'Taom rasmi'}
                        className="w-full h-40 object-cover rounded-2xl border border-slate-100 mb-4"
                      />
                    )}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Apple size={22} />
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        Retsept
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900">{dish.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                      <MapPin size={11} className="text-slate-300" />
                      {dish.kindergartenName || "Noma'lum MTT"} | {dish.district || "-"}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Kkal</p>
                        <p className="text-xs font-black">{toNumber(dish.kcal)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Temir</p>
                        <p className="text-xs font-black">{toNumber(dish.iron)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Uglevod</p>
                        <p className="text-xs font-black">{toNumber(dish.carbs)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
        <AnimatePresence>
          {isPlannerOpen && (
            <TenDayMenuPlannerModal
              isOpen={isPlannerOpen}
              onClose={() => setIsPlannerOpen(false)}
              kindergartens={kindergartens}
              dishes={dishes}
              initialDate={selectedDate}
              onSaved={(startDate) => {
                setSelectedDate(startDate);
                setMenuRefreshKey((value) => value + 1);
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

