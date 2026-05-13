import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Plus, 
  Calendar, 
  History, 
  Database, 
  ShieldCheck, 
  Droplets,
  Apple,
  Clock,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Baby,
  Users,
  Stethoscope,
  ChevronDown,
  LayoutGrid,
  Sparkles,
  Zap,
  X,
  Sun
} from 'lucide-react';
import { clsx } from 'clsx';
import { MealCreationModal } from '../../components/MealCreationModal';
import { DailyMenuCreationModal } from '../../components/DailyMenuCreationModal';

const TABS = [
  { id: 'active', label: 'Kalendar reja', icon: Calendar },
  { id: 'today', label: 'Bugungi menyu', icon: Clock },
  { id: 'archive', label: 'Arxiv', icon: History },
  { id: 'database', label: 'Taomlar bazasi', icon: Database },
  { id: 'ai-analysis', label: 'AI Menu Tahlil', icon: Sparkles },
];

const AIMealAnalysisModal = ({ isOpen, onClose, meal }: { isOpen: boolean, onClose: () => void, meal: any }) => {
  if (!meal) return null;

  // Fallback data if not provided in the meal object
  const vitamins = meal.vitaminsData || [
    { name: 'Vitamin A', val: 85, color: 'bg-amber-500', desc: 'Ko\'rish qobiliyati' },
    { name: 'Vitamin C', val: 70, color: 'bg-emerald-500', desc: 'Immunitet' },
    { name: 'Vitamin D', val: 92, color: 'bg-blue-500', desc: 'Suyaklar rivoji' },
    { name: 'Vitamin B6', val: 65, color: 'bg-indigo-500', desc: 'Asab tizimi' },
  ];

  const ingredients = meal.ingredients || ['Tovuq go\'shti', "Yashil no'xat", 'Sabzi', 'Guruch', 'Zaytun moyi', 'Ozroq tuz'];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="h-48 relative">
              <img src={meal.img} className="w-full h-full object-cover" alt={meal.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 -mt-12 relative bg-white rounded-t-[40px] space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{meal.name}</h3>
                  <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mt-1">AI Nutritiology Analysis</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
                    Tavsiya etiladi
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    <ShieldCheck size={12} /> 100% Xavfsiz
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Energiya', value: meal.kkal + ' kkal', icon: Zap, color: 'text-amber-500 bg-amber-50', desc: 'Kunlik quvvat' },
                  { label: 'Oqsillar', value: meal.protein || '24 gr', icon: Baby, color: 'text-indigo-500 bg-indigo-50', desc: 'Mushaklar uchun' },
                  { label: 'Moslik', value: '98%', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50', desc: 'Yosh me\'yori' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-[32px] border border-slate-50 bg-slate-50/50 space-y-3 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group">
                    <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-lg font-black text-slate-900">{item.value}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* VITAMINS SECTION */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <Apple size={14} className="text-emerald-500" /> Vitaminlar va Minerallar:
                </h4>
                <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-8 bg-slate-50/50 rounded-[40px] border border-slate-100">
                   {vitamins.map((vit: any) => (
                     <div key={vit.name} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-slate-700 uppercase">{vit.name}</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase italic">{vit.desc}</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${vit.val}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={clsx("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", vit.color)}
                           />
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* COMPOSITION / INGREDIENTS */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <Database size={14} className="text-indigo-600" /> Mahsulotlar (Tarkibi):
                </h4>
                <div className="flex flex-wrap gap-2.5">
                   {ingredients.map((ing: string) => (
                     <span key={ing} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-default">
                        {ing}
                     </span>
                   ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                  <Sparkles className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-150 transition-transform duration-1000" size={150} />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                        <Sparkles size={18} />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-[0.2em]">AI Ekspert Xulosasi</h4>
                    </div>
                    <p className="text-sm leading-relaxed font-medium opacity-90">
                      {meal.analysis || "Ushbu taom bolalar organizmi uchun zarur bo'lgan barcha aminokislotalarga boy. Vitaminlar miqdori yuqoriligi sababli bolaning sog'lom rivojlanishini ta'minlaydi."}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={onClose} className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all">
                Tushunarli va Tasdiqlash
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const SUB_TABS = [
  { id: 'all', label: 'Barchasi', icon: LayoutGrid },
  { id: '1-3', label: '1–3 yosh', icon: Baby },
  { id: '3-7', label: '3–7 yosh', icon: Users },
  { id: 'diet', label: 'Parhez', icon: Stethoscope },
  { id: 'drinks', label: 'Ichimliklar', icon: Droplets },
];

const AGE_GROUPS = [
  { id: '1-3', label: '1–3 yosh', icon: Baby, color: 'text-emerald-600 bg-emerald-50' },
  { id: '3-7', label: '3–7 yosh', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
];

const TODAY_ISO = "2026-04-27"; // Prototip uchun bugungi sana

// Kalendar sanalarini yaratish (Bugundan boshlab)
const DATES = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date(2026, 3, 27 + i); // 27-apreldan (bugundan) boshlab
  return {
    day: date.getDate(),
    month: date.toLocaleString('uz-UZ', { month: 'long' }),
    year: date.getFullYear(),
    weekday: date.toLocaleString('uz-UZ', { weekday: 'short' }),
    full: `${date.getDate()} - ${date.toLocaleString('uz-UZ', { month: 'long' })} ${date.getFullYear()} - yil`,
    iso: date.toISOString().split('T')[0]
  };
});

export const NutritionMenu = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [subTab, setSubTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(DATES[0]); // Bugungi kun default
  const [archiveDate, setArchiveDate] = useState({ day: 27, weekday: 'Dush', iso: '2026-04-27', full: '27-aprel, 2026' });
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isDailyMenuModalOpen, setIsDailyMenuModalOpen] = useState(false);
  const [selectedAIMeal, setSelectedAIMeal] = useState<any>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // Database states
  const [dbSearch, setDbSearch] = useState('');
  const [dbCategory, setDbCategory] = useState('Barchasi');

  const ARCHIVE_DATES = useMemo(() => {
    return Array.from({ length: 11 }).map((_, i) => {
      const d = new Date(2026, 3, 17 + i); // 17-apreldan boshlab, 27-aprelda (bugun) tugaydi
      return {
        day: d.getDate(),
        weekday: d.toLocaleString('uz-UZ', { weekday: 'short' }),
        iso: d.toISOString().split('T')[0],
        full: `${d.getDate()}-aprel, 2026`
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <main className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10">
        {/* TABS NAVIGATION */}
        <div className="flex gap-2 p-1 bg-slate-200/40 w-full sm:w-fit rounded-[20px] sm:rounded-[24px] border border-slate-200/50 shadow-inner overflow-x-auto no-scrollbar sticky top-0 z-30 backdrop-blur-md">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-[16px] sm:rounded-[20px] font-black text-[9px] sm:text-[11px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                activeTab === tab.id ? "bg-white text-indigo-600 shadow-xl shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={14} className="sm:w-4 sm:h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: KALENDAR REJA */}
        <AnimatePresence mode="wait">
          {activeTab === 'active' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 sm:space-y-10"
            >
              {/* DATE SCROLLER */}
              <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                   <div className="space-y-1">
                      <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[9px] sm:text-[10px] ml-1 sm:ml-2">Sana tanlang (Aprel - May 2026)</h3>
                      <div className="flex items-center gap-2 ml-1 sm:ml-2">
                         <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">10 kunlik sikl: Aktiv</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => setIsDailyMenuModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                         <Plus size={14} className="inline mr-1 sm:mr-2" /> Yangi yaratish
                      </button>
                      <div className="hidden xs:flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-indigo-100 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
                         <ShieldCheck size={14} /> AI Optimizatsiya
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 custom-scrollbar px-1 group cursor-grab active:cursor-grabbing">
                  {DATES.map((d, i) => {
                    const isToday = d.iso === TODAY_ISO;
                    const isSelected = selectedDate.iso === d.iso;

                    return (
                      <motion.button
                        whileHover={{ y: -4 }}
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={clsx(
                          "min-w-[80px] sm:min-w-[110px] py-4 sm:py-6 rounded-[20px] sm:rounded-[32px] flex flex-col items-center gap-1 sm:gap-2 transition-all duration-500 border-2 relative",
                          isSelected 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105 sm:scale-110" 
                            : isToday
                              ? "bg-blue-50 border-blue-400 text-blue-600"
                              : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-slate-50/50"
                        )}
                      >
                        {isToday && (
                          <span className={clsx(
                            "absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-tighter shadow-sm whitespace-nowrap",
                            isSelected ? "bg-white text-indigo-600" : "bg-blue-600 text-white"
                          )}>
                            Bugun
                          </span>
                        )}
                        <span className="text-[8px] sm:text-[10px] font-black uppercase opacity-60 tracking-widest">{d.weekday}</span>
                        <span className="text-xl sm:text-2xl font-black">{d.day}</span>
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter opacity-50">{d.month}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION TITLE FOR SELECTED DATE */}
              <div className="flex items-center gap-3 sm:gap-6 px-2">
                 <div className="w-1 sm:w-1.5 h-8 sm:h-12 bg-indigo-600 rounded-full" />
                 <div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                       {selectedDate.full}
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">
                       Tanlangan kun uchun taomnoma
                    </p>
                 </div>
              </div>

              {/* SUB-NAVBAR: FILTERS */}
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                <div className="flex gap-1.5 sm:gap-3 p-1 sm:p-2 bg-white rounded-[20px] sm:rounded-[28px] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSubTab(tab.id)}
                      className={clsx(
                        "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-[16px] sm:rounded-[20px] font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        subTab === tab.id 
                          ? "bg-slate-900 text-white shadow-lg scale-[1.05]" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <tab.icon size={12} className="sm:w-3.5 sm:h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MEAL MATRIX (AGE GROUPS & DIETS) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-10 lg:gap-y-16">
                {['Nonushta (08:30)', 'Tushlik (12:30)', 'Poldnik (16:00)', 'Kechki ovqat (18:30)'].map((mealTime, mIdx) => (
                  <div key={mIdx} className="space-y-6 sm:space-y-8 bg-slate-50/50 p-4 sm:p-6 rounded-[32px] sm:rounded-[50px] border border-slate-100/50">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="px-4 sm:px-8 py-2 sm:py-2.5 bg-slate-900 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] rounded-full shadow-xl whitespace-nowrap">
                           {mealTime}
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:gap-8">
                       {(subTab === 'all' ? [...AGE_GROUPS, { id: 'diet', label: 'Parhez', icon: Stethoscope, color: 'text-rose-600 bg-rose-50' }, { id: 'drinks', label: 'Ichimliklar', icon: Droplets, color: 'text-blue-600 bg-blue-50' }] : 
                         subTab === 'diet' ? [{ id: 'diet', label: 'Parhez', icon: Stethoscope, color: 'text-rose-600 bg-rose-50' }] :
                         subTab === 'drinks' ? [{ id: 'drinks', label: 'Ichimliklar', icon: Droplets, color: 'text-blue-600 bg-blue-50' }] :
                         AGE_GROUPS.filter(g => g.id === subTab)).map((group) => {
                          
                          const isDrink = group.id === 'drinks';
                          const isDiet = group.id === 'diet';
                          
                          const getMealData = (): { name: string; ing: string[]; img: string; method?: string } => {
                            const daySeed = (selectedDate.day + mIdx) % 10;
                            
                            if (isDrink) {
                              const drinks = [
                                { name: "Ko'k choy (Limonli)", ing: ["Suv", "Ko'k choy", "Limon", "Asal"], img: "https://images.unsplash.com/photo-1594631252845-29fc458695d7?q=80&w=1974&auto=format&fit=crop" },
                                { name: "Mevali Kompot", ing: ["Olma", "O'rik", "Suv", "Ozroq shakar"], img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2125&auto=format&fit=crop" },
                                { name: "Yangi siqilgan Olma sharbati", ing: ["Yashil olma"], img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=2048&auto=format&fit=crop" },
                                { name: "Kefir (2.5%)", ing: ["Sut", "Zakvaska"], img: "https://images.unsplash.com/photo-1621264421884-3f8205465538?q=80&w=2071&auto=format&fit=crop" },
                                { name: "Qora choy (Sutli)", ing: ["Suv", "Qora choy", "Sut", "Qand"], img: "https://images.unsplash.com/photo-1544787210-22bb1e07900e?q=80&w=2022&auto=format&fit=crop" }
                              ];
                              return drinks[daySeed % drinks.length];
                            }
                            
                            if (isDiet) {
                              return { 
                                name: daySeed % 2 === 0 ? "Parhezli Guruchli bo'tqa" : "Bug'da pishgan sabzavotlar", 
                                ing: daySeed % 2 === 0 ? ["Guruch", "Suv", "Ozroq tuz"] : ["Brokkoli", "Sabzi", "Gulkaram"], 
                                method: "Mahsulotlar barcha vitaminlarini saqlab qolgan holda bug'da yoki suvda pishiriladi.", 
                                img: daySeed % 2 === 0 ? "https://images.unsplash.com/photo-1594910411241-11910a76a88b?q=80&w=2070&auto=format&fit=crop" : "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=2070&auto=format&fit=crop" 
                              };
                            }

                            if (group.id === '3-7') {
                              const meals = [
                                { name: "Mol go'shtidan Kotlet va Grechka", ing: ["Go'sht", "Grechka", "Piyoz"], img: "https://images.unsplash.com/photo-1603333388196-83fa4c577adc?q=80&w=2072&auto=format&fit=crop" },
                                { name: "Sabzavotli Dimlama", ing: ["Go'sht", "Kartoshka", "Sabzi"], img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop" },
                                { name: "Mastava (Go'shtli)", ing: ["Go'sht", "Guruch", "Sabzavotlar"], img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop" }
                              ];
                              return meals[daySeed % meals.length];
                            }

                            return { 
                              name: mIdx === 0 ? "Sutli 'Gerkules' bo'tqasi" : "Moshxo'rda (Yumshoq)", 
                              ing: ["Sut", "Gerkules", "Mosh", "Guruch"], 
                              method: "Bolalar uchun barcha mahsulotlar yaxshilab yumshatib pishiriladi.", 
                              img: mIdx === 0 ? "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076&auto=format&fit=crop" : "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop"
                            };
                          };

                          const data = getMealData();

                          return (
                            <div key={group.id} className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[44px] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 space-y-6 sm:space-y-8">
                               <div className="flex items-center justify-between border-b border-slate-50 pb-4 sm:pb-6">
                                  <div className="flex items-center gap-3 sm:gap-4">
                                     <div className={clsx("p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-inner", group.color)}>
                                        <group.icon size={20} className="sm:w-5.5 sm:h-5.5" />
                                     </div>
                                     <div>
                                        <h4 className="font-black text-slate-900 uppercase text-[10px] sm:text-xs tracking-widest">{group.label} {isDrink ? "" : "uchun"}</h4>
                                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">{isDrink ? "Vitaminli ichimliklar" : isDiet ? "Oshqozon-ichak yo'li uchun" : "Sutli va Vitaminli ratsion"}</p>
                                     </div>
                                  </div>
                                  <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronDown size={18} /></button>
                               </div>

                               <div className="grid grid-cols-1 gap-6 sm:gap-8">
                                  <div className="group/meal relative bg-slate-100 rounded-[28px] sm:rounded-[44px] overflow-hidden border border-white shadow-md hover:shadow-2xl transition-all duration-700">
                                     <div className="flex flex-col lg:flex-row min-h-[auto] lg:min-h-[300px]">
                                        {/* Image Section */}
                                        <div className="lg:w-5/12 h-48 lg:h-auto relative overflow-hidden shrink-0">
                                           <div className="absolute inset-0 z-10 bg-gradient-to-tr from-black/40 via-transparent to-white/10" />
                                           <img 
                                              src={data.img} 
                                              alt={data.name} 
                                              className="w-full h-full object-cover transition-transform duration-1000 scale-105 group-hover/meal:scale-110" 
                                           />
                                           <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
                                              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-1.5 sm:gap-2">
                                                 <div className={clsx("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", isDrink ? "bg-blue-500" : isDiet ? "bg-rose-500" : "bg-emerald-500")} />
                                                 <span className="text-[8px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                                    {isDrink ? "Ichimlik" : "Asosiy Taom"}
                                                 </span>
                                              </div>
                                           </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="lg:w-7/12 p-6 sm:p-10 space-y-6 sm:space-y-8 flex flex-col justify-center bg-white">
                                           <div>
                                              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                                                 <span className="px-2.5 sm:px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                                                    Premium sifat
                                                 </span>
                                              </div>
                                              <h5 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight mb-2 sm:mb-3">
                                                 {data.name}
                                              </h5>
                                              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                 <span className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-100">
                                                    <Clock size={12} className="text-indigo-500 sm:w-3.5 sm:h-3.5" /> {isDrink ? "200 ml" : "250 gr"}
                                                 </span>
                                                 {!isDrink && (
                                                   <span className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-100">
                                                      <Apple size={12} className="text-emerald-500 sm:w-3.5 sm:h-3.5" /> 340 kkal
                                                   </span>
                                                 )}
                                              </div>
                                           </div>

                                           <div className="space-y-3 sm:space-y-4">
                                              <p className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 opacity-70">
                                                 <Database size={12} className="text-indigo-600 sm:w-3.5 sm:h-3.5" /> Tarkibi:
                                              </p>
                                              <div className="flex flex-wrap gap-2">
                                                 {data.ing.map(ing => (
                                                    <span key={ing} className="px-3 py-1.5 bg-indigo-50/30 border border-indigo-100 text-indigo-700 rounded-xl text-[9px] sm:text-[10px] font-bold transition-colors hover:bg-indigo-100">
                                                       {ing}
                                                    </span>
                                                 ))}
                                              </div>
                                           </div>

                                           {!isDrink && data.method && (
                                              <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-[32px] border border-slate-100 relative group/method">
                                                 <div className="absolute -top-2.5 sm:-top-3 left-4 sm:left-6 px-3 sm:px-4 py-0.5 sm:py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                                                    <span className="text-[8px] sm:text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tayyorlanishi</span>
                                                 </div>
                                                 <p className="text-[10px] sm:text-[12px] leading-relaxed text-slate-600 font-medium italic">
                                                    "{data.method}"
                                                 </p>
                                              </div>
                                           )}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-10 bg-white rounded-[32px] sm:rounded-[50px] border border-indigo-100 shadow-2xl shadow-indigo-100/50 mt-10 sm:mt-16">
                 <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-2xl sm:rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
                       <ShieldCheck size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                       <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Taomnoma tayyor!</h3>
                       <p className="text-slate-500 text-xs sm:text-sm font-medium">AI nazoratidan muvaffaqiyatli o'tdi.</p>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <button className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-slate-100 text-slate-700 rounded-xl sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                       Tasdiqlash
                    </button>
                    <button 
                       onClick={() => {
                          toast.success("Taomnoma muvaffaqiyatli tasdiqlandi va barcha bog'cha oshpazlariga yuborildi! ✅");
                       }}
                       className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                       <ArrowRight size={16} strokeWidth={3} className="sm:w-4.5 sm:h-4.5" />
                       Bog'chalarga yuborish
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BUGUNGI MENYU */}
          {activeTab === 'today' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 sm:space-y-12"
            >
              {/* SUB-NAVBAR FOR TODAY */}
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                <div className="flex gap-1.5 sm:gap-3 p-1.5 sm:p-2 bg-white rounded-[20px] sm:rounded-[28px] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSubTab(tab.id)}
                      className={clsx(
                        "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-[16px] sm:rounded-[20px] font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        subTab === tab.id 
                          ? "bg-slate-900 text-white shadow-lg scale-[1.05]" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <tab.icon size={12} className="sm:w-3.5 sm:h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MEAL TIMES SECTIONS */}
              {[
                 { time: '08:30', type: 'Nonushta', color: 'bg-amber-500' },
                 { time: '12:30', type: 'Tushlik', color: 'bg-indigo-600' },
                 { time: '16:00', type: 'Poldnik', color: 'bg-rose-500' },
                 { time: '18:30', type: 'Kechki ovqat', color: 'bg-slate-800' }
              ].map((section) => (
                <div key={section.type} className="space-y-6 sm:space-y-8">
                   <div className="flex items-center gap-4 sm:gap-6">
                      <div className={clsx("w-1.5 sm:w-2 h-8 sm:h-10 rounded-full", section.color)} />
                      <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{section.type} <span className="text-slate-400 text-lg sm:text-xl ml-1 sm:ml-2">{section.time}</span></h3>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {SUB_TABS.filter(t => t.id !== 'all').filter(t => subTab === 'all' || t.id === subTab).map((group) => {
                         const getMealInfo = () => {
                            if (group.id === '1-3') return { name: "Sutli bo'tqa", img: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076", desc: "Yumshoq ratsion" };
                            if (group.id === '3-7') return { name: "Kotlet va Grechka", img: "https://images.unsplash.com/photo-1603333388196-83fa4c577adc?q=80&w=2072", desc: "To'yimli tushlik" };
                            if (group.id === 'diet') return { name: "Parhez pyure", img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=2070", desc: "Yengil hazm" };
                            return { name: "Mevali sharbat", img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=2048", desc: "Vitaminkurs" };
                         };
                         const data = getMealInfo();

                         return (
                            <motion.div 
                               layout
                               key={group.id} 
                               className="bg-white rounded-2xl sm:rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                            >
                               <div className="h-32 sm:h-40 relative overflow-hidden">
                                  <img src={data.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={data.name} />
                                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[7px] sm:text-[8px] font-black uppercase text-indigo-600">
                                     {group.label}
                                  </div>
                               </div>
                               <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">{data.name}</h4>
                                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.desc}</p>
                                  <div className="flex items-center justify-between pt-1 sm:pt-2">
                                     <span className="text-[8px] sm:text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 sm:py-1 rounded-md uppercase">Tayyor</span>
                                     <button className="text-slate-300 hover:text-indigo-600 transition-colors"><ArrowRight size={14} className="sm:w-4 sm:h-4" /></button>
                                  </div>
                               </div>
                            </motion.div>
                         );
                      })}
                   </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: ARXIV */}
          {activeTab === 'archive' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* ARCHIVE QUICK CALENDAR */}
              <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-1 sm:px-2 gap-3">
                   <h3 className="font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px]">Oxirgi 10 kunlik tarix</h3>
                   <div className="flex items-center gap-2 text-indigo-600 font-black text-[9px] sm:text-[10px] uppercase tracking-widest bg-indigo-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-indigo-100">
                      <History size={14} /> {archiveDate.full}
                   </div>
                </div>
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 custom-scrollbar px-1 group cursor-grab active:cursor-grabbing">
                   {ARCHIVE_DATES.map((d, i) => {
                      const isToday = d.iso === TODAY_ISO;
                      const isSelected = archiveDate.iso === d.iso;
                      return (
                         <button 
                            key={i} 
                            onClick={() => setArchiveDate(d)}
                            className={clsx(
                               "min-w-[80px] sm:min-w-[100px] py-4 sm:py-5 rounded-[20px] sm:rounded-[28px] flex flex-col items-center border transition-all duration-300",
                               isSelected 
                                 ? "bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105" 
                                 : isToday 
                                   ? "bg-blue-50 border-blue-200 text-blue-600" 
                                   : "bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200"
                            )}
                         >
                            <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-60 tracking-widest">{d.weekday}</span>
                            <span className="text-xl sm:text-2xl font-black">{d.day}</span>
                            {isToday && <span className="text-[7px] sm:text-[8px] font-black uppercase mt-0.5">Bugun</span>}
                         </button>
                      );
                   })}
                </div>
              </div>

              {/* DETAILED ARCHIVE INFO */}
              <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[50px] border border-slate-100 shadow-sm space-y-8 sm:space-y-10">
                 <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 border-b border-slate-50 pb-6 sm:pb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                       <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-indigo-600 shrink-0">
                          <Calendar size={24} className="sm:w-8 sm:h-8" />
                       </div>
                       <div>
                          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{archiveDate.full} Hisoboti</h2>
                          <p className="text-slate-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">Yakuniy taomnoma va statistikalar</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => toast.info("Hisobot PDF formatida yuklanmoqda... 📄")}
                       className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-100 text-slate-700 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                       Hisobotni yuklash
                    </button>
                 </div>

                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10">
                    {/* MEAL LIST */}
                    <div className="space-y-4 sm:space-y-6">
                       <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 sm:ml-2">Kunlik Taomnoma</h4>
                       {[
                          { time: '08:30', name: 'Nonushta', meal: "Sutli guruch bo'tqasi, Choy, Non" },
                          { time: '12:30', name: 'Tushlik', meal: "Tovuqli sho'rva, Teftel, Grechka" },
                          { time: '16:00', name: 'Poldnik', meal: "Meva sharbati, Shirinlik" },
                          { time: '18:30', name: 'Kechki ovqat', meal: "Qaynatilgan go'sht va sabzavotlar" }
                       ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                             <span className="text-xs sm:text-sm font-black text-indigo-600 bg-white px-2.5 sm:px-3 py-1 rounded-lg border border-slate-100">{item.time}</span>
                             <div className="flex-1">
                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900">{item.meal}</p>
                             </div>
                             <CheckCircle2 size={18} className="text-emerald-500 sm:w-5 sm:h-5" />
                          </div>
                       ))}
                    </div>

                    {/* STATS & SUMMARY */}
                    <div className="space-y-6 sm:space-y-8">
                       <div className="p-6 sm:p-8 bg-slate-900 rounded-[32px] sm:rounded-[40px] text-white shadow-2xl">
                          <h4 className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60 mb-4 sm:mb-6">Kun yakuniy statistikasi</h4>
                          <div className="grid grid-cols-2 gap-4 sm:gap-8">
                             <div>
                                <p className="text-xl sm:text-2xl font-black">124 nafar</p>
                                <p className="text-[8px] sm:text-[9px] font-bold uppercase opacity-50 tracking-widest">Jami bolalar</p>
                             </div>
                             <div>
                                <p className="text-xl sm:text-2xl font-black">100%</p>
                                <p className="text-[8px] sm:text-[9px] font-bold uppercase opacity-50 tracking-widest">Sifat nazorati</p>
                             </div>
                             <div>
                                <p className="text-xl sm:text-2xl font-black">1.4 mln</p>
                                <p className="text-[8px] sm:text-[9px] font-bold uppercase opacity-50 tracking-widest">Sarf-xarajat</p>
                             </div>
                             <div>
                                <p className="text-xl sm:text-2xl font-black">2 ta</p>
                                <p className="text-[8px] sm:text-[9px] font-bold uppercase opacity-50 tracking-widest">Maxsus parhez</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-6 sm:p-8 border-2 border-dashed border-slate-200 rounded-[32px] sm:rounded-[40px] space-y-3 sm:space-y-4">
                          <h4 className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest">Oshpaz izohi:</h4>
                          <p className="text-xs text-slate-500 leading-relaxed italic">
                             "Barcha mahsulotlar yangi holatda qabul qilindi. Taomlar texnologik xarita asosida tayyorlandi. Bolalar taomlarni ishtaha bilan tanovul qilishdi."
                          </p>
                          <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                             <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200 rounded-full shrink-0" />
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">N. Olimova (Bosh oshpaz)</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: TAOMLAR BAZASI */}
          {activeTab === 'database' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="bg-white p-4 sm:p-10 rounded-[28px] sm:rounded-[50px] border border-slate-100 shadow-sm space-y-6 sm:space-y-10">
                 {/* HEADER & SEARCH */}
                 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
                    <div>
                       <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Taomlar bazasi</h2>
                       <p className="text-slate-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[8px] sm:text-[10px] mt-1.5 sm:mt-2">500 dan ortiq tasdiqlangan retseptlar</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                       <div className="relative group w-full xl:w-[400px]">
                          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors sm:w-5 sm:h-5" size={18} />                          <input 
                             type="text" 
                             value={dbSearch}
                             onChange={(e) => setDbSearch(e.target.value)}
                             placeholder="Taom qidirish..." 
                             className="w-full pl-11 sm:pl-14 pr-6 sm:pr-8 py-3.5 sm:py-4.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-[24px] text-[12px] sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
                          />
                       </div>
                       <button 
                         onClick={() => setIsMealModalOpen(true)}
                         className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4.5 bg-indigo-600 text-white rounded-xl sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-[1.02] transition-all"
                       >
                          <Plus size={16} strokeWidth={3} className="sm:w-4.5 sm:h-4.5" /> Yangi qo'shish
                       </button>
                    </div>
                 </div>

                 {/* CATEGORIES */}
                 <div className="flex flex-wrap gap-2 sm:gap-3 pb-4 border-b border-slate-50 overflow-x-auto no-scrollbar">
                    {['Barchasi', 'Sho\'rvalar', 'Quyuq taomlar', 'Parhez taomlar', 'Salatlar', 'Ichimliklar', 'Desertlar', 'Non mahsulotlari'].map((cat) => (
                       <button 
                          key={cat} 
                          onClick={() => setDbCategory(cat)}
                          className={clsx(
                             "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                             dbCategory === cat ? "bg-slate-900 text-white shadow-lg scale-105" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50 hover:text-slate-600"
                          )}
                       >
                          {cat}
                       </button>
                    ))}
                 </div>

                 {/* DATABASE GRID */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {[
                       { name: "Moshxo'rda (Yumshoq)", cat: "Sho'rvalar", kkal: 320, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071" },
                       { name: "Sutli Gerkules", cat: "Non mahsulotlari", kkal: 280, img: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076" },
                       { name: "Tovuqli Kotlet", cat: "Quyuq taomlar", kkal: 410, img: "https://images.unsplash.com/photo-1603333388196-83fa4c577adc?q=80&w=2072" },
                       { name: "Mevali Kompot", cat: "Ichimliklar", kkal: 120, img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2125" },
                       { name: "Sabzavotli Dimlama", cat: "Parhez taomlar", kkal: 290, img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=2070" },
                       { name: "Olma sharbati", cat: "Ichimliklar", kkal: 95, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=2048" }
                    ].filter(f => (dbCategory === 'Barchasi' || f.cat === dbCategory) && f.name.toLowerCase().includes(dbSearch.toLowerCase()))
                    .map((food, idx) => (
                       <motion.div 
                          layout
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          key={food.name} 
                          className="group bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 flex flex-col"
                       >
                          <div className="h-44 sm:h-56 relative overflow-hidden shrink-0">
                             <img src={food.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={food.name} />
                             <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[8px] sm:text-[9px] font-black uppercase text-indigo-600 shadow-lg">
                                {food.cat}
                             </div>
                          </div>
                          <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 flex-1 flex flex-col justify-between">
                             <div>
                                <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mb-2">{food.name}</h4>
                                <div className="flex items-center gap-3 sm:gap-4">
                                   <span className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <Apple size={14} className="text-emerald-500 sm:w-3.5 sm:h-3.5" /> {food.kkal} kkal
                                   </span>
                                   <span className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <Database size={14} className="text-indigo-500 sm:w-3.5 sm:h-3.5" /> 12 masalliq
                                   </span>
                                </div>
                             </div>
                             <div className="flex items-center gap-2 pt-2">
                                <button className="flex-1 py-3 sm:py-3.5 bg-slate-50 text-slate-900 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all">
                                   Retsept
                                </button>
                                <button className="p-3 sm:p-3.5 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                   <Plus size={18} className="sm:w-5 sm:h-5" />
                                </button>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>

                 {/* PAGINATION INFO */}
                 <div className="flex items-center justify-center pt-6 sm:pt-10">
                    <button className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-xl sm:rounded-[28px] font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                       Yana 494 ta taomni yuklash
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
          {/* TAB 5: AI ANALYSIS */}
          {activeTab === 'ai-analysis' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-10 sm:space-y-16"
            >
              {/* ── Taomnoma Xulosasi Card ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie card */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Taomnoma Xulosasi</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qoidabuzarliklar taqsimoti</p>
                    </div>
                  </div>

                  {/* Custom donut */}
                  <div className="flex items-center justify-center my-4">
                    <div className="relative w-44 h-44">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {[
                          { pct: 35, color: "#6366f1", offset: 0 },
                          { pct: 25, color: "#f59e0b", offset: 35 },
                          { pct: 15, color: "#f43f5e", offset: 60 },
                          { pct: 25, color: "#94a3b8", offset: 75 },
                        ].map((s, i) => {
                          const r = 38, circ = 2 * Math.PI * r;
                          return (
                            <circle key={i}
                              cx="50" cy="50" r={r}
                              fill="none"
                              stroke={s.color}
                              strokeWidth="14"
                              strokeLinecap="round"
                              strokeDasharray={`${(s.pct / 100) * circ - 3} ${circ}`}
                              strokeDashoffset={-((s.offset / 100) * circ)}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900">100%</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jami xatolar</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2.5 mt-2">
                    {[
                      { label: "Taomnoma", pct: "35%", color: "#6366f1" },
                      { label: "Gigiyena",  pct: "25%", color: "#f59e0b" },
                      { label: "Davomat",   pct: "15%", color: "#f43f5e" },
                      { label: "Boshqa",    pct: "25%", color: "#94a3b8" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-900">{item.pct}</span>
                          <ChevronRight size={13} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Summary cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Vitaminlar balansı", score: "92%", status: "Optimal", color: "emerald", icon: "🥦", desc: "Kunlik vitaminlar me'yori 92% qoplangan. A, D, C vitaminlari yetarli." },
                    { title: "Kaloriya me'yori",   score: "88%", status: "Yaxshi",  color: "blue",    icon: "⚡", desc: "1-3 yosh: 1200 kkal, 3-7 yosh: 1800 kkal. O'rtacha 88% bajarildi." },
                    { title: "Protein balansi",    score: "74%", status: "O'rta",   color: "amber",   icon: "🥩", desc: "Protein miqdori belgilangan me'yordan pastroq. Qo'shimcha manba kerak." },
                    { title: "Gigiyena nazorati",  score: "96%", status: "A'lo",    color: "indigo",  icon: "🧼", desc: "Sanitariya holati a'lo darajada. Barcha mahsulotlar sertifikatlangan." },
                    { title: "Tuz va shakar",      score: "81%", status: "Normal",  color: "purple",  icon: "🧂", desc: "Tuz me'yori to'g'ri kuzatilmoqda. Shakar bolalarga mos miqdorda." },
                    { title: "Suv va suyuqlik",    score: "95%", status: "Optimal", color: "cyan",    icon: "💧", desc: "Kunlik suyuqlik me'yori to'liq bajarilmoqda. Kompot va suv yetarli." },
                  ].map((card, i) => (
                    <div key={i} className={clsx("bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all")}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{card.icon}</span>
                        <span className={clsx("text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                          card.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                          card.color === "blue"    ? "bg-blue-50 text-blue-600" :
                          card.color === "amber"   ? "bg-amber-50 text-amber-600" :
                          card.color === "indigo"  ? "bg-indigo-50 text-indigo-600" :
                          card.color === "purple"  ? "bg-purple-50 text-purple-600" :
                                                     "bg-cyan-50 text-cyan-600"
                        )}>{card.status}</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                      <p className={clsx("text-2xl font-black mb-2",
                        card.color === "emerald" ? "text-emerald-500" :
                        card.color === "blue"    ? "text-blue-500" :
                        card.color === "amber"   ? "text-amber-500" :
                        card.color === "indigo"  ? "text-indigo-500" :
                        card.color === "purple"  ? "text-purple-500" : "text-cyan-500"
                      )}>{card.score}</p>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className={clsx("h-full rounded-full",
                          card.color === "emerald" ? "bg-emerald-500" :
                          card.color === "blue"    ? "bg-blue-500" :
                          card.color === "amber"   ? "bg-amber-400" :
                          card.color === "indigo"  ? "bg-indigo-500" :
                          card.color === "purple"  ? "bg-purple-500" : "bg-cyan-500"
                        )} style={{ width: card.score }} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 px-4 bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 sm:p-3 bg-indigo-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-200 shrink-0">
                       <Sparkles size={24} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                       <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI TAHLIL MONITORING</h2>
                       <p className="text-indigo-600 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Tizim: 4 mahal ovqat tahlili</p>
                    </div>
                 </div>
                 <p className="text-[12px] sm:text-sm text-slate-600 font-medium max-w-4xl leading-relaxed">
                   Ushbu bo‘lim har bir bog‘chada kun davomida berilgan 4 mahal ovqatni sun’iy intellekt orqali alohida va umumiy tarzda tahlil qiladi. Tizim har bir taomni tekshiradi va kunlik umumiy xulosa chiqaradi.
                 </p>
              </div>

              <div className="grid grid-cols-1 gap-12 sm:gap-20">
                 {[
                    { 
                      time: '08:30', title: 'Nonushta', icon: Sun, color: 'text-amber-500 bg-amber-50', 
                      summary: "Nonushta ratsioni uglevodlar va vitaminlarga boy qilib tanlangan. Bu bolalarning miya faoliyati va jismoniy tetikligi uchun 100% mos keladi.",
                      baho: "100%",
                      balans: "Optimal",
                      stats: [
                         { label: "Vitamin A", val: "20%" },
                         { label: "Vitamin B", val: "30%" },
                         { label: "Vitamin C", val: "50%" },
                         { label: "Energiya", val: "350 kkal" }
                      ],
                      items: [
                        { name: "Sutli Gerkules bo'tqasi", cat: "Asosiy taom", kkal: 280, img: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076", vitamins: "A, D, Kalsiy", protein: "8g", foyda: "Energiya miqdori bolaning kunlik faolligini boshlash uchun yetarli." },
                        { name: "Limonli ko'k choy", cat: "Ichimlik", kkal: 45, img: "https://images.unsplash.com/photo-1594631252845-29fc458695d7?q=80&w=1974", vitamins: "Vit C", protein: "0g", foyda: "Gidratatsiyani ta'minlaydi va immunitetni mustahkamlaydi." }
                      ]
                    },
                    { 
                      time: '12:30', title: 'Tushlik', icon: Utensils, color: 'text-indigo-500 bg-indigo-50',
                      summary: "Protein va murakkab uglevodlar balanslangan. Energiya tiklanishi uchun mos.",
                      baho: "98%",
                      balans: "Zo'r",
                      stats: [
                         { label: "Protein", val: "40%" },
                         { label: "Uglevod", val: "45%" },
                         { label: "Vitamin B12", val: "30%" },
                         { label: "Energiya", val: "770 kkal" }
                      ],
                      items: [
                        { name: "Moshxo'rda (Go'shtli)", cat: "Birinchi taom", kkal: 320, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071", vitamins: "B12, Fe", protein: "12g", foyda: "O'suvchi organizm uchun zarur bo'lgan aminokislotalarga boy." },
                        { name: "Mol go'shtidan Kotlet va Grechka", cat: "Ikkinchi taom", kkal: 450, img: "https://images.unsplash.com/photo-1603333388196-83fa4c577adc?q=80&w=2072", vitamins: "Mg, Fe", protein: "18g", foyda: "Gemoglobin miqdorini normada saqlashga yordam beradi." }
                      ]
                    }
                 ].map((section, idx) => (
                    <div key={idx} className="space-y-6 sm:space-y-8">
                       <div className="flex items-center gap-4 sm:gap-6 mb-2 px-2 sm:px-4">
                          <div className={clsx("w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0", section.color)}>
                             <section.icon size={24} className="sm:w-7 sm:h-7" />
                          </div>
                          <div>
                             <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">{section.title} ANALIZI</h3>
                             <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                               <Sparkles size={12} className="text-indigo-600" />
                               <p className="text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">AI tekshiruvida</p>
                             </div>
                          </div>
                          <div className="h-px flex-1 bg-slate-100 hidden sm:block" />
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                          {section.items.map((item, iIdx) => (
                            <div key={iIdx} className="bg-white rounded-[28px] sm:rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 flex flex-col xs:flex-row relative">
                               <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase shadow-lg shadow-indigo-200">
                                 <Sparkles size={10} /> AI
                               </div>
                               <div className="xs:w-2/5 h-40 xs:h-auto relative shrink-0">
                                  <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-slate-900 shadow-sm">
                                     {item.cat}
                                  </div>
                               </div>
                               <div className="xs:w-3/5 p-5 sm:p-6 space-y-4 sm:space-y-5">
                                  <div>
                                     <h4 className="text-base sm:text-lg font-black text-slate-900 mb-2 sm:mb-3">{item.name}</h4>
                                     <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 sm:py-1.5 rounded-lg border border-amber-100"><Zap size={10} className="sm:w-3 sm:h-3" /> {item.kkal}</span>
                                        <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 sm:py-1.5 rounded-lg border border-indigo-100"><Baby size={10} className="sm:w-3 sm:h-3" /> {item.vitamins}</span>
                                     </div>
                                  </div>
                                  <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 relative">
                                     <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-500 rounded-r-md"></div>
                                     <p className="text-[10px] sm:text-[11px] text-slate-700 font-medium flex items-start gap-1.5">
                                        <span className="text-emerald-500 font-black">💬 Foyda:</span> {item.foyda}
                                     </p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>

                       {/* MEALTIME AI SUMMARY PANEL */}
                       <div className="mx-1 sm:mx-4 p-6 sm:p-8 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-[32px] sm:rounded-[40px] text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group">
                          <div className="absolute right-0 top-0 w-32 sm:w-64 h-32 sm:h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                          
                          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 sm:gap-8">
                             <div className="flex-1 space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                   <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                      <Sparkles size={16} className="sm:w-5 sm:h-5" />
                                   </div>
                                   <h4 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-indigo-100">AI Xulosa</h4>
                                </div>
                                <p className="text-base sm:text-lg font-bold leading-relaxed opacity-95">
                                   {section.summary}
                                </p>
                             </div>
                             
                             <div className="md:w-1/3 flex flex-col gap-2 sm:gap-3 border-t md:border-t-0 md:border-l border-white/20 pt-4 sm:pt-6 md:pt-0 md:pl-8">
                                <div className="flex justify-between items-center bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                                   <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-80">Baho</span>
                                   <span className="text-base sm:text-lg font-black text-emerald-400">{section.baho}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
                                   <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-80">Balans</span>
                                   <span className="text-[10px] sm:text-sm font-black text-amber-300 uppercase">{section.balans}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                                   {section.stats.map(stat => (
                                     <div key={stat.label} className="bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/5">
                                       <span className="text-[7px] sm:text-[8px] font-bold uppercase opacity-70 block">{stat.label}</span>
                                       <span className="text-[10px] sm:text-xs font-black">{stat.val}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}

                 {/* ── Oziq-ovqat va vitamin analizi ── */}
                 <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Sparkles size={18} /></div>
                     <div>
                       <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Oziq-ovqat va Vitamin Analizi</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Har bir element bo'yicha AI diagnostikasi</p>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {[
                       { name: "Vitamin A", val: 100, status: "Optimal", color: "#fbbf24", desc: "Monitoring faol" },
                       { name: "Vitamin C", val: 100, status: "Optimal", color: "#f87171", desc: "Monitoring faol" },
                       { name: "Vitamin D", val: 100, status: "Optimal", color: "#60a5fa", desc: "Monitoring faol" },
                       { name: "Kalsiy",    val: 100, status: "Optimal", color: "#34d399", desc: "Monitoring faol" },
                       { name: "Temir",     val: 88,  status: "Yaxshi",  color: "#a78bfa", desc: "Monitoring faol" },
                       { name: "Oqsillar",  val: 95,  status: "Optimal", color: "#f472b6", desc: "Monitoring faol" },
                     ].map((v, i) => (
                       <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                         <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: v.color + "20" }}>
                             {["🌟","🍊","☀️","🦴","🩸","🥩"][i]}
                           </div>
                           <span className="text-[9px] font-black px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-wider">{v.status}</span>
                         </div>
                         <h4 className="text-base font-black text-slate-900 mb-0.5">{v.name}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{v.desc}</p>
                         <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                           <span className="text-slate-400">Muvofiqlik</span>
                           <span className="text-slate-900">{v.val}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${v.val}%`, backgroundColor: v.color }} />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* ── Hududiy liderlar & Kritik hududlar ── */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                   <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                     <div className="flex items-center gap-3 mb-5">
                       <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center"><Trophy className="text-amber-500" size={18} /></div>
                       <div>
                         <h3 className="text-sm font-black text-slate-900 uppercase">Hududiy liderlar (TOP 5)</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Eng yaxshi taomnoma ko'rsatkichlari</p>
                       </div>
                     </div>
                     <div className="space-y-3">
                       {[
                         { name: "Qarshi shahri", score: 97, type: "Public" },
                         { name: "Shahrisabz sh.", score: 94, type: "Public" },
                         { name: "Kitob tumani",   score: 91, type: "Davlat" },
                         { name: "Koson tumani",   score: 89, type: "Public" },
                         { name: "Muborak t.",     score: 88, type: "Oilaviy" },
                       ].map((d, i) => (
                         <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                           <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm",
                             i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-slate-100 text-slate-500" : "bg-orange-50 text-orange-400")}>
                             {i + 1}
                           </div>
                           <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                               <span className="text-sm font-black text-slate-900">{d.name}</span>
                               <span className="text-sm font-black text-emerald-600">{d.score}</span>
                             </div>
                             <span className="text-[9px] font-black text-slate-400 bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md uppercase">{d.type}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                       <p className="text-[10px] font-bold text-indigo-600 italic">"Ushbu tumanlarning oziq-ovqat nazorati modelini butun viloyatga Best Practice sifatida joriy etish tavsiya etiladi."</p>
                     </div>
                   </div>

                   <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                     <div className="flex items-center gap-3 mb-5">
                       <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center"><AlertTriangle className="text-rose-500" size={18} /></div>
                       <div>
                         <h3 className="text-sm font-black text-slate-900 uppercase">Kritik hududlar (TOP 5)</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">E'tibor talab qiluvchi tumanlar</p>
                       </div>
                     </div>
                     <div className="space-y-3">
                       {[
                         { name: "Chiroqchi t.", score: 64, issue: "Taomnoma" },
                         { name: "Dehqonobod t.", score: 68, issue: "Gigiyena" },
                         { name: "Nishon t.",     score: 71, issue: "Davomat" },
                         { name: "Qamashi t.",    score: 73, issue: "Taomnoma" },
                         { name: "Kasbi t.",      score: 75, issue: "Sanitariya" },
                       ].map((d, i) => (
                         <div key={i} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 hover:bg-white hover:shadow-sm transition-all">
                           <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500 font-black text-sm">!</div>
                           <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                               <span className="text-sm font-black text-slate-900">{d.name}</span>
                               <span className="text-sm font-black text-rose-600">{d.score}</span>
                             </div>
                             <span className="text-[9px] font-black text-rose-400 uppercase">Muammo: {d.issue}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                       <p className="text-[10px] font-bold text-rose-500 italic">"Ushbu hududlarda tizimli monitoring kechikmoqda. Auditorlar guruhini yuborish zarur."</p>
                     </div>
                   </div>
                 </div>

                 {/* ── Sog'lomlashtirish rejasi ── */}
                 <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                     <div>
                       <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                         <ShieldCheck className="text-rose-500" size={20} /> Past reytingli bog'chalarni "Sog'lomlashtirish" rejasi
                       </h3>
                       <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full mt-1 inline-block uppercase">Kritik holat: 12 ta bog'cha</span>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                       { step: "01", title: "Avtomatik Diagnostika", desc: "Reytingi past bog'chalar uchun AI algoritmi orqali past ko'rsatkich sabablarini 1 soat ichida aniqlash.", color: "rose", icon: "🔍", rec: "Foto-hisobotlar chastotasini oshirish." },
                       { step: "02", title: "Kadrlar Bilimini Yangilash", desc: "Muammoli MTT xodimlari uchun AI platformasida maxsus blits-kurs va test sinovlarini tashkil etish.", color: "orange", icon: "👥", rec: "Oshpazlar uchun sanitariya vebinari." },
                       { step: "03", title: "Resurslarni Qayta Taqsimlash", desc: "Vitamin va ozuqa yetishmovchiligi aniqlangan hududlarga qo'shni omborlardan zaxiralarni yo'naltirish.", color: "amber", icon: "📦", rec: "Vitamin D zaxirasini 20% ga oshirish." },
                       { step: "04", title: "Raqamli Nazoratni Kuchaytirish", desc: "24 soat davomida har bir jarayonni onlayn video-tahlil orqali AI nazoratiga o'tkazish.", color: "indigo", icon: "⚡", rec: "Face-ID tizimini qayta kalibrlash." },
                     ].map((s, i) => (
                       <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                         <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md mb-4 text-xl",
                           s.color === "rose" ? "bg-rose-500" : s.color === "orange" ? "bg-orange-500" : s.color === "amber" ? "bg-amber-500" : "bg-indigo-600")}>
                           {s.icon}
                         </div>
                         <p className="text-[8px] font-black text-slate-300 mb-1">{s.step}</p>
                         <h4 className="text-sm font-black text-slate-900 mb-2">{s.title}</h4>
                         <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-3">{s.desc}</p>
                         <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                           <p className={clsx("text-[9px] font-black uppercase tracking-tight",
                             s.color === "rose" ? "text-rose-500" : s.color === "orange" ? "text-orange-500" : s.color === "amber" ? "text-amber-500" : "text-indigo-500")}>
                             {s.rec}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                   {/* AI bashorat banner */}
                   <div className="mt-5 p-5 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Sparkles size={22} className="text-indigo-400 animate-pulse" /></div>
                       <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                         <span className="text-white font-black">AI Strategik Bashorati: </span>
                         "Agar ushbu bog'chalarda <span className="text-indigo-400">48 soat</span> ichida ijobiy siljish kuzatilmasa, tizim avtomatik ravishda ta'minotchi korxonaga nisbatan 'Kritik' ogohlantirish yuboradi."
                       </p>
                     </div>
                     <button className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap">
                       Barcha buyruqlarni ijro etish
                     </button>
                   </div>
                 </div>

                 {/* ── AI Strategik Tavsiyalar ── */}
                 <div className="bg-slate-950 rounded-[32px] p-6 sm:p-10 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 blur-[120px] rounded-full" />
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                           <Zap size={26} className="text-amber-400" />
                         </div>
                         <div>
                           <h3 className="text-xl font-black tracking-tight italic">AI Strategik Tavsiyalar</h3>
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Autonomous Governance v4.0</p>
                         </div>
                       </div>
                       <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
                         Batafsil hisobotni yuklash
                       </button>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       {[
                         { title: "Auditorlar Nazorati",       text: "Chiroqchi va Koson tumanlariga zudlik bilan auditorlar guruhini yuborish va joyida o'rganish.", icon: ShieldCheck, color: "emerald" },
                         { title: "Logistika Optimizatsiyasi", text: "Logistika provayderini qayta ko'rib chiqish va kechikishlar uchun jarima sanksiyalarini qo'llash.", icon: Zap,        color: "amber" },
                         { title: "Xarajatlarni Boshqarish",  text: "Xususiy bog'chalar uchun xarajatlarni optimallashtirish bo'yicha yangi raqamli metodik qo'llanma.", icon: Database,   color: "indigo" },
                         { title: "Biometrik Monitoring",     text: "Raqamli davomatni (Face ID/Biometriya) barcha bog'chalarda majburiy etib belgilash.", icon: Users,       color: "rose" },
                       ].map((t, i) => (
                         <div key={i} className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                           <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                             t.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                             t.color === "amber"   ? "bg-amber-500/10 text-amber-400" :
                             t.color === "indigo"  ? "bg-indigo-500/10 text-indigo-400" :
                                                     "bg-rose-500/10 text-rose-400")}>
                             <t.icon size={22} />
                           </div>
                           <div>
                             <h4 className="text-sm font-black text-white mb-1">{t.title}</h4>
                             <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{t.text}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>

                 {/* FINAL DAILY AI VERDICT */}
                 <div className="mx-1 sm:mx-4 mt-6 sm:mt-8 bg-slate-900 rounded-[32px] sm:rounded-[60px] p-6 sm:p-12 text-white border-t-4 sm:border-t-8 border-indigo-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent" />
                    <div className="relative z-10 space-y-8 sm:space-y-12">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 border-b border-white/10 pb-6 sm:pb-8">
                          <div className="flex items-center gap-4 sm:gap-6">
                             <div className="w-12 h-12 sm:w-20 sm:h-20 bg-indigo-600/20 rounded-xl sm:rounded-[28px] border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                                <ShieldCheck size={28} className="sm:w-10 sm:h-10" />
                             </div>
                             <div>
                                <h2 className="text-xl sm:text-4xl font-black tracking-tight mb-1 sm:mb-2 leading-tight">YAKUNIY AI TAHLIL</h2>
                                <p className="text-indigo-400 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[8px] sm:text-[10px]">Barcha 4 mahal ovqat tahlili natijasi</p>
                             </div>
                          </div>
                          <div className="px-6 sm:px-10 py-4 sm:py-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl sm:rounded-[32px] text-center">
                             <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-400">REYTING</p>
                             <p className="text-3xl sm:text-5xl font-black text-white">98.4%</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                          {[
                            { icon: Zap, color: 'text-amber-400', title: '1. Energetik Balans', text: "Kunlik 1250 kkal — optimal. Tavsiya etilgan normaga to'liq mos keladi." },
                            { icon: Baby, color: 'text-blue-400', title: '2. Vitamin tahlili', text: "A, B12, C va D vitaminlar balanslangan. Immunitet uchun barcha kerakli moddalar mavjud." },
                            { icon: Sparkles, color: 'text-indigo-400', title: '3. AI Tavsiya', text: "Ertangi menyuda proteinni 5% ga oshirish tavsiya etiladi." }
                          ].map((point, pIdx) => (
                             <div key={pIdx} className="p-6 sm:p-8 bg-white/5 rounded-[24px] sm:rounded-[40px] border border-white/10 hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                  <point.icon className={point.color} size={18} />
                                  <h5 className="font-black text-[11px] sm:text-sm uppercase tracking-widest text-indigo-100">{point.title}</h5>
                                </div>
                                <p className="text-[12px] sm:text-sm leading-relaxed opacity-80 font-medium">{point.text}</p>
                             </div>
                          ))}
                       </div>

                       <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                          <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                             <Database size={12} /> Ma'lumot saqlandi
                          </p>
                          <button className="w-full sm:w-auto px-8 sm:px-16 py-4 sm:py-6 bg-indigo-600 hover:bg-indigo-500 rounded-xl sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 sm:gap-3">
                             <CheckCircle2 size={16} /> Tasdiqlash
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MealCreationModal isOpen={isMealModalOpen} onClose={() => setIsMealModalOpen(false)} />
      <DailyMenuCreationModal 
        isOpen={isDailyMenuModalOpen} 
        onClose={() => setIsDailyMenuModalOpen(false)} 
        selectedDate={selectedDate.full}
      />
      <AIMealAnalysisModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        meal={selectedAIMeal} 
      />
    </div>
  );
};
