import React, { useEffect, useState } from 'react';
import { Briefcase, Edit2, Fingerprint, Save, Smartphone, User, Users, X } from 'lucide-react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';

const emptyParentForm = {
  father: {
    full_name: '',
    workplace: '',
    phone: '',
    passport_no: '',
  },
  mother: {
    full_name: '',
    workplace: '',
    phone: '',
    passport_no: '',
  },
};

type ParentFormKey = 'full_name' | 'workplace' | 'phone' | 'passport_no';
type ParentFormData = Record<ParentFormKey, string>;

const ParentInfoCard = ({
  title,
  tone,
  data,
  isEditing,
  onChange,
}: {
  title: string;
  tone: 'sky' | 'emerald';
  data: ParentFormData;
  isEditing: boolean;
  onChange: (field: ParentFormKey, value: string) => void;
}) => {
  const accent = tone === 'sky'
    ? {
        line: 'from-sky-500 to-cyan-400',
        badge: 'bg-sky-50 text-sky-700 border-sky-100',
        icon: 'bg-sky-50 text-sky-600 border-sky-100',
      }
    : {
        line: 'from-emerald-500 to-teal-400',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        icon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      };

  const fieldClass = 'w-full rounded-xl border border-brand-border bg-slate-50 px-3 py-2 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-sky-100';
  const filledCount = [data.full_name, data.phone, data.workplace, data.passport_no].filter(Boolean).length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-white p-4 shadow-sm md:p-5">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent.line}`} />
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${accent.badge}`}>{title}</span>
          {isEditing ? (
            <input
              value={data.full_name}
              onChange={(e) => onChange('full_name', e.target.value)}
              className={`${fieldClass} mt-2 text-[18px] font-extrabold`}
              placeholder={`${title} F.I.Sh.`}
            />
          ) : (
            <h5 className="mt-2 text-[22px] font-extrabold leading-tight text-brand-depth break-words">{data.full_name || 'Kiritilmagan'}</h5>
          )}
          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-muted">
            {filledCount}/4 ta ma'lumot to'ldirilgan
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accent.icon}`}>
          <User size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500">
            <Briefcase size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-brand-muted">Ish joyi</p>
            {isEditing ? (
              <input value={data.workplace} onChange={(e) => onChange('workplace', e.target.value)} className={fieldClass} />
            ) : (
              <p className="mt-1 text-[15px] font-bold leading-snug text-brand-depth break-words">{data.workplace || 'Kiritilmagan'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500">
            <Smartphone size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-brand-muted">Telefon</p>
            {isEditing ? (
              <input type="tel" value={data.phone} onChange={(e) => onChange('phone', e.target.value)} className={fieldClass} placeholder="+998" />
            ) : (
              <p className="mt-1 text-[15px] font-bold leading-snug text-brand-depth break-words">{data.phone || '--'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-500">
            <Fingerprint size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-brand-muted">Passport</p>
            {isEditing ? (
              <input value={data.passport_no} onChange={(e) => onChange('passport_no', e.target.value.toUpperCase())} className={`${fieldClass} uppercase`} placeholder="AA1234567" />
            ) : (
              <p className="mt-1 text-[15px] font-bold uppercase leading-snug text-brand-depth break-words">{data.passport_no || '--'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ParentProfileSection = ({ parentData, onUpdate }: any) => {
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyParentForm);

  useEffect(() => {
    setFormData({
      father: {
        full_name: parentData.fatherName || '',
        workplace: parentData.fatherWorkplace || '',
        phone: parentData.fatherPhone || '',
        passport_no: parentData.fatherPassport || '',
      },
      mother: {
        full_name: parentData.motherName || '',
        workplace: parentData.motherWorkplace || '',
        phone: parentData.motherPhone || '',
        passport_no: parentData.motherPassport || '',
      },
    });
  }, [parentData]);

  const updateParentField = (parent: 'father' | 'mother', field: ParentFormKey, value: string) => {
    setFormData((current) => ({
      ...current,
      [parent]: {
        ...current[parent],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/parent-portal/profile/${parentData.id}`, {
        address: parentData.address || '',
        photo_url: parentData.photo_url || '',
        father: formData.father,
        mother: formData.mother,
      });
      showNotification("Ota-ona ma'lumotlari yangilandi!", 'success');
      setIsEditing(false);
      onUpdate?.();
    } catch (err) {
      console.error(err);
      showNotification("Saqlashda xatolik yuz berdi", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kg-page kg-parent-section space-y-4 pb-4 sm:space-y-5">
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[22px] font-extrabold leading-tight text-brand-depth md:text-[26px]">Ota-ona profili</h3>
          <p className="mt-1.5 text-[12px] font-medium text-brand-muted md:text-[13px]">Otasi va onasi ma'lumotlari alohida panelda</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="kg-parent-edit-action flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-50 px-4 py-2.5 text-[12px] font-bold text-sky-700 transition-all hover:bg-sky-500 hover:text-white sm:w-auto"
          >
            <Edit2 size={13} /> <span>Tahrirlash</span>
          </button>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="kg-parent-secondary-action flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-[12px] font-bold text-brand-muted transition-all hover:bg-slate-200"
            >
              <X size={13} /> Bekor qilish
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={13} />}
              Saqlash
            </button>
          </div>
        )}
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-brand-border bg-gradient-to-r from-white via-sky-50/40 to-emerald-50/40 p-4 shadow-sm md:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-600">
            <Users size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-600">Oila ma'lumotlari</p>
            <h4 className="mt-1 text-[18px] font-extrabold leading-tight text-brand-depth break-words">
              {parentData.first_name} {parentData.last_name} uchun biriktirilgan ota-ona profili
            </h4>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ParentInfoCard
          title="Otasi"
          tone="sky"
          data={formData.father}
          isEditing={isEditing}
          onChange={(field, value) => updateParentField('father', field, value)}
        />
        <ParentInfoCard
          title="Onasi"
          tone="emerald"
          data={formData.mother}
          isEditing={isEditing}
          onChange={(field, value) => updateParentField('mother', field, value)}
        />
      </div>
    </div>
  );
};
