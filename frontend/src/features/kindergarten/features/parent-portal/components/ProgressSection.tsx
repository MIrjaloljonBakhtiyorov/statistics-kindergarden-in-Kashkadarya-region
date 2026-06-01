import React from 'react';
import { Star, Award, MessageSquare, TrendingUp, Calendar, Zap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const ProgressSection = ({ data }: any) => {
  const avgRating = data?.progress?.length > 0 
    ? (data.progress.reduce((sum: number, r: any) => sum + r.rating, 0) / data.progress.length).toFixed(1)
    : "5.0";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
      {/* Gamified Header */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-5 md:p-8 rounded-[1.8rem] md:rounded-[3rem] text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-6 text-center lg:text-left">
        <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 space-y-2.5">
           <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[8px] font-black uppercase tracking-widest">Muvaffaqiyatlar</span>
           </div>
           <h4 className="text-xl md:text-3xl font-black tracking-tight leading-tight uppercase">Bolaning <br/> Yutuqlari</h4>
           <p className="text-[9px] md:text-xs font-bold text-white/70 uppercase tracking-widest max-w-xs">Har bir kichik qadam - katta yutuq.</p>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-white/10 p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border border-white/20 backdrop-blur-xl shadow-inner group">
           <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white text-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-700">
              <Award size={32} md:size={40} />
           </div>
           <div className="text-center">
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Umumiy Reyting</p>
              <div className="flex items-end justify-center gap-1.5">
                 <p className="text-3xl md:text-5xl font-black tracking-tighter leading-none">{avgRating}</p>
                 <Sparkles className="text-white mb-1.5 animate-bounce" size={16} />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {data?.progress?.length > 0 ? data.progress.map((r:any, idx: number) => (
           <motion.div 
             key={r.id} 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.1 }}
             className="bg-white p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] border border-brand-border shadow-sm hover:border-brand-primary transition-all relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                 <Star size={80} />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 md:mb-8">
                 <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-amber-50 text-amber-500 flex items-center justify-center border-2 border-white shadow-md shrink-0 group-hover:rotate-12 transition-all">
                       <Star size={24} md:size={32} fill="#fbbf24" />
                    </div>
                    <div className="text-left">
                       <h5 className="text-lg md:text-2xl font-black text-brand-depth tracking-tight uppercase leading-none">{r.subject}</h5>
                       <div className="flex items-center gap-3 mt-2">
                          <p className="text-[9px] md:text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
                             <Calendar size={12} className="text-brand-primary" /> {r.date}
                          </p>
                          <div className="h-3 w-px bg-slate-200" />
                          <p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tasdiqlangan</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                    <div className="flex gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                       {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={18} 
                            fill={i < r.rating ? '#fbbf24' : 'none'} 
                            className={i < r.rating ? 'text-amber-400' : 'text-slate-200'} 
                          />
                       ))}
                    </div>
                    <p className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Tarbiyachi bahosi</p>
                 </div>
              </div>

              <div className="bg-slate-50 p-5 md:p-8 rounded-[1.2rem] md:rounded-[2rem] border border-brand-border relative">
                 <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                       <Zap size={12} className="text-brand-primary" />
                       <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Tarbiyachi izohi</span>
                    </div>
                    <p className="text-sm md:text-xl font-bold text-brand-depth leading-relaxed italic">
                       "{r.comment}"
                    </p>
                 </div>
              </div>
           </motion.div>
        )) : (
          <div className="p-12 md:p-16 text-center space-y-3 bg-white rounded-[2rem] border border-brand-border shadow-sm">
             <Star size={32} className="mx-auto text-slate-200" />
             <p className="text-brand-muted uppercase text-[9px] font-black tracking-widest">Ma'lumotlar yo'q</p>
          </div>
        )}
     </div>

     {/* Motivational Banner */}
     <div className="bg-brand-depth p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-primary/20 to-transparent"></div>
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20"><TrendingUp size={24} className="text-emerald-400" /></div>
           <div className="text-left">
              <h5 className="text-lg md:text-xl font-black tracking-tight uppercase leading-none">Oylik Hisobot</h5>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">O'sish sur'ati: +12%</p>
           </div>
        </div>
        <button className="relative z-10 px-8 py-4 bg-white text-brand-depth rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">
           Hisobotni ko'rish
        </button>
     </div>
  </motion.div>
);
};
