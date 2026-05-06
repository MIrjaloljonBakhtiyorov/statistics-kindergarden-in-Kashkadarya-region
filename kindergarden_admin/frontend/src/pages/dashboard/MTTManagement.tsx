import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Building2, School, LayoutGrid, Home, 
  Settings, Eye, Edit, Trash2, Loader2, MapPin, User, ChevronRight, 
  MoreVertical, ShieldCheck, Key, Users, Zap, Grid, List, Phone,
  Download, FileSpreadsheet, FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { YangiBogchaQoshishModal } from './YangiBogchaQoshishModal';
import { kindergartenApi } from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    'Active': { label: 'Aktiv', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    'Monitoring': { label: 'Monitoring', color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' },
    'Issue': { label: 'Muammo', color: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' },
    'Aktiv': { label: 'Aktiv', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    'Noaktiv': { label: 'Noaktiv', color: 'bg-slate-50 text-slate-400 border-slate-100', dot: 'bg-slate-400' },
    'Critical': { label: 'Kritik', color: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' },
  };
  const config = configs[status as keyof typeof configs] || configs['Active'];

  return (
    <div className={clsx("px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit shadow-sm", config.color)}>
      <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
      {config.label}
    </div>
  );
};

export const MTTManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const DISTRICTS = [
    "Qarshi shahri", "Qarshi tumani", "Shahrisabz shahri", "Shahrisabz tumani",
    "Kitob tumani", "Koson tumani", "Muborak tumani", "G‘uzor tumani",
    "Nishon tumani", "Dehqonobod tumani", "Qamashi tumani", "Chiroqchi tumani", 
    "Kasbi tumani", "Mirishkor tumani", "Yakkabog‘ tumani"
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await kindergartenApi.getAll();
      setData(result);
    } catch (error) {
      console.error("Error fetching kindergartens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Ushbu bog‘chani o‘chirishni tasdiqlaysizmi?")) {
      try {
        await kindergartenApi.delete(id);
        setData(data.filter(item => item.id !== id));
        toast.success("Bog'cha muvaffaqiyatli o'chirildi");
      } catch (error) {
        console.error("Error deleting kindergarten:", error);
        toast.error("O'chirishda xatolik yuz berdi");
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.directorName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (districtFilter === '' || item.district === districtFilter) &&
    (typeFilter === '' || item.type === typeFilter)
  );

  const stats = [
    { label: 'Jami muassasalar', value: data.length, icon: Building2, color: 'bg-indigo-600' },
    { label: 'Davlat (Public)', value: data.filter(i => i.type === 'Public').length, icon: School, color: 'bg-blue-500' },
    { label: 'Xususiy (Private)', value: data.filter(i => i.type === 'Private').length, icon: LayoutGrid, color: 'bg-purple-500' },
    { label: 'Oilaviy (Home)', value: data.filter(i => i.type === 'Home').length, icon: Home, color: 'bg-amber-500' },
  ];

  const seedExampleData = async () => {
    const examples = [
      { name: "12-sonli 'Quyoshcha' MTT", type: "Public", district: "Qarshi shahri", directorName: "Alimova Zarina", phone: "+998901234567", capacity: 150, currentChildren: 142, username: "mtt_12_qarshi", status: "Active", budget: 450000000 },
      { name: "Smart Kids Academy", type: "Private", district: "Shahrisabz shahri", directorName: "Karimov Sherzod", phone: "+998912223344", capacity: 80, currentChildren: 65, username: "smart_kids_sh", status: "Active", budget: 120000000 },
      { name: "Baxtli Bolalik Oilaviy MTT", type: "Home", district: "Kitob tumani", directorName: "Usmonova Gulnoza", phone: "+998934445566", capacity: 25, currentChildren: 22, username: "baxtli_kitob", status: "Active", budget: 15000000 },
      { name: "5-sonli 'G'uncha' MTT", type: "Public", district: "Koson tumani", directorName: "Toshpo'latova Maftuna", phone: "+998947778899", capacity: 200, currentChildren: 195, username: "guncha_koson", status: "Issue", budget: 520000000 },
      { name: "Mirishkor Nurli Kelajak", type: "Private", district: "Mirishkor tumani", directorName: "Eshonqulov Jamshed", phone: "+998991112233", capacity: 60, currentChildren: 40, username: "mirishkor_nuri", status: "Active", budget: 85000000 },
      { name: "9-sonli Davlat MTT", type: "Public", district: "Muborak tumani", directorName: "Sodiqova Nilufar", phone: "+998905556677", capacity: 120, currentChildren: 110, username: "mtt_9_muborak", status: "Monitoring", budget: 380000000 },
      { name: "Kamalak Oilaviy Bog'chasi", type: "Home", district: "Nishon tumani", directorName: "Xoliqova Dilnoza", phone: "+998918889900", capacity: 30, currentChildren: 28, username: "kamalak_nishon", status: "Issue", budget: 18000000 },
    ];

    setLoading(true);
    try {
      for (const item of examples) {
        await kindergartenApi.create({
          ...item,
          address: "Namunaviy manzil, " + item.district,
          email: item.username + "@mail.uz",
          position: "Direktor",
          groups: Math.floor(Math.random() * 8) + 2,
          age13: true,
          age37: true,
          educators: 8,
          cooks: 2,
          techStaff: 3,
          mealType: "3 mahal",
          sanitation: "Yaxshi",
          water: "Mavjud",
          kitchenEq: "To‘liq",
          financeType: item.type === "Public" ? "Davlat" : "Xususiy",
          lat: 38.86,
          lng: 65.78,
          password: "USER1234",
          system_id: `MTT-${Math.floor(1000 + Math.random() * 9000)}`,
          rating: 100,
          aiMonitoring: true,
          threshold: 75
        });
      }
      fetchData();
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (id: string) => {
    navigate(`/kindergartens/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 sm:p-8 space-y-6 sm:space-y-8">
      <AnimatePresence>
        {isModalOpen && (
          <YangiBogchaQoshishModal
            initialData={editData}
            onClose={() => {
              setIsModalOpen(false);
              setEditData(null);
            }}
            onSave={() => {
              setIsModalOpen(false);
              setEditData(null);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
      {/* 1. HEADER DESIGN */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Bog‘chalar ro‘yxati</h1>
            <div className="hidden xs:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Real-time</span>
            </div>
          </div>
          <p className="text-xs sm:text-base text-slate-500 font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
            Tizimdagi barcha bog‘chalar va ularning ma’lumotlari
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button 
            onClick={seedExampleData}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-xl sm:rounded-[20px] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <Zap size={16} className="text-amber-500" />
            Seed Data
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[20px] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3"
          >
            <Plus size={16} sm:size={18} strokeWidth={3} />
            Bog‘cha qo‘shish
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex flex-col xs:flex-row justify-between items-start gap-3">
              <div className={clsx("p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-lg", stat.color)}>
                <stat.icon size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="text-left xs:text-right">
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. FILTER & CONTROL BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} className="sm:w-4.5 sm:h-4.5" />
            <input 
              type="text" placeholder="Qidirish..." 
              className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-[22px] text-xs sm:text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select 
                className="flex-1 lg:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-[22px] text-[9px] sm:text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-500 cursor-pointer transition-all"
                value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
            >
                <option value="">Tumanlar</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
                className="flex-1 lg:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-[22px] text-[9px] sm:text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-500 cursor-pointer transition-all"
                value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            >
                <option value="">Turlari</option>
                <option value="Public">Davlat</option>
                <option value="Private">Xususiy</option>
                <option value="Home">Oilaviy</option>
            </select>
            
            <div className="flex bg-slate-100 p-1 sm:p-1.5 rounded-lg sm:rounded-[20px] border border-slate-200 shadow-inner shrink-0">
              <button 
                onClick={() => setViewMode('table')}
                className={clsx(
                  "p-2 sm:p-2.5 rounded-md sm:rounded-xl transition-all",
                  viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <List size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "p-2 sm:p-2.5 rounded-md sm:rounded-xl transition-all",
                  viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Grid size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>

            <div className="flex gap-2 shrink-0">
              <button className="p-3 sm:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-[20px] text-slate-500 hover:bg-slate-50 transition-all" title="Excelga eksport">
                <FileSpreadsheet size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button className="p-3 sm:p-4 bg-white border border-slate-200 rounded-lg sm:rounded-[20px] text-slate-500 hover:bg-slate-50 transition-all" title="PDFga eksport">
                <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT — DISPLAY MODES */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 sm:py-24 text-center">
              <Loader2 className="animate-spin mx-auto text-indigo-500" size={40} className="sm:w-12 sm:h-12" />
              <p className="mt-4 text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Ma'lumotlar yuklanmoqda...</p>
            </motion.div>
          ) : filteredData.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 sm:py-24 text-center bg-white rounded-2xl sm:rounded-[40px] border border-dashed border-slate-200">
               <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Building2 className="text-slate-200" size={28} className="sm:w-8 sm:h-8" />
               </div>
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs sm:text-sm">Bog‘chalar topilmadi</h3>
               <p className="text-[10px] sm:text-xs text-slate-400 mt-2 font-bold">Qidiruv yoki filtrni o‘zgartirib ko‘ring</p>
            </motion.div>
          ) : viewMode === 'table' ? (
            /* OPTION 1: TABLE VIEW (DEFAULT) */
            <motion.div key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-2xl sm:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-left">Bog‘cha nomi</th>
                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left">Tuman</th>
                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left">Turi</th>
                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-center">Bolalar</th>
                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-center">Guruhlar</th>
                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left">Status</th>
                        <th className="px-6 sm:px-10 py-4 sm:py-6 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.map((item, i) => (
                        <motion.tr 
                          key={item.id} 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          transition={{ delay: i * 0.03 }}
                          onClick={() => handleNavigate(item.id)}
                          className="hover:bg-indigo-50/20 transition-all group cursor-pointer"
                        >
                          <td className="px-6 sm:px-10 py-4 sm:py-6">
                            <div className="flex items-center gap-3 sm:gap-5">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm group-hover:scale-110 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                                <School size={20} className="sm:w-5.5 sm:h-5.5" />
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-black text-slate-900 uppercase tracking-tight text-xs sm:text-sm mb-0.5 truncate">{item.name}</div>
                                <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.system_id || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-6">
                            <span className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-tighter">{item.district}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-6">
                             <div className={clsx("text-[8px] sm:text-[9px] font-black px-2 py-0.5 sm:py-1 rounded-lg uppercase border w-fit whitespace-nowrap", 
                                item.type === 'Public' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                item.type === 'Private' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>{item.type === 'Public' ? 'Davlat' : item.type === 'Private' ? 'Xususiy' : 'Oilaviy'}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-6 text-center">
                            <span className="text-xs sm:text-sm font-black text-slate-900">{item.currentChildren || 0}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-6 text-center">
                            <span className="text-xs sm:text-sm font-black text-slate-900">{item.groups || 0}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-6">
                            <StatusBadge status={item.status || 'Active'} />
                          </td>
                          <td className="px-6 sm:px-10 py-4 sm:py-6 text-right">
                            <div className="flex justify-end gap-1.5 sm:gap-2">
                                <button onClick={(e) => handleEdit(e, item)} className="p-2 sm:p-3 bg-white border border-slate-100 rounded-lg sm:rounded-xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all"><Edit size={16} className="sm:w-4.5 sm:h-4.5"/></button>
                                <button onClick={(e) => handleDelete(e, item.id)} className="p-2 sm:p-3 bg-white border border-slate-100 rounded-lg sm:rounded-xl text-slate-400 hover:text-rose-600 hover:shadow-lg transition-all"><Trash2 size={16} className="sm:w-4.5 sm:h-4.5"/></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            /* OPTION 2: CARD GRID (PREMIUM UI) */
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredData.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleNavigate(item.id)}
                  className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                     <Building2 size={100} className="sm:w-30 sm:h-30" />
                  </div>

                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                     <div className={clsx("p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg", 
                        item.type === 'Public' ? "bg-blue-500" :
                        item.type === 'Private' ? "bg-purple-500" : "bg-amber-500"
                     )}>
                        <School className="text-white" size={20} className="sm:w-6 sm:h-6" />
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleEdit(e, item)}
                          className="p-2 bg-white/10 hover:bg-white/20 text-slate-400 hover:text-indigo-600 rounded-lg transition-all backdrop-blur-md border border-white/20"
                        >
                          <Edit size={14} />
                        </button>
                        <StatusBadge status={item.status || 'Active'} />
                     </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                     <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors truncate">{item.name}</h3>
                     <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                        <MapPin size={10} className="sm:w-3 sm:h-3" />
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest truncate">{item.district} • {item.type === 'Public' ? 'Davlat' : item.type === 'Private' ? 'Xususiy' : 'Oilaviy'}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                     <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                           <Users size={10} className="text-indigo-500" />
                           <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase">Bolalar</span>
                        </div>
                        <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">{item.currentChildren || 0}</p>
                     </div>
                     <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                           <Grid size={10} className="text-emerald-500" />
                           <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase">Guruhlar</span>
                        </div>
                        <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">{item.groups || 0}</p>
                     </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t border-slate-50">
                     <div className="flex items-center gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                           <User size={12} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase leading-none">Direktor</p>
                           <p className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">{item.directorName}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                           <Phone size={12} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase leading-none">Telefon</p>
                           <p className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">{item.phone}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 flex justify-end">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                       Batafsil <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
