import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
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
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  update: {
    label: 'Yangilandi',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    dot: 'bg-blue-500',
    icon: RefreshCw,
  },
  warning: {
    label: 'Ehtiyot',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
  },
  error: {
    label: 'Muhim',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    dot: 'bg-rose-500',
    icon: AlertCircle,
  },
  ai: {
    label: 'AI',
    color: 'text-indigo-300',
    bg: 'bg-slate-900',
    border: 'border-indigo-500/40',
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

  const loadAlerts = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [appliedSearch, filter, page]);

  useEffect(() => {
    loadAlerts();
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
    { label: 'Jami alert', value: summary.total, color: 'text-slate-950 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
    { label: 'Muhim', value: summary.critical + summary.warning, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
    { label: "Bog'chalar", value: summary.kindergartens, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Dorilar', value: summary.medical, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Taomnoma', value: summary.menus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
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
    <div className="min-h-screen space-y-6 bg-slate-50 pb-20 text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                <Bell size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Alertlar markazi
                </h1>
                <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                  Bog'cha yaratilishi, dori zaxirasi va taomnoma hodisalari real bazadan shakllanadi.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                real-time
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {summaryCards.map((card) => (
                <div key={card.label} className={clsx('rounded-2xl border border-white/70 px-4 py-3 shadow-sm dark:border-slate-800', card.bg)}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                  <p className={clsx('mt-2 text-3xl font-black tabular-nums', card.color)}>{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xl space-y-3 xl:w-[520px]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 shadow-inner dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Yaratilgan alertlarni qidirish..."
                    className="h-13 w-full rounded-2xl border border-transparent bg-white pl-12 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-900 dark:text-white"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                      aria-label="Qidiruvni tozalash"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={runSearch}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-95"
                >
                  <Search size={17} />
                  Qidirish
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-slate-400">
                {appliedSearch
                  ? `"${appliedSearch}" bo'yicha natija: ${pagination.total}`
                  : `${pagination.from}-${pagination.to} / ${pagination.total} ta alert`}
              </p>
              <button
                type="button"
                onClick={loadAlerts}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                disabled={loading}
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Yangilash
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-24 z-20 flex w-full max-w-full gap-2 overflow-x-auto rounded-[1.6rem] border border-slate-200 bg-white/90 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl no-scrollbar dark:border-slate-800 dark:bg-slate-900/90">
        {filterTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setFilter(item.key);
              setPage(1);
            }}
            className={clsx(
              'relative flex min-w-[116px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-black transition-all',
              filter === item.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            {item.label}
            <span
              className={clsx(
                'absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[10px] font-black tabular-nums',
                filter === item.key
                  ? 'border-indigo-500 bg-white text-indigo-600'
                  : 'border-white bg-slate-950 text-white dark:border-slate-900 dark:bg-indigo-500'
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
            const isDarkCard = alert.status === 'ai';

            return (
              <motion.article
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: index * 0.02 }}
                className={clsx(
                  'grid gap-4 rounded-[2rem] border p-4 shadow-[0_20px_60px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[150px_1fr]',
                  isDarkCard
                    ? 'border-indigo-500/40 bg-slate-950 text-white'
                    : 'border-white bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
                )}
              >
                <div className={clsx('flex flex-row items-center gap-4 rounded-[1.5rem] border p-4 lg:flex-col lg:items-start', isDarkCard ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950')}>
                  <div className="flex items-center gap-2">
                    <span className={clsx('h-2.5 w-2.5 rounded-full', config.dot)} />
                    <span className={clsx('text-[11px] font-black uppercase tracking-widest', config.color)}>{config.label}</span>
                  </div>
                  <div>
                    <p className="font-mono text-3xl font-black tabular-nums tracking-tight sm:text-4xl lg:text-3xl">
                      {clockTime}
                    </p>
                    <p className={clsx('mt-1 text-[11px] font-black uppercase tracking-widest', isDarkCard ? 'text-slate-400' : 'text-slate-400')}>
                      #{alert.orderNumber || pagination.from + index}
                    </p>
                  </div>
                  <div className={clsx('flex items-center gap-2 text-xs font-bold lg:mt-auto', isDarkCard ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400')}>
                    <CalendarDays size={14} />
                    <span>{dateText}</span>
                  </div>
                </div>

                <div className="min-w-0 p-1 sm:p-2">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className={clsx('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border', config.bg, config.border, config.color)}>
                        <Icon size={26} />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                            Alert #{alert.orderNumber || pagination.from + index}
                          </span>
                          <span className={clsx('rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest', config.bg, config.border, config.color)}>
                            {CATEGORY_LABELS[alert.category]}
                          </span>
                          <span className={clsx('inline-flex items-center gap-1.5 text-xs font-bold', isDarkCard ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400')}>
                            <Clock3 size={14} />
                            {formatRelativeTime(alert.createdAt)}
                          </span>
                        </div>
                        <h2 className="text-xl font-black leading-tight tracking-tight text-inherit sm:text-2xl">
                          {alert.title}
                        </h2>
                        <p className={clsx('mt-2 text-base font-semibold leading-7', isDarkCard ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300')}>
                          {alert.context}
                        </p>
                      </div>
                    </div>

                    {alert.actionUrl && (
                      <a
                        href={alert.actionUrl}
                        className={clsx('inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition active:scale-95', isDarkCard ? 'border-white/10 text-white hover:bg-white/10' : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800')}
                      >
                        Ochish
                        <ArrowUpRight size={15} />
                      </a>
                    )}
                  </div>

                  {!!alert.details?.length && (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {alert.details.slice(0, 6).map((detail) => (
                        <div
                          key={`${alert.id}-${detail.label}`}
                          className={clsx('rounded-2xl border px-4 py-3', isDarkCard ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950')}
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{detail.label}</p>
                          <p className={clsx('mt-1 text-sm font-black leading-5', isDarkCard ? 'text-white' : 'text-slate-800 dark:text-white')}>{detail.value}</p>
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
          <div className="rounded-[2rem] border border-white bg-white py-20 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="mx-auto animate-spin text-indigo-500" size={38} />
            <h3 className="mt-4 text-sm font-black uppercase tracking-widest text-slate-400">Alertlar yuklanmoqda</h3>
          </div>
        )}

        {!loading && (error || alerts.length === 0) && (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Bell className="text-slate-300" size={34} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
              {error || "Hozircha alertlar yo'q"}
            </h3>
            <p className="mt-2 text-sm font-bold text-slate-400">
              Filtr yoki qidiruvni o'zgartirib ko'ring.
            </p>
          </div>
        )}
      </section>

      {!loading && !error && pagination.totalPages > 1 && (
        <nav className="flex flex-col gap-3 rounded-[1.6rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="px-2 text-sm font-black text-slate-500 dark:text-slate-400">
            {pagination.from}-{pagination.to} ko'rsatildi. Jami: {pagination.total}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
                    'h-10 min-w-10 rounded-2xl px-3 text-xs font-black tabular-nums transition',
                    item === pagination.page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  {item}
                </button>
              ) : (
                <span key={item} className="px-1 text-sm font-black text-slate-400">...</span>
              )
            ))}

            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Keyingi
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
