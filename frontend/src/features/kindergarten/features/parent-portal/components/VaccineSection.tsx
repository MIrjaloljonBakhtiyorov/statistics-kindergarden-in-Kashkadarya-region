import React from 'react';
import { Syringe, Clock, CheckCircle, ShieldCheck, AlertCircle, Info, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export const VaccineSection = ({ data }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
     {/* Passport Style Header */}
     <div className="bg-gradient-to-br from-sky-500 to-blue-700 p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
           <div className="space-y-3 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                 <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center">
                    <ShieldCheck size={24} md:size={28} className="text-white" />
                 </div>
                 <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest backdrop-blur-md">Emlash Pasporti</div>
              </div>
              <h4 className="text-xl md:text-3xl font-black tracking-tight leading-tight uppercase italic">Raqamli <br/> Immunizatsiya</h4>
              <p className="text-white/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-sm">Davlat standartlari asosida tasdiqlangan monitoring.</p>
           </div>
           
           <div className="flex gap-3 md:gap-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-5 rounded-2xl text-center min-w-[100px] md:min-w-[120px]">
                 <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Olingan</p>
                 <p className="text-2xl md:text-3xl font-black">{data?.vaccinations?.filter((v:any) => v.status === 'TAKEN').length || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl text-center min-w-[100px] md:min-w-[120px]">
                 <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Rejada</p>
                 <p className="text-2xl md:text-3xl font-black">{data?.vaccinations?.filter((v:any) => v.status !== 'TAKEN').length || 0}</p>
              </div>
           </div>
        </div>
     </div>

     {/* List Section */}
     <div className="bg-white rounded-[1.8rem] md:rounded-[2.5rem] border border-brand-border overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/20 gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg group">
                 <Syringe size={24} md:size={32} className="group-hover:rotate-[-45deg] transition-transform duration-500" />
              </div>
              <div className="text-left">
                 <h5 className="text-xl md:text-2xl font-black text-brand-depth tracking-tight uppercase leading-none">Emlashlar Ro'yxati</h5>
                 <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                    <Calendar size={12} className="text-sky-500" /> 2024-2026 reja
                 </p>
              </div>
           </div>
        </div>

        <div className="divide-y divide-slate-50">
           {data?.vaccinations?.length > 0 ? data.vaccinations.map((v:any, idx: number) => (
              <motion.div 
                key={v.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 md:p-8 flex flex-col sm:flex-row items-center justify-between hover:bg-slate-50/50 transition-all group gap-6"
              >
                 <div className="flex items-center gap-5 md:gap-8 w-full sm:w-auto">
                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 transition-all shadow-md group-hover:scale-105 ${v.status === 'TAKEN' ? 'bg-emerald-50 border-white text-emerald-500' : 'bg-slate-50 border-white text-slate-300'}`}>
                       <Syringe size={24} md:size={32} />
                    </div>
                    <div className="space-y-0.5 text-left flex-1">
                       <h5 className="text-lg md:text-xl font-black text-brand-depth tracking-tight group-hover:text-sky-600 transition-colors">{v.vaccine_name}</h5>
                       <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                             <Clock size={12} className="text-sky-500" />
                             <span className="text-[8px] md:text-[9px] font-black text-brand-muted uppercase tracking-widest">Reja: {v.planned_date}</span>
                          </div>
                          {v.status === 'TAKEN' && (
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm">
                                <CheckCircle size={12} className="text-emerald-500" />
                                <span className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Sana: {v.taken_date}</span>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className={`px-6 py-2.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm transition-all ${
                       v.status === 'TAKEN' 
                         ? 'bg-emerald-500 text-white shadow-emerald-500/10' 
                         : 'bg-brand-depth text-white shadow-brand-depth/10'
                    }`}>
                       {v.status === 'TAKEN' ? 'Olingan' : 'Kutilmoqda'}
                    </div>
                    {v.status !== 'TAKEN' && (
                       <div className="p-2 md:p-2.5 bg-amber-50 text-amber-500 rounded-lg border border-amber-100 hover:bg-amber-500 hover:text-white transition-all cursor-pointer">
                          <Info size={18} />
                       </div>
                    )}
                 </div>
              </motion.div>
           )) : (
            <div className="p-12 text-center space-y-3">
               <Syringe size={32} className="mx-auto text-slate-200" />
               <p className="text-brand-muted uppercase text-[9px] font-black tracking-widest">Ma'lumotlar yo'q</p>
            </div>
           )}
        </div>
     </div>

     {/* Info Alert */}
     <div className="bg-blue-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-blue-100 flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-sky-500 rounded-xl flex items-center justify-center shadow-sm shrink-0">
           <AlertCircle size={24} />
        </div>
        <p className="text-[9px] md:text-[10px] font-bold text-sky-800 uppercase leading-relaxed tracking-widest">
           Emlash ishlari davlat tomonidan tasdiqlangan grafik asosida olib boriladi. Savollar bo'lsa, bog'laning.
        </p>
     </div>
  </motion.div>
);
