import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  PackageX,
  Pill,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { apiClient } from '@/shared/api';

type MedicalStockStatus = 'NOT_ENTERED' | 'OK' | 'LOW' | 'EMPTY' | 'EXPIRED' | 'EXPIRING';

type MedicalStockItem = {
  id: string;
  kindergarten_id: string | number;
  kindergarten_name?: string;
  district?: string;
  address?: string;
  phone?: string;
  name: string;
  form?: string;
  unit?: string;
  required_quantity: number;
  required_label?: string;
  current_quantity: number;
  child_count_basis: number;
  nearest_expiry_date?: string | null;
  oldest_expired_date?: string | null;
  expired_batch_count?: number;
  status: MedicalStockStatus;
};

type MedicalStockResponse = {
  generated_at: string;
  summary: {
    kindergartens: number;
    total_items: number;
    issues: number;
    expired: number;
    empty: number;
    low: number;
    expiring: number;
    not_entered: number;
  };
  issues: MedicalStockItem[];
};

const statusMeta: Record<MedicalStockStatus, { label: string; className: string; icon: any }> = {
  NOT_ENTERED: { label: 'Kiritilmagan', className: 'bg-slate-500/10 text-slate-200 border-white/10', icon: CircleAlert },
  OK: { label: 'Yetarli', className: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/25', icon: CheckCircle2 },
  LOW: { label: 'Yetarli emas', className: 'bg-amber-500/10 text-amber-200 border-amber-400/25', icon: AlertTriangle },
  EMPTY: { label: 'Qolmagan', className: 'bg-rose-500/10 text-rose-200 border-rose-400/25', icon: PackageX },
  EXPIRED: { label: "Muddati o'tgan", className: 'bg-red-500/10 text-red-200 border-red-400/25', icon: ShieldAlert },
  EXPIRING: { label: 'Muddati yaqin', className: 'bg-orange-500/10 text-orange-200 border-orange-400/25', icon: CalendarClock },
};

const filters = [
  { value: 'ALL', label: 'Barcha muammolar' },
  { value: 'EXPIRED', label: "Muddati o'tgan" },
  { value: 'EMPTY', label: 'Qolmagan' },
  { value: 'LOW', label: 'Yetarli emas' },
  { value: 'EXPIRING', label: 'Muddati yaqin' },
  { value: 'NOT_ENTERED', label: 'Kiritilmagan' },
];

const emptySummary: MedicalStockResponse['summary'] = {
  kindergartens: 0,
  total_items: 0,
  issues: 0,
  expired: 0,
  empty: 0,
  low: 0,
  expiring: 0,
  not_entered: 0,
};

const PAGE_SIZE = 50;

export const MedicalStockReserve = () => {
  const [data, setData] = useState<MedicalStockResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMedicalStock = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/kindergartens/medical-stock-alerts');
        setData(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Dori-darmon zaxirasini yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalStock();
  }, []);

  const issues = data?.issues || [];
  const summary = data?.summary || emptySummary;

  const districts = useMemo(() => {
    return Array.from(new Set(issues.map((item) => item.district).filter(Boolean))).sort();
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return issues.filter((item) => {
      const haystack = `${item.kindergarten_name || ''} ${item.phone || ''} ${item.district || ''} ${item.name} ${item.form || ''}`.toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesDistrict = districtFilter === 'ALL' || item.district === districtFilter;
      return matchesSearch && matchesStatus && matchesDistrict;
    });
  }, [districtFilter, issues, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [districtFilter, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + PAGE_SIZE);
  const visibleFrom = filteredIssues.length === 0 ? 0 : startIndex + 1;
  const visibleTo = Math.min(startIndex + PAGE_SIZE, filteredIssues.length);

  return (
    <div className="min-h-screen bg-[#08100f] pb-12 font-sans text-white">
      <header className="sticky top-0 z-30 bg-[#0b1110]/92 backdrop-blur-xl border-b border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center shadow-md shadow-rose-600/20">
              <Pill className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-none">Dori-darmon zaxirasi</h1>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                Bogchalar kesimida muddati, qoldiq va normativ nazorati
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Bogcha yoki dori qidirish"
                className="w-full sm:w-72 pl-8 pr-3 py-2 bg-[#111615] border border-white/10 rounded-lg text-[12px] font-bold text-white placeholder:text-slate-500 shadow-sm outline-none focus:border-rose-400/70 focus:ring-4 focus:ring-rose-500/10"
              />
            </div>
            <select
              value={districtFilter}
              onChange={(event) => setDistrictFilter(event.target.value)}
              className="bg-[#111615] border border-white/10 rounded-lg px-3 py-2 text-[12px] font-black text-white outline-none focus:border-rose-400/70 focus:ring-4 focus:ring-rose-500/10"
            >
              <option value="ALL">Barcha tumanlar</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
          <StatCard title="Bogchalar" value={summary.kindergartens} icon={Building2} color="text-indigo-200" bg="bg-indigo-500/15 ring-indigo-400/25" />
          <StatCard title="Muammolar" value={summary.issues} icon={ShieldAlert} color="text-rose-200" bg="bg-rose-500/15 ring-rose-400/25" />
          <StatCard title="Muddati o'tgan" value={summary.expired} icon={CalendarClock} color="text-red-200" bg="bg-red-500/15 ring-red-400/25" />
          <StatCard title="Qolmagan" value={summary.empty} icon={PackageX} color="text-pink-200" bg="bg-pink-500/15 ring-pink-400/25" />
          <StatCard title="Yetarli emas" value={summary.low} icon={AlertTriangle} color="text-amber-200" bg="bg-amber-500/15 ring-amber-400/25" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`shrink-0 px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === filter.value
                  ? 'bg-white text-[#08100f] border-white shadow-md shadow-black/20'
                  : 'bg-[#111615] text-slate-200 border-white/10 hover:border-rose-400/40 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-400/25 text-rose-100 rounded-lg p-3 text-[13px] font-bold">
            {error}
          </div>
        )}

        <section>
          <div className="bg-[#111615] border border-white/10 rounded-xl shadow-[0_20px_55px_rgba(0,0,0,0.24)] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0b1110]">
              <div>
                <h2 className="text-[15px] font-black text-white">Muammoli dori-darmonlar</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-0.5">
                  {filteredIssues.length} ta yozuvdan {visibleFrom}-{visibleTo} ko'rsatilmoqda
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                <span>Har sahifada {PAGE_SIZE} ta</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1120px]">
                <thead>
                  <tr className="bg-[#0b1110] text-[10px] font-black uppercase text-slate-300 tracking-widest border-b border-white/10">
                    <th className="px-3 py-3 w-16 text-center">#</th>
                    <th className="px-4 py-3">Bogcha</th>
                    <th className="px-3 py-3">Dori</th>
                    <th className="px-3 py-3">Qoldiq</th>
                    <th className="px-3 py-3">Normativ</th>
                    <th className="px-3 py-3">Yaroqlilik</th>
                    <th className="px-4 py-3">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                        Zaxira yuklanmoqda...
                      </td>
                    </tr>
                  )}
                  {!loading && filteredIssues.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                        Tanlangan filtrda muammo topilmadi
                      </td>
                    </tr>
                  )}
                  {!loading && paginatedIssues.map((item, index) => {
                    const meta = statusMeta[item.status];
                    const StatusIcon = meta.icon;
                    return (
                      <tr key={`${item.kindergarten_id}-${item.id}`} className="hover:bg-white/[0.04] transition-colors">
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-white/10 px-2 text-[11px] font-black text-white">
                            {startIndex + index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-black text-white leading-snug">{item.kindergarten_name}</p>
                          <p className="text-[11px] font-semibold text-slate-300 mt-0.5">{item.phone || 'Telefon kiritilmagan'}</p>
                          <p className="text-[11px] font-semibold text-slate-300 mt-0.5">{item.district || 'Tuman kiritilmagan'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[13px] font-black text-white leading-snug">{item.name}</p>
                          <p className="text-[11px] font-semibold text-slate-300 mt-0.5 max-w-sm">{item.form || 'Shakli kiritilmagan'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-base font-black text-white leading-none">
                            {Number(item.current_quantity || 0).toLocaleString('uz-UZ')}
                            <span className="text-[11px] text-slate-300 ml-1">{item.unit}</span>
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[13px] font-black text-white">{item.required_quantity} {item.unit}</p>
                          <p className="text-[10px] font-semibold text-slate-300 mt-0.5">{item.child_count_basis} bola asosida</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[12px] font-black text-white">{item.oldest_expired_date || item.nearest_expiry_date || '-'}</p>
                          {item.expired_batch_count ? (
                            <p className="text-[10px] font-bold text-red-300 mt-0.5">{item.expired_batch_count} partiya muddati o'tgan</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest ${meta.className}`}>
                            <StatusIcon size={12} />
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!loading && filteredIssues.length > PAGE_SIZE && (
              <div className="flex min-w-0 flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10 px-4 py-3 bg-[#0b1110]">
                <p className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  {safePage}-sahifa / {totalPages} sahifa
                </p>
                <div className="flex w-full min-w-0 items-center gap-2 sm:flex-1 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={safePage === 1}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#111615] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-rose-400/40"
                  >
                    <ChevronLeft size={14} />
                    Oldingi
                  </button>
                  <div className="custom-scrollbar flex min-w-0 max-w-full flex-1 items-center gap-1 overflow-x-auto pb-1 whitespace-nowrap">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        className={`h-8 min-w-8 shrink-0 rounded-lg px-2 text-[12px] font-black transition ${
                          safePage === pageNumber
                            ? 'bg-white text-[#08100f] shadow-md shadow-black/20'
                            : 'bg-white/10 text-slate-200 hover:bg-white/15'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={safePage === totalPages}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#111615] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-rose-400/40"
                  >
                    Keyingi
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string; value: number; icon: any; color: string; bg: string }) => (
  <div className="bg-[#111615] border border-white/10 rounded-lg p-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)] min-h-[86px]">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color} mb-2 ring-1`}>
      <Icon size={16} />
    </div>
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{title}</p>
    <h3 className="text-lg font-black text-white leading-none">{value}</h3>
  </div>
);
