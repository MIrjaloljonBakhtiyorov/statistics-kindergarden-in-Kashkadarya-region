import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Smartphone, Trash2, Contact, Save, UserPlus, Info, X } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient } from '@/shared/api';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

const RELATIONS = [
  'Bobosi', 'Buvisi', 'Amakisi', "Tog'asi", 'Ammasi', 'Xolasi',
  'Akasi', 'Opasi', 'Otasi', 'Onasi',
];

const initialForm = {
  full_name: '',
  relation: 'Bobosi',
  phone: '',
  photo_url: '',
};

export const PickupSection = ({ data, onUpdate }: any) => {
  const { user } = useAuth();
  const { showNotification, confirm } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const resetForm = () => {
    setFormData(initialForm);
    setShowForm(false);
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.childId) return;

    const fullName = formData.full_name.trim();
    const phone = formData.phone.trim();

    if (!fullName || !phone) {
      showNotification("Ism-familiya va telefon raqamni kiriting", 'error');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.post('/parent-portal/pickups', {
        ...formData,
        full_name: fullName,
        phone,
        child_id: user.childId,
      });
      showNotification("Yangi vakil qo'shildi", 'success');
      resetForm();
      onUpdate?.();
    } catch (error: any) {
      showNotification(error?.response?.data?.error || 'Xatolik yuz berdi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm("Ushbu vakilni o'chirishni xohlaysizmi?");
    if (!ok) return;

    try {
      await apiClient.delete(`/parent-portal/pickups/${id}`);
      showNotification("Vakil o'chirildi", 'success');
      onUpdate?.();
    } catch (error: any) {
      showNotification(error?.response?.data?.error || "O'chirishda xatolik", 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAdd}
          className="rounded-[1.35rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/30 ring-1 ring-rose-50 md:p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <UserPlus size={20} />
            </div>
            <div>
              <h5 className="text-base font-black uppercase tracking-tight text-slate-950">Yangi vakil</h5>
              <p className="text-[9px] font-black uppercase tracking-widest text-rose-500">Ma'lumotlarni shu yerda kiriting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <label className="px-1 text-[9px] font-black uppercase tracking-widest text-slate-700">To'liq ism-familiya</label>
              <input
                required
                type="text"
                value={formData.full_name}
                onChange={(event) => setFormData({ ...formData, full_name: event.target.value })}
                placeholder="Ism va familiya"
                className="h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/60 px-4 text-sm font-bold text-slate-950 outline-none transition-all focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100/70"
              />
            </div>

            <div className="space-y-2">
              <label className="px-1 text-[9px] font-black uppercase tracking-widest text-slate-700">Bog'liqlik</label>
              <select
                value={formData.relation}
                onChange={(event) => setFormData({ ...formData, relation: event.target.value })}
                className="h-12 w-full appearance-none rounded-2xl border border-rose-100 bg-rose-50/60 px-4 text-sm font-bold text-slate-950 outline-none transition-all focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100/70"
              >
                {RELATIONS.map((relation) => <option key={relation} value={relation}>{relation}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="px-1 text-[9px] font-black uppercase tracking-widest text-slate-700">Telefon</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                placeholder="+998 -- --- -- --"
                className="h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/60 px-4 text-sm font-bold text-slate-950 outline-none transition-all focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100/70"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="rounded-2xl border border-rose-100 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save size={16} />}
              Saqlash
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data?.pickups?.map((v: any, idx: number) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.06 }}
            className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-[1.35rem] border border-rose-100 bg-white p-4 text-center shadow-sm transition-all hover:border-rose-200 hover:shadow-md sm:flex-row sm:text-left md:p-5"
          >
            <div className="absolute -bottom-4 -right-4 text-rose-500 opacity-[0.04] transition-transform duration-700 group-hover:scale-110">
              <UserCheck size={110} />
            </div>

            <div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-rose-100 bg-rose-50 shadow-sm transition-all group-hover:scale-105">
              {v.photo_url ? (
                <img src={v.photo_url} alt={v.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-rose-200">
                  <Contact size={32} />
                  <p className="mt-1 text-[7px] font-black uppercase tracking-widest">Surat yo'q</p>
                </div>
              )}
            </div>

            <div className="relative z-10 flex-1 space-y-3">
              <div className="space-y-1">
                <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-rose-600">{v.relation}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                </div>
                <p className="text-lg font-extrabold leading-tight tracking-tight text-slate-950 transition-colors group-hover:text-rose-600 md:text-xl">{v.full_name}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-800 sm:justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500"><Smartphone size={14} /></div>
                  {v.phone}
                </div>
                <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest text-rose-500 sm:justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500"><ShieldCheck size={14} /></div>
                  Ruxsat: 08:00 - 18:30
                </div>
              </div>

              <button
                onClick={() => handleDelete(v.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-500 hover:text-white active:scale-95 sm:justify-start"
              >
                <Trash2 size={12} /> O'chirish
              </button>
            </div>
          </motion.div>
        ))}

        {(!data?.pickups || data.pickups.length === 0) && (
          <div className="relative overflow-hidden rounded-[1.35rem] border border-rose-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-100/60" />
            <div className="relative z-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h5 className="text-base font-extrabold uppercase tracking-tight text-slate-950 md:text-lg">Yaqin qarindoshlarimni qo'shish</h5>
                  <p className="mt-1 max-w-lg text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-slate-500">Farzandingizni olib ketishga ruxsat berilgan shaxslarni shu yerdan qo'shing.</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] md:w-auto"
              >
                <UserPlus size={16} /> Vakil qo'shish
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-[1.35rem] border border-rose-100 bg-rose-50/70 p-4 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500">
          <Info size={18} />
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-rose-900">Xavfsizlik ogohlantirishi</p>
          <p className="text-[10px] font-bold uppercase leading-relaxed tracking-wide text-rose-800/70">
            Vakillarni qo'shishda hujjatlar to'g'riligiga ishonch hosil qiling. Bog'cha ma'muriyati tekshirish huquqini saqlab qoladi.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
