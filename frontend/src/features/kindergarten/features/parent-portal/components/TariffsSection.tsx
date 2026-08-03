import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Crown,
  Gift,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Utensils,
  X
} from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  period: string;
  icon: any;
  tone: string;
  button: string;
  recommended?: boolean;
  menuDays: string;
  menuHint: string;
  foodPreview: {
    day: string;
    meal: string;
    imageUrl: string;
  }[];
  features: string[];
};

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Bepul',
    price: '$0',
    period: '/ oy',
    icon: Gift,
    tone: 'emerald',
    button: 'Joriy tarif',
    menuDays: '1 kun',
    menuHint: 'Faqat bugungi kun taomnomasi',
    foodPreview: [
      { day: 'Bugun', meal: "O'zbekcha osh", imageUrl: 'https://zamindmc.uz/images/food1.png' }
    ],
    features: [
      'Farzandning asosiy profili',
      'Kunlik davomat',
      'Ertangi kun uchun boradi/bormaydi belgilash',
      '1 kunlik taomnoma',
      'Bog\'cha e\'lonlari',
      'Asosiy salomatlik ma\'lumotlari',
      'Emlash holati',
      'Hujjatlarni ko\'rish',
      'Bitta vakil qo\'shish',
      'Tarbiyachiga cheklangan xabar'
    ]
  },
  {
    id: 'plus',
    name: 'Plus',
    oldPrice: '$2.99',
    price: '$1.99',
    discount: '33% chegirma',
    period: '/ oy',
    icon: Star,
    tone: 'blue',
    button: 'Eng qulay tarifga hoziroq o\'tish',
    menuDays: '3 kun',
    menuHint: '1 kun oldingi + bugungi + 1 kun keyingi',
    foodPreview: [
      { day: 'Kecha', meal: "Sho'rva", imageUrl: 'https://zamindmc.uz/images/food2.png' },
      { day: 'Bugun', meal: "Lag'mon", imageUrl: 'https://zamindmc.uz/images/food3.png' },
      { day: 'Ertaga', meal: 'Shashlik', imageUrl: 'https://zamindmc.uz/images/food4.png' }
    ],
    features: [
      'Bepul tarifdagi barcha imkoniyatlar',
      'To\'liq tarbiyachi bilan chat',
      '3 kunlik taomnoma',
      'Oqsil, yog\', uglevod, kletchatka tahlili',
      'Oylik davomat hisoboti',
      'Farzand hujjatlarini yuklash',
      '2 ta vakil biriktirish',
      'Bog\'chalar xaritasini ko\'rish',
      'Psixologik maslahat maqolalari',
      'Yoshga mos tarbiya tavsiyalari'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    oldPrice: '$4.99',
    price: '$2.99',
    discount: '40% chegirma',
    period: '/ oy',
    icon: TrendingUp,
    tone: 'violet',
    button: 'Darhol tarif rejasini almashtirish',
    menuDays: '5 kun',
    menuHint: '2 kun oldingi + bugungi + 2 kun keyingi',
    foodPreview: [
      { day: '2 kun avvalgi', meal: 'Mastava', imageUrl: 'https://zamindmc.uz/images/food5.png' },
      { day: 'Kecha', meal: 'Dimlama', imageUrl: 'https://zamindmc.uz/images/food6.png' },
      { day: 'Bugun', meal: 'Chuchvara', imageUrl: 'https://zamindmc.uz/images/food7.png' },
      { day: 'Ertaga', meal: 'Somsa', imageUrl: 'https://zamindmc.uz/images/food8.png' },
      { day: '2 kun keyingi', meal: 'Manti', imageUrl: 'https://zamindmc.uz/images/food9.png' }
    ],
    features: [
      'Plus tarifdagi barcha imkoniyatlar',
      'AI asosidagi kunlik ovqatlanish bahosi',
      'Kechki ovqat tavsiyasi',
      'Temir, kalsiy, A, C, D vitaminlari tahlili',
      'Yetishmovchilik va ortiqchalik alertlari',
      'Bo\'y, vazn va rivojlanish dinamikasi',
      'Oylik PDF hisobot',
      'Yaqin bog\'chalarni lokatsiya bo\'yicha topish',
      'Bog\'chalarni masofa va to\'lov bo\'yicha saralash',
      '3 ta bog\'chani tanlanganlarga saqlash',
      'Psixolog bilan oyiga cheklangan maslahat',
      'AI tarbiya va rivojlanish tavsiyalari'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    oldPrice: '$7.99',
    price: '$3.99',
    discount: '50% chegirma',
    period: '/ oy',
    icon: Crown,
    tone: 'amber',
    button: 'Darhol tarif rejasini almashtirish',
    recommended: true,
    menuDays: '7 kun',
    menuHint: '3 kun oldingi + bugungi + 3 kun keyingi',
    foodPreview: [
      { day: '3 kun avvalgi', meal: 'Patir non', imageUrl: 'https://zamindmc.uz/images/food10.png' },
      { day: '2 kun avvalgi', meal: 'Hasip', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hasip.jpg?width=180' },
      { day: 'Kecha', meal: 'Moshkichra', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Moshkichra.jpg?width=180' },
      { day: 'Bugun', meal: 'Qozon kabob', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Qozon%20kabob%20(Uzbek%20national%20cuisine).jpg?width=180' },
      { day: 'Ertaga', meal: 'Shivit oshi', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shivit%20oshi.jpg?width=180' },
      { day: '2 kun keyingi', meal: 'Tukhum barak', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tukhum%20Barak.jpg?width=180' },
      { day: '3 kun keyingi', meal: 'Jizzax somsa', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jizzakh%20somsa%20(samosa).jpg?width=180' }
    ],
    features: [
      'Pro tarifdagi barcha imkoniyatlar',
      'Bolaning individual ovqatlanish profili',
      'Allergiya va tibbiy cheklovlarni hisobga olgan AI tavsiyalar',
      'Individual haftalik kechki ovqat rejasi',
      'Psixolog bilan onlayn konsultatsiya',
      'Ota-onaga individual tarbiya tavsiyalari',
      'Bog\'chalarni narx, masofa, xizmat va reyting bo\'yicha taqqoslash',
      'Cheklanmagan tanlangan bog\'chalar ro\'yxati',
      'Bog\'cha to\'lovi va qo\'shimcha xizmatlar narxlarini ko\'rish',
      'Xaritada eng yaqin bog\'chalarni aniqlash',
      'Bog\'cha bilan bog\'lanish yoki tashrif so\'rovini yuborish',
      'Ustuvor texnik yordam',
      'Kengaytirilgan oylik AI xulosasi',
      'Salomatlik, ovqatlanish va rivojlanishning yagona hisoboti'
    ]
  }
];

const toneClasses: Record<string, { icon: string; border: string; button: string; badge: string; text: string }> = {
  emerald: {
    icon: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    border: 'border-emerald-200',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-600'
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600 border-blue-200',
    border: 'border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    text: 'text-blue-600'
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600 border-violet-200',
    border: 'border-violet-200',
    button: 'bg-violet-600 hover:bg-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    text: 'text-violet-600'
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600 border-amber-200',
    border: 'border-amber-300',
    button: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-orange-500 hover:via-rose-500 hover:to-pink-500 shadow-lg shadow-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    text: 'text-amber-600'
  }
};

const providerConfig: Record<string, { label: string; logoUrl: string; logoClass: string }> = {
  click: {
    label: 'Click',
    logoUrl: 'https://www.ictweek.uz/uploads/F5Q8C3029/click-01.png',
    logoClass: 'object-contain p-1'
  },
  payme: {
    label: 'Payme',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToITzBcM7v0HZVgw-mZ9rvODkOHnIpaV2TMRQbvzbhqw&s=10',
    logoClass: 'object-contain p-1'
  },
  karta: {
    label: 'Karta',
    logoUrl: 'https://www.visa.com.my/dam/VCOM/regional/ap/malaysia/global-elements/images/hk-visa-gold-card-498x280.png',
    logoClass: 'object-cover'
  }
};

const ProviderLogo = ({ type, compact = false }: { type: string; compact?: boolean }) => {
  const provider = providerConfig[type];
  if (provider) {
    return (
      <span className={`flex items-center justify-center overflow-hidden bg-white ${compact ? 'h-9 w-9 rounded-2xl border border-slate-100 shadow-sm' : 'h-full min-h-[76px] w-full rounded-2xl'}`}>
        <img
          src={provider.logoUrl}
          alt={`${provider.label} logotipi`}
          className={`h-full w-full ${provider.logoClass}`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
      <CreditCard size={16} />
    </span>
  );
};

const PaymentModal = ({ plan, onClose }: { plan: Plan; onClose: () => void }) => {
  const [method, setMethod] = useState('click');
  const isFree = plan.id === 'free';
  const amount = `${plan.price} ${plan.period}`;
  const selectedProvider = providerConfig[method];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="kg-parent-modal-layer fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto overscroll-contain p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-payment-modal-title"
    >
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-[1.35rem] border border-rose-100 bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[1.6rem]"
      >
        <div className="relative flex-none overflow-hidden border-b border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-4 sm:p-5 md:p-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500"></div>
          <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 shadow-sm sm:h-12 sm:w-12">
              <plan.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">To'lovni tasdiqlash</p>
              <h3 id="parent-payment-modal-title" className="mt-1 text-lg font-extrabold uppercase leading-tight text-brand-depth sm:text-xl">{plan.name} tarifi</h3>
            </div>
          </div>
          <button autoFocus type="button" onClick={onClose} aria-label="To'lov oynasini yopish" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-brand-muted transition-colors hover:bg-rose-50 hover:text-rose-500">
            <X size={18} />
          </button>
          </div>
        </div>

        <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-5 md:p-6">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/45 p-4">
            <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-muted">Oylik to'lov</p>
                <p className="mt-1 break-words text-2xl font-extrabold leading-none text-brand-depth sm:text-3xl">{amount}</p>
            </div>
              {plan.discount && <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-rose-600 shadow-sm">{plan.discount}</span>}
            </div>
          </div>

          {!isFree && (
            <div className="space-y-3">
              <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">To'lov usuli</p>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {Object.keys(providerConfig).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMethod(item)}
                    className={`flex min-h-[78px] items-stretch justify-center overflow-hidden rounded-2xl border p-1 transition-all sm:min-h-[96px] sm:p-1.5 ${
                      method === item ? 'border-rose-200 bg-rose-50 text-brand-depth shadow-sm' : 'border-brand-border bg-white text-brand-muted hover:border-rose-100 hover:bg-rose-50/50'
                    }`}
                  >
                    <ProviderLogo type={item} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            disabled={isFree}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-center text-[11px] font-extrabold uppercase leading-snug tracking-[0.12em] text-white shadow-lg shadow-rose-500/20 transition-all hover:from-rose-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:py-4 sm:text-[12px]"
          >
            <ProviderLogo type={method} compact />
            {isFree ? 'Bepul tarif faol' : `${selectedProvider.label} orqali to'lov qilish`}
          </button>

          <p className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-[11px] font-semibold leading-relaxed text-brand-muted">
            To'lov provideri ulanishi bilan ushbu tugma real checkout sahifasiga yo'naltiradi.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const TariffsSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <div className="kg-parent-section kg-tariffs-typography space-y-5 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-brand-primary"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pl-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/10 flex items-center justify-center shrink-0">
              <BadgeDollarSign size={23} />
            </div>
            <div>
              <h4 className="text-xl font-extrabold leading-tight text-brand-depth sm:text-2xl md:text-[28px]">Biz taklif qiladigan xizmatlar</h4>
              <p className="text-[13px] md:text-[15px] font-medium leading-relaxed text-brand-muted mt-1">Ota-onalar uchun qulay imkoniyatlar asosida tuzilgan paketlar.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col ${plan.recommended ? 'border-amber-300 ring-2 ring-amber-200/60' : toneClasses[plan.tone].border}`}
          >
            {plan.recommended && (
              <div className="mx-4 mt-4 flex max-w-[210px] items-center justify-center gap-1.5 self-end rounded-full bg-amber-500 px-3.5 py-1.5 text-[10px] font-extrabold leading-tight text-white shadow-md shadow-amber-200 sm:absolute sm:right-4 sm:top-3 sm:m-0">
                <Crown size={12} className="shrink-0" /> Siz uchun eng mos va qulay tarif
              </div>
            )}

            <div className={`border-b border-slate-100 p-4 sm:p-5 ${plan.recommended ? 'sm:pt-16' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${toneClasses[plan.tone].icon}`}>
                  <plan.icon size={23} />
                </div>
                <div className="min-w-0">
                  <h5 className={`text-2xl md:text-[26px] font-extrabold leading-none ${toneClasses[plan.tone].text}`}>{plan.name}</h5>
                  <div className="mt-1 flex flex-wrap items-end gap-2">
                    {plan.oldPrice && <span className="text-base font-bold text-brand-muted line-through">{plan.oldPrice}</span>}
                    <span className="text-[34px] font-extrabold leading-none text-brand-depth">{plan.price}</span>
                    <span className="mb-1 text-sm font-semibold text-brand-depth">{plan.period}</span>
                  </div>
                  {plan.discount && <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${toneClasses[plan.tone].badge}`}>{plan.discount}</span>}
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 space-y-4">
              <div>
                <p className="text-[11px] font-extrabold text-brand-muted mb-3">Asosiy imkoniyatlar</p>
                <div className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${toneClasses[plan.tone].text}`} />
                      <span className="text-[13px] font-semibold leading-[1.45] text-brand-depth">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-brand-depth">
                  <Utensils size={17} className={toneClasses[plan.tone].text} />
                  <p className="text-[11px] font-extrabold">Taomnoma ko'rish imkoniyati</p>
                </div>
                <p className="mt-2 text-[28px] font-extrabold leading-none text-brand-depth">{plan.menuDays}</p>
                <p className="mt-1 text-[12px] font-medium leading-snug text-brand-muted">{plan.menuHint}</p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {plan.foodPreview.map((food) => (
                    <div key={`${plan.id}-${food.day}-${food.meal}`} className="w-[78px] rounded-[1px] border border-white bg-white p-1.5 shadow-sm">
                      <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-[1px] bg-slate-100">
                        <Utensils size={16} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${toneClasses[plan.tone].text} opacity-40`} />
                        <img
                          src={food.imageUrl}
                          alt={food.meal}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="relative z-10 h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <p className="mt-1.5 truncate text-center text-[9px] font-extrabold text-brand-depth">{food.day}</p>
                      <p className="truncate text-center text-[10px] font-semibold text-brand-muted">{food.meal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full rounded-2xl px-4 py-3.5 text-[11px] md:text-[12px] font-extrabold leading-tight text-white transition-all flex items-center justify-center gap-2 text-center ${toneClasses[plan.tone].button}`}
              >
                {plan.recommended ? <Crown size={15} /> : plan.id === 'free' ? <ShieldCheck size={15} /> : <CreditCard size={15} />}
                {plan.button}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
          <Sparkles size={20} />
        </div>
        <p className="text-[13px] font-semibold leading-relaxed text-brand-muted">
          Tarif tanlangandan so'ng to'lov oynasi ochiladi. To'lovni Click yoki Payme orqali amalga oshirishingiz mumkin.
        </p>
      </div>

      {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
};
