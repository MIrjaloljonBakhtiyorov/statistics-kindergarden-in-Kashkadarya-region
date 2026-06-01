import React, { useState } from 'react';
import { Calendar, UserCheck, AlertCircle, Clock, ChevronRight, CheckCircle2, XCircle, Download, Save, History, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';


export const AttendanceSection = ({ data, childId, onUpdate }: any) => {
  const { showNotification } = useNotification();
  const [tomorrowAttending, setTomorrowAttending] = useState(true);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const stats = [
    { label: 'Kelgan kunlar', val: data?.attendance?.filter((a:any) => a.status === 'PRESENT').length || 0, icon: UserCheck, color: 'emerald', desc: 'Jami davomat' },
    { label: 'Kelmagan kunlar', val: data?.attendance?.filter((a:any) => a.status !== 'PRESENT').length || 0, icon: XCircle, color: 'rose', desc: 'Sababli/Sababsiz' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await apiClient.post(`/attendance`, {
        date: dateStr,
        attendance_data: {
          [childId]: tomorrowAttending ? 'PRESENT' : 'ABSENT'
        },
        reason: tomorrowAttending ? '' : reason
      });

      showNotification("Ertangi kun uchun reja saqlandi!", "success");
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      showNotification("Saqlashda xatolik yuz berdi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
      {/* Planning Section */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-blue-600 rounded-[2rem] md:rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-brand-depth p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] text-white overflow-hidden shadow-xl border border-white/10">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
           
           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-10">
              <div className="space-y-3 text-center lg:text-left flex-1">
                 <div className="flex items-center justify-center lg:justify-start">
                    <span className="px-3 py-1 bg-brand-primary/20 border border-brand-primary/30 rounded-full text-[8px] font-black uppercase tracking-widest text-brand-primary">Smart Planning</span>
                 </div>
                 <h4 className="text-xl md:text-3xl font-black tracking-tight leading-tight uppercase">Ertaga farzandingiz <br/> bog'chaga boradimi?</h4>
                 <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-wider leading-relaxed max-w-sm">Ertangi kun rejasini oldindan belgilash tarbiyachilarga yordam beradi.</p>
              </div>
              
              <div className="w-full lg:w-auto space-y-6">
                <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                   <button 
                     onClick={() => setTomorrowAttending(true)}
                     className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-10 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-500 ${tomorrowAttending ? 'bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-500/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                   >
                      <CheckCircle2 size={16} md:size={18} /> Boradi
                   </button>
                   <button 
                     onClick={() => setTomorrowAttending(false)}
                     className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-10 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-500 ${!tomorrowAttending ? 'bg-rose-500 text-white shadow-lg ring-4 ring-rose-500/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                   >
                      <XCircle size={16} md:size={18} /> Yo'q
                   </button>
                </div>

                <AnimatePresence mode="wait">
                   {!tomorrowAttending && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="space-y-3"
                      >
                         <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Sababini kiriting..."
                            className="w-full bg-white/5 border border-white/10 focus:border-brand-primary rounded-xl p-4 text-white font-bold outline-none transition-all placeholder:text-white/20 text-xs"
                            rows={2}
                         />
                      </motion.div>
                   )}
                </AnimatePresence>

                <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="w-full flex items-center justify-center gap-3 py-4 md:py-5 bg-white text-brand-depth rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] hover:bg-brand-primary hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 relative group overflow-hidden"
                 >
                    {isSaving ? <div className="w-4 h-4 border-2 border-brand-depth border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                    Tasdiqlash
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] border border-brand-border shadow-sm group hover:border-brand-primary transition-all relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center border border-${stat.color}-100 transition-transform group-hover:scale-110`}>
                   <stat.icon size={24} md:size={32} />
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-0.5">{stat.label}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{stat.desc}</p>
                </div>
             </div>
             
             <div className="flex items-end justify-between">
                <p className={`text-4xl md:text-6xl font-black text-brand-depth tracking-tighter leading-none`}>
                   {stat.val}<span className={`text-base md:text-lg text-${stat.color}-500 ml-1.5 opacity-40 font-black`}>kun</span>
                </p>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                   <TrendingUp size={12} className={`text-${stat.color}-500`} />
                   <span className="text-[9px] font-black text-brand-depth">Normal</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* History List */}
      <div className="bg-white rounded-[1.8rem] md:rounded-[2.5rem] border border-brand-border overflow-hidden shadow-sm">
         <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/20 gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand-depth text-white flex items-center justify-center shadow-lg group">
                  <History size={24} md:size={32} className="group-hover:rotate-[-45deg] transition-transform duration-500" />
               </div>
               <div>
                  <h5 className="text-xl md:text-2xl font-black text-brand-depth tracking-tight uppercase leading-none">Arxiv Jurnali</h5>
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                     <Clock size={12} className="text-brand-primary" /> Oxirgi 30 kun
                  </p>
               </div>
            </div>
            <button className="flex items-center gap-2.5 px-6 py-3.5 bg-brand-ghost text-brand-depth rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all border border-brand-border">
               <Download size={16} />
               <span>Excel Hisobot</span>
            </button>
         </div>

         <div className="divide-y divide-slate-50">
            {data?.attendance?.length === 0 ? (
               <div className="p-16 text-center space-y-3">
                  <Calendar size={40} className="mx-auto text-slate-200" />
                  <p className="text-brand-muted uppercase text-[9px] font-black tracking-widest">Ma'lumotlar yo'q</p>
               </div>
            ) : (
              data?.attendance?.map((a:any, idx: number) => (
                 <motion.div 
                   key={a.id} 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between hover:bg-slate-50/50 transition-all group gap-6"
                 >
                    <div className="flex items-center gap-5 md:gap-8 w-full sm:w-auto">
                       <div className="text-center bg-white w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-md group-hover:scale-105 transition-transform">
                          <p className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase">Apr</p>
                          <p className="text-xl md:text-3xl font-black text-brand-depth leading-none tracking-tighter">{a.date.split('-')[2]}</p>
                       </div>
                       <div className="space-y-1 text-left">
                          <p className="text-base md:text-xl font-black text-brand-depth tracking-tight">Bog'chaga {a.status === 'PRESENT' ? 'keldi' : 'kelmadi'}</p>
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${a.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                             <p className="text-[9px] md:text-[10px] font-black text-brand-muted uppercase tracking-wider">{a.date}</p>
                          </div>
                          {a.reason && (
                             <p className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 mt-1.5">Sabab: {a.reason}</p>
                          )}
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                       <div className={`px-6 py-2.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm transition-all ${
                          a.status === 'PRESENT' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                       }`}>
                          {a.status === 'PRESENT' ? 'Tasdiqlangan' : 'Kelmagan'}
                       </div>
                       <div className="p-2 md:p-2.5 text-brand-muted hover:text-brand-primary transition-colors cursor-pointer bg-slate-50 rounded-lg">
                          <ChevronRight size={18} />
                       </div>
                    </div>
                 </motion.div>
              ))
            )}
         </div>
      </div>
    </motion.div>
  );
};


