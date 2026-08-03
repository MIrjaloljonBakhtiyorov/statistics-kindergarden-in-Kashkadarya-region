import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Fingerprint,
  Globe2,
  History,
  Loader2,
  MapPin,
  MonitorSmartphone,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '@/shared/api';

type LoginEvent = {
  id: string;
  created_at: string;
  device_type?: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  location_label?: string;
};

type LoginHistoryResponse = {
  items: LoginEvent[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

const formatLoginDate = (value?: string) => {
  if (!value) return 'Vaqt aniqlanmagan';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hour}:${minute}`;
};

export const LoginHistorySection = ({ childId }: { childId: string }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LoginHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const latestEvent = useMemo(() => data?.items?.[0], [data?.items]);

  useEffect(() => {
    let ignore = false;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/parent-portal/login-history/${childId}`, {
          params: { page, limit: 10 }
        });
        if (!ignore) setData(res.data);
      } catch (error) {
        if (!ignore) {
          setData({
            items: [],
            page,
            limit: 10,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: page > 1
          });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      ignore = true;
    };
  }, [childId, page]);

  const totalPages = data?.totalPages || 1;

  return (
    <div className="kg-parent-section space-y-4 sm:space-y-5 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/50 md:p-6">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-sky-500 via-cyan-400 to-emerald-400"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/65 to-emerald-50/60"></div>
        <div className="absolute -right-12 -top-16 hidden h-40 w-40 rounded-[42px] border border-white/70 bg-white/45 rotate-12 md:block"></div>
        <div className="absolute bottom-5 right-28 hidden h-16 w-16 rounded-[24px] border border-sky-100 bg-sky-100/35 md:block"></div>
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-600 shadow-lg shadow-sky-100/80">
              <History size={25} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600">Xavfsizlik nazorati</p>
              <h3 className="mt-1 text-[24px] font-extrabold leading-tight text-brand-depth md:text-[30px]">Kirish tarixi</h3>
              <p className="mt-1 text-[13px] font-semibold leading-relaxed text-brand-muted">
                Ota-ona profiliga kirilgan vaqt, qurilma va manzil ma'lumotlari.
              </p>
            </div>
          </div>

          <div className="grid gap-2 rounded-3xl border border-sky-100 bg-white/90 p-3 shadow-lg shadow-sky-100/70 sm:min-w-[270px] sm:grid-cols-[46px_minmax(0,1fr)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Fingerprint size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wide text-brand-muted">Oxirgi kirish</p>
              <p className="mt-1 truncate text-sm font-extrabold text-brand-depth">{latestEvent ? formatLoginDate(latestEvent.created_at) : 'Hali yozuv yo\'q'}</p>
              <p className="mt-0.5 text-[11px] font-bold text-emerald-600">{latestEvent ? 'Faoliyat qayd qilindi' : 'Kuzatuv kutilmoqda'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl shadow-sky-100/45">
        <div className="relative overflow-hidden border-b border-sky-100 bg-white px-4 py-4 md:px-5">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50/85 via-white to-emerald-50/65"></div>
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-600 shadow-sm">
                <CalendarCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Jurnal</p>
                <p className="mt-0.5 text-lg font-extrabold text-brand-depth">{data?.total || 0} ta kirish yozuvi</p>
              </div>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-[11px] font-extrabold text-emerald-700 shadow-sm">
              <ShieldCheck size={14} className="text-emerald-500" />
              10 tadan ko'rsatiladi
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-brand-muted">
            <Loader2 size={30} className="animate-spin text-sky-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em]">Yuklanmoqda</p>
          </div>
        ) : data?.items?.length ? (
          <div className="space-y-3 bg-gradient-to-b from-slate-50/75 to-white p-3 md:p-4">
            {data.items.map((item, index) => (
              <div key={item.id} className="relative overflow-hidden rounded-[26px] border border-sky-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/70">
                <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-sky-500 to-cyan-400"></div>
                <div className="grid gap-3 p-3 md:grid-cols-[minmax(260px,1.25fr)_minmax(165px,0.85fr)_minmax(170px,0.9fr)] md:items-center md:p-4 md:pl-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white text-sky-600 shadow-sm">
                      <MonitorSmartphone size={23} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase text-sky-600">
                          #{(page - 1) * 10 + index + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-600">
                          <BadgeCheck size={12} />
                          Muvaffaqiyatli
                        </span>
                      </div>
                      <p className="mt-2 text-[18px] font-extrabold leading-tight text-brand-depth">{formatLoginDate(item.created_at)}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-brand-muted">
                        <Clock3 size={13} />
                        Tizimga kirilgan vaqt
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-brand-muted">Qurilma</p>
                    <p className="mt-1 text-sm font-extrabold text-brand-depth">{item.device_type || 'Aniqlanmagan'}</p>
                    <p className="mt-0.5 truncate text-[12px] font-semibold text-brand-muted">{item.browser || 'Brauzer noma\'lum'} • {item.os || 'OS noma\'lum'}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-brand-muted">Qayerdan</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-brand-depth">
                      <MapPin size={14} className="text-rose-500" />
                      <span className="truncate">{item.location_label || 'Aniqlanmagan'}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold text-brand-muted">
                      <Globe2 size={13} />
                      <span className="truncate">{item.ip_address || 'IP yo\'q'}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 text-brand-muted">
              <History size={28} />
            </div>
            <h4 className="mt-4 text-xl font-extrabold text-brand-depth">Kirish tarixi hali yo'q</h4>
            <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-brand-muted">
              Ota-ona profiliga keyingi kirishdan boshlab qurilma va vaqt ma'lumotlari shu yerda ko'rinadi.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-sky-100 bg-gradient-to-r from-white via-sky-50/45 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[12px] font-extrabold text-brand-muted shadow-sm">
            <span className="text-sky-600">Sahifa</span>
            {data?.page || page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={loading || page <= 1}
              className="flex h-10 items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 text-[11px] font-extrabold uppercase text-brand-muted shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft size={16} />
              Oldingi
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={loading || page >= totalPages}
              className="flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 text-[11px] font-extrabold uppercase text-white shadow-sm shadow-sky-200 transition-all hover:from-sky-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Keyingi
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
