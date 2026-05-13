import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Building2, School, LayoutGrid, Home,
  Edit, Trash2, Loader2, MapPin, User, ChevronRight,
  ShieldCheck, Users, Zap, Grid, List, Phone, Download, FileSpreadsheet,
  Eye, EyeOff, Copy, ExternalLink, KeyRound, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { YangiBogchaQoshishModal } from './YangiBogchaQoshishModal';
import { kindergartenApi } from '../../api/apiClient';
import { MOCK_KINDERGARTENS } from '../../lib/mock-data';

const BOGCHA_PANEL_URL = '/kindergarten/';

const CredentialsModal = ({ item, onClose, onOpen }: { item: any; onClose: () => void; onOpen: () => void }) => {
  const [showPass, setShowPass] = useState(false);
  const copy = (text: string) => { navigator.clipboard.writeText(text); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <KeyRound size={15} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kirish ma'lumotlari</p>
              <p className="text-sm font-black text-slate-900 leading-tight truncate max-w-[180px]">{item.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {/* Username */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Login (Username)</p>
              <p className="text-sm font-black text-slate-800 font-mono">{item.username || '—'}</p>
            </div>
            <button
              onClick={() => copy(item.username || '')}
              className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600 transition-all"
              title="Nusxa olish"
            >
              <Copy size={14} />
            </button>
          </div>

          {/* Password */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Parol</p>
              <p className="text-sm font-black text-slate-800 font-mono tracking-widest">
                {showPass ? (item.password || 'USER1234') : '••••••••••'}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowPass(v => !v)}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600 transition-all"
                title={showPass ? "Yashirish" : "Ko'rish"}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => copy(item.password || 'USER1234')}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600 transition-all"
                title="Nusxa olish"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center">
            Panel manzili: <span className="font-bold text-indigo-600">{BOGCHA_PANEL_URL}</span>
          </p>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onOpen}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <ExternalLink size={14} /> Bogcha paneliga o'tish
          </button>
        </div>
      </div>
    </div>
  );
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; iconBg: string }> = {
  Public:  { label: 'Davlat',  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100',   iconBg: 'bg-blue-600' },
  Private: { label: 'Xususiy', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', iconBg: 'bg-purple-500' },
  Home:    { label: 'Oilaviy', color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100',  iconBg: 'bg-amber-500' },
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
  "Kasbi tumani", "Mirishkor tumani", "Yakkabog' tumani", "Beshkent tumani",
];

export const MTTManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [credItem, setCredItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try { 
      const res = await kindergartenApi.getAll(); 
      if (Array.isArray(res) && res.length > 0) {
        setData(res);
      } else {
        // If API returns empty or not an array, use mock data
        setData(MOCK_KINDERGARTENS);
      }
    }
    catch (err) { 
      console.error("API error, using mock data:", err);
      setData(MOCK_KINDERGARTENS);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Ushbu bog'chani o'chirishni tasdiqlaysizmi?")) return;
    try {
      await kindergartenApi.delete(id);
      setData(d => (Array.isArray(d) ? d : []).filter(i => i.id !== id));
      toast.success("Bog'cha muvaffaqiyatli o'chirildi");
    } catch { toast.error("O'chirishda xatolik yuz berdi"); }
  };

  const seedExampleData = async () => {
    const examples = [
      { name: "12-sonli 'Quyoshcha' MTT",  type: "Public",  district: "Qarshi shahri",     directorName: "Alimova Zarina",      phone: "+998901234567", capacity: 150, currentChildren: 142, username: "mtt_12_qarshi",   status: "Active" },
      { name: "Smart Kids Academy",          type: "Private", district: "Shahrisabz shahri", directorName: "Karimov Sherzod",     phone: "+998912223344", capacity: 80,  currentChildren: 65,  username: "smart_kids_sh",   status: "Active" },
      { name: "Baxtli Bolalik Oilaviy MTT",  type: "Home",   district: "Kitob tumani",      directorName: "Usmonova Gulnoza",    phone: "+998934445566", capacity: 25,  currentChildren: 22,  username: "baxtli_kitob",    status: "Active" },
      { name: "5-sonli 'G'uncha' MTT",       type: "Public",  district: "Koson tumani",      directorName: "Toshpo'latova M.",    phone: "+998947778899", capacity: 200, currentChildren: 195, username: "guncha_koson",    status: "Issue" },
      { name: "Mirishkor Nurli Kelajak",      type: "Private", district: "Mirishkor tumani",  directorName: "Eshonqulov Jamshed",  phone: "+998991112233", capacity: 60,  currentChildren: 40,  username: "mirishkor_nuri",  status: "Active" },
      { name: "9-sonli Davlat MTT",           type: "Public",  district: "Muborak tumani",    directorName: "Sodiqova Nilufar",    phone: "+998905556677", capacity: 120, currentChildren: 110, username: "mtt_9_muborak",   status: "Monitoring" },
      { name: "Kamalak Oilaviy Bog'chasi",    type: "Home",   district: "Nishon tumani",     directorName: "Xoliqova Dilnoza",    phone: "+998918889900", capacity: 30,  currentChildren: 28,  username: "kamalak_nishon",  status: "Issue" },
    ];
    setLoading(true);
    try {
      for (const item of examples) {
        await kindergartenApi.create({
          ...item, address: "Namunaviy manzil, " + item.district,
          email: item.username + "@mail.uz", position: "Direktor",
          groups: Math.floor(Math.random() * 8) + 2, age13: true, age37: true,
          educators: 8, cooks: 2, techStaff: 3, mealType: "3 mahal",
          sanitation: "Yaxshi", water: "Mavjud", kitchenEq: "To'liq",
          financeType: item.type === "Public" ? "Davlat" : "Xususiy",
          lat: 38.86, lng: 65.78, password: "USER1234",
          system_id: `MTT-${Math.floor(1000 + Math.random() * 9000)}`,
          rating: 100, aiMonitoring: true, threshold: 75,
        });
      }
      fetchData();
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const filtered = Array.isArray(data) ? data.filter(i =>
    (i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || i.directorName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!districtFilter || i.district === districtFilter) &&
    (!typeFilter || i.type === typeFilter)
  ) : [];

  const stats = [
    { label: 'Jami muassasalar',  val: Array.isArray(data) ? data.length : 0,                               icon: Building2,  iconBg: 'bg-indigo-600' },
    { label: 'Davlat (Public)',   val: Array.isArray(data) ? data.filter(i => i.type === 'Public').length : 0,  icon: School,     iconBg: 'bg-blue-500' },
    { label: 'Xususiy (Private)', val: Array.isArray(data) ? data.filter(i => i.type === 'Private').length : 0, icon: LayoutGrid, iconBg: 'bg-purple-500' },
    { label: 'Oilaviy (Home)',    val: Array.isArray(data) ? data.filter(i => i.type === 'Home').length : 0,    icon: Home,       iconBg: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] space-y-6 pb-20">

      {credItem && (
        <CredentialsModal
          item={credItem}
          onClose={() => setCredItem(null)}
          onOpen={() => { window.open(BOGCHA_PANEL_URL, '_blank'); setCredItem(null); }}
        />
      )}

      <AnimatePresence>
        {isModalOpen && (
          <YangiBogchaQoshishModal
            initialData={editData}
            onClose={() => { setIsModalOpen(false); setEditData(null); }}
            onSave={() => { setIsModalOpen(false); setEditData(null); fetchData(); }}
          />
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────────── */}
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
            onClick={seedExampleData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <Zap size={14} className="text-amber-500" /> Seed Data
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/25"
          >
            <Plus size={15} strokeWidth={2.5} /> Bog'cha qo'shish
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
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

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
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

      {/* ── Content ────────────────────────────────────────────────────── */}
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
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left">Bog'cha nomi</th>
                    <th className="px-4 py-4 text-left">Tuman</th>
                    <th className="px-4 py-4 text-left">Turi</th>
                    <th className="px-4 py-4 text-center">Bolalar</th>
                    <th className="px-4 py-4 text-center">Guruhlar</th>
                    <th className="px-4 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((item, i) => {
                    const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.Public;
                    return (
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
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {item.system_id || '—'}</p>
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
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-black text-slate-900">{item.currentChildren ?? 0}</span>
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
                              onClick={e => handleDelete(e, item.id)}
                              className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
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
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/kindergartens/${item.id}`)}
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
                        <StatusBadge status={item.status || 'Active'} />
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{item.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-4">
                      <MapPin size={9} /> {item.district} · {tc.label}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Users size={9} /> Bolalar
                        </p>
                        <p className="text-lg font-black text-slate-900">{item.currentChildren ?? 0}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Grid size={9} /> Guruhlar
                        </p>
                        <p className="text-lg font-black text-slate-900">{item.groups ?? 0}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-4 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <User size={11} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Direktor</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight">{item.directorName || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Phone size={11} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Telefon</p>
                          <p className="text-xs font-bold text-slate-700">{item.phone || '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                      Batafsil <ChevronRight size={12} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
