import React from 'react';
import { Activity, Heart, ShieldAlert, FileText, Clipboard, Thermometer, Ruler, Weight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const MedicalSection = ({ parentData }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
     {/* Medical Overview Header */}
     <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-[60px] md:blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
           <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center">
                    <Clipboard size={20} md:size={24} className="text-white" />
                 </div>
                 <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-400">Tasdiqlangan</div>
              </div>
              <h4 className="text-xl md:text-3xl font-black tracking-tight uppercase leading-tight italic">Sog'liqni Saqlash <br/> Monitoringi</h4>
              <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-xs">Farzandingizning rivojlanishi nazorat ostida.</p>
           </div>
           
           <div className="bg-white/5 border border-white/10 p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl shadow-inner min-w-[240px]">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"><CheckCircle2 size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-0.5">Status</p>
                    <p className="text-lg font-black uppercase tracking-tight">Sog'lom</p>
                 </div>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full w-[95%] bg-gradient-to-r from-emerald-500 to-emerald-300"></div>
              </div>
              <p className="text-[8px] font-black text-white/30 uppercase mt-2.5 tracking-widest">Normal: 95%</p>
           </div>
        </div>
     </div>

     {/* Vitals Grid */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
           { label: 'Bo\'yi', val: parentData.height || '--', unit: 'cm', icon: Ruler, color: 'blue', desc: 'O\'sish' },
           { label: 'Vazni', val: parentData.weight || '--', unit: 'kg', icon: Weight, color: 'rose', desc: 'Vazn' },
           { label: 'Harorat', val: '36.6', unit: '°C', icon: Thermometer, color: 'emerald', desc: 'Holat' }
        ].map((v, i) => (
           <div key={i} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-brand-border shadow-sm group hover:border-brand-primary transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                 <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-${v.color}-50 text-${v.color}-500 flex items-center justify-center border border-${v.color}-100 shadow-sm transition-transform group-hover:scale-110`}>
                    <v.icon size={24} md:size={32} />
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-0.5">{v.label}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{v.desc}</p>
                 </div>
              </div>
              
              <p className="text-4xl md:text-5xl font-black text-brand-depth tracking-tighter leading-none">
                 {v.val}<span className={`text-base md:text-lg text-${v.color}-500 ml-1.5 opacity-40 uppercase font-black`}>{v.unit}</span>
              </p>
           </div>
        ))}
     </div>
     
     {/* Allergies */}
     <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-[2rem] md:rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white p-6 md:p-10 rounded-[1.8rem] md:rounded-[2.5rem] border border-brand-border shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
           <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-50 text-amber-500 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-inner border-2 border-white shrink-0">
              <ShieldAlert size={32} md:size={48} className="animate-pulse" />
           </div>
           <div className="space-y-3 md:space-y-4 flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                 <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-200">Critical Info</span>
              </div>
              <h5 className="text-xl md:text-2xl font-black text-brand-depth tracking-tight uppercase leading-none">Allergiya va Maxsus Taqiqlar</h5>
              <div className="bg-slate-50 p-5 md:p-6 rounded-xl border border-brand-border relative overflow-hidden group/card">
                 <p className="text-sm md:text-lg font-black text-amber-900 leading-relaxed uppercase tracking-tight relative z-10">
                    {parentData.allergies || 'Tizimda hech qanday allergiya yoki taqiqlar qayd etilmagan'}
                 </p>
              </div>
           </div>
        </div>
     </div>

     {/* Medical Notes */}
     <div className="bg-white rounded-[1.8rem] md:rounded-[2.5rem] border border-brand-border overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/20 gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand-depth text-white flex items-center justify-center shadow-lg group">
                 <FileText size={24} md:size={32} className="group-hover:rotate-[-10deg] transition-transform duration-500" />
              </div>
              <div className="text-left">
                 <h5 className="text-xl md:text-2xl font-black text-brand-depth tracking-tight uppercase leading-none">Shifokor Jurnali</h5>
                 <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                    <Activity size={12} className="text-brand-primary" /> Oxirgi tekshiruv qaydlari
                 </p>
              </div>
           </div>
        </div>
        <div className="p-6 md:p-8">
           <div className="relative p-6 md:p-10 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 min-h-[120px] flex items-center justify-center group/note">
              <p className="text-xs md:text-lg font-bold text-brand-slate leading-loose italic text-center max-w-2xl relative z-10">
                 "{parentData.medical_notes || 'Tizimda hozircha shifokor tomonidan kiritilgan qo\'shimcha qaydlar mavjud emas. Farzandingiz sog\'lig\'i doimiy nazoratda.'}"
              </p>
           </div>
        </div>
     </div>
  </motion.div>
);
