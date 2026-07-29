import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Apple,
  Check,
  CheckCircle2,
  Clock,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Utensils,
  XCircle,
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

const mealLabels: Record<string, string> = {
  BREAKFAST: 'Nonushta',
  LUNCH: 'Tushlik',
  TEA: 'Poldnik',
  DINNER: 'Kechki ovqat',
};

const getAssetUrl = (value?: string | null) => {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  const apiRoot = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
  return `${apiRoot || 'http://localhost:3001'}${value}`;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const qualitySuggestions = [
  "Taomning hidi, rangi, ta'mi va ko'rinishi me'yorda.",
  "Taom harorati, konsistensiyasi va porsiya ko'rinishi bolalar uchun mos.",
  "Organoleptik ko'rsatkichlar talabga javob bermaydi.",
  "Taomning ta'mi, hidi yoki tashqi ko'rinishi qayta tekshirilsin.",
];

const normalizeKitchenStatus = (value?: string | null) => {
  const status = String(value || '').toUpperCase();
  if (['SERVED', 'TAYYOR', 'SUZILDI'].includes(status)) return 'TAYYOR';
  if (['COOKING_STARTED', 'COOKING', 'PISHIRILMOQDA', 'PISHIRILYAPTI'].includes(status)) return 'PISHIRILMOQDA';
  if (['ACCEPTED', 'QABUL_QILINDI'].includes(status)) return 'QABUL_QILINDI';
  return 'BOSHLASH';
};

const qualityLabel = (value?: string | null) => {
  if (value === 'QUALITY_OK') return "Ko'rsatkichlar me'yorda";
  if (value === 'QUALITY_BAD') return "Ko'rsatkichlarda og'ish bor";
  return "Organoleptik tekshiruv kutilmoqda";
};

const NurseSanitaryPanel: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [date, setDate] = useState(todayIso());
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [qualityDrafts, setQualityDrafts] = useState<Record<string, string>>({});

  const pending = useMemo(() => checkpoints.filter(item => item.status === 'PENDING_NURSE'), [checkpoints]);
  const approved = useMemo(() => checkpoints.filter(item => item.status === 'APPROVED'), [checkpoints]);
  const canShowMeals = approved.length > 0;
  const readyMeals = useMemo(
    () => meals.filter((meal) => normalizeKitchenStatus(meal.kitchen_status) === 'TAYYOR' && meal.task_id),
    [meals]
  );
  const pendingQualityCount = useMemo(
    () => readyMeals.filter((meal) => !['QUALITY_OK', 'QUALITY_BAD'].includes(meal.nurse_quality_status)).length,
    [readyMeals]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const checkpointsRes = await apiClient.get(`/nurse/sanitary-checkpoints?date=${date}`);
      const nextCheckpoints = Array.isArray(checkpointsRes.data) ? checkpointsRes.data : [];
      setCheckpoints(nextCheckpoints);
      if (nextCheckpoints.some((item: any) => item.status === 'APPROVED')) {
        const mealsRes = await apiClient.get(`/nurse/today-meals?date=${date}`);
        setMeals(Array.isArray(mealsRes.data) ? mealsRes.data : []);
      } else {
        setMeals([]);
      }
    } catch (error) {
      showNotification("Sanitariya ma'lumotlarini yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 30000);
    return () => window.clearInterval(interval);
  }, [date]);

  const approveCheckpoint = async (checkpointId: string) => {
    try {
      setApprovingId(checkpointId);
      await apiClient.post(`/nurse/sanitary-checkpoints/${checkpointId}/approve`, {
        nurse_id: user?.id || '',
      });
      showNotification('Sanitariya checkpointi tasdiqlandi', 'success');
      await loadData();
    } catch (error: any) {
      showNotification(error?.response?.data?.error || 'Tasdiqlashda xatolik', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const setQualityComment = (taskId: string, value: string) => {
    setQualityDrafts((state) => ({ ...state, [taskId]: value }));
  };

  const submitQualityReview = async (meal: any, qualityStatus: 'QUALITY_OK' | 'QUALITY_BAD') => {
    const taskId = meal.task_id || meal.taskId;
    const comment = String(qualityDrafts[taskId] || meal.nurse_quality_comment || '').trim();
    if (!comment) {
      showNotification("Taom sifati bo'yicha izoh yozing", 'warning');
      return;
    }

    try {
      setReviewingId(taskId);
      await apiClient.post(`/nurse/meal-quality/${taskId}`, {
        quality_status: qualityStatus,
        comment,
        nurse_id: user?.id || '',
      });
      showNotification(qualityStatus === 'QUALITY_OK' ? 'Taom sifatli deb belgilandi' : 'Taom sifatsiz deb belgilandi', 'success');
      await loadData();
    } catch (error: any) {
      showNotification(error?.response?.data?.error || "Organoleptik ko'rsatkichlarni saqlashda xatolik", 'error');
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-brand-border rounded-[2rem] p-10 text-center text-brand-primary font-black animate-pulse">
        Sanitariya checkpointlari yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden bg-white/90 border border-emerald-100 rounded-[2rem] p-6 shadow-[0_20px_52px_rgba(16,185,129,0.10)] backdrop-blur-md">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-emerald-200/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-white/70">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-depth">Sanitariya checkpointlari</h2>
              <p className="text-xs font-bold text-brand-slate mt-1">
                Oshpaz checkpointlari 6 soatda bir marta hamshira tasdig'iga yuboriladi.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-white/85 border border-emerald-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-brand-primary shadow-sm"
            />
            <button
              onClick={loadData}
              className="px-4 py-3 rounded-xl border border-emerald-100 bg-white/85 text-brand-depth text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-50 transition-colors"
            >
              <RefreshCw size={15} /> Yangilash
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Kutilmoqda" value={pending.length} tone="amber" />
        <StatCard label="Tasdiqlangan" value={approved.length} tone="emerald" />
        <StatCard label="6 soatlik davrlar" value={checkpoints.length} tone="blue" />
        <StatCard label="Organoleptik ko'rsatkichlar" value={pendingQualityCount} tone="rose" />
      </div>

      <section className="bg-white/92 border border-emerald-100 rounded-[2rem] shadow-[0_20px_52px_rgba(16,185,129,0.09)] overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50/55 to-sky-50/45">
          <h3 className="text-xl font-black text-brand-depth">Hamshiraga yuborilgan checkpointlar</h3>
        </div>
        <div className="space-y-3 p-4">
          {checkpoints.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-sky-50/50 p-10 text-center text-brand-muted font-black uppercase tracking-widest text-[10px]">
              Bugun checkpoint yuborilmagan
            </div>
          )}
          {checkpoints.map((checkpoint) => {
            const answersCount = Object.values(checkpoint.answers || {}).filter(Boolean).length;
            const approvedStatus = checkpoint.status === 'APPROVED';
            return (
              <div
                key={checkpoint.id}
                className="relative overflow-hidden rounded-[1.5rem] border p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-all hover:-translate-y-0.5"
                style={{
                  background: approvedStatus
                    ? 'radial-gradient(circle at 92% 0%, rgba(16,185,129,0.16), transparent 8rem), linear-gradient(135deg, #ecfdf5, #fff 58%, #f0fdfa)'
                    : 'radial-gradient(circle at 92% 0%, rgba(245,158,11,0.16), transparent 8rem), linear-gradient(135deg, #fffbeb, #fff 58%, #fff7ed)',
                  borderColor: approvedStatus ? '#bbf7d0' : '#fed7aa',
                  boxShadow: approvedStatus ? '0 16px 36px rgba(16,185,129,0.10)' : '0 16px 36px rgba(245,158,11,0.10)',
                }}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-35" style={{ background: approvedStatus ? '#10b981' : '#f59e0b' }} />
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: approvedStatus ? 'linear-gradient(90deg,#10b981,transparent)' : 'linear-gradient(90deg,#f59e0b,transparent)' }} />
                <div className="flex items-start gap-4">
                  <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ring-4 ring-white/70 ${
                    approvedStatus ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {approvedStatus ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                  </div>
                  <div className="relative z-10">
                    <p className="text-lg font-black text-brand-depth">{checkpoint.chef_name || 'Oshpaz'}</p>
                    <p className="text-xs font-bold text-brand-slate mt-1">
                      {checkpoint.period_label || checkpoint.period_start} - {answersCount} ta band tasdiqlangan
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${approvedStatus ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {approvedStatus ? 'Hamshira tasdiqlagan' : "Hamshira tasdig'i kutilmoqda"}
                    </p>
                  </div>
                </div>
                {checkpoint.status === 'PENDING_NURSE' ? (
                  <button
                    onClick={() => approveCheckpoint(checkpoint.id)}
                    disabled={approvingId === checkpoint.id}
                    className="relative z-10 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                  >
                    {approvingId === checkpoint.id ? 'Tasdiqlanmoqda...' : 'Tasdiqlayman'}
                  </button>
                ) : (
                  <span className="relative z-10 px-4 py-2 rounded-xl bg-white/75 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Tasdiqlangan
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {canShowMeals && (
        <section className="bg-white/92 border border-emerald-100 rounded-[2rem] shadow-[0_20px_52px_rgba(16,185,129,0.09)] overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-white via-teal-50/45 to-amber-50/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/15 ring-4 ring-white/70">
                <MessageSquareText size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-depth">Tayyor taomlarning organoleptik ko'rsatkichlari</h3>
                <p className="text-xs font-bold text-brand-slate mt-1">Oshpaz tayyor deb belgilagan taomlar hidi, ta'mi, rangi, harorati va tashqi ko'rinishi bo'yicha tekshiriladi.</p>
              </div>
            </div>
            <span className="w-fit px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">
              {pendingQualityCount} ta kutilmoqda
            </span>
          </div>

          <div className="p-6 space-y-4">
            {readyMeals.length === 0 && (
              <div className="rounded-2xl border border-dashed border-brand-border bg-slate-50 p-8 text-center">
                <AlertTriangle className="mx-auto text-brand-muted" size={28} />
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-3">
                  Hozircha oshpaz tayyor deb belgilagan taom yo'q
                </p>
              </div>
            )}

            {readyMeals.map((meal) => {
              const taskId = meal.task_id || meal.taskId;
              const reviewed = ['QUALITY_OK', 'QUALITY_BAD'].includes(meal.nurse_quality_status);
              const isBad = meal.nurse_quality_status === 'QUALITY_BAD';
              const draft = qualityDrafts[taskId] ?? meal.nurse_quality_comment ?? '';

              return (
                <article key={taskId} className="border border-emerald-100 rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-white to-emerald-50/35 shadow-sm hover:shadow-[0_18px_38px_rgba(16,185,129,0.10)] transition-all">
                  <div className="p-5 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-emerald-100 overflow-hidden shrink-0 shadow-sm">
                        {meal.image_url ? (
                          <img src={getAssetUrl(meal.image_url)} alt={meal.meal_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-muted">
                            <Utensils size={24} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                          {mealLabels[meal.meal_type] || meal.meal_type}
                        </span>
                        <h4 className="text-lg font-black text-brand-depth mt-1">{meal.meal_name}</h4>
                        <p className="text-xs font-bold text-brand-slate mt-2 line-clamp-2">
                          {meal.composition || meal.products || 'Tarkib kiritilmagan'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-3 py-1 rounded-lg bg-white border border-brand-border text-[10px] font-black text-brand-slate">
                            {meal.calories || 0} kkal
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                            Tayyor
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                            reviewed
                              ? isBad ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {qualityLabel(meal.nurse_quality_status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={draft}
                        onChange={(event) => setQualityComment(taskId, event.target.value)}
                        disabled={reviewed}
                        rows={3}
                        className="w-full rounded-xl border border-brand-border bg-white p-3 text-sm font-bold text-brand-depth outline-none focus:border-brand-primary disabled:bg-slate-100"
                        placeholder="Masalan: hidi, ta'mi, rangi, harorati va tashqi ko'rinishi me'yorda..."
                      />
                      {!reviewed && (
                        <div className="flex flex-wrap gap-2">
                          {qualitySuggestions.map((text) => (
                            <button
                              key={text}
                              onClick={() => setQualityComment(taskId, text)}
                              className="px-3 py-2 rounded-xl bg-white border border-brand-border text-[10px] font-black text-brand-slate text-left"
                            >
                              {text}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => submitQualityReview(meal, 'QUALITY_OK')}
                          disabled={reviewed || reviewingId === taskId}
                          className="h-11 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <Check size={16} /> Me'yorda
                        </button>
                        <button
                          onClick={() => submitQualityReview(meal, 'QUALITY_BAD')}
                          disabled={reviewed || reviewingId === taskId}
                          className="h-11 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <XCircle size={16} /> Og'ish bor
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {canShowMeals && (
        <section className="bg-white/92 border border-emerald-100 rounded-[2rem] shadow-[0_20px_52px_rgba(16,185,129,0.09)] overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-white via-orange-50/50 to-emerald-50/45 flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/15 ring-4 ring-white/70">
              <Apple size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-brand-depth">Bugungi ovqatlar paneli</h3>
              <p className="text-xs font-bold text-brand-slate mt-1">Sanitariya checkpointi tasdiqlangandan keyin ochiladi.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
            {meals.length === 0 && (
              <div className="md:col-span-2 xl:col-span-4 text-center py-10 text-brand-muted font-black uppercase tracking-widest text-[10px]">
                Bugun uchun ovqat kiritilmagan
              </div>
            )}
            {meals.map((meal) => (
              <article key={meal.id} className="border border-orange-100 rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-white to-orange-50/40 shadow-sm hover:shadow-[0_18px_38px_rgba(249,115,22,0.10)] transition-all">
                <div className="h-36 bg-slate-100">
                  {meal.image_url ? (
                    <img src={getAssetUrl(meal.image_url)} alt={meal.meal_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted">
                      <Utensils size={30} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                    {mealLabels[meal.meal_type] || meal.meal_type}
                  </span>
                  <h4 className="text-base font-black text-brand-depth mt-2">{meal.meal_name}</h4>
                  <p className="text-xs font-bold text-brand-slate mt-2 line-clamp-2">
                    {meal.composition || meal.products || 'Tarkib kiritilmagan'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-black text-brand-slate">
                    <span>{meal.calories || 0} kkal</span>
                    <span>{meal.kitchen_status || 'BOSHLASH'}</span>
                    <span>Protein: {meal.protein || 0}</span>
                    <span>Yog': {meal.fat || 0}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'emerald' | 'blue' | 'rose' }) => {
  const theme = tone === 'amber'
    ? { from: '#fffbeb', to: '#fed7aa', accent: '#d97706', glow: 'rgba(217,119,6,0.14)' }
    : tone === 'emerald'
      ? { from: '#ecfdf5', to: '#bbf7d0', accent: '#059669', glow: 'rgba(5,150,105,0.14)' }
      : tone === 'rose'
        ? { from: '#fff1f2', to: '#fecdd3', accent: '#e11d48', glow: 'rgba(225,29,72,0.13)' }
        : { from: '#eff6ff', to: '#bae6fd', accent: '#0284c7', glow: 'rgba(2,132,199,0.14)' };
  return (
    <div
      className="relative overflow-hidden border rounded-[1.5rem] p-5 transition-all hover:-translate-y-0.5"
      style={{
        background: `radial-gradient(circle at 92% 0%, ${theme.accent}22, transparent 7rem), linear-gradient(135deg, ${theme.from}, #fff 54%, ${theme.to})`,
        borderColor: `${theme.accent}30`,
        boxShadow: `0 18px 40px ${theme.glow}`,
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-35" style={{ background: theme.accent }} />
      <div className="relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-white/70" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}>
        <ShieldCheck size={18} />
      </div>
      <p className="relative z-10 text-[10px] font-black text-brand-muted uppercase tracking-widest mt-4">{label}</p>
      <div className="relative z-10 mt-1 flex items-end justify-between gap-3">
        <p className="text-3xl font-black text-brand-depth leading-none">{value}</p>
        <span className="h-2 w-14 rounded-full opacity-80" style={{ background: `linear-gradient(90deg, ${theme.accent}, transparent)` }} />
      </div>
    </div>
  );
};

export default NurseSanitaryPanel;

