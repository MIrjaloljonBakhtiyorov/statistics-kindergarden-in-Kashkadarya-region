import React, { useState, useEffect } from 'react';
import { Apple, Clock, Flame, Zap, Target, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient } from '@/shared/api';


const MEAL_LABELS: Record<string, string> = {
  'BREAKFAST': 'Nonushta',
  'LUNCH': 'Tushlik',
  'TEA': 'Ikkinchi tushlik',
  'DINNER': 'Kechki ovqat'
};

const MEAL_TIMES: Record<string, string> = {
  'BREAKFAST': '08:30',
  'LUNCH': '12:30',
  'TEA': '16:00',
  'DINNER': '18:30'
};

export const MenuSection = ({ data: initialData, childId }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [menu, setMenu] = useState(initialData?.menu || []);
  const [loading, setLoading] = useState(false);

  const fetchMenu = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await apiClient.get(`/parent-portal/menu/${childId}/${dateStr}`);
      setMenu(res.data);
    } catch (err) {
      console.error(err);
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const selected = selectedDate.toISOString().split('T')[0];
    
    if (today !== selected) {
      fetchMenu(selectedDate);
    } else {
      setMenu(initialData?.menu || []);
    }
  }, [selectedDate, childId, initialData]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    return date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
  };

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const d = date.toISOString().split('T')[0];
    if (d === today.toISOString().split('T')[0]) return 'Bugun';
    if (d === yesterday.toISOString().split('T')[0]) return 'Kecha';
    if (d === tomorrow.toISOString().split('T')[0]) return 'Ertaga';
    
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 md:space-y-6">
      {/* Calendar Navigation */}
      <div className="bg-white p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-brand-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-inner">
               <CalendarIcon size={20} />
            </div>
            <div>
               <p className="text-[8px] font-black text-brand-muted uppercase tracking-widest leading-none mb-0.5">Taomnoma rejasi</p>
               <h4 className="text-lg md:text-xl font-black text-brand-depth tracking-tight uppercase">{getDateLabel(selectedDate)}</h4>
            </div>
         </div>

         <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button 
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-white hover:text-brand-primary rounded-lg transition-all hover:shadow-sm text-brand-muted"
            >
               <ChevronLeft size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1.5" />
            <button 
              onClick={() => setSelectedDate(new Date())}
              className={`px-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${isToday(selectedDate) ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-brand-muted hover:bg-white'}`}
            >
               Bugun
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1.5" />
            <button 
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-white hover:text-brand-primary rounded-lg transition-all hover:shadow-sm text-brand-muted"
            >
               <ChevronRight size={20} />
            </button>
         </div>
      </div>

      <div className="bg-emerald-50 p-4 md:p-6 rounded-[1.8rem] md:rounded-[2.5rem] border border-emerald-100 flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
         <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0 border-2 border-emerald-50">
            <Apple className="text-emerald-500" size={32} />
         </div>
         <div className="space-y-1">
            <h4 className="text-lg md:text-2xl font-black text-emerald-900 tracking-tight">Parhez Menyu</h4>
            <p className="text-emerald-700 text-[10px] md:text-xs font-bold uppercase tracking-widest max-w-xl">
               100% tabiiy mahsulotlardan tayyorlangan.
            </p>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
           <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-emerald-600 font-black uppercase text-[9px] tracking-widest">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
           {menu?.length > 0 ? menu.map((item: any, idx: number) => (
             <motion.div 
               key={idx} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-5 shadow-sm hover:shadow-xl hover:border-brand-primary transition-all group overflow-hidden"
             >
                {/* Meal Image Container */}
                <div className="relative h-40 md:h-48 w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 bg-slate-100">
                   {item.image_url ? (
                      <img src={item.image_url} alt={item.meal_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                         <Apple size={48} className="opacity-20" />
                         <p className="text-[8px] font-black uppercase tracking-widest mt-1.5">Rasm yo'q</p>
                      </div>
                   )}
                   <div className="absolute top-3 left-3 flex gap-1.5">
                      <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-600 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                         {MEAL_LABELS[item.meal_type] || item.meal_type}
                      </div>
                   </div>
                   <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-brand-depth font-black text-[9px] md:text-[10px] bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-sm">
                      <Clock size={12} className="text-brand-primary"/> {MEAL_TIMES[item.meal_type] || '--:--'}
                   </div>
                </div>

                <div className="px-2">
                   <h5 className="text-lg md:text-xl font-black text-brand-depth mb-2 leading-tight tracking-tight group-hover:text-brand-primary transition-colors">
                      {item.meal_name}
                   </h5>
                   <p className="text-[9px] md:text-[10px] font-bold text-brand-slate mb-4 bg-slate-50 p-3 rounded-xl border-l-4 border-emerald-300 italic">
                      Tarkibi: {item.vitamins}
                   </p>
                   
                   <div className="grid grid-cols-2 gap-2.5 md:gap-3 pt-4 border-t border-slate-100">
                      {[
                         {icon: Flame, label: "Temir", value: `${item.iron} mg`, color: "orange"},
                         {icon: Zap, label: "Uglerod", value: `${item.carbohydrates} g`, color: "blue"},
                      ].map(nut => (
                         <div key={nut.label} className="bg-slate-50 p-2.5 md:p-3 rounded-lg md:rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                               <div className={`w-7 h-7 rounded-lg bg-${nut.color}-100 text-${nut.color}-500 flex items-center justify-center`}><nut.icon size={12} /></div>
                               <span className="text-[7px] md:text-[8px] font-black text-brand-muted uppercase">{nut.label}</span>
                            </div>
                            <span className="text-[9px] md:text-xs font-black text-brand-depth">{nut.value}</span>
                         </div>
                      ))}
                      <div className="bg-brand-depth p-3 md:p-4 rounded-lg md:rounded-xl flex items-center justify-between col-span-2 text-white shadow-md group-hover:bg-brand-primary transition-colors">
                         <div className="flex items-center gap-2">
                            <Target size={14} className="opacity-40" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase opacity-60 tracking-widest">Quvvati</span>
                         </div>
                         <span className="text-lg md:text-xl font-black tracking-tight">{item.calories} <span className="text-[10px] opacity-40">kkal</span></span>
                      </div>
                   </div>
                </div>
             </motion.div>
           )) : (
             <div className="col-span-1 lg:col-span-2 bg-white p-10 md:p-16 rounded-[2rem] border-2 border-dashed border-brand-border flex flex-col items-center justify-center text-center space-y-3">
                <Apple size={32} className="text-brand-muted" />
                <p className="text-brand-muted font-black uppercase tracking-widest text-[9px] md:text-[10px]">Menyu topilmadi</p>
             </div>
           )}
        </div>
      )}
    </motion.div>
  );
};

