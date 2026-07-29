import React from 'react';
import { Award, Calendar, FileText, MessageSquare, Sparkles, Star, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const formatDate = (value?: string) => {
  if (!value) return 'Sana kiritilmagan';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ProgressSection = ({ data }: any) => {
  const progress = Array.isArray(data?.progress) ? data.progress : [];
  const avgRating = progress.length
    ? (progress.reduce((sum: number, item: any) => sum + Number(item.rating || 0), 0) / progress.length).toFixed(1)
    : '0.0';
  const topRating = progress.length ? Math.max(...progress.map((item: any) => Number(item.rating || 0))) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="kg-progress-typography space-y-4 md:space-y-5">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-4 shadow-sm md:p-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500"></div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 shadow-sm">
              <Award size={23} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Muvaffaqiyatlar</p>
              <h4 className="mt-1 text-xl font-extrabold uppercase leading-tight text-brand-depth md:text-2xl">Bolaning yutuqlari</h4>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">Baholar, izohlar va rivojlanish qaydlari</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:w-[360px]">
            <SummaryCard label="Yozuvlar" value={progress.length} icon={FileText} />
            <SummaryCard label="Reyting" value={avgRating} icon={Star} />
            <SummaryCard label="Eng yuqori" value={topRating || '--'} icon={Sparkles} />
          </div>
        </div>
      </div>

      {progress.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {progress.map((item: any, idx: number) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex min-h-[210px] flex-col rounded-[1.25rem] border border-rose-100 bg-white p-4 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50/25 md:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
                    <Star size={20} fill="#f43f5e" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="line-clamp-2 text-lg font-extrabold uppercase leading-tight text-brand-depth">{item.subject || 'Yutuq qaydi'}</h5>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                      <Calendar size={12} className="text-rose-500" /> {formatDate(item.date)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-center">
                  <p className="text-xl font-extrabold leading-none text-rose-600">{Number(item.rating || 0).toFixed(1)}</p>
                  <p className="mt-1 text-[8px] font-black uppercase tracking-wide text-brand-muted">baho</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {[...Array(5)].map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    size={16}
                    fill={starIndex < Number(item.rating || 0) ? '#f43f5e' : 'none'}
                    className={starIndex < Number(item.rating || 0) ? 'text-rose-500' : 'text-rose-200'}
                  />
                ))}
              </div>

              <div className="mt-4 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare size={14} className="text-rose-500" />
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-muted">Tarbiyachi izohi</p>
                </div>
                <p className="line-clamp-4 text-sm font-semibold leading-relaxed text-brand-slate">
                  {item.comment || "Izoh kiritilmagan."}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-dashed border-rose-200 bg-rose-50/35 p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
            <Star size={26} />
          </div>
          <p className="mt-4 text-sm font-extrabold uppercase text-brand-depth">Yutuqlar hali kiritilmagan</p>
          <p className="mx-auto mt-1 max-w-md text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-brand-muted">
            Tarbiyachi baholari va bolaning muvaffaqiyatlari shu yerda ko'rinadi.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-[1.25rem] border border-brand-border bg-brand-depth p-4 text-white shadow-sm md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-rose-200">
            <TrendingUp size={21} />
          </div>
          <div>
            <h5 className="text-lg font-extrabold uppercase leading-tight">Oylik hisobot</h5>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">O'sish sur'ati: +12%</p>
          </div>
        </div>
        <button className="rounded-2xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-brand-depth transition-all hover:bg-rose-500 hover:text-white">
          Hisobotni ko'rish
        </button>
      </div>
    </motion.div>
  );
};

const SummaryCard = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="rounded-2xl border border-rose-100 bg-white/85 px-3 py-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between gap-2">
      <Icon size={15} className="text-rose-500" />
      <p className="text-[7px] font-black uppercase tracking-[0.12em] text-brand-muted">{label}</p>
    </div>
    <p className="text-lg font-extrabold leading-none text-brand-depth">{value}</p>
  </div>
);
