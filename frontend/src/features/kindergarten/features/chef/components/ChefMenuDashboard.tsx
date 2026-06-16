import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock,
  Flame,
  Loader2,
  Play,
  RefreshCw,
  Soup,
  Thermometer,
  Timer,
  Utensils,
  Users,
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';

const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');

const displayAssetUrl = (url?: string | null) => {
  const src = String(url || '').trim();
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
  return encodeURI(`${apiRoot}${src.startsWith('/') ? '' : '/'}${src}`);
};

const MEALS = [
  { id: 'BREAKFAST', label: 'Nonushta', time: '08:30' },
  { id: 'LUNCH', label: 'Tushlik', time: '12:30' },
  { id: 'TEA', label: 'Poldnik', time: '16:00' },
  { id: 'DINNER', label: 'Kechki ovqat', time: '18:30' },
];

const FLOW = ['BOSHLASH', 'QABUL_QILINDI', 'PISHIRILMOQDA', 'TAYYOR'];

const STATUS: Record<string, { label: string; icon: React.ElementType; badge: string; action: string }> = {
  BOSHLASH: {
    label: 'Yangi',
    icon: Clock,
    badge: 'bg-slate-100 text-slate-600',
    action: 'Qabul qilish',
  },
  QABUL_QILINDI: {
    label: 'Qabul qilindi',
    icon: CheckCircle2,
    badge: 'bg-emerald-50 text-brand-primary',
    action: 'Pishirishni boshlash',
  },
  PISHIRILMOQDA: {
    label: 'Pishmoqda',
    icon: Flame,
    badge: 'bg-amber-50 text-amber-600',
    action: 'Tayyor deb belgilash',
  },
  TAYYOR: {
    label: 'Tayyor',
    icon: Check,
    badge: 'bg-green-50 text-green-600',
    action: 'Yakunlangan',
  },
};

const normalizeStatus = (status?: string) => {
  const value = String(status || '').toUpperCase();
  if (['PENDING', 'BOSHLASH'].includes(value)) return 'BOSHLASH';
  if (['ACCEPTED', 'QABUL_QILINDI'].includes(value)) return 'QABUL_QILINDI';
  if (['COOKING_STARTED', 'COOKING', 'PISHIRILMOQDA', 'PISHIRILYAPTI'].includes(value)) return 'PISHIRILMOQDA';
  if (['SERVED', 'TAYYOR', 'SUZILDI'].includes(value)) return 'TAYYOR';
  return 'BOSHLASH';
};

const formatTime = (value?: string) => {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const nutritionPartsOf = (value?: string) => String(value || '')
  .split('|')
  .map((part) => part.trim())
  .filter(Boolean);

const detailOf = (value: string | undefined, label: string) => {
  const part = nutritionPartsOf(value).find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return part ? part.replace(new RegExp(`^${label}:\\s*`, 'i'), '').trim() : '';
};

export const ChefMenuDashboard: React.FC = () => {
  const { showNotification } = useNotification();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeMeal, setActiveMeal] = useState('BREAKFAST');
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [temperatureById, setTemperatureById] = useState<Record<string, string>>({});
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = window.setInterval(fetchData, 30000);
    return () => window.clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const normalizedTasks = useMemo(() => tasks.map((task) => ({
    ...task,
    menuId: task.menuId || task.menu_id || task.id,
    mealName: task.mealName || task.meal_name || 'Nomsiz taom',
    mealType: task.mealType || task.meal_type || 'BREAKFAST',
    ageGroup: task.ageGroup || task.age_group || '',
    dietType: task.dietType || task.diet_type || 'REGULAR',
    calories: Number(task.calories || 0),
    imageUrl: task.imageUrl || task.image_url || '',
    products: task.products || detailOf(task.vitamins, 'Mahsulotlar'),
    composition: task.composition || detailOf(task.vitamins, 'Taomlar'),
    protein: Number(task.protein || 0),
    fat: Number(task.fat || 0),
    statusKey: normalizeStatus(task.status),
  })), [tasks]);

  const visibleTasks = normalizedTasks.filter((task) => task.mealType === activeMeal);
  const readyCount = normalizedTasks.filter((task) => task.statusKey === 'TAYYOR').length;
  const cookingCount = normalizedTasks.filter((task) => task.statusKey === 'PISHIRILMOQDA').length;
  const pendingCount = normalizedTasks.filter((task) => task.statusKey === 'BOSHLASH').length;
  const activeMealInfo = MEALS.find((meal) => meal.id === activeMeal);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        apiClient.get(`/kitchen/tasks/${selectedDate}`),
        apiClient.get('/attendance/today-stats'),
      ]);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setStats(statsRes.data || {});
    } catch (error) {
      showNotification('Oshpaz vazifalarini yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (task: any) => {
    const currentIndex = FLOW.indexOf(task.statusKey);
    const nextStatus = FLOW[Math.min(currentIndex + 1, FLOW.length - 1)];
    if (task.statusKey === 'TAYYOR') return;

    const payload: any = { status: nextStatus };
    if (nextStatus === 'PISHIRILMOQDA') {
      payload.start_time = new Date().toISOString();
    }
    if (nextStatus === 'TAYYOR') {
      payload.served_time = new Date().toISOString();
      const temperature = Number(temperatureById[task.menuId] || 0);
      if (temperature > 0) payload.temperature = temperature;
    }

    try {
      setUpdatingId(task.menuId);
      await apiClient.post(`/kitchen/tasks/${task.menuId}/status`, payload);
      showNotification(
        nextStatus === 'TAYYOR'
          ? `${task.mealName}: tayyor, hamshiraga xabar yuborildi`
          : `${task.mealName}: ${STATUS[nextStatus].label}`,
        'success'
      );
      await fetchData();
    } catch (error) {
      showNotification('Holatni yangilashda xatolik', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0">
              <ChefHat size={28} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-depth tracking-tight">Oshpaz ish stoli</h2>
              <p className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-widest mt-1">
                Bugungi menyu, pishirish holati va tarqatish nazorati
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="h-11 px-4 bg-brand-depth text-white rounded-xl flex items-center gap-3">
              <Clock size={17} className="text-brand-emerald" />
              <span className="text-sm font-black tabular-nums">
                {now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <label className="h-11 px-4 bg-slate-50 border border-brand-border rounded-xl flex items-center gap-3">
              <Calendar size={17} className="text-brand-primary" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold"
              />
            </label>
            <button
              onClick={fetchData}
              className="h-11 px-4 bg-white border border-brand-border rounded-xl flex items-center gap-2 text-sm font-bold text-brand-depth hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Yangilash
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard icon={Users} label="Bugungi bolalar" value={stats.total ?? 0} />
        <SummaryCard icon={ClipboardList} label="Vazifalar" value={normalizedTasks.length} />
        <SummaryCard icon={Flame} label="Pishmoqda" value={cookingCount} tone="amber" />
        <SummaryCard icon={CheckCircle2} label="Tayyor" value={readyCount} tone="green" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <div className="space-y-5">
          <div className="bg-white border border-brand-border rounded-xl p-2 shadow-sm flex flex-wrap gap-2">
            {MEALS.map((meal) => {
              const count = normalizedTasks.filter((task) => task.mealType === meal.id).length;
              const isActive = activeMeal === meal.id;
              return (
                <button
                  key={meal.id}
                  onClick={() => setActiveMeal(meal.id)}
                  className={`flex-1 min-w-[145px] h-16 rounded-xl px-4 flex items-center justify-between transition-colors ${
                    isActive ? 'bg-brand-primary text-white' : 'text-brand-depth hover:bg-slate-50'
                  }`}
                >
                  <span className="text-left">
                    <span className="block text-sm font-black">{meal.label}</span>
                    <span className={`block text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white/75' : 'text-brand-muted'}`}>
                      {meal.time}
                    </span>
                  </span>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isActive ? 'bg-white/15' : 'bg-slate-100'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="bg-white border border-brand-border rounded-xl min-h-[320px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-brand-primary" size={34} />
              <p className="text-xs font-black text-brand-muted uppercase tracking-widest">Yuklanmoqda</p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <EmptyState meal={activeMealInfo?.label || ''} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.menuId}
                  task={task}
                  updating={updatingId === task.menuId}
                  temperature={temperatureById[task.menuId] || ''}
                  onTemperatureChange={(value) => setTemperatureById((state) => ({ ...state, [task.menuId]: value }))}
                  onAction={() => updateStatus(task)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-brand-depth text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Timer size={22} />
              </div>
              <div>
                <h3 className="font-black text-lg">{activeMealInfo?.label}</h3>
                <p className="text-[10px] font-bold text-white/55 uppercase tracking-widest">Tarqatish: {activeMealInfo?.time}</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-brand-emerald" />
            </div>
            <p className="text-xs text-white/60 font-semibold mt-4 leading-relaxed">
              Pishirish bosqichini vaqtida belgilang. Harorat faqat tayyor bo'lganda kiritiladi.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-black text-brand-depth flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Ish holati
            </h3>
            <div className="mt-4 space-y-3">
              <StatusRow label="Yangi vazifalar" value={pendingCount} />
              <StatusRow label="Pishmoqda" value={cookingCount} />
              <StatusRow label="Yakunlangan" value={readyCount} />
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-black text-brand-depth flex items-center gap-2">
              <Utensils size={18} className="text-brand-primary" />
              Porsiya eslatmasi
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-brand-muted">
              <div className="bg-slate-50 rounded-xl p-3">Nonushta<br /><span className="text-brand-depth">200-250 g</span></div>
              <div className="bg-slate-50 rounded-xl p-3">Tushlik<br /><span className="text-brand-depth">250-300 g</span></div>
              <div className="bg-slate-50 rounded-xl p-3">Poldnik<br /><span className="text-brand-depth">150-200 g</span></div>
              <div className="bg-slate-50 rounded-xl p-3">Kechki<br /><span className="text-brand-depth">200 g</span></div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tone = 'primary' }: { icon: React.ElementType; label: string; value: number; tone?: string }) => {
  const toneClass = tone === 'amber'
    ? 'bg-amber-50 text-amber-600'
    : tone === 'green'
      ? 'bg-emerald-50 text-brand-primary'
      : 'bg-slate-50 text-brand-primary';

  return (
    <div className="bg-white border border-brand-border rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneClass}`}>
        <Icon size={21} />
      </div>
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-brand-depth">{value}</p>
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  updating,
  temperature,
  onTemperatureChange,
  onAction,
}: {
  task: any;
  updating: boolean;
  temperature: string;
  onTemperatureChange: (value: string) => void;
  onAction: () => void;
}) => {
  const config = STATUS[task.statusKey];
  const Icon = config.icon;
  const progress = Math.round((FLOW.indexOf(task.statusKey) / (FLOW.length - 1)) * 100);
  const isReady = task.statusKey === 'TAYYOR';
  const needsTemperature = task.statusKey === 'PISHIRILMOQDA';

  return (
    <article className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
      {task.imageUrl && (
        <img
          src={displayAssetUrl(task.imageUrl)}
          alt={task.mealName || 'Taom rasmi'}
          className="w-full h-44 object-cover border-b border-brand-border"
        />
      )}
      <div className="p-4 border-b border-brand-border flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${config.badge}`}>
              {config.label}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 text-brand-muted">
              {task.ageGroup || 'Yosh belgilanmagan'}
            </span>
          </div>
          <h3 className="text-lg font-black text-brand-depth leading-tight truncate">{task.mealName}</h3>
          <p className="text-xs font-bold text-brand-muted mt-1">
            {task.dietType === 'DIETARY' ? 'Parhez menyu' : 'Oddiy menyu'}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-50 text-brand-primary flex items-center justify-center shrink-0">
          <Icon size={22} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Metric icon={Users} label="Porsiya" value={task.portions ?? 0} />
          <Metric icon={Clock} label="Boshlash" value={formatTime(task.startTime)} />
          <Metric icon={Thermometer} label="Harorat" value={task.temperatureRecords?.[0]?.temp ? `${task.temperatureRecords[0].temp} C` : '--'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Tarkib</p>
            <p className="text-xs font-bold text-brand-depth mt-1 leading-relaxed">{task.composition || task.mealName}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Mahsulotlar</p>
            <p className="text-xs font-bold text-brand-depth mt-1 leading-relaxed">{task.products || '-'}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
          <Flame size={14} />
          {task.calories} kkal
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
            <span>Jarayon</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {needsTemperature && (
          <label className="block">
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Tayyor taom harorati</span>
            <div className="relative mt-2">
              <input
                type="number"
                min="0"
                value={temperature}
                onChange={(event) => onTemperatureChange(event.target.value)}
                className="w-full h-11 rounded-xl border border-brand-border bg-slate-50 px-4 pr-12 font-bold outline-none"
                placeholder="Masalan: 75"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-brand-muted">C</span>
            </div>
          </label>
        )}

        <button
          onClick={onAction}
          disabled={isReady || updating}
          className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
            isReady
              ? 'bg-emerald-50 text-brand-primary'
              : 'bg-brand-primary text-white hover:bg-emerald-700'
          } disabled:opacity-70`}
        >
          {updating ? <Loader2 size={17} className="animate-spin" /> : isReady ? <Check size={17} /> : task.statusKey === 'BOSHLASH' ? <Play size={17} /> : <CheckCircle2 size={17} />}
          {config.action}
        </button>
      </div>
    </article>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="bg-slate-50 rounded-xl p-3 min-h-[74px]">
    <Icon size={16} className="text-brand-primary mb-2" />
    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{label}</p>
    <p className="text-sm font-black text-brand-depth mt-0.5">{value}</p>
  </div>
);

const StatusRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
    <span className="text-xs font-bold text-brand-muted">{label}</span>
    <span className="text-sm font-black text-brand-depth">{value}</span>
  </div>
);

const EmptyState = ({ meal }: { meal: string }) => (
  <div className="bg-white border border-dashed border-brand-border rounded-xl min-h-[320px] flex flex-col items-center justify-center text-center p-8">
    <div className="w-16 h-16 rounded-xl bg-slate-50 text-brand-muted flex items-center justify-center mb-4">
      <Soup size={30} />
    </div>
    <h3 className="text-xl font-black text-brand-depth">Menyu topilmadi</h3>
    <p className="text-sm font-semibold text-brand-muted mt-2 max-w-sm">
      {meal} uchun hali oshpaz vazifasi belgilanmagan. Menyu tasdiqlangandan keyin shu yerda ko'rinadi.
    </p>
  </div>
);

