import React, { useState } from 'react';
import {
  X, Building2, Home, Users, Briefcase, Building,
  Phone, Mail, FileText, MapPin, User, Clock,
  ChevronRight, ChevronLeft, Check, Pencil, CheckCircle2,
} from 'lucide-react';
import { BogchaFormData, defaultFormData } from '../types/bogcha.types';

interface Props {
  onClose: () => void;
}

const DISTRICTS = [
  'Qarshi sh.', 'Shahrisabz sh.', 'Qarshi t.', 'Shahrisabz t.',
  'Kitob t.', 'Koson t.', 'Muborak t.', "G'uzor t.",
  'Nishon t.', 'Dehqonobod t.', 'Qamashi t.', 'Chiroqchi t.',
  'Kasbi t.', 'Mirishkor t.', "Yakkabog' t.", "Ko'kdala t.",
];

const STEP_LABELS = [
  'Turi', 'Asosiy', 'Manzil', 'Direktor',
  'Xodimlar', 'Guruhlar', 'Taomnoma', 'Tasdiqlash',
];

const BOGCHA_TURLARI = [
  { id: 'DAVLAT', label: 'Davlat MTT', icon: Building2, color: '#1565C0', bg: '#EFF6FF' },
  { id: 'NODAVLAT', label: 'Nodavlat (Xususiy)', icon: Home, color: '#6D28D9', bg: '#F5F3FF' },
  { id: 'OILAVIY', label: 'Oilaviy MTT', icon: Users, color: '#065F46', bg: '#ECFDF5' },
  { id: 'DAVLAT_XUSUSIY', label: 'Davlat-xususiy sheriklik', icon: Building, color: '#C2410C', bg: '#FFF7ED' },
  { id: 'TASHKILOT', label: 'Tashkilotga qarashli', icon: Briefcase, color: '#374151', bg: '#F9FAFB' },
];

const Counter = ({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold hover:border-[#003580] hover:text-[#003580] transition-all"
    >−</button>
    <span className="w-12 text-center text-xl font-black text-[#003580]">{value}</span>
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      className="w-9 h-9 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold hover:border-[#003580] hover:text-[#003580] transition-all"
    >+</button>
  </div>
);

const Field = ({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      {Icon && <Icon size={12} />}{label}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/10 focus:border-[#003580] transition-all";

const BogchaCreateWizard: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BogchaFormData>(defaultFormData);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof BogchaFormData, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2500);
  };

  const turiLabel = BOGCHA_TURLARI.find(t => t.id === form.turi)?.label ?? '—';

  const summaryGroups = [
    {
      step: 1, title: 'Bogcha turi',
      rows: [['Tur', turiLabel]],
    },
    {
      step: 2, title: 'Asosiy ma\'lumotlar',
      rows: [['Nomi', form.nomi], ['Telefon', form.telefon], ['Email', form.email], ['Litsenziya', form.litsenziya]],
    },
    {
      step: 3, title: 'Manzil',
      rows: [['Tuman', form.tuman], ['Mahalla', form.mahalla], ['Ko\'cha/Uy', form.manzil], ['Mo\'ljal', form.orientir]],
    },
    {
      step: 4, title: 'Direktor',
      rows: [['Ismi', form.direktorIsmi], ['Telefon', form.direktorTelefon], ['Pasport', form.direktorPassport], ['Tajriba', form.direktorTajriba]],
    },
    {
      step: 5, title: 'Xodimlar',
      rows: [
        ['Tarbiyachilar', `${form.tarbiyachiSoni} nafar`],
        ['Hamshiralar', `${form.hamshiraSoni} nafar`],
        ['Oshpazlar', `${form.oshpazSoni} nafar`],
        ['Jami', `${form.tarbiyachiSoni + form.hamshiraSoni + form.oshpazSoni + form.boshqaXodimlar} nafar`],
      ],
    },
    {
      step: 6, title: 'Guruhlar',
      rows: [['Guruhlar soni', `${form.guruhlarSoni} ta`], ['Bolalar jami', `${form.bolalarJami} nafar`], ['Yosh chegarasi', form.yoshChegarasi]],
    },
    {
      step: 7, title: 'Taomnoma',
      rows: [['Turi', form.taomnomaTuri], ['Nonushta', form.nonushtaVaqti], ['Tushlik', form.tushlikVaqti], ['Kechki taom', form.kechkiVaqti]],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] font-black text-[#003580] uppercase tracking-widest mb-0.5">Yangi MTT qo'shish</p>
            <h2 className="text-xl font-black text-slate-900">
              {success ? "Bogcha yaratildi!" : STEP_LABELS[step - 1]}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step progress */}
        {!success && (
          <div className="px-8 pt-5 pb-4 shrink-0">
            <div className="flex items-center gap-1">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1;
                const done = n < step;
                const active = n === step;
                return (
                  <React.Fragment key={n}>
                    <div className="flex flex-col items-center gap-1" style={{ minWidth: 36 }}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${
                          done ? 'bg-emerald-500 border-emerald-500 text-white'
                            : active ? 'bg-[#003580] border-[#003580] text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {done ? <Check size={13} /> : n}
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-wide hidden sm:block ${active ? 'text-[#003580]' : done ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {label}
                      </span>
                    </div>
                    {i < 7 && (
                      <div className={`flex-1 h-0.5 mb-3 rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">

          {/* SUCCESS */}
          {success && (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={52} className="text-emerald-500" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900">Muvaffaqiyatli yaratildi!</h3>
                <p className="text-slate-500 mt-2 font-medium">"{form.nomi || 'Yangi bogcha'}" tizimga qo'shildi</p>
              </div>
            </div>
          )}

          {/* STEP 1 - Turi */}
          {!success && step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {BOGCHA_TURLARI.map(t => {
                const active = form.turi === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set('turi', t.id)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      active ? 'border-[#003580] shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: active ? t.bg : undefined }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${t.color}18` }}>
                      <t.icon size={20} style={{ color: t.color }} />
                    </div>
                    <p className="font-black text-sm leading-tight" style={{ color: active ? t.color : '#374151' }}>{t.label}</p>
                    {active && (
                      <div className="mt-2 flex items-center gap-1">
                        <Check size={12} style={{ color: t.color }} />
                        <span className="text-[10px] font-bold" style={{ color: t.color }}>Tanlandi</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2 - Asosiy */}
          {!success && step === 2 && (
            <div className="flex flex-col gap-4">
              <Field label="Bogcha nomi" icon={FileText}>
                <input className={inputCls} placeholder="masalan: 1-sonli Nilufar MTT" value={form.nomi} onChange={e => set('nomi', e.target.value)} />
              </Field>
              <Field label="Telefon raqami" icon={Phone}>
                <input className={inputCls} placeholder="+998 90 123 45 67" value={form.telefon} onChange={e => set('telefon', e.target.value)} />
              </Field>
              <Field label="Email" icon={Mail}>
                <input className={inputCls} type="email" placeholder="bogcha@edu.uz" value={form.email} onChange={e => set('email', e.target.value)} />
              </Field>
              <Field label="Litsenziya raqami" icon={FileText}>
                <input className={inputCls} placeholder="LTS-2024-XXXXX" value={form.litsenziya} onChange={e => set('litsenziya', e.target.value)} />
              </Field>
            </div>
          )}

          {/* STEP 3 - Manzil */}
          {!success && step === 3 && (
            <div className="flex flex-col gap-4">
              <Field label="Tuman" icon={MapPin}>
                <select className={inputCls} value={form.tuman} onChange={e => set('tuman', e.target.value)}>
                  <option value="">— Tumanni tanlang —</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Mahalla" icon={MapPin}>
                <input className={inputCls} placeholder="Mahalla nomi" value={form.mahalla} onChange={e => set('mahalla', e.target.value)} />
              </Field>
              <Field label="Ko'cha va uy raqami" icon={MapPin}>
                <input className={inputCls} placeholder="Ko'cha, uy raqami" value={form.manzil} onChange={e => set('manzil', e.target.value)} />
              </Field>
              <Field label="Mo'ljal / Orientir" icon={MapPin}>
                <input className={inputCls} placeholder="Eng yaqin mo'ljal" value={form.orientir} onChange={e => set('orientir', e.target.value)} />
              </Field>
            </div>
          )}

          {/* STEP 4 - Direktor */}
          {!success && step === 4 && (
            <div className="flex flex-col gap-4">
              <Field label="To'liq ismi" icon={User}>
                <input className={inputCls} placeholder="Familiya Ism Otasining ismi" value={form.direktorIsmi} onChange={e => set('direktorIsmi', e.target.value)} />
              </Field>
              <Field label="Telefon raqami" icon={Phone}>
                <input className={inputCls} placeholder="+998 90 123 45 67" value={form.direktorTelefon} onChange={e => set('direktorTelefon', e.target.value)} />
              </Field>
              <Field label="Pasport seriya va raqami" icon={FileText}>
                <input className={inputCls} placeholder="AA 1234567" value={form.direktorPassport} onChange={e => set('direktorPassport', e.target.value)} />
              </Field>
              <Field label="Ish tajribasi">
                <select className={inputCls} value={form.direktorTajriba} onChange={e => set('direktorTajriba', e.target.value)}>
                  <option value="">— Tajribani tanlang —</option>
                  {['1-3 yil', '3-5 yil', '5-10 yil', '10+ yil'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* STEP 5 - Xodimlar */}
          {!success && step === 5 && (
            <div className="flex flex-col gap-5">
              {[
                { label: 'Tarbiyachilar soni', key: 'tarbiyachiSoni' as const },
                { label: 'Hamshiralar soni', key: 'hamshiraSoni' as const },
                { label: 'Oshpazlar soni', key: 'oshpazSoni' as const },
                { label: 'Boshqa xodimlar', key: 'boshqaXodimlar' as const },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                  <span className="font-bold text-slate-700">{item.label}</span>
                  <Counter value={form[item.key] as number} onChange={v => set(item.key, v)} />
                </div>
              ))}
              <div className="bg-[#003580] text-white rounded-2xl px-5 py-4 flex items-center justify-between">
                <span className="font-black uppercase tracking-wide text-sm">Jami xodimlar</span>
                <span className="text-2xl font-black">
                  {form.tarbiyachiSoni + form.hamshiraSoni + form.oshpazSoni + form.boshqaXodimlar} nafar
                </span>
              </div>
            </div>
          )}

          {/* STEP 6 - Guruhlar */}
          {!success && step === 6 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                <span className="font-bold text-slate-700">Guruhlar soni</span>
                <Counter value={form.guruhlarSoni} onChange={v => set('guruhlarSoni', v)} min={1} />
              </div>
              <Field label="Bolalar jami soni">
                <input
                  type="number"
                  className={inputCls}
                  min={1}
                  value={form.bolalarJami}
                  onChange={e => set('bolalarJami', Number(e.target.value))}
                />
              </Field>
              <Field label="Yosh chegarasi">
                <select className={inputCls} value={form.yoshChegarasi} onChange={e => set('yoshChegarasi', e.target.value)}>
                  {['1-3 yosh', '3-7 yosh', 'Aralash'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
              {form.guruhlarSoni > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-700">O'rtacha guruh hajmi</span>
                  <span className="text-xl font-black text-indigo-700">
                    {Math.round(form.bolalarJami / form.guruhlarSoni)} nafar
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 7 - Taomnoma */}
          {!success && step === 7 && (
            <div className="flex flex-col gap-4">
              <Field label="Taomnoma turi">
                <select className={inputCls} value={form.taomnomaTuri} onChange={e => set('taomnomaTuri', e.target.value)}>
                  {['Standart', 'Kengaytirilgan', 'Dietali'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Nonushta vaqti" icon={Clock}>
                <input type="time" className={inputCls} value={form.nonushtaVaqti} onChange={e => set('nonushtaVaqti', e.target.value)} />
              </Field>
              <Field label="Tushlik vaqti" icon={Clock}>
                <input type="time" className={inputCls} value={form.tushlikVaqti} onChange={e => set('tushlikVaqti', e.target.value)} />
              </Field>
              <Field label="Kechki taom vaqti" icon={Clock}>
                <input type="time" className={inputCls} value={form.kechkiVaqti} onChange={e => set('kechkiVaqti', e.target.value)} />
              </Field>
            </div>
          )}

          {/* STEP 8 - Tasdiqlash */}
          {!success && step === 8 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-500 font-medium">Barcha ma'lumotlarni tekshiring va tasdiqlang.</p>
              {summaryGroups.map(group => (
                <div key={group.step} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
                    <span className="text-[11px] font-black text-[#003580] uppercase tracking-widest">{group.title}</span>
                    <button
                      type="button"
                      onClick={() => setStep(group.step)}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#003580] transition-colors"
                    >
                      <Pencil size={11} /> Tahrirlash
                    </button>
                  </div>
                  <div className="px-5 py-3 grid grid-cols-2 gap-y-2 gap-x-4">
                    {group.rows.map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{k}</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{v || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!success && (
          <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 transition-all"
            >
              <ChevronLeft size={16} />
              {step === 1 ? 'Bekor qilish' : 'Orqaga'}
            </button>
            <div className="text-[11px] font-bold text-slate-400">{step} / 8</div>
            {step < 8 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !form.turi}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003580] text-white font-bold text-sm hover:bg-[#002560] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Keyingisi <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                <Check size={16} /> Bogcha yaratish
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BogchaCreateWizard;
