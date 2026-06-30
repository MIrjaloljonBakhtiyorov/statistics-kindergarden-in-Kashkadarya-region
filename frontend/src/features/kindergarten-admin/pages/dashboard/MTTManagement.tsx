import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Building2, School, LayoutGrid, Home,
  Edit, Trash2, Loader2, MapPin, User, ChevronRight,
  ShieldCheck, Users, Grid, List, Phone, Download, FileSpreadsheet,
  Eye, EyeOff, Copy, ExternalLink, KeyRound, X, Clock, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { YangiBogchaQoshishModal } from './YangiBogchaQoshishModal';
import { kindergartenApi } from '@/shared/api';

const BOGCHA_PANEL_URL = '/kindergarten/';

const copyToClipboard = async (text: string) => {
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below handles browsers that block the Clipboard API.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

const CredentialsModal = ({ item, onClose, onOpen }: { item: any; onClose: () => void; onOpen: () => void }) => {
  const [showPass, setShowPass] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const copy = async (field: 'username' | 'password', text: string) => {
    const ok = await copyToClipboard(text);
    if (!ok) {
      toast.error('Nusxa olishda xatolik yuz berdi');
      return;
    }

    setCopiedField(field);
    toast.success(field === 'username' ? 'Login nusxalandi' : 'Parol nusxalandi');
    window.setTimeout(() => setCopiedField(null), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-slate-950/45 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="bg-white rounded-[24px] shadow-2xl shadow-slate-950/25 w-full max-w-[430px] overflow-hidden border border-white/80"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 sm:px-7 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 ring-1 ring-indigo-100">
              <KeyRound size={17} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kirish ma'lumotlari</p>
              <p className="text-base font-black text-slate-900 leading-tight truncate max-w-[260px]">{item.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 sm:px-7 py-5 space-y-3.5">
          {/* Username */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Login (Username)</p>
              <p className="text-sm font-black text-slate-800 font-mono">{item.username || '-'}</p>
            </div>
            <button
              onClick={() => copy('username', item.username || '')}
              className={clsx(
                "p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all shrink-0",
                copiedField === 'username' ? "text-emerald-600 bg-white border-emerald-100" : "text-slate-400 hover:text-indigo-600"
              )}
              title={copiedField === 'username' ? "Nusxalandi" : "Nusxa olish"}
            >
              <Copy size={14} />
            </button>
          </div>

          {/* Password */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Parol</p>
              <p className="text-sm font-black text-slate-800 font-mono tracking-widest truncate">
                {showPass ? (item.password || 'USER1234') : '----------'}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowPass(v => !v)}
                className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600 transition-all"
                title={showPass ? "Yashirish" : "Ko'rish"}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => copy('password', item.password || 'USER1234')}
                className={clsx(
                  "p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all",
                  copiedField === 'password' ? "text-emerald-600 bg-white border-emerald-100" : "text-slate-400 hover:text-indigo-600"
                )}
                title={copiedField === 'password' ? "Nusxalandi" : "Nusxa olish"}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center">
            Panel manzili: <span className="font-bold text-indigo-600">{BOGCHA_PANEL_URL}</span>
          </p>
        </div>

        <div className="px-6 sm:px-7 pb-6">
          <button
            onClick={onOpen}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <ExternalLink size={14} /> Bogcha paneliga o'tish
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DeleteConfirmModal = ({
  item,
  isDeleting,
  onClose,
  onConfirm,
}: {
  item: any;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDeleting, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-slate-950/45 backdrop-blur-md p-4 sm:p-6"
      onClick={() => !isDeleting && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-[440px] overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-2xl shadow-slate-950/25"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pb-5 pt-6 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <Trash2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">O'chirish</p>
              <p className="truncate text-base font-black leading-tight text-slate-900">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5 sm:px-7">
          <p className="text-sm font-bold leading-6 text-slate-600">
            Ushbu bog'chani o'chirishni tasdiqlaysizmi?
          </p>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Tanlangan bog'cha</p>
            <p className="mt-1 text-sm font-black text-slate-900">{item.name}</p>
            <p className="mt-0.5 text-xs font-bold text-slate-500">{item.district || 'Tuman kiritilmagan'}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-100 disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-700 disabled:opacity-70"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            O'chirish
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; iconBg: string }> = {
  Public:  { label: 'Davlat',  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100',   iconBg: 'bg-blue-600' },
  Private: { label: 'Xususiy', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', iconBg: 'bg-purple-500' },
  Home:    { label: 'Oilaviy', color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100',  iconBg: 'bg-amber-500' },
};

const TYPE_ORDER = ['Private', 'Public', 'Home'];

const getTypeOrder = (type: string) => {
  const index = TYPE_ORDER.indexOf(type);
  return index === -1 ? TYPE_ORDER.length : index;
};

const WORK_HOUR_OPTIONS = [
  { value: 4, label: '4 soatlik', iconBg: 'bg-cyan-500' },
  { value: 9.5, label: '9-10.5 soatlik', iconBg: 'bg-emerald-500' },
  { value: 12, label: '12 soatlik', iconBg: 'bg-rose-500' },
  { value: 24, label: '24 soatlik', iconBg: 'bg-slate-700' },
];

const WORK_HOUR_STAT_GROUPS = [
  { values: [4], filterValue: '4', label: '4 soatlik', iconBg: 'bg-cyan-500' },
  { values: [9, 9.5, 10.5], filterValue: '9.5', label: '9-10.5 soatlik', iconBg: 'bg-emerald-500' },
  { values: [12], filterValue: '12', label: '12 soatlik', iconBg: 'bg-rose-500' },
  { values: [24], filterValue: '24', label: '24 soatlik', iconBg: 'bg-slate-700' },
];

const getWorkHours = (item: any) => {
  const value = Number(item?.workHours || 9);
  return [4, 9, 9.5, 10.5, 12, 24].includes(value) ? value : 9.5;
};

const getWorkHourLabel = (item: any) => {
  const value = typeof item === 'number' ? item : getWorkHours(item);
  if ([9, 9.5, 10.5].includes(value)) return '9-10.5 soatlik';
  return WORK_HOUR_OPTIONS.find((option) => option.value === value)?.label || `${value} soatlik`;
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  Active:     { label: 'Aktiv',    dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Monitoring: { label: 'Monitor',  dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  Issue:      { label: 'Muammo',   dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  Critical:   { label: 'Kritik',   dot: 'bg-rose-600',    badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  Noaktiv:    { label: 'Noaktiv',  dot: 'bg-slate-400',   badge: 'bg-slate-50 text-slate-500 border-slate-200' },
  Aktiv:      { label: 'Aktiv',    dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Active;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider", c.badge)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", c.dot)} />
      {c.label}
    </span>
  );
};

const DISTRICTS = [
  "Qarshi shahri", "Qarshi tumani", "Shahrisabz shahri", "Shahrisabz tumani",
  "Kitob tumani", "Koson tumani", "Muborak tumani", "G'uzor tumani",
  "Nishon tumani", "Dehqonobod tumani", "Qamashi tumani", "Chiroqchi tumani",
  "Kasbi tumani", "Mirishkor tumani", "Yakkabog' tumani", "Ko'kdala tumani",
];

const getChildrenCount = (item: any) => {
  return Number(item.actualChildrenCount ?? item.childrenCount ?? 0);
};

export const MTTManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [workHoursFilter, setWorkHoursFilter] = useState('');
  const [sortMode, setSortMode] = useState('type-group');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [credItem, setCredItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { 
      const res = await kindergartenApi.getAll(); 
      setData(Array.isArray(res) ? res : []);
    }
    catch (err) { 
      console.error("API error:", err);
      setData([]);
      toast.error("Bog'chalar ma'lumotini yuklashda xatolik");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setIsDeleting(true);
      await kindergartenApi.delete(deleteTarget.id);
      setData(d => (Array.isArray(d) ? d : []).filter(i => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Bog'cha muvaffaqiyatli o'chirildi");
    } catch {
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setIsDeleting(false);
    }
  };

  const matchesWorkHoursFilter = (item: any) => {
    if (!workHoursFilter) return true;
    if (Number(workHoursFilter) === 9.5) return [9, 9.5, 10.5].includes(getWorkHours(item));
    return getWorkHours(item) === Number(workHoursFilter);
  };

  const filtered = Array.isArray(data) ? data.filter(i =>
    (i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || i.directorName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!districtFilter || i.district === districtFilter) &&
    (!typeFilter || i.type === typeFilter) &&
    matchesWorkHoursFilter(i)
  ).sort((a, b) => {
    if (sortMode === 'type-group') {
      const typeDiff = getTypeOrder(a.type) - getTypeOrder(b.type);
      if (typeDiff !== 0) return typeDiff;
      return String(a.name || '').localeCompare(String(b.name || ''), 'uz');
    }
    if (sortMode === 'children-desc') return getChildrenCount(b) - getChildrenCount(a);
    if (sortMode === 'children-asc') return getChildrenCount(a) - getChildrenCount(b);
    if (sortMode === 'hours-asc') return getWorkHours(a) - getWorkHours(b);
    if (sortMode === 'hours-desc') return getWorkHours(b) - getWorkHours(a);
    return String(a.name || '').localeCompare(String(b.name || ''), 'uz');
  }) : [];

  const stats = [
    { label: 'Jami muassasalar',  val: Array.isArray(data) ? data.length : 0,                               icon: Building2,  iconBg: 'bg-indigo-600' },
    { label: 'Davlat (Public)',   val: Array.isArray(data) ? data.filter(i => i.type === 'Public').length : 0,  icon: School,     iconBg: 'bg-blue-500' },
    { label: 'Xususiy (Private)', val: Array.isArray(data) ? data.filter(i => i.type === 'Private').length : 0, icon: LayoutGrid, iconBg: 'bg-purple-500' },
    { label: 'Oilaviy (Home)',    val: Array.isArray(data) ? data.filter(i => i.type === 'Home').length : 0,    icon: Home,       iconBg: 'bg-amber-500' },
  ];

  const workHourStats = WORK_HOUR_STAT_GROUPS.map((group) => ({
    ...group,
    val: Array.isArray(data) ? data.filter((item) => group.values.includes(getWorkHours(item))).length : 0,
  }));

  return (
    <div className="min-h-screen bg-[#f4f6fb] space-y-6 pb-20">

      {credItem && (
        <CredentialsModal
          item={credItem}
          onClose={() => setCredItem(null)}
          onOpen={() => {
            const kindergartenId = credItem.id || 'new';
            localStorage.removeItem('auth_user');
            window.open(`${BOGCHA_PANEL_URL}${kindergartenId}/director`, '_blank');
            setCredItem(null);
          }}
        />
      )}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            item={deleteTarget}
            isDeleting={isDeleting}
            onClose={() => !isDeleting && setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <YangiBogchaQoshishModal
            initialData={editData}
            onClose={() => { setIsModalOpen(false); setEditData(null); }}
            onSave={() => { setIsModalOpen(false); setEditData(null); fetchData(); }}
          />
        )}
      </AnimatePresence>

      {/* в”Ђв”Ђ Header в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bog'chalar ro'yxati</h1>
          <p className="text-sm text-slate-400 font-medium flex items-center gap-2 mt-1">
            <ShieldCheck size={14} className="text-indigo-500" />
            Tizimdagi barcha bog'chalar va ularning ma'lumotlari
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditData(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25"
          >
            <Plus size={15} strokeWidth={2.5} /> Bog'cha qo'shish
          </button>
        </div>
      </div>

      {/* в”Ђв”Ђ Stats в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4"
          >
            <div className={clsx("w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0", s.iconBg)}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{s.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* в”Ђв”Ђ Filter bar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {workHourStats.map((item) => (
          <button
            key={item.label}
            onClick={() => setWorkHoursFilter(workHoursFilter === item.filterValue ? '' : item.filterValue)}
            className={clsx(
              "bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left transition-all",
              workHoursFilter === item.filterValue ? "border-indigo-300 ring-4 ring-indigo-500/10" : "border-slate-100 hover:border-indigo-200"
            )}
          >
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0", item.iconBg)}>
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xl font-black text-slate-900">{item.val} ta</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Qidirish..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* District select */}
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="">Tumanlar</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Type select */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="">Turlari</option>
            <option value="Public">Davlat</option>
            <option value="Private">Xususiy</option>
            <option value="Home">Oilaviy</option>
          </select>

          <select
            value={workHoursFilter}
            onChange={e => setWorkHoursFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            <option value="">Ish vaqti</option>
            {WORK_HOUR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <div className="relative">
            <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={sortMode}
              onChange={e => setSortMode(e.target.value)}
              className="pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
            >
              <option value="type-group">Turi bo'yicha</option>
              <option value="name-asc">Nomi A-Z</option>
              <option value="children-desc">Bolalar ko'pdan</option>
              <option value="children-asc">Bolalar ozdan</option>
              <option value="hours-asc">Ish vaqti 4-24</option>
              <option value="hours-desc">Ish vaqti 24-4</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={clsx("p-2 rounded-lg transition-all", viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid size={16} />
            </button>
          </div>

          {/* Export */}
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all" title="Excel">
            <FileSpreadsheet size={16} />
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all" title="PDF">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* в”Ђв”Ђ Content в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={36} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-slate-200" />
            </div>
            <h3 className="font-black text-slate-400 uppercase tracking-widest text-sm">Bog'chalar topilmadi</h3>
            <p className="text-xs text-slate-400 mt-1.5">Qidiruv yoki filtrni o'zgartirib ko'ring</p>
          </motion.div>

        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <motion.div key="table" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left">Bog'cha nomi</th>
                    <th className="px-4 py-4 text-left">Tuman</th>
                    <th className="px-4 py-4 text-left">Turi</th>
                    <th className="px-4 py-4 text-left">Ish vaqti</th>
                    <th className="px-4 py-4 text-center">Bolalar</th>
                    <th className="px-4 py-4 text-center">Guruhlar</th>
                    <th className="px-4 py-4 text-left">Holat</th>
                    <th className="px-6 py-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((item, i) => {
                    const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.Public;
                    const showTypeHeader = sortMode === 'type-group' && (i === 0 || filtered[i - 1]?.type !== item.type);
                    return [
                      showTypeHeader ? (
                        <tr key={`${item.type}-header`} className="bg-slate-100/70">
                          <td colSpan={8} className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <span className={clsx("w-2.5 h-2.5 rounded-full", tc.iconBg)} />
                              <span className={clsx("text-[11px] font-black uppercase tracking-[0.22em]", tc.color)}>
                                {tc.label} bog'chalar
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {filtered.filter((row) => row.type === item.type).length} ta
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : null,
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.025 }}
                        onClick={() => {}}
                        className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0", tc.iconBg)}>
                              <School size={18} />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{item.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {item.system_id || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-slate-600">{item.district}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={clsx("text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider", tc.bg, tc.color)}>
                            {tc.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider">
                            <Clock size={11} /> {getWorkHourLabel(item)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-black text-slate-900">{getChildrenCount(item)}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-black text-slate-900">{item.groups ?? 0}</span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={item.status || 'Active'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); setCredItem(item); }}
                              className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all"
                              title="Ko'rish / Kirish"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={e => handleEdit(e, item)}
                              className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={e => handleDelete(e, item)}
                              className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ].filter(Boolean);
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

        ) : (
          /* GRID VIEW */
          <motion.div key="grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((item, i) => {
              const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.Public;
              const showTypeHeader = sortMode === 'type-group' && (i === 0 || filtered[i - 1]?.type !== item.type);
              return [
                showTypeHeader ? (
                  <div key={`${item.type}-grid-header`} className="sm:col-span-2 xl:col-span-3 flex items-center gap-3 pt-2">
                    <span className={clsx("w-3 h-3 rounded-full", tc.iconBg)} />
                    <h2 className={clsx("text-sm font-black uppercase tracking-[0.22em]", tc.color)}>
                      {tc.label} bog'chalar
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {filtered.filter((row) => row.type === item.type).length} ta
                    </span>
                  </div>
                ) : null,
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setCredItem(item)}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                >
                  {/* top stripe */}
                  <div className={clsx("h-1 w-full", tc.iconBg)} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={clsx("w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md", tc.iconBg)}>
                        <School size={20} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); setCredItem(item); }} className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Ko'rish">
                          <Eye size={14} />
                        </button>
                        <button onClick={e => handleEdit(e, item)} className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                          <Edit size={14} />
                        </button>
                        <button onClick={e => handleDelete(e, item)} className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                        <StatusBadge status={item.status || 'Active'} />
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{item.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-4">
                      <MapPin size={9} /> {item.district} В· {tc.label}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Users size={9} /> Bolalar
                        </p>
                        <p className="text-lg font-black text-slate-900">{getChildrenCount(item)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Grid size={9} /> Guruhlar
                        </p>
                        <p className="text-lg font-black text-slate-900">{item.groups ?? 0}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Clock size={9} /> Ish vaqti
                        </p>
                        <p className="text-sm font-black text-slate-900">{getWorkHourLabel(item)}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-4 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <User size={11} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Direktor</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight">{item.directorName || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Phone size={11} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Telefon</p>
                          <p className="text-xs font-bold text-slate-700">{item.phone || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                      Batafsil <ChevronRight size={12} />
                    </div>
                  </div>
                </motion.div>
              ].filter(Boolean);
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

