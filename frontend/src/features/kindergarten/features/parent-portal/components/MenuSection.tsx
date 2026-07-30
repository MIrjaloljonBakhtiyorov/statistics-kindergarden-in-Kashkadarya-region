import React, { useEffect, useMemo, useState } from 'react';
import { Apple, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Droplets, Flame, Leaf, Soup, Target, Wheat, Zap } from 'lucide-react';
import { apiClient, PARENT_PORTAL_API_BASE_URL } from '@/shared/api';

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Nonushta',
  LUNCH: 'Tushlik',
  TEA: 'Ikkinchi tushlik',
  DINNER: 'Kechki ovqat',
};

const MEAL_TIMES: Record<string, string> = {
  BREAKFAST: '08:30',
  LUNCH: '12:30',
  TEA: '16:00',
  DINNER: '18:30',
};

const MEAL_ORDER = ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'];

const UZ_MONTHS = [
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

const summaryToneClasses: Record<string, { border: string; icon: string; text: string }> = {
  rose: {
    border: 'border-rose-100',
    icon: 'bg-rose-50 text-rose-500',
    text: 'text-rose-500',
  },
  amber: {
    border: 'border-amber-100',
    icon: 'bg-amber-50 text-amber-500',
    text: 'text-amber-500',
  },
  indigo: {
    border: 'border-indigo-100',
    icon: 'bg-indigo-50 text-indigo-500',
    text: 'text-indigo-500',
  },
  teal: {
    border: 'border-teal-100',
    icon: 'bg-teal-50 text-teal-500',
    text: 'text-teal-500',
  },
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const apiBase = PARENT_PORTAL_API_BASE_URL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};

const getNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const isDrinkItem = (item: any) => {
  const text = `${item?.meal_name || ''} ${item?.composition || ''} ${item?.products || ''}`.toLowerCase();
  return ['choy', 'kompot', 'sharbat', 'sut', 'kefir', 'ayron', 'kakao', 'suv', 'ichimlik'].some((keyword) => text.includes(keyword));
};

export const MenuSection = ({ data: initialData, childId }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [menu, setMenu] = useState(initialData?.menu || []);
  const [loading, setLoading] = useState(false);

  const fetchMenu = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = formatDateKey(date);
      const res = await apiClient.get(`/parent-portal/menu/${childId}/${dateStr}`);
      setMenu(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = formatDateKey(new Date());
    const selected = formatDateKey(selectedDate);

    if (today !== selected) {
      fetchMenu(selectedDate);
    } else {
      setMenu(initialData?.menu || []);
    }
  }, [selectedDate, childId, initialData]);

  const sortedMenu = useMemo(() => {
    return [...(menu || [])].sort((a: any, b: any) => {
      const first = MEAL_ORDER.indexOf(a.meal_type);
      const second = MEAL_ORDER.indexOf(b.meal_type);
      return (first === -1 ? 99 : first) - (second === -1 ? 99 : second);
    });
  }, [menu]);

  const totals = useMemo(() => {
    return sortedMenu.reduce(
      (acc: any, item: any) => ({
        calories: acc.calories + getNumber(item.calories),
        protein: acc.protein + getNumber(item.protein),
        fat: acc.fat + getNumber(item.fat),
        carbohydrates: acc.carbohydrates + getNumber(item.carbohydrates),
        iron: acc.iron + getNumber(item.iron),
        calcium: acc.calcium + getNumber(item.calcium),
      }),
      { calories: 0, protein: 0, fat: 0, carbohydrates: 0, iron: 0, calcium: 0 }
    );
  }, [sortedMenu]);

  const groupedMenu = useMemo(() => {
    const drinks = sortedMenu.filter(isDrinkItem);
    const meals = sortedMenu.filter((item: any) => !isDrinkItem(item));
    return [
      { id: 'meals', title: 'Taomlar', subtitle: 'Asosiy ovqatlar va yeguliklar', items: meals },
      { id: 'drinks', title: 'Ichimliklar', subtitle: 'Choy, kompot, sharbat va sut mahsulotlari', items: drinks },
    ];
  }, [sortedMenu]);

  const changeDate = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  const isToday = (date: Date) => formatDateKey(date) === formatDateKey(new Date());

  const getDateLabel = (date: Date) => {
    return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]}`;
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((selected.getTime() - base.getTime()) / 86400000);

    if (diffDays === -1) return 'Kecha';
    if (diffDays === 0) return 'Bugun';
    if (diffDays === 1) return 'Ertangi kun';
    return 'Tanlangan kun';
  };

  return (
    <div className="kg-parent-section space-y-4 md:space-y-5">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-rose-100 bg-white p-4 shadow-sm md:p-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500"></div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 via-pink-400 to-transparent opacity-60"></div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 shadow-sm">
              <CalendarIcon size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Taomnoma rejasi</p>
              <h4 className="mt-1 text-xl font-extrabold uppercase leading-tight text-brand-depth md:text-2xl">{getDateLabel(selectedDate)}</h4>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                Tanlangan kun taomnomasi
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm sm:w-[260px]">
            <button
              type="button"
              onClick={() => changeDate(-1)}
              aria-label="Oldingi kun"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-muted transition-all hover:bg-white hover:text-rose-600"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className={`h-10 min-w-[96px] rounded-xl px-4 text-[9px] font-black uppercase tracking-[0.14em] transition-all ${
                isToday(selectedDate)
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20'
                  : 'text-brand-muted hover:bg-white hover:text-rose-600'
              }`}
            >
              {getDateStatus(selectedDate)}
            </button>
            <button
              type="button"
              onClick={() => changeDate(1)}
              aria-label="Keyingi kun"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-muted transition-all hover:bg-white hover:text-rose-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-rose-100 bg-white p-10 text-center shadow-sm">
          <div className="h-10 w-10 rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">Yuklanmoqda...</p>
        </div>
      ) : sortedMenu.length > 0 ? (
        <div className="space-y-5">
          {groupedMenu.map((section) => (
            <section key={section.id} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-500">{section.title}</p>
                  <h5 className="mt-1 text-lg font-extrabold uppercase leading-tight text-brand-depth">{section.subtitle}</h5>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-brand-muted">
                  {section.items.length} ta
                </span>
              </div>

              {section.items.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {section.items.map((item: any, idx: number) => (
                    <MenuCard key={item.id || `${section.id}-${idx}`} item={item} idx={idx} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-slate-200 bg-white p-6 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-muted">{section.title} kiritilmagan</p>
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 shadow-sm">
            <Apple size={26} />
          </div>
          <p className="mt-4 text-sm font-extrabold uppercase text-brand-depth">Menyu topilmadi</p>
          <p className="mx-auto mt-1 max-w-md text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-brand-muted">
            Bu sana uchun taomnoma hali tasdiqlanmagan yoki tizimga kiritilmagan.
          </p>
        </div>
      )}

      <div className="rounded-[1.25rem] border border-brand-border bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-500">Umumiy tarkib</p>
            <h5 className="mt-1 text-lg font-extrabold uppercase leading-tight text-brand-depth">Kunlik ozuqa ko'rsatkichlari</h5>
          </div>
          <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-rose-600">
            {sortedMenu.length} ta taom
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Quvvat', value: Math.round(totals.calories), suffix: 'kkal', icon: Flame, tone: 'amber' },
            { label: 'Oqsil', value: Math.round(totals.protein), suffix: 'g', icon: Target, tone: 'indigo' },
            { label: 'Uglevod', value: Math.round(totals.carbohydrates), suffix: 'g', icon: Zap, tone: 'teal' },
            { label: "Yog'", value: Math.round(totals.fat), suffix: 'g', icon: Soup, tone: 'rose' },
            { label: 'Temir', value: Number(totals.iron.toFixed(1)), suffix: 'mg', icon: Wheat, tone: 'amber' },
            { label: 'Kalsiy', value: Number(totals.calcium.toFixed(1)), suffix: 'mg', icon: Droplets, tone: 'indigo' },
          ].map((item) => (
            <div key={item.label} className={`rounded-[1rem] border bg-white p-3 shadow-sm ${summaryToneClasses[item.tone].border}`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${summaryToneClasses[item.tone].icon}`}>
                  <item.icon size={16} />
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.12em] text-brand-muted">{item.label}</p>
              </div>
              <p className="text-xl font-extrabold leading-none text-brand-depth">
                {item.value}
                <span className={`ml-1 text-[9px] font-black uppercase ${summaryToneClasses[item.tone].text}`}>{item.suffix}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MenuCard = ({ item, idx }: { item: any; idx: number }) => {
  const imageUrl = getAssetUrl(item.image_url);
  const isDiet = item.diet_type === 'DIETARY';

  return (
    <div
      className="overflow-hidden rounded-[1.25rem] border border-brand-border bg-white shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50/25"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)]">
        <div className="relative h-44 bg-slate-100 sm:h-full sm:min-h-[210px]">
          {imageUrl ? (
            <img src={imageUrl} alt={item.meal_name || 'Taom'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-rose-50 text-rose-200">
              <Apple size={42} />
              <p className="mt-2 text-[8px] font-black uppercase tracking-[0.16em]">Rasm yo'q</p>
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-xl bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-rose-600 shadow-sm backdrop-blur">
            {MEAL_LABELS[item.meal_type] || item.meal_type || 'Taom'}
          </div>
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-depth/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm backdrop-blur">
            <Clock size={12} /> {MEAL_TIMES[item.meal_type] || '--:--'}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4 md:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h5 className="text-lg font-extrabold uppercase leading-tight text-brand-depth md:text-xl">{item.meal_name || 'Taom nomi kiritilmagan'}</h5>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-brand-muted">
                {item.age_group ? `${item.age_group} yosh` : 'Yosh guruhi umumiy'}
              </p>
            </div>
            {isDiet && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-rose-600">
                <Leaf size={11} /> Parhez
              </span>
            )}
          </div>

          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-muted">Tarkibi</p>
            <p className="mt-1 line-clamp-3 text-sm font-semibold leading-relaxed text-brand-slate">
              {item.composition || item.products || item.vitamins || 'Tarkib kiritilmagan'}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <NutritionPill icon={Flame} label="Kkal" value={item.calories ? `${item.calories}` : '--'} />
            <NutritionPill icon={Target} label="Oqsil" value={item.protein ? `${item.protein} g` : '--'} />
            <NutritionPill icon={Zap} label="Uglevod" value={item.carbohydrates ? `${item.carbohydrates} g` : '--'} />
            <NutritionPill icon={Soup} label="Yog'" value={item.fat ? `${item.fat} g` : '--'} />
          </div>
        </div>
      </div>
    </div>
  );
};

const NutritionPill = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3">
    <div className="flex items-center justify-between gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-rose-500">
        <Icon size={14} />
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.14em] text-brand-muted">{label}</span>
    </div>
    <p className="mt-2 text-sm font-extrabold uppercase text-brand-depth">{value}</p>
  </div>
);
