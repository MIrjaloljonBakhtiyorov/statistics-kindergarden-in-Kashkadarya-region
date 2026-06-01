import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Smartphone, Trash2, Contact, X, Save, Camera, ShieldAlert, UserPlus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '@/shared/api';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';


const RELATIONS = [
  'Bobosi', 'Buvisi', 'Amakisi', 'Tog\'asi', 'Ammasi', 'Xolasi', 
  'Akasi', 'Opasi', 'Otasi', 'Onasi'
];

export const PickupSection = ({ data, onUpdate }: any) => {
  const { user } = useAuth();
  const { showNotification, confirm } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    relation: 'Bobosi',
    phone: '',
    photo_url: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.childId) return;
    
    setIsSaving(true);
    try {
      await apiClient.post(`/parent-portal/pickups`, {
        ...formData,
        child_id: user.childId
      });
      showNotification('Yangi vakil qo\'shildi', 'success');
      setShowModal(false);
      setFormData({ full_name: '', relation: 'Bobosi', phone: '', photo_url: '' });
      if (onUpdate) onUpdate();
    } catch (error) {
      showNotification('Xatolik yuz berdi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm('Ushbu vakilni o\'chirishni xohlaysizmi?');
    if (!ok) return;
    
    try {
      await apiClient.delete(`/parent-portal/pickups/${id}`);
      showNotification('Vakil o\'chirildi', 'success');
      if (onUpdate) onUpdate();
    } catch (error) {
      showNotification('O\'chirishda xatolik', 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
       {/* High Security Header */}
       <div className="bg-brand-depth p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex items-center gap-4">
             <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center shadow-lg shrink-0 group">
                <ShieldCheck size={24} md:size={28} className="text-brand-primary group-hover:scale-110 transition-transform duration-500" />
             </div>
             <div className="text-left">
                <h4 className="text-xl md:text-2xl font-black tracking-tight uppercase leading-tight italic">Xavfsiz Olib <br/> Ketish Tizimi</h4>
                <p className="text-white/40 text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                   <ShieldAlert size={12} className="text-emerald-500" /> Faqat ruxsat etilgan shaxslar
                </p>
             </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="relative z-10 w-full md:w-auto px-8 py-4 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-dark transition-all flex items-center justify-center gap-2.5 active:scale-95 group"
          >
             <UserPlus size={16} /> Yangi vakil qo'shish
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {data?.pickups?.map((v:any, idx: number) => (
             <motion.div 
               key={v.id} 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-brand-border shadow-sm flex flex-col sm:flex-row items-center gap-6 md:gap-8 text-center sm:text-left hover:border-brand-primary transition-all group relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                   <UserCheck size={80} />
                </div>

                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl bg-slate-50 border-2 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 relative z-10 group-hover:scale-105 transition-all">
                   {v.photo_url ? (
                      <img src={v.photo_url} alt={v.full_name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="text-slate-200 flex flex-col items-center">
                         <Contact size={40} md:size={56} className="opacity-20" />
                         <p className="text-[7px] font-black mt-1 uppercase tracking-widest">Surat yo'q</p>
                      </div>
                   )}
                </div>
                
                <div className="flex-1 space-y-3 md:space-y-4 relative z-10">
                   <div className="space-y-0.5">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                         <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[7px] md:text-[8px] font-black uppercase tracking-widest rounded-md border border-brand-primary/20">{v.relation}</span>
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-brand-depth tracking-tight leading-none group-hover:text-brand-primary transition-colors">{v.full_name}</p>
                   </div>
                   
                   <div className="space-y-1.5">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm font-black text-brand-depth">
                         <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-brand-muted"><Smartphone size={14} /></div>
                         {v.phone}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-[8px] md:text-[9px] font-bold text-brand-muted uppercase tracking-widest">
                         <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-brand-muted"><ShieldCheck size={14} /></div>
                         Ruxsat: 08:00 - 18:30
                      </div>
                   </div>

                   <div className="pt-2 flex justify-center sm:justify-start">
                      <button 
                        onClick={() => handleDelete(v.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-500 rounded-lg font-black text-[9px] uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                         <Trash2 size={12} /> O'chirish
                      </button>
                   </div>
                </div>
             </motion.div>
          ))}
          {(!data?.pickups || data.pickups.length === 0) && (
            <div className="lg:col-span-2 py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                  <UserCheck size={32} />
               </div>
               <h5 className="text-lg font-black text-brand-depth uppercase tracking-tight">Vakillar qo'shilmagan</h5>
               <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-widest px-8 max-w-sm">Ruxsat berilgan shaxslar ro'yxatini shakllantiring.</p>
            </div>
          )}
       </div>

       {/* Security Notice */}
       <div className="bg-amber-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-amber-100 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-amber-500 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-amber-100">
             <Info size={24} />
          </div>
          <div className="space-y-0.5">
             <p className="text-[9px] md:text-[10px] font-black text-amber-900 uppercase tracking-widest">Xavfsizlik ogohlantirishi</p>
             <p className="text-[9px] md:text-[10px] font-bold text-amber-800/70 leading-relaxed uppercase tracking-widest">
                Vakillarni qo'shishda hujjatlar to'g'riligiga ishonch hosil qiling. Bog'cha ma'muriyati tekshirish huquqini saqlab qoladi.
             </p>
          </div>
       </div>

       {/* Add Representative Modal */}
       <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setShowModal(false)}
                 className="absolute inset-0 bg-black/20 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 50 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 50 }}
                 className="relative w-full max-w-lg bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden"
               >
                  <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg">
                           <UserPlus size={20} />
                        </div>
                        <div>
                           <h3 className="text-lg md:text-xl font-black text-brand-depth uppercase tracking-tight">Yangi vakil</h3>
                           <p className="text-brand-muted text-[8px] font-black uppercase tracking-widest mt-1">Xavfsizlikni ta'minlang</p>
                        </div>
                     </div>
                     <button onClick={() => setShowModal(false)} className="p-2 bg-white border border-slate-100 rounded-xl text-brand-muted hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleAdd} className="p-6 md:p-8 space-y-6">
                     <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-brand-depth uppercase tracking-widest px-2">To'liq ism-familiya</label>
                           <input 
                             required
                             type="text" 
                             value={formData.full_name}
                             onChange={e => setFormData({...formData, full_name: e.target.value})}
                             placeholder="Ism va familiya"
                             className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl outline-none font-bold text-sm transition-all shadow-inner"
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-brand-depth uppercase tracking-widest px-2">Bog'liqlik</label>
                           <select 
                             value={formData.relation}
                             onChange={e => setFormData({...formData, relation: e.target.value})}
                             className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl outline-none font-bold text-sm transition-all appearance-none shadow-inner"
                           >
                              {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-brand-depth uppercase tracking-widest px-2">Telefon</label>
                           <input 
                             required
                             type="tel" 
                             value={formData.phone}
                             onChange={e => setFormData({...formData, phone: e.target.value})}
                             placeholder="+998 -- --- -- --"
                             className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-brand-primary focus:bg-white rounded-xl outline-none font-bold text-sm transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     <div className="pt-2">
                        <button 
                          disabled={isSaving}
                          className="w-full py-5 bg-brand-depth text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-brand-primary active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {isSaving ? (
                              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                           ) : (
                              <>
                                 <Save size={18} /> Saqlash
                              </>
                           )}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
          )}
       </AnimatePresence>
    </motion.div>
  );
};



