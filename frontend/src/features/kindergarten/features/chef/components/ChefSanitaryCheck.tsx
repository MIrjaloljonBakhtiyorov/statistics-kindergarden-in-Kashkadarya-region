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
    category: 'QoвЂl gigiyenasi',
    text: "Qo'llar sovun bilan yuvilgan va antiseptik ishlatilgan",
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    category: 'Tirnoqlar',
    text: 'Tirnoqlar olingan, toza va lak/boвЂyoqsiz',
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
    category: 'SogвЂliq',
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
    text: 'GoвЂsht, sabzavot va non uchun taxtalar alohida',
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
    category: 'Sut va goвЂsht',
    text: 'Sut va goвЂsht mahsulotlari alohida saqlanmoqda',
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
    category: 'QoвЂl yuvish joyi',
    text: "Sovun, salfetka va antiseptik yetarli",
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 15,
    category: 'Chiqindi',
    text: 'Chiqindi idishlari yopiq va vaqtida boвЂshatilgan',
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
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden bg-brand-depth text-white border border-slate-800 rounded-xl shadow-sm min-h-[310px]">
        <img
          src="https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/35" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-6 items-center p-5 sm:p-8 min-h-[310px]">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shrink-0 shadow-lg">
              <ClipboardCheck size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.25em] mb-2">Premium oshxona nazorati</p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl">Sanitariya checkpointlari</h2>
              <p className="text-sm sm:text-base font-semibold text-white/70 max-w-2xl mt-4 leading-relaxed">
                Oshpaz ish stoliga kirishdan oldin oshxona, jihozlar, mahsulotlar va shaxsiy gigiyena holatini tasdiqlang.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest">Vizual audit</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest">6 soatlik checkpoint</span>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-400/15 border border-emerald-300/25 text-emerald-200 text-[10px] font-black uppercase tracking-widest">Majburiy</span>
              </div>
            </div>
          </div>

          <div className="flex lg:justify-end">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.12)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tabular-nums">{progress}%</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{checkedCount}/{SANITARY_ITEMS.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-brand-depth">Tekshiruv bandlari</h3>
              <p className="text-xs font-semibold text-brand-muted mt-1">Har bir punkt real tekshiruvdan keyin belgilanadi.</p>
            </div>
            <span className={`w-fit text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${allChecked ? 'bg-emerald-50 text-brand-primary' : 'bg-amber-50 text-amber-600'}`}>
              {allChecked ? 'Boshlash mumkin' : `${SANITARY_ITEMS.length - checkedCount} ta qoldi`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {SANITARY_ITEMS.map((item) => {
              const Icon = item.icon;
              const checked = Boolean(checkedItems[item.id]);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`group overflow-hidden rounded-xl border text-left transition-all ${
                    checked
                      ? 'border-emerald-200 bg-white shadow-md shadow-emerald-900/5'
                      : 'border-brand-border bg-white hover:border-emerald-200 hover:shadow-md'
                  }`}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={item.image}
                      alt=""
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${checked ? 'opacity-90' : 'opacity-80'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur ${
                        checked ? 'bg-brand-primary text-white border-emerald-300/40' : 'bg-white/90 text-brand-primary border-white/40'
                      }`}>
                        {checked ? <Check size={20} /> : <Icon size={20} />}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 text-brand-depth text-[10px] font-black uppercase tracking-widest">
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute right-4 top-4">
                      <span className={`w-8 h-8 rounded-xl border flex items-center justify-center backdrop-blur ${
                        checked ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white/25 border-white/40 text-white'
                      }`}>
                        <Check size={16} />
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="block text-base font-black text-brand-depth leading-snug min-h-[44px]">{item.text}</span>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${checked ? 'text-brand-primary' : 'text-brand-muted'}`}>
                      {checked ? 'Tasdiqlandi' : 'Tekshirish kerak'}
                      </span>
                      <span className={`h-2 w-16 rounded-full ${checked ? 'bg-brand-primary' : 'bg-slate-100'}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="xl:sticky xl:top-6 space-y-4">
          <div className="overflow-hidden bg-white border border-brand-border rounded-xl shadow-sm">
            <div className="relative h-40">
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
            <div className="p-5">
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

          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
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

