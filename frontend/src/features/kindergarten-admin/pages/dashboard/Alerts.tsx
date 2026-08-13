import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pill,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Utensils,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '@/shared/api';

type AlertStatus = 'success' | 'update' | 'warning' | 'error' | 'ai';
type AlertCategory = 'kindergarten' | 'medical' | 'menu' | 'ai';
type FilterKey = 'all' | 'kindergarten' | 'medical' | 'menu' | 'important';

interface AlertDetail {
  label: string;
  value: string;
}

interface Alert {
  id: string;
  status: AlertStatus;
  category: AlertCategory;
  iconKey?: AlertCategory;
  orderNumber?: number;
  title: string;
  context: string;
  actor: string;
  createdAt: string;
  actionUrl?: string;
  details?: AlertDetail[];
}

interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  kindergartens: number;
  medical: number;
  menus: number;
}

interface AlertPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
}

const emptySummary: AlertSummary = {
  total: 0,
  critical: 0,
  warning: 0,
  kindergartens: 0,
  medical: 0,
  menus: 0,
};

const emptyPagination: AlertPagination = {
  page: 1,
  pageSize: 50,
  total: 0,
  totalPages: 1,
  from: 0,
  to: 0,
  hasPrev: false,
  hasNext: false,
};

const STATUS_CONFIG = {
  success: {
    label: 'Yaratildi',
    color: 'text-emerald-300',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/25',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  update: {
    label: 'Yangilandi',
    color: 'text-sky-300',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/25',
    dot: 'bg-blue-500',
    icon: RefreshCw,
  },
  warning: {
    label: 'Ehtiyot',
    color: 'text-amber-300',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/25',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
  },
  error: {
    label: 'Muhim',
    color: 'text-rose-300',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/25',
    dot: 'bg-rose-500',
    icon: AlertCircle,
  },
  ai: {
    label: 'AI',
    color: 'text-violet-300',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/25',
    dot: 'bg-indigo-400',
    icon: ShieldCheck,
  },
};

const CATEGORY_ICONS = {
  kindergarten: School,
  medical: Pill,
  menu: Utensils,
  ai: ShieldCheck,
};

const CATEGORY_LABELS: Record<AlertCategory, string> = {
  kindergarten: "Bog'chalar",
  medical: 'Dorilar',
  menu: 'Taomnoma',
  ai: 'AI',
};

const pad = (value: number) => String(value).padStart(2, '0');

const toValidDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatClockTime = (value: string) => {
  const date = toValidDate(value);
  if (!date) return '--:--:--';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatAlertDate = (value: string) => {
  const date = toValidDate(value);
  if (!date) return "Sana yo'q";
  return date.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatRelativeTime = (value: string) => {
  const date = toValidDate(value);
  if (!date) return "Vaqt yo'q";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return 'Hozir';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} daqiqa oldin`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)} soat oldin`;
  return formatAlertDate(value);
};

const isImportant = (alert: Alert) => ['error', 'warning'].includes(alert.status);

export const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary>(emptySummary);
  const [pagination, setPagination] = useState<AlertPagination>(emptyPagination);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [draftSearch, setDraftSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlerts = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/kindergartens/alerts', {
        params: {
          page,
          pageSize: 50,
          filter,
          search: appliedSearch || undefined,
        },
      });
      setAlerts(Array.isArray(response.data?.alerts) ? response.data.alerts : []);
      setSummary({ ...emptySummary, ...(response.data?.summary || {}) });
      setPagination({ ...emptyPagination, ...(response.data?.pagination || {}) });
    } catch {
      setError("Alertlarni yuklab bo'lmadi");
      setAlerts([]);
      setSummary(emptySummary);
      setPagination(emptyPagination);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [appliedSearch, filter, page]);

  useEffect(() => {
    loadAlerts();
    const timer = window.setInterval(() => loadAlerts(false), 30_000);
    return () => window.clearInterval(timer);
  }, [loadAlerts]);

  const filterTabs = useMemo(() => [
    { key: 'all' as const, label: 'Barchasi', count: summary.total },
    { key: 'kindergarten' as const, label: "Bog'chalar", count: summary.kindergartens },
    { key: 'medical' as const, label: 'Dorilar', count: summary.medical },
    { key: 'menu' as const, label: 'Taomnoma', count: summary.menus },
    { key: 'important' as const, label: 'Muhim', count: summary.critical + summary.warning },
  ], [summary]);

  const pageItems = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const points = new Set([1, totalPages, pagination.page - 1, pagination.page, pagination.page + 1]);
    if (pagination.page <= 3) [2, 3, 4].forEach((item) => points.add(item));
    if (pagination.page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((item) => points.add(item));

    const sorted = Array.from(points)
      .filter((item) => item >= 1 && item <= totalPages)
      .sort((a, b) => a - b);

    return sorted.reduce<(number | string)[]>((items, item, index) => {
      if (index > 0 && item - sorted[index - 1] > 1) items.push(`dots-${item}`);
      items.push(item);
      return items;
    }, []);
  }, [pagination.page, pagination.totalPages]);

  const summaryCards = [
    { label: 'Jami alert', value: summary.total, color: 'text-white', bg: 'bg-[#151918]' },
    { label: 'Muhim', value: summary.critical + summary.warning, color: 'text-rose-300', bg: 'bg-rose-950/25' },
    { label: "Bog'chalar", value: summary.kindergartens, color: 'text-emerald-300', bg: 'bg-emerald-950/25' },
    { label: 'Dorilar', value: summary.medical, color: 'text-amber-300', bg: 'bg-amber-950/25' },
    { label: 'Taomnoma', value: summary.menus, color: 'text-sky-300', bg: 'bg-sky-950/25' },
  ];

  const runSearch = () => {
    setAppliedSearch(draftSearch.trim());
    setPage(1);
  };
  const clearSearch = () => {
    setDraftSearch('');
    setAppliedSearch('');
    setPage(1);
  };

  return (
    <div className="min-h-screen space-y-5 bg-[#08100f] pb-20 text-white">
      <section className="overflow-hidden rounded-[22px] border border-white/10 bg-[#111615] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#533cff] to-[#00b7a8] text-white shadow-lg shadow-emerald-950/40">
                <Bell size={24} />
              </div>
              <div>
                <h1 className="text-[17px] font-black tracking-tight text-white">
                  Alertlar markazi
                </h1>
                <p className="mt-1 text-[12px] font-bold text-slate-300">
                  Bog'cha yaratilishi, dori zaxirasi va taomnoma hodisalari real bazadan shakllanadi.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                real-time
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {summaryCards.map((card) => (
                <div key={card.label} className={clsx('rounded-2xl border border-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]', card.bg)}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                  <p className={clsx('mt-1.5 text-[18px] font-black tabular-nums', card.color)}>{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xl space-y-3 xl:w-[520px]">
            <div className="rounded-[18px] border border-white/10 bg-[#0b1110] p-2 shadow-inner">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Yaratilgan alertlarni qidirish..."
                    className="h-13 w-full rounded-2xl border border-white/10 bg-[#151918] pl-12 pr-10 text-[13px] font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-500/10"
                    value={draftSearch}
                    onChange={(event) => setDraftSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') runSearch();
                    }}
                  />
                  {draftSearch && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                      aria-label="Qidiruvni tozalash"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={runSearch}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#533cff] to-[#00b7a8] px-5 text-[13px] font-black text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110 active:scale-95"
                >
                  <Search size={17} />
                  Qidirish
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-bold text-slate-400">
                {appliedSearch
                  ? `"${appliedSearch}" bo'yicha natija: ${pagination.total}`
                  : `${pagination.from}-${pagination.to} / ${pagination.total} ta alert`}
              </p>
              <button
                type="button"
                onClick={() => loadAlerts()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#151918] px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-200 shadow-sm transition hover:bg-white/10 disabled:opacity-50"
                disabled={loading}
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Yangilash
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-24 z-20 flex w-full max-w-full gap-2 overflow-x-auto rounded-[18px] border border-white/10 bg-[#111615]/95 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl no-scrollbar">
        {filterTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setFilter(item.key);
              setPage(1);
            }}
            className={clsx(
              'relative flex min-w-[104px] items-center justify-center rounded-xl px-4 py-2.5 text-[12px] font-black transition-all',
              filter === item.key
                ? 'bg-gradient-to-r from-[#533cff] to-[#00b7a8] text-white shadow-lg shadow-cyan-950/30'
                : 'text-slate-300 hover:bg-white/10'
            )}
          >
            {item.label}
            <span
              className={clsx(
                'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[12px] font-black tabular-nums',
                filter === item.key
                  ? 'border-white/15 bg-[#0b1110] text-white'
                  : 'border-[#111615] bg-[#050807] text-white'
              )}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <section className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert, index) => {
            const config = STATUS_CONFIG[alert.status];
            const Icon = CATEGORY_ICONS[alert.iconKey || alert.category] || config.icon;
            const clockTime = formatClockTime(alert.createdAt);
            const dateText = formatAlertDate(alert.createdAt);

            return (
              <motion.article
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: index * 0.02 }}
                className={clsx(
                  'rounded-[20px] border border-white/10 bg-[#111615] p-4 text-white shadow-[0_18px_54px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:border-emerald-400/20 hover:shadow-[0_24px_72px_rgba(0,0,0,0.34)]'
                )}
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]', config.bg, config.border, config.color)}>
                        <Icon size={21} />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-[#0b1110] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-300">
                            #{alert.orderNumber || pagination.from + index}
                          </span>
                          <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest', config.bg, config.border, config.color)}>
                            <span className={clsx('h-1.5 w-1.5 rounded-full', config.dot)} />
                            {config.label}
                          </span>
                          <span className={clsx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest', config.bg, config.border, config.color)}>
                            {CATEGORY_LABELS[alert.category]}
                          </span>
                        </div>
                        <h2 className="text-[14px] font-black leading-snug tracking-tight text-white">
                          {alert.title}
                        </h2>
                        <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-300">
                          {alert.context}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1110] px-3 py-2 text-[11px] font-bold text-slate-300">
                      <span className="font-mono font-black tabular-nums text-white">{clockTime}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
                      <span className="hidden items-center gap-1.5 sm:inline-flex">
                        <CalendarDays size={13} />
                        {dateText}
                      </span>
                    </div>
                  </div>

                  {!!alert.details?.length && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                      {alert.details.slice(0, 6).map((detail) => (
                        <div
                          key={`${alert.id}-${detail.label}`}
                          className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1110] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        >
                          <p className="truncate text-[10px] font-black uppercase tracking-widest text-slate-400">{detail.label}</p>
                          <p className="mt-1 truncate text-[12px] font-black leading-5 text-white" title={detail.value}>{detail.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {loading && (
          <div className="rounded-[22px] border border-white/10 bg-[#111615] py-20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <RefreshCw className="mx-auto animate-spin text-indigo-500" size={38} />
            <h3 className="mt-4 text-[14px] font-black uppercase tracking-widest text-slate-400">Alertlar yuklanmoqda</h3>
          </div>
        )}

        {!loading && (error || alerts.length === 0) && (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-[#111615] py-20 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#0b1110]">
              <Bell className="text-slate-500" size={34} />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-widest text-white">
              {error || "Hozircha alertlar yo'q"}
            </h3>
            <p className="mt-2 text-[14px] font-bold text-slate-400">
              Filtr yoki qidiruvni o'zgartirib ko'ring.
            </p>
          </div>
        )}
      </section>

      {!loading && !error && pagination.totalPages > 1 && (
        <nav className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-[#111615] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:flex-row sm:items-center sm:justify-between">
          <div className="px-2 text-[12px] font-black text-slate-400">
            {pagination.from}-{pagination.to} ko'rsatildi. Jami: {pagination.total}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-2xl border border-white/10 px-4 py-2 text-[12px] font-black text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Oldingi
            </button>

            {pageItems.map((item) => (
              typeof item === 'number' ? (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={clsx(
                    'h-10 min-w-10 rounded-2xl px-3 text-[12px] font-black tabular-nums transition',
                    item === pagination.page
                      ? 'bg-gradient-to-r from-[#533cff] to-[#00b7a8] text-white shadow-lg shadow-cyan-950/30'
                      : 'border border-white/10 text-slate-300 hover:bg-white/10'
                  )}
                >
                  {item}
                </button>
              ) : (
                <span key={item} className="px-1 text-[12px] font-black text-slate-400">...</span>
              )
            ))}

            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
              className="rounded-2xl border border-white/10 px-4 py-2 text-[12px] font-black text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Keyingi
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
