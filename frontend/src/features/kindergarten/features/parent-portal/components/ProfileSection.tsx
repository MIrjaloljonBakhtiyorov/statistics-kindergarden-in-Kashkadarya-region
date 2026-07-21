import React, { useEffect, useState } from 'react';
import { User, MapPin, Smartphone, Briefcase, Fingerprint, Target, Edit2, Save, X, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';

const getAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};

export const ProfileSection = ({ parentData, onUpdate }: any) => {
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local state for form data
  const [formData, setFormData] = useState({
    address: parentData.address || '',
    photo_url: parentData.photo_url || '',
    father: {
      workplace: parentData.fatherWorkplace || '',
      phone: parentData.fatherPhone || '',
      passport_no: parentData.fatherPassport || '',
    },
    mother: {
      workplace: parentData.motherWorkplace || '',
      phone: parentData.motherPhone || '',
      passport_no: parentData.motherPassport || '',
    }
  });

  useEffect(() => {
    setFormData({
      address: parentData.address || '',
      photo_url: parentData.photo_url || '',
      father: {
        workplace: parentData.fatherWorkplace || '',
        phone: parentData.fatherPhone || '',
        passport_no: parentData.fatherPassport || '',
      },
      mother: {
        workplace: parentData.motherWorkplace || '',
        phone: parentData.motherPhone || '',
        passport_no: parentData.motherPassport || '',
      }
    });
  }, [parentData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Use parentData.id which is the child_id in this context
      await apiClient.put(`/parent-portal/profile/${parentData.id}`, formData);
      showNotification("Ma'lumotlar muvaffaqiyatli yangilandi!", "success");
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      showNotification("Saqlashda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setLoading(true);
      const res = await apiClient.post(`/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, photo_url: res.data.url });
      showNotification("Rasm muvaffaqiyatli yuklandi!", "success");
    } catch (err) {
      showNotification("Rasmni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="kg-page space-y-3 md:space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-1">
         <h3 className="text-base md:text-lg font-black text-brand-depth uppercase tracking-tight leading-tight">Profil ma'lumotlari</h3>
         {!isEditing ? (
           <button 
             onClick={() => setIsEditing(true)}
             className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl font-black text-[9px] uppercase tracking-wide hover:bg-brand-primary hover:text-white transition-all"
           >
             <Edit2 size={12} /> Tahrirlash
           </button>
         ) : (
           <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
             <button 
               onClick={() => setIsEditing(false)}
               className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-brand-muted rounded-xl font-black text-[9px] uppercase tracking-wide hover:bg-slate-200 transition-all"
             >
               <X size={12} /> Bekor qilish
             </button>
             <button 
               onClick={handleSave}
               disabled={loading}
               className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-wide hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
             >
               {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={12} />} 
               Saqlash
             </button>
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-5">
        {/* Child Details */}
        <div className="space-y-2.5 md:space-y-3">
          <h4 className="flex items-center gap-2.5 text-[10px] md:text-xs font-black text-brand-depth uppercase tracking-[0.12em] md:tracking-[0.2em] px-1 leading-tight">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
            Bola Ma'lumotlari
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
             {/* Child Photo Section */}
             <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="relative group cursor-pointer" onClick={() => isEditing && document.getElementById('child-photo-upload')?.click()}>
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border-2 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                      {formData.photo_url ? (
                         <img src={getAssetUrl(formData.photo_url)} alt="Bola rasmi" className="w-full h-full object-cover" />
                      ) : (
                         <User size={32} className="text-slate-200" />
                      )}
                      {loading && (
                         <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <div className="w-6 h-6 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                         </div>
                      )}
                   </div>
                   {isEditing && (
                      <div className="absolute inset-0 bg-brand-depth/40 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={20} className="text-white" />
                      </div>
                   )}
                </div>
                {isEditing && (
                   <div className="mt-0">
                      <input 
                         id="child-photo-upload"
                         type="file"
                         accept="image/*"
                         onChange={handleFileChange}
                         className="hidden"
                      />
                      <button 
                        type="button"
                        onClick={() => document.getElementById('child-photo-upload')?.click()}
                        className="px-3 py-1.5 bg-white border border-brand-border rounded-lg font-black text-[9px] uppercase tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                         <Camera size={12} /> Tanlash
                      </button>
                   </div>
                )}
             </div>

             <div className="bg-white p-3 rounded-xl border border-brand-border shadow-sm group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 md:p-4 opacity-[0.03]">
                   <User size={40} className="md:w-[50px] md:h-[50px]" />
                </div>
                <p className="text-[7px] md:text-[8px] font-black text-brand-muted uppercase tracking-wide md:tracking-widest mb-0.5">To'liq ism-familiyasi</p>
                <p className="text-xs md:text-sm font-black text-brand-depth break-words">{parentData.first_name} {parentData.last_name}</p>
             </div>

             <div className="bg-white p-3 rounded-xl border border-brand-border shadow-sm group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 md:p-4 opacity-[0.03]">
                   <Target size={40} className="md:w-[50px] md:h-[50px]" />
                </div>
                <p className="text-[7px] md:text-[8px] font-black text-brand-muted uppercase tracking-wide md:tracking-widest mb-0.5">Guvohnoma raqami</p>
                <p className="text-xs md:text-sm font-black text-brand-depth break-words">{parentData.birth_certificate_number || 'Kiritilmagan'}</p>
             </div>

             <div className={`bg-white p-3 rounded-xl border transition-all ${isEditing ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-brand-border'} shadow-sm group overflow-hidden relative`}>
                <div className="absolute top-0 right-0 p-3 md:p-4 opacity-[0.03]">
                   <MapPin size={40} className="md:w-[50px] md:h-[50px]" />
                </div>
                <p className="text-[7px] md:text-[8px] font-black text-brand-muted uppercase tracking-wide md:tracking-widest mb-0.5">Yashash manzili</p>
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-slate-50 border border-brand-border rounded-lg py-2 px-2.5 text-xs font-bold focus:ring-2 focus:ring-brand-primary/10 outline-none"
                  />
                ) : (
                  <p className="text-xs md:text-sm font-black text-brand-depth break-words">{formData.address || '--'}</p>
                )}
             </div>

             <div className="bg-gradient-to-br from-brand-primary to-brand-primary-dark p-3.5 md:p-4 rounded-xl text-white shadow-lg relative overflow-hidden group">
                <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:scale-110 transition-transform duration-700">
                   <Target size={60} className="md:w-[80px] md:h-[80px]" />
                </div>
                <p className="text-[7px] md:text-[8px] font-black uppercase tracking-wide md:tracking-widest opacity-60 mb-1.5">Hozirgi Guruhi</p>
                <p className="text-base md:text-lg font-black tracking-tight break-words">{parentData.childGroup || 'Guruh biriktirilmagan'}</p>
             </div>
          </div>
        </div>

        {/* Parent Details */}
        <div className="space-y-2.5 md:space-y-3">
          <h4 className="flex items-center gap-2.5 text-[10px] md:text-xs font-black text-brand-depth uppercase tracking-[0.12em] md:tracking-[0.2em] px-1 leading-tight">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
            Ota-ona Ma'lumotlari
          </h4>
          <div className="space-y-2.5 md:space-y-3">
             {/* Father */}
             <div className="bg-white p-3.5 md:p-4 rounded-xl border border-brand-border shadow-sm space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-brand-primary"></div>
                <div className="flex justify-between items-start gap-3 pl-2">
                   <div className="min-w-0">
                      <p className="text-[7px] md:text-[8px] font-black text-brand-primary uppercase tracking-wide md:tracking-widest">Otasi ma'lumotlari</p>
                      <h5 className="text-sm md:text-base font-black text-brand-depth mt-0.5 tracking-tight break-words">{parentData.fatherName || 'Kiritilmagan'}</h5>
                   </div>
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-brand-muted shrink-0"><User size={16} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                   <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Briefcase size={12} className="text-brand-muted md:w-3.5 md:h-3.5" />
                      <div className="flex-1">
                         <p className="text-[6px] md:text-[7px] font-black text-brand-muted uppercase">Ish joyi</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.father.workplace}
                             onChange={(e) => setFormData({...formData, father: {...formData.father, workplace: e.target.value}})}
                             className="w-full bg-white border border-brand-border rounded-md py-1 px-1.5 text-[9px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10"
                           />
                         ) : (
                         <p className="text-[10px] font-bold text-brand-depth break-words">{formData.father.workplace || 'Kiritilmagan'}</p>
                         )}
                      </div>
                   </div>
                   <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Smartphone size={12} className="text-brand-muted md:w-3.5 md:h-3.5" />
                      <div className="flex-1">
                         <p className="text-[6px] md:text-[7px] font-black text-brand-muted uppercase">Telefon</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.father.phone}
                             onChange={(e) => setFormData({...formData, father: {...formData.father, phone: e.target.value}})}
                             className="w-full bg-white border border-brand-border rounded-md py-1 px-1.5 text-[9px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10"
                           />
                         ) : (
                           <p className="text-[10px] font-bold text-brand-depth break-words">{formData.father.phone || '--'}</p>
                         )}
                      </div>
                   </div>
                   <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex items-center gap-2 col-span-1 sm:col-span-2">
                      <Fingerprint size={12} className="text-brand-muted md:w-3.5 md:h-3.5" />
                      <div className="flex-1">
                         <p className="text-[6px] md:text-[7px] font-black text-brand-muted uppercase">Passport</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.father.passport_no}
                             onChange={(e) => setFormData({...formData, father: {...formData.father, passport_no: e.target.value}})}
                             className="w-full bg-white border border-brand-border rounded-md py-1 px-1.5 text-[9px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10 uppercase"
                           />
                         ) : (
                           <p className="text-[9px] md:text-[10px] font-bold text-brand-depth uppercase tracking-wide md:tracking-widest break-words">{formData.father.passport_no || '--'}</p>
                         )}
                      </div>
                   </div>
                </div>
             </div>

             {/* Mother */}
             <div className="bg-white p-3.5 md:p-4 rounded-xl border border-brand-border shadow-sm space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-rose-500"></div>
                <div className="flex justify-between items-start gap-3 pl-2">
                   <div className="min-w-0">
                      <p className="text-[7px] md:text-[8px] font-black text-rose-500 uppercase tracking-wide md:tracking-widest">Onasi ma'lumotlari</p>
                      <h5 className="text-sm md:text-base font-black text-brand-depth mt-0.5 tracking-tight break-words">{parentData.motherName || 'Kiritilmagan'}</h5>
                   </div>
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-brand-muted shrink-0"><User size={16} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                   <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Briefcase size={12} className="text-brand-muted md:w-3.5 md:h-3.5" />
                      <div className="flex-1">
                         <p className="text-[6px] md:text-[7px] font-black text-brand-muted uppercase">Ish joyi</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.mother.workplace}
                             onChange={(e) => setFormData({...formData, mother: {...formData.mother, workplace: e.target.value}})}
                             className="w-full bg-white border border-brand-border rounded-md py-1 px-1.5 text-[9px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10"
                           />
                         ) : (
                           <p className="text-[10px] font-bold text-brand-depth break-words">{formData.mother.workplace || 'Kiritilmagan'}</p>
                         )}
                      </div>
                   </div>
                   <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Smartphone size={12} className="text-brand-muted md:w-3.5 md:h-3.5" />
                      <div className="flex-1">
                         <p className="text-[6px] md:text-[7px] font-black text-brand-muted uppercase">Telefon</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.mother.phone}
                             onChange={(e) => setFormData({...formData, mother: {...formData.mother, phone: e.target.value}})}
                             className="w-full bg-white border border-brand-border rounded-md py-1 px-1.5 text-[9px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10"
                           />
                         ) : (
                           <p className="text-[10px] font-bold text-brand-depth break-words">{formData.mother.phone || '--'}</p>
                         )}
                      </div>
                   </div>
                   <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 flex items-center gap-2 col-span-1 sm:col-span-2">
                      <Fingerprint size={12} className="text-brand-muted md:w-3.5 md:h-3.5" />
                      <div className="flex-1">
                         <p className="text-[6px] md:text-[7px] font-black text-brand-muted uppercase">Passport</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.mother.passport_no}
                             onChange={(e) => setFormData({...formData, mother: {...formData.mother, passport_no: e.target.value}})}
                             className="w-full bg-white border border-brand-border rounded-md py-1 px-1.5 text-[9px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10 uppercase"
                           />
                         ) : (
                           <p className="text-[9px] md:text-[10px] font-bold text-brand-depth uppercase tracking-wide md:tracking-widest break-words">{formData.mother.passport_no || '--'}</p>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

