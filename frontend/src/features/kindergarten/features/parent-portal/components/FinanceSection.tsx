import React from 'react';
import { Wallet, CreditCard, Receipt, Download, CheckCircle2, ClipboardList, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const FinanceSection = ({ data }: any) => {
  const totalPaid = data?.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
         {/* Balance Card */}
         <div className="lg:col-span-2 bg-brand-depth p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-brand-primary/20 rounded-full blur-[60px] md:blur-[80px] -mr-24 -mt-24"></div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-6 md:gap-8">
               <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                     <p className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Hisob holati (Balans)</p>
                     <h4 className="text-2xl md:text-4xl font-black tracking-tighter">0.00 <span className="text-sm md:text-base opacity-40 uppercase ml-1.5">UZS</span></h4>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-xl border bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
                     <CheckCircle2 size={20} />
                  </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 pt-4 md:pt-6 border-t border-white/5">
                  <div>
                     <p className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Umumiy to'lovlar</p>
                     <p className="text-sm md:text-base font-black">{totalPaid.toLocaleString()} UZS</p>
                  </div>
                  <div>
                     <p className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Joriy qarz</p>
                     <p className="text-sm md:text-base font-black text-emerald-400">0 UZS</p>
                  </div>
                  <div className="hidden md:block">
                     <p className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Keyingi hisob</p>
                     <p className="text-sm md:text-base font-black">1-may, 2026</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex flex-row lg:flex-col gap-3 md:gap-4">
            <div className="flex-1 bg-brand-primary p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-lg flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-brand-primary-dark transition-all active:scale-95 border-b-2 md:border-b-4 border-black/10">
               <CreditCard size={24} className="mb-1.5 md:mb-2.5" />
               <h5 className="text-xs md:text-sm font-black uppercase leading-tight">To'lov</h5>
            </div>
            <div className="flex-1 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-brand-border shadow-sm flex flex-col justify-center items-center text-center group cursor-pointer hover:border-brand-primary transition-all active:scale-95">
               <Receipt size={24} className="text-brand-primary mb-1.5 md:mb-2.5" />
               <h5 className="text-xs md:text-sm font-black text-brand-depth uppercase leading-tight">Invoys</h5>
            </div>
         </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border overflow-hidden shadow-sm">
         <div className="p-4 md:p-5 border-b border-slate-50 bg-slate-50/20">
            <h5 className="font-black text-brand-depth uppercase text-[9px] md:text-[10px] tracking-widest flex items-center gap-2">
               <ClipboardList size={16} className="text-brand-primary" /> To'lovlar Tarixi
            </h5>
         </div>
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[500px]">
               <thead>
                  <tr className="bg-slate-50/50 text-[8px] md:text-[9px] font-black text-brand-muted uppercase tracking-[0.15em] border-b border-brand-border">
                     <th className="px-5 md:px-8 py-3 md:py-4">Operatsiya</th>
                     <th className="px-5 md:px-8 py-3 md:py-4">Sana</th>
                     <th className="px-5 md:px-8 py-3 md:py-4">Summa</th>
                     <th className="px-5 md:px-8 py-3 md:py-4">Holat</th>
                     <th className="px-5 md:px-8 py-3 md:py-4 text-right">Kvitansiya</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {data?.payments?.map((p: any) => (
                     <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-5 md:px-8 py-4 md:py-5 font-mono text-[8px] md:text-[9px] font-black text-brand-primary">#{p.id.slice(0, 8)}</td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-xs font-black text-brand-depth">{p.date}</td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-sm md:text-base font-black text-brand-depth tracking-tight">{p.amount.toLocaleString()} UZS</td>
                        <td className="px-5 md:px-8 py-4 md:py-5">
                           <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[7px] md:text-[8px] font-black uppercase rounded-md">To'langan</span>
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-right">
                           <button className="p-2 md:p-3 bg-white text-brand-depth hover:bg-brand-primary hover:text-white rounded-lg md:rounded-xl transition-all shadow-sm border border-brand-border group-hover:scale-110">
                              <Download size={14} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
};

