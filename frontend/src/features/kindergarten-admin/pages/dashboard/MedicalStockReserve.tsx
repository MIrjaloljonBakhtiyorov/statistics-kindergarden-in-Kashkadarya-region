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
  NOT_ENTERED: { label: 'Kiritilmagan', className: 'bg-slate-50 text-slate-700 border-slate-200', icon: CircleAlert },
  OK: { label: 'Yetarli', className: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
  LOW: { label: 'Yetarli emas', className: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertTriangle },
  EMPTY: { label: 'Qolmagan', className: 'bg-rose-50 text-rose-700 border-rose-100', icon: PackageX },
  EXPIRED: { label: "Muddati o'tgan", className: 'bg-red-50 text-red-700 border-red-100', icon: ShieldAlert },
  EXPIRING: { label: 'Muddati yaqin', className: 'bg-orange-50 text-orange-700 border-orange-100', icon: CalendarClock },
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
    <div className="min-h-screen bg-[#f4f6fb] pb-12 font-sans text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center shadow-md shadow-rose-600/20">
              <Pill className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-none">Dori-darmon zaxirasi</h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Bogchalar kesimida muddati, qoldiq va normativ nazorati
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Bogcha yoki dori qidirish"
                className="w-full sm:w-72 pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 shadow-sm outline-none focus:border-rose-300"
              />
            </div>
            <select
              value={districtFilter}
              onChange={(event) => setDistrictFilter(event.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-black text-slate-600 outline-none focus:border-rose-300"
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
          <StatCard title="Bogchalar" value={summary.kindergartens} icon={Building2} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard title="Muammolar" value={summary.issues} icon={ShieldAlert} color="text-rose-600" bg="bg-rose-50" />
          <StatCard title="Muddati o'tgan" value={summary.expired} icon={CalendarClock} color="text-red-600" bg="bg-red-50" />
          <StatCard title="Qolmagan" value={summary.empty} icon={PackageX} color="text-pink-600" bg="bg-pink-50" />
          <StatCard title="Yetarli emas" value={summary.low} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`shrink-0 px-3 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === filter.value
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-lg p-3 text-xs font-bold">
            {error}
          </div>
        )}

        <section>
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <h2 className="text-sm font-black text-slate-900">Muammoli dori-darmonlar</h2>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                  {filteredIssues.length} ta yozuvdan {visibleFrom}-{visibleTo} ko'rsatilmoqda
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span>Har sahifada {PAGE_SIZE} ta</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1120px]">
                <thead>
                  <tr className="bg-white text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="px-3 py-3 w-16 text-center">#</th>
                    <th className="px-4 py-3">Bogcha</th>
                    <th className="px-3 py-3">Dori</th>
                    <th className="px-3 py-3">Qoldiq</th>
                    <th className="px-3 py-3">Normativ</th>
                    <th className="px-3 py-3">Yaroqlilik</th>
                    <th className="px-4 py-3">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-black uppercase tracking-widest text-[9px]">
                        Zaxira yuklanmoqda...
                      </td>
                    </tr>
                  )}
                  {!loading && filteredIssues.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-black uppercase tracking-widest text-[9px]">
                        Tanlangan filtrda muammo topilmadi
                      </td>
                    </tr>
                  )}
                  {!loading && paginatedIssues.map((item, index) => {
                    const meta = statusMeta[item.status];
                    const StatusIcon = meta.icon;
                    return (
                      <tr key={`${item.kindergarten_id}-${item.id}`} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-slate-100 px-2 text-[10px] font-black text-slate-600">
                            {startIndex + index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-black text-slate-900 leading-snug">{item.kindergarten_name}</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{item.phone || 'Telefon kiritilmagan'}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.district || 'Tuman kiritilmagan'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-xs font-black text-slate-900 leading-snug">{item.name}</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5 max-w-sm">{item.form || 'Shakli kiritilmagan'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-base font-black text-slate-900 leading-none">
                            {Number(item.current_quantity || 0).toLocaleString('uz-UZ')}
                            <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-xs font-black text-slate-900">{item.required_quantity} {item.unit}</p>
                          <p className="text-[9px] font-semibold text-slate-500 mt-0.5">{item.child_count_basis} bola asosida</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[11px] font-black text-slate-700">{item.oldest_expired_date || item.nearest_expiry_date || '-'}</p>
                          {item.expired_batch_count ? (
                            <p className="text-[9px] font-bold text-red-600 mt-0.5">{item.expired_batch_count} partiya muddati o'tgan</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${meta.className}`}>
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
              <div className="flex min-w-0 flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                <p className="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {safePage}-sahifa / {totalPages} sahifa
                </p>
                <div className="flex w-full min-w-0 items-center gap-2 sm:flex-1 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={safePage === 1}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-slate-300"
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
                        className={`h-8 min-w-8 shrink-0 rounded-lg px-2 text-[11px] font-black transition ${
                          safePage === pageNumber
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
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
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-slate-300"
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
  <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm min-h-[86px]">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color} mb-2`}>
      <Icon size={16} />
    </div>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
    <h3 className="text-lg font-black text-slate-900 leading-none">{value}</h3>
  </div>
);
