import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  X, 
  Search, 
  Plus, 
  CheckCircle2, 
  Utensils, 
  Baby, 
  Users, 
  Stethoscope, 
  Clock,
  ArrowRight,
  Save,
  Send
} from 'lucide-react';
import { clsx } from 'clsx';

interface DailyMenuCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

const MOCK_DB = [
  { id: 1, name: "Sutli Gerkules bo'tqasi", cat: "Bo'tqalar" },
  { id: 2, name: "Moshxo'rda (Go'shtli)", cat: "Sho'rvalar" },
  { id: 3, name: "Tovuqli Kotlet va Grechka", cat: "Quyuq taomlar" },
  { id: 4, name: "Sabzavotli Dimlama", cat: "Parhez" },
  { id: 5, name: "Mevali Kompot", cat: "Ichimliklar" },
  { id: 6, name: "Guruchli bo'tqa (suvda)", cat: "Parhez" },
  { id: 7, name: "Mastava (Yumshoq)", cat: "Sho'rvalar" },
  { id: 8, name: "Osh (Palov)", cat: "Quyuq taomlar" },
];

export const DailyMenuCreationModal: React.FC<DailyMenuCreationModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const [activeMealTime, setActiveMealTime] = useState('Nonushta');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuData, setMenuData] = useState<any>({
    '1-3': { Nonushta: '', Tushlik: '', Poldnik: '', KechkiOvqat: '' },
    '3-7': { Nonushta: '', Tushlik: '', Poldnik: '', KechkiOvqat: '' },
    'parhez': { Nonushta: '', Tushlik: '', Poldnik: '', KechkiOvqat: '' },
  });

  if (!isOpen) return null;

  const filteredDB = MOCK_DB.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const MEAL_TIMES = ['Nonushta', 'Tushlik', 'Poldnik', 'Kechki ovqat'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[32px] sm:rounded-[50px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-3 sm:p-4 bg-indigo-600 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-indigo-200 shrink-0">
                <Utensils size={24} className="sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Taomnoma yaratish</h2>
                <p className="text-indigo-600 text-[9px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1">{selectedDate}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-4 hover:bg-slate-200 rounded-xl sm:rounded-2xl transition-colors text-slate-400">
              <X size={24} className="sm:w-7 sm:h-7" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Sidebar: Meal Times */}
            <div className="w-full lg:w-64 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 p-4 sm:p-8 flex lg:flex-col gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
              {MEAL_TIMES.map(time => (
                <button
                  key={time}
                  onClick={() => setActiveMealTime(time)}
                  className={clsx(
                    "flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest transition-all whitespace-nowrap",
                    activeMealTime === time ? "bg-white text-indigo-600 shadow-xl shadow-slate-200 scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Clock size={14} className="sm:w-4 sm:h-4" /> {time}
                </button>
              ))}
            </div>

            {/* Main Content: Group Selection & DB Search */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-8 sm:space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 gap-8 sm:gap-10">
                
                {/* 1-3 YOSH QISMI */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-emerald-100 text-emerald-600 rounded-lg sm:rounded-xl"><Baby size={18} className="sm:w-5 sm:h-5" /></div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">1–3 yosh</h3>
                    </div>
                    {menuData['1-3'][activeMealTime] && (
                      <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg">Tanlandi</span>
                    )}
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 sm:w-5 sm:h-5" size={16} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Qidirish..."
                      className="w-full pl-11 sm:pl-14 pr-4 sm:pr-8 py-4 sm:py-5 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl focus:ring-4 focus:ring-indigo-50 font-bold text-xs sm:text-sm"
                    />
                    <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 gap-2">
                       {filteredDB.slice(0, 1).map(m => (
                         <button 
                           key={m.id} 
                           onClick={() => setMenuData({...menuData, '1-3': {...menuData['1-3'], [activeMealTime]: m.name}})}
                           className={clsx(
                             "px-3 py-1.5 border rounded-lg text-[9px] font-black transition-all",
                             menuData['1-3'][activeMealTime] === m.name ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                           )}
                         >
                           + {m.name}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                {/* 3-7 YOSH QISMI */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-indigo-100 text-indigo-600 rounded-lg sm:rounded-xl"><Users size={18} className="sm:w-5 sm:h-5" /></div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">3–7 yosh</h3>
                    </div>
                    {menuData['3-7'][activeMealTime] && (
                      <span className="text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg">Tanlandi</span>
                    )}
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 sm:w-5 sm:h-5" size={16} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Qidirish..."
                      className="w-full pl-11 sm:pl-14 pr-4 sm:pr-8 py-4 sm:py-5 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl focus:ring-4 focus:ring-indigo-50 font-bold text-xs sm:text-sm"
                    />
                    <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 gap-2">
                       {filteredDB.slice(2, 3).map(m => (
                         <button 
                           key={m.id} 
                           onClick={() => setMenuData({...menuData, '3-7': {...menuData['3-7'], [activeMealTime]: m.name}})}
                           className={clsx(
                             "px-3 py-1.5 border rounded-lg text-[9px] font-black transition-all",
                             menuData['3-7'][activeMealTime] === m.name ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                           )}
                         >
                           + {m.name}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                {/* PARHEZ QISMI */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-rose-100 text-rose-600 rounded-lg sm:rounded-xl"><Stethoscope size={18} className="sm:w-5 sm:h-5" /></div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">Parhez</h3>
                    </div>
                    {menuData['parhez'][activeMealTime] && (
                      <span className="text-[8px] sm:text-[10px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg">Tanlandi</span>
                    )}
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 sm:w-5 sm:h-5" size={16} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Qidirish..."
                      className="w-full pl-11 sm:pl-14 pr-4 sm:pr-8 py-4 sm:py-5 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl focus:ring-4 focus:ring-indigo-50 font-bold text-xs sm:text-sm"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-emerald-600 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
              <CheckCircle2 size={18} className="sm:w-5 sm:h-5" /> Barcha vaqtlar tayyor
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button onClick={onClose} className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-5 bg-white border border-slate-200 text-slate-600 rounded-xl sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                Bekor qilish
              </button>
              <button 
                onClick={() => {
                  toast.success("Taomnoma tasdiqlandi va barcha bog'chalarga yuborildi! 🚀");
                  onClose();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-12 py-3.5 sm:py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Send size={16} className="sm:w-4.5 sm:h-4.5" /> <span className="sm:inline">Yuborish</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
