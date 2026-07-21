import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChefHat,
  ClipboardCheck,
  Droplets,
  Loader2,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Utensils,
  Wind,
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

const SANITARY_ITEMS = [
  {
    id: 1,
    category: 'Tozalik',
    text: 'Oshxona tozalangan va dezinfeksiya qilingan',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    category: 'Jihozlar',
    text: 'Idishlar va jihozlar ishlatishga tayyor',
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    category: "Qo'l gigiyenasi",
    text: "Qo'llar sovun bilan yuvilgan va antiseptik ishlatilgan",
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    category: 'Tirnoqlar',
    text: "Tirnoqlar olingan, toza va lak/bo'yoqsiz",
    icon: CheckCircle2,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    category: 'Xodim',
    text: "Maxsus kiyim, qalpoq va qo'lqop kiyilgan",
    icon: ChefHat,
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    category: "Sog'liq",
    text: "Qo'lda jarohat, yiringlash yoki ochiq yara yo'q",
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    category: 'Mahsulot',
    text: 'Mahsulotlarning muddati va sifati tekshirilgan',
    icon: CheckCircle2,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    category: 'Harorat',
    text: "Muzlatkich harorati me'yorda",
    icon: Thermometer,
    image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    category: 'Idish-tovoq',
    text: 'Idish-tovoqlar sanitariya-gigiyena talablariga mos',
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 10,
    category: 'Kesish taxtalari',
    text: "Go'sht, sabzavot va non uchun taxtalar alohida",
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 11,
    category: 'Xom mahsulot',
    text: 'Xom va tayyor mahsulotlar bir-biriga tegmayapti',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 12,
    category: "Sut va go'sht",
    text: "Sut va go'sht mahsulotlari alohida saqlanmoqda",
    icon: Thermometer,
    image: 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 13,
    category: 'Havo',
    text: 'Ventilyatsiya ishlayapti',
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 14,
    category: "Qo'l yuvish joyi",
    text: "Sovun, salfetka va antiseptik yetarli",
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 15,
    category: 'Chiqindi',
    text: "Chiqindi idishlari yopiq va vaqtida bo'shatilgan",
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 16,
    category: 'Tozalash inventari',
    text: 'Pol, stol va idish inventarlari alohida saqlanadi',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 17,
    category: 'Texnologiya',
    text: 'Taom tayyorlash texnologiyasiga amal qilinganmi',
    icon: ClipboardCheck,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 18,
    category: 'Dezinfeksiya',
    text: "Oshxona to'liq dezinfeksiya qilinganmi",
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 19,
    category: 'Shamollatish',
    text: 'Xona shamollatilganmi',
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
  },
];

const SANITARY_CARD_TONES = [
  { accent: '#059669', soft: '#ecfdf5', border: '#bbf7d0', text: '#047857' },
  { accent: '#0284c7', soft: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
  { accent: '#d97706', soft: '#fff7ed', border: '#fed7aa', text: '#b45309' },
  { accent: '#7c3aed', soft: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  { accent: '#e11d48', soft: '#fff1f2', border: '#fecdd3', text: '#be123c' },
  { accent: '#0891b2', soft: '#ecfeff', border: '#a5f3fc', text: '#0e7490' },
];

interface Props {
  onComplete: () => void;
}

export const ChefSanitaryCheck: React.FC<Props> = ({ onComplete }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  const checkedCount = useMemo(
    () => SANITARY_ITEMS.filter((item) => checkedItems[item.id]).length,
    [checkedItems]
  );
  const progress = Math.round((checkedCount / SANITARY_ITEMS.length) * 100);
  const allChecked = checkedCount === SANITARY_ITEMS.length;
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (progress / 100) * circumference;

  const toggleItem = (id: number) => {
    setCheckedItems((state) => ({ ...state, [id]: !state[id] }));
  };

  const handleConfirm = async () => {
    if (!allChecked || !user) {
      showNotification('Barcha sanitariya bandlarini tasdiqlang', 'warning');
      return;
    }

    try {
      setSaving(true);
      const today = new Date().toISOString().slice(0, 10);
      await apiClient.post('/chef/sanitary-check', {
        chef_id: user.id,
        date: today,
        submitted_at: new Date().toISOString(),
        answers: checkedItems,
      });
      showNotification('Sanitariya checkpointi hamshiraga yuborildi', 'success');
      onComplete();
    } catch (error) {
      showNotification('Sanitariya tekshiruvini saqlashda xatolik', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden bg-brand-depth text-white border border-slate-800 rounded-2xl shadow-sm min-h-[178px]">
        <img
          src="https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/35" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_128px] gap-4 items-center p-4 sm:p-5 min-h-[178px]">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shrink-0 shadow-lg">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black text-emerald-300 uppercase tracking-[0.22em] mb-1.5">Premium oshxona nazorati</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight max-w-3xl">Sanitariya checkpointlari</h2>
              <p className="text-xs sm:text-sm font-semibold text-white/70 max-w-2xl mt-2 leading-relaxed">
                Oshpaz ish stoliga kirishdan oldin oshxona, jihozlar, mahsulotlar va shaxsiy gigiyena holatini tasdiqlang.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[9px] font-black uppercase tracking-widest">Vizual audit</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[9px] font-black uppercase tracking-widest">6 soatlik</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-400/15 border border-emerald-300/25 text-emerald-200 text-[9px] font-black uppercase tracking-widest">Majburiy</span>
              </div>
            </div>
          </div>

          <div className="flex lg:justify-end">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.12)" strokeWidth="7" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="#10B981"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black tabular-nums">{progress}%</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{checkedCount}/{SANITARY_ITEMS.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border bg-gradient-to-r from-white via-emerald-50/50 to-sky-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-brand-depth">Tekshiruv bandlari</h3>
              <p className="text-xs font-semibold text-brand-muted mt-1">Har bir punkt real tekshiruvdan keyin belgilanadi.</p>
            </div>
            <span className={`w-fit text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${allChecked ? 'bg-emerald-50 text-brand-primary' : 'bg-amber-50 text-amber-600'}`}>
              {allChecked ? 'Boshlash mumkin' : `${SANITARY_ITEMS.length - checkedCount} ta qoldi`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 p-4">
            {SANITARY_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const checked = Boolean(checkedItems[item.id]);
              const tone = SANITARY_CARD_TONES[index % SANITARY_CARD_TONES.length];
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="group relative overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5"
                  style={{
                    background: checked
                      ? `linear-gradient(135deg, ${tone.soft} 0%, #ffffff 54%, ${tone.soft} 100%)`
                      : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.72))',
                    borderColor: checked ? tone.border : '#e2e8f0',
                    boxShadow: checked ? `0 16px 34px ${tone.accent}18` : '0 10px 24px rgba(15,23,42,0.04)',
                  }}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: `linear-gradient(90deg, ${tone.accent}, transparent)` }}
                  />
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl opacity-20 transition-transform duration-500 group-hover:scale-125"
                    style={{ background: tone.accent }}
                  />

                  <div className="relative z-10 flex gap-3 p-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-white shadow-sm"
                      style={{
                        background: checked ? `linear-gradient(135deg, ${tone.accent}, ${tone.accent}cc)` : '#ffffff',
                        borderColor: checked ? `${tone.accent}40` : tone.border,
                        color: checked ? '#ffffff' : tone.text,
                      }}
                    >
                      {checked ? <Check size={20} /> : <Icon size={20} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest"
                          style={{ backgroundColor: tone.soft, borderColor: tone.border, color: tone.text }}
                        >
                          {item.category}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${checked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-brand-muted'}`}>
                          {checked ? 'OK' : 'Kutilmoqda'}
                        </span>
                      </div>
                      <span className="block min-h-[42px] text-sm font-black text-brand-depth leading-snug">{item.text}</span>
                    </div>

                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white shadow-sm">
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${checked ? 'text-brand-primary' : 'text-brand-muted'}`}>
                      {checked ? 'Tasdiqlandi' : 'Tekshirish kerak'}
                    </span>
                    <span className="h-2 w-16 rounded-full bg-slate-100 overflow-hidden">
                      <span
                        className="block h-full rounded-full transition-all duration-500"
                        style={{ width: checked ? '100%' : '18%', background: checked ? tone.accent : '#cbd5e1' }}
                      />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="xl:sticky xl:top-6 space-y-4">
          <div className="overflow-hidden bg-white border border-brand-border rounded-2xl shadow-sm">
            <div className="relative h-32">
              <img
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Kitchen safety</p>
                <h3 className="text-xl font-black mt-1">Ish boshlashdan oldin</h3>
              </div>
            </div>
            <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-brand-depth">Eslatma</h3>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Xavfsizlik birinchi</p>
              </div>
            </div>
            <p className="text-sm text-brand-muted font-semibold leading-relaxed mt-4">
              Checkpointlar hamshira tomonidan tasdiqlanmaguncha oshpaz dashboardi ochilmaydi. Bu bolalar ovqatlanishi xavfsizligi uchun majburiy bosqich.
            </p>
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-brand-muted uppercase tracking-widest">Tayyorlik</span>
              <span className="text-sm font-black text-brand-depth tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <button
              onClick={handleConfirm}
              disabled={!allChecked || saving}
              className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                allChecked
                  ? 'bg-brand-primary text-white hover:bg-emerald-700'
                  : 'bg-slate-100 text-brand-muted cursor-not-allowed'
              }`}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Ishni boshlash
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
};

