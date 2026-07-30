import React, { useEffect, useState } from 'react';
import { User, MapPin, Smartphone, Briefcase, Fingerprint, Target, Edit2, Save, X, Camera, FileText, School, Users, CheckCircle2 } from 'lucide-react';
import { apiClient, PARENT_PORTAL_API_BASE_URL } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';

const getAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const apiBase = PARENT_PORTAL_API_BASE_URL || '';
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
    <div className="kg-page kg-parent-section kg-profile-typography space-y-4 pb-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-1">
         <div>
           <h3 className="text-[22px] md:text-[26px] font-extrabold text-brand-depth tracking-normal leading-[1.08]">Profil ma'lumotlari</h3>
           <p className="mt-1.5 text-[12px] md:text-[13px] font-medium tracking-normal text-brand-muted">Barcha ma'lumotlar ketma-ket ko'rinishda</p>
         </div>
         {!isEditing ? (
           <button 
             onClick={() => setIsEditing(true)}
             className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-2xl font-bold text-[12px] hover:bg-rose-500 hover:text-white transition-all"
           >
             <Edit2 size={12} /> Tahrirlash
           </button>
         ) : (
           <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
             <button 
               onClick={() => setIsEditing(false)}
               className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-brand-muted rounded-2xl font-bold text-[12px] hover:bg-slate-200 transition-all"
             >
               <X size={12} /> Bekor qilish
             </button>
             <button 
               onClick={handleSave}
               disabled={loading}
               className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-2xl font-bold text-[12px] hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
             >
               {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div> : <Save size={12} />}
               Saqlash
             </button>
           </div>
         )}
      </div>

      <div className="space-y-5">
        {/* Child Details */}
        <section className="relative overflow-hidden rounded-3xl border border-brand-border bg-white p-4 shadow-sm md:p-5">
          <div className="absolute inset-y-0 left-0 w-1 bg-rose-500"></div>
          <div className="mb-4 flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <User size={16} />
            </span>
            <div>
              <h4 className="text-[16px] md:text-[18px] font-extrabold text-brand-depth tracking-normal leading-tight">Bola ma'lumotlari</h4>
              <p className="mt-1 text-[12px] md:text-[13px] font-medium tracking-normal text-brand-muted">Asosiy profil va guruh</p>
            </div>
          </div>

          <div className="space-y-3">
             <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-4 rounded-3xl border border-rose-100 bg-gradient-to-r from-white via-rose-50/60 to-pink-50/70 p-4 shadow-sm overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-60">
                  <div className="absolute right-6 top-5 h-20 w-20 rounded-full border border-rose-200/70"></div>
                  <div className="absolute right-14 bottom-4 h-12 w-12 rounded-full bg-pink-100/60"></div>
                  <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
                </div>
                <div className="relative group cursor-pointer shrink-0" onClick={() => isEditing && document.getElementById('child-photo-upload')?.click()}>
                   <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-50 border-2 border-white shadow-lg shadow-slate-200/70 overflow-hidden flex items-center justify-center relative">
                      {formData.photo_url ? (
                         <img src={getAssetUrl(formData.photo_url)} alt="Bola rasmi" className="w-full h-full object-cover" />
                      ) : (
                         <User size={30} className="text-slate-300" />
                      )}
                      {loading && (
                         <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <div className="w-6 h-6 border-3 border-rose-500 border-t-transparent rounded-full"></div>
                         </div>
                      )}
                   </div>
                   {isEditing && (
                      <div className="absolute inset-0 bg-brand-depth/40 flex items-center justify-center rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={20} className="text-white" />
                      </div>
                   )}
                </div>
                <div className="relative w-full min-w-0 flex-1 text-center sm:text-left">
                   <p className="text-[12px] font-bold text-rose-500 mb-1">Bola profili</p>
                   <h5 className="text-[23px] md:text-[28px] font-extrabold text-brand-depth leading-[1.08] break-words">{parentData.first_name} {parentData.last_name}</h5>
                   <p className="text-[14px] md:text-[15px] font-semibold text-brand-muted mt-1.5 break-words">{parentData.childGroup || 'Guruh biriktirilmagan'}</p>
                   <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                     <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[12px] font-bold text-rose-700">
                       <Users size={13} /> {parentData.childGroup || 'Guruh yo\'q'}
                     </span>
                     <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-[12px] font-bold text-pink-700">
                       <CheckCircle2 size={13} /> Faol profil
                     </span>
                     <span className="inline-flex w-full min-w-0 max-w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[12px] font-bold text-brand-muted sm:w-auto sm:justify-start">
                       <School size={13} className="shrink-0" />
                       <span className="min-w-0 truncate">{parentData.kindergartenName || 'Bog\'cha biriktirilgan'}</span>
                     </span>
                   </div>
                </div>
                {isEditing && (
                   <div className="mt-0 shrink-0">
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
                        className="px-3 py-2 bg-white border border-brand-border rounded-2xl font-bold text-[12px] hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                         <Camera size={12} /> Tanlash
                      </button>
                   </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
               <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-sm group overflow-hidden relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                     <User size={18} />
                  </div>
                  <p className="text-[12px] font-semibold text-brand-muted mb-2">To'liq ism-familiyasi</p>
                  <p className="text-[17px] md:text-[18px] font-extrabold text-brand-depth leading-snug break-words">{parentData.first_name} {parentData.last_name}</p>
               </div>

               <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-sm group overflow-hidden relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                     <FileText size={18} />
                  </div>
                  <p className="text-[12px] font-semibold text-brand-muted mb-2">Guvohnoma raqami</p>
                  <p className="text-[17px] md:text-[18px] font-extrabold text-brand-depth leading-snug break-words">{parentData.birth_certificate_number || 'Kiritilmagan'}</p>
               </div>

               <div className={`bg-white p-4 rounded-3xl border transition-all ${isEditing ? 'border-rose-300 ring-4 ring-rose-100/80' : 'border-brand-border'} shadow-sm group overflow-hidden relative xl:col-span-1`}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                     <MapPin size={18} />
                  </div>
                  <p className="text-[12px] font-semibold text-brand-muted mb-2">Yashash manzili</p>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-slate-50 border border-brand-border rounded-xl py-2 px-3 text-[15px] font-semibold focus:ring-2 focus:ring-rose-100 outline-none"
                    />
                  ) : (
                    <p className="text-[16px] md:text-[17px] font-extrabold text-brand-depth leading-snug break-words">{formData.address || '--'}</p>
                  )}
               </div>

               <div className="bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500 p-4 rounded-3xl text-white shadow-lg shadow-pink-500/20 relative overflow-hidden group">
                  <div className="absolute -left-8 -top-10 h-24 w-24 rounded-full bg-white/15 blur-2xl"></div>
                  <div className="absolute right-5 top-5 h-16 w-16 rounded-full border border-white/20"></div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/18 text-white border border-white/25 shadow-sm">
                     <Target size={18} />
                  </div>
                  <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                     <Target size={78} />
                  </div>
                  <p className="text-[12px] font-semibold opacity-85 mb-2">Hozirgi guruhi</p>
                  <p className="text-[20px] md:text-[22px] font-extrabold leading-tight break-words">{parentData.childGroup || 'Guruh biriktirilmagan'}</p>
               </div>
             </div>
          </div>
        </section>

        {/* Parent Details */}
        <section className="relative overflow-hidden rounded-3xl border border-brand-border bg-white p-4 shadow-sm md:p-5">
          <div className="absolute inset-y-0 left-0 w-1 bg-rose-500"></div>
          <div className="mb-4 flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Fingerprint size={16} />
            </span>
            <div>
              <h4 className="text-[16px] md:text-[18px] font-extrabold text-brand-depth tracking-normal leading-tight">Ota-ona ma'lumotlari</h4>
              <p className="mt-1 text-[12px] md:text-[13px] font-medium tracking-normal text-brand-muted">Otasi va onasi ketma-ket</p>
            </div>
          </div>
          <div className="space-y-3">
             {/* Father */}
             <div className="bg-gradient-to-br from-white via-pink-50/35 to-white p-4 md:p-5 rounded-3xl border border-pink-100 shadow-sm space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 to-rose-400"></div>
                <div className="flex justify-between items-start gap-3 pt-1">
                   <div className="min-w-0">
                      <span className="mb-2 inline-flex rounded-full bg-pink-100 px-3 py-1 text-[11px] font-bold text-pink-700">Otasi</span>
                      <h5 className="text-[20px] md:text-[22px] font-extrabold text-brand-depth mt-1 leading-tight break-words">{parentData.fatherName || 'Kiritilmagan'}</h5>
                   </div>
                   <div className="w-11 h-11 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700 shrink-0 border border-pink-200"><User size={18} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                   <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
                        <Briefcase size={14} className="text-pink-600" />
                      </span>
                      <div className="flex-1">
                         <p className="text-[12px] font-semibold text-brand-muted">Ish joyi</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.father.workplace}
                             onChange={(e) => setFormData({...formData, father: {...formData.father, workplace: e.target.value}})}
                             className="w-full bg-slate-50 border border-brand-border rounded-lg py-1.5 px-2 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-rose-100"
                           />
                         ) : (
                         <p className="text-[15px] font-bold text-brand-depth leading-snug break-words">{formData.father.workplace || 'Kiritilmagan'}</p>
                         )}
                      </div>
                   </div>
                   <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        <Smartphone size={14} className="text-sky-600" />
                      </span>
                      <div className="flex-1">
                         <p className="text-[12px] font-semibold text-brand-muted">Telefon</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.father.phone}
                             onChange={(e) => setFormData({...formData, father: {...formData.father, phone: e.target.value}})}
                             className="w-full bg-slate-50 border border-brand-border rounded-lg py-1.5 px-2 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-rose-100"
                           />
                         ) : (
                           <p className="text-[15px] font-bold text-brand-depth leading-snug break-words">{formData.father.phone || '--'}</p>
                         )}
                      </div>
                   </div>
                   <div className="flex items-start gap-2.5 col-span-1 sm:col-span-2 pt-2 border-t border-slate-100">
                      <span className="w-8 h-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <Fingerprint size={14} className="text-indigo-600" />
                      </span>
                      <div className="flex-1">
                         <p className="text-[12px] font-semibold text-brand-muted">Passport</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.father.passport_no}
                             onChange={(e) => setFormData({...formData, father: {...formData.father, passport_no: e.target.value}})}
                             className="w-full bg-slate-50 border border-brand-border rounded-lg py-1.5 px-2 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-rose-100 uppercase"
                           />
                         ) : (
                           <p className="text-[15px] font-bold text-brand-depth uppercase leading-snug break-words">{formData.father.passport_no || '--'}</p>
                         )}
                      </div>
                   </div>
                </div>
             </div>

             {/* Mother */}
             <div className="bg-gradient-to-br from-white via-rose-50/35 to-white p-4 md:p-5 rounded-3xl border border-rose-100 shadow-sm space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-pink-400"></div>
                <div className="flex justify-between items-start gap-3 pt-1">
                   <div className="min-w-0">
                      <span className="mb-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700">Onasi</span>
                      <h5 className="text-[20px] md:text-[22px] font-extrabold text-brand-depth mt-1 leading-tight break-words">{parentData.motherName || 'Kiritilmagan'}</h5>
                   </div>
                   <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 border border-rose-200"><User size={18} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                   <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <Briefcase size={14} className="text-rose-600" />
                      </span>
                      <div className="flex-1">
                         <p className="text-[12px] font-semibold text-brand-muted">Ish joyi</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.mother.workplace}
                             onChange={(e) => setFormData({...formData, mother: {...formData.mother, workplace: e.target.value}})}
                             className="w-full bg-slate-50 border border-brand-border rounded-lg py-1.5 px-2 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-rose-100"
                           />
                         ) : (
                           <p className="text-[15px] font-bold text-brand-depth leading-snug break-words">{formData.mother.workplace || 'Kiritilmagan'}</p>
                         )}
                      </div>
                   </div>
                   <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        <Smartphone size={14} className="text-sky-600" />
                      </span>
                      <div className="flex-1">
                         <p className="text-[12px] font-semibold text-brand-muted">Telefon</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.mother.phone}
                             onChange={(e) => setFormData({...formData, mother: {...formData.mother, phone: e.target.value}})}
                             className="w-full bg-slate-50 border border-brand-border rounded-lg py-1.5 px-2 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-rose-100"
                           />
                         ) : (
                           <p className="text-[15px] font-bold text-brand-depth leading-snug break-words">{formData.mother.phone || '--'}</p>
                         )}
                      </div>
                   </div>
                   <div className="flex items-start gap-2.5 col-span-1 sm:col-span-2 pt-2 border-t border-slate-100">
                      <span className="w-8 h-8 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <Fingerprint size={14} className="text-indigo-600" />
                      </span>
                      <div className="flex-1">
                         <p className="text-[12px] font-semibold text-brand-muted">Passport</p>
                         {isEditing ? (
                           <input 
                             type="text"
                             value={formData.mother.passport_no}
                             onChange={(e) => setFormData({...formData, mother: {...formData.mother, passport_no: e.target.value}})}
                             className="w-full bg-slate-50 border border-brand-border rounded-lg py-1.5 px-2 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-rose-100 uppercase"
                           />
                         ) : (
                           <p className="text-[15px] font-bold text-brand-depth uppercase leading-snug break-words">{formData.mother.passport_no || '--'}</p>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

