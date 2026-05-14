import { useState } from 'react';
import { Search, ChefHat, Clock, Users, Flame, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const recipes = [
  {
    id: 1,
    title: "Yangi sog'ilgan sutda tayyorlangan mevali suli bo'tqasi",
    category: "1-3",
    time: "20 min",
    servings: "10 kishi",
    calories: "180 kcal",
    ingredients: ["Oliy navli suli yormasi", "Tabiiy sigir suti", "Toza sariyog'", "Yangi rezavorlar", "Tabiiy asal"],
    image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=800&q=80",
    chefNote: "Bolalar uchun kunning mukammal boshlanishi. Suli yormasi oshqozon uchun yengil va energiya bilan ta'minlaydi."
  },
  {
    id: 2,
    title: "Yumshoq mol go'shtli an'anaviy Moshxo'rda",
    category: "3-7",
    time: "45 min",
    servings: "10 kishi",
    calories: "320 kcal",
    ingredients: ["Saralangan mosh", "Lazer guruchi", "Yumshoq lahm go'sht", "Yangi sabzavotlar", "Zaytun yog'i"],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    chefNote: "Oqsillarga boy va to'yimli. Moshxo'rda bolaning o'sishi va suyaklari mustahkamlanishiga yordam beradi."
  },
  {
    id: 3,
    title: "Bedana tuxumi bilan bezatilgan shohona Palov",
    category: "3-7",
    time: "60 min",
    servings: "10 kishi",
    calories: "410 kcal",
    ingredients: ["Alanga guruchi", "Yosh buzoq go'shti", "Sariq sabzi", "Bedana tuxumi", "Zig'ir yog'i"],
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
    chefNote: "An'anaviy taomimizning bolalar uchun maxsus yog'sizlantirilgan va vitaminlarga boyitilgan varianti."
  },
  {
    id: 4,
    title: "Bug'da pishirilgan qaymoqli sabzavot pyuresi",
    category: "parhez",
    time: "20 min",
    servings: "5 kishi",
    calories: "120 kcal",
    ingredients: ["Brokkoli", "Shirin kartoshka", "Yangi qaymoq", "Muskat yong'og'i"],
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    chefNote: "Oshqozon-ichak tizimi nozik bolalar uchun maxsus parhezli, vitaminlarga o'ta boy sabzavotli aralashma."
  },
  {
    id: 5,
    title: "100% Tabiiy Apelsin va Olma sharbati",
    category: "ichimlik",
    time: "10 min",
    servings: "10 kishi",
    calories: "90 kcal",
    ingredients: ["Yangi uzilgan apelsin", "Shirin olma", "Yalpiz yaprog'i"],
    image: "https://images.unsplash.com/photo-1622597467836-f3e7e4d5b995?auto=format&fit=crop&w=800&q=80",
    chefNote: "Immun tizimini ko'taruvchi, C vitaminiga boy, shakarsiz tabiiy meva sharbati."
  },
  {
    id: 6,
    title: "Dimlangan tovuq filesi va ismaloq",
    category: "parhez",
    time: "35 min",
    servings: "8 kishi",
    calories: "210 kcal",
    ingredients: ["Yumshoq tovuq filesi", "Yangi ismaloq", "Limon sharbati", "Zaytun yog'i"],
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
    chefNote: "Oqsil va temir moddasining ajoyib manbai. Yengil hazm bo'ladi va mushaklar o'sishiga yordam beradi."
  },
  {
    id: 7,
    title: "Qulupnayli shirin manna bo'tqasi",
    category: "1-3",
    time: "15 min",
    servings: "10 kishi",
    calories: "200 kcal",
    ingredients: ["Oliy nav manna krupasi", "Toza sut", "Yangi qulupnay", "Tabiiy vanil"],
    image: "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=800&q=80",
    chefNote: "Kichkintoylar sevib iste'mol qiluvchi, shirin va mayin teksturali klassik nonushta."
  },
  {
    id: 8,
    title: "O'rmon mevalaridan tayyorlangan issiq kompot",
    category: "ichimlik",
    time: "30 min",
    servings: "20 kishi",
    calories: "85 kcal",
    ingredients: ["Qorag'at", "Malina", "Olma", "Asal", "Darchin"],
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80",
    chefNote: "Qish kunlarida bolalarni sovuqdan asrovchi, vitaminlarga to'la shifobaxsh qaynatma."
  },
  {
    id: 9,
    title: "Tvorogli va bananli mazali quymoqlar",
    category: "1-3",
    time: "25 min",
    servings: "6 kishi",
    calories: "230 kcal",
    ingredients: ["Yumshoq tvorog", "Pishgan banan", "Tuxum", "Un", "Ozroq shakar"],
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80",
    chefNote: "Kalsiyga boy va juda mazali. Nonushta uchun ajoyib tanlov."
  },
  {
    id: 10,
    title: "Sabzavotli va go'shtli bug'li manti",
    category: "3-7",
    time: "50 min",
    servings: "12 kishi",
    calories: "280 kcal",
    ingredients: ["Mol go'shti", "Qovoq", "Piyoz", "Un", "Sariyog'"],
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    chefNote: "Bug'da pishirilgani sababli barcha vitaminlar saqlanib qoladi. Bolalar uchun juda foydali."
  },
  {
    id: 11,
    title: "Tovuq sho'rva",
    category: "3-7",
    time: "40 min",
    servings: "10 kishi",
    calories: "150 kcal",
    ingredients: ["Tovuq", "Sabzi", "Kartoshka", "Piyoz", "Ko'k"],
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    chefNote: "Yumshoq va shifobaxsh. Bolalar uchun kundalik sho'rva."
  },
  {
    id: 12,
    title: "Qovoqli shirko'cha",
    category: "1-3",
    time: "30 min",
    servings: "8 kishi",
    calories: "170 kcal",
    ingredients: ["Qovoq", "Sut", "Un", "Sariyog'", "Tuz"],
    image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
    chefNote: "Beta-karotinga boy, mayda bolalar uchun eng foydali taomlardan biri."
  },
  {
    id: 13,
    title: "Yashil no'xatli guruch",
    category: "parhez",
    time: "35 min",
    servings: "10 kishi",
    calories: "240 kcal",
    ingredients: ["Guruch", "Yashil no'xat", "Zaytun yog'i", "Ko'k piyoz"],
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=800&q=80",
    chefNote: "Yengil va foydali. Oqsil va uglevod muvozanati mukammal."
  },
  {
    id: 14,
    title: "Olcha va o'rik kompoti",
    category: "ichimlik",
    time: "15 min",
    servings: "15 kishi",
    calories: "110 kcal",
    ingredients: ["Olcha", "O'rik", "Shakar", "Suv", "Limon"],
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    chefNote: "Tabiiy mevalar asosida tayyorlangan mazali va vitaminga boy ichimlik."
  },
  {
    id: 15,
    title: "Sabzavotli omlet",
    category: "1-3",
    time: "15 min",
    servings: "5 kishi",
    calories: "190 kcal",
    ingredients: ["Tuxum", "Pomidor", "Qalampir", "Piyoz", "Yog'"],
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
    chefNote: "Protein va vitaminlarga boy tez tayyorlanadigan nonushta."
  },
  {
    id: 16,
    title: "Bug'da pishirilgan baliq",
    category: "parhez",
    time: "40 min",
    servings: "8 kishi",
    calories: "220 kcal",
    ingredients: ["Oq baliq", "Kartoshka", "Limon", "Ko'k", "Zaytun yog'i"],
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    chefNote: "Omega-3 yog'lariga boy. Miya rivojlanishi uchun juda foydali."
  },
  {
    id: 17,
    title: "Lavlagi salatasi",
    category: "parhez",
    time: "20 min",
    servings: "8 kishi",
    calories: "95 kcal",
    ingredients: ["Lavlagi", "Smetana", "Chesnok", "Ko'k"],
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80",
    chefNote: "Qon yaratishga yordam beruvchi temir moddasiga boy taom."
  },
  {
    id: 18,
    title: "Mastava",
    category: "3-7",
    time: "55 min",
    servings: "12 kishi",
    calories: "290 kcal",
    ingredients: ["Mol go'sht", "Guruch", "Pomidor", "Sabzi", "Kartoshka"],
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=800&q=80",
    chefNote: "O'zbekona an'anaviy taom. To'yimli va vitaminlarga boy."
  },
  {
    id: 19,
    title: "Qatiq va meva",
    category: "1-3",
    time: "5 min",
    servings: "6 kishi",
    calories: "140 kcal",
    ingredients: ["Tabiiy qatiq", "Banan", "Qulupnay", "Asal"],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    chefNote: "Probiotiklarga boy. Ichak florasi uchun juda foydali."
  },
  {
    id: 20,
    title: "Bug'doy uni non",
    category: "3-7",
    time: "60 min",
    servings: "20 kishi",
    calories: "160 kcal",
    ingredients: ["Bug'doy uni", "Xamirturush", "Suv", "Tuz", "Yog'"],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    chefNote: "Toza bug'doy unidan tayyorlangan, tolaga boy va to'yimli kundalik non."
  },
];

export default function RetseptlarKitobi() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter(recipe => {
    return recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 md:space-y-12">
      {/* Top Banner */}
      <div className="w-full overflow-hidden rounded-3xl relative bg-white border border-slate-100 shadow-xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/60 -skew-x-12 translate-x-16" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 px-8 py-10 md:px-16 md:py-14">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter">
              <span className="block text-slate-900">AQLVOY</span>
              <span className="block text-indigo-600">OSHPAZ</span>
            </h1>
            <p className="text-lg md:text-2xl font-bold text-slate-800 leading-snug max-w-lg">
              Ushbu loyiha <span className="text-indigo-600 underline underline-offset-4">Sh. Sh. Mirziyoyeva</span> tashabbusi va g&apos;oyasi asosida ishlab chiqildi
            </p>
            <p className="text-sm md:text-base text-slate-500 italic leading-relaxed max-w-md">
              Maktabgacha ta&apos;lim tashkilotlari tarbiyalanuvchilari uchun mo&apos;ljallangan maxsus &ldquo;Retseptlar kitobi&rdquo; loyihasining muallifi va rahbari. Kitob bolalarning to&apos;g&apos;ri ovqatlanishi va sog&apos;lom rivojlanishini ta&apos;minlash maqsadida yaratilgan.
            </p>
          </div>
          <div className="w-64 md:w-96 shrink-0 relative">
            <div className="absolute inset-0 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse" />
            <img
              src="/welcome_image.png"
              alt="Aqlvoy Oshpaz"
              className="relative w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500 rotate-3"
            />
          </div>
        </div>
      </div>

      {/* Authors - always visible, compact */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
            <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Mualliflar</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            {[
              { name: "Sh. Sh. Mirziyoyeva", role: "Loyiha muallifi va rahbari" },
              { name: "B. Chustiy", role: "\"Chustiy Group\" rahbari" },
              { name: "U. T. Muxiddinov", role: "t.f.n., MTV boshqarma boshlig'i" },
              { name: "G. U. Nasurova", role: "t.f.n., MTV bosh mutaxassisi" },
              { name: "A. M. Mirzaxamedov", role: "Ovqatlantirish texnologi" },
              { name: "Y. G. Tem", role: "MTV o'rinbosari" },
              { name: "A. R. Sodiqov", role: "Ovqatlantirish texnologi" },
              { name: "B. Babaxanov", role: "\"Chustiy Group\" bosh oshpaz" },
              { name: "T. Xalilov", role: "\"Chustiy Group\" oshpazi" },
              { name: "Ya. Alimov", role: "Bosh konditer, novvoy" },
              { name: "G. I. Shapxova", role: "t.f.d., professor, TTA" },
              { name: "R. A. Qosimov", role: "t.f.n., SES mutaxassisi" },
              { name: "E. S. Tsoy", role: "JSST milliy mutaxassisi" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <div>
                  <p className="text-[13px] font-black text-slate-800 leading-tight">{a.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400 leading-tight mt-0.5">{a.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-5 bg-slate-300 rounded-full" />
            <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Retsenzentlar</p>
          </div>
          <div className="space-y-3">
            {[
              { name: "I. E. Borodina", role: "JSST xalqaro maslahatchisi" },
              { name: "D. A. Zaredinov", role: "t.f.d., Gigiena kafedrasi mudiri" },
              { name: "N. J. Ermatov", role: "t.f.d., Ovqatlanish kafedrasi mudiri" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <div>
                  <p className="text-[13px] font-black text-slate-800 leading-tight">{r.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400 leading-tight mt-0.5">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <ChefHat className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-[12px] font-black text-emerald-700 uppercase tracking-wider">Kitob rasmiy tasdiqlangan</p>
          </div>
        </div>
      </div>

      {/* ── SHAHNOZA MIRZIYOYEVA TASHABBUSI ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-rose-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-400">Ijtimoiy tashabbus</span>
          <div className="h-px flex-1 bg-gradient-to-r from-rose-100 to-transparent" />
        </div>

        {/* Asosiy karta */}
        <div className="rounded-[2rem] overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #1a0a1e 0%, #2d1b3d 50%, #1a0a1e 100%)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[340px]">
              <img
                src="https://data.daryo.uz/media/cache/2019/04/photo_2019-04-04_17-05-07-680x453.jpg"
                alt="Shahnoza Mirziyoyeva"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', minHeight: 340 }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #1a0a1e)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1a0a1e 0%, transparent 50%)' }} />
              <div className="absolute bottom-5 left-5">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black text-rose-300 uppercase tracking-widest border" style={{ background: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.3)' }}>
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                  Ijtimoiy tashabbus
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center gap-5">
              <h4 className="text-[26px] font-black text-white leading-tight">
                Nogironligi bo'lgan bolalarga <span className="text-rose-300">birgalikda qanot bag'ishlaylik!</span>
              </h4>
              <p className="text-[14px] leading-relaxed font-medium" style={{ color: 'rgba(203,213,225,0.85)' }}>
                O'zbekiston Respublikasi Prezidentining katta qizi Shahnoza Mirziyoyeva nogironligi bo'lgan bolalarga yordam ko'rsatish, ularni jamiyatga to'liq qo'shish va teng imkoniyatlar yaratish bo'yicha faol ijtimoiy tashabbus bilan chiqmoqda.
              </p>
              <blockquote className="border-l-4 border-rose-400 pl-4">
                <p className="text-[13px] italic font-medium text-rose-200 leading-relaxed">
                  "Har bir bola — alohida dunyo. Ularning qalbidagi nur bizning kelajagimizdir. Biror bolaning ko'zlarida umid ko'rsak, uni so'ndirmasligimiz kerak."
                </p>
                <p className="text-[11px] font-black text-rose-400 uppercase tracking-wider mt-2">— Shahnoza Mirziyoyeva</p>
              </blockquote>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Maxsus ehtiyojli bolalar", "Inklyuziv ta'lim", "Ijtimoiy qo'llab-quvvatlash", "Teng imkoniyatlar"].map((tag, i) => (
                  <span key={i} className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.2)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 ta kichik rasm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { src: "https://data.daryo.uz/media/cache/2019/04/photo_2019-04-04_17-05-07-680x453.jpg", label: "Bolalar bilan uchrashuv", desc: "Maxsus ehtiyojli bolalarga sovg'alar topshirildi" },
            { src: "https://data.daryo.uz/media/cache/2019/04/photo_2019-04-04_17-05-34-680x453.jpg", label: "G'amxo'rlik lahzasi", desc: "Har bir bolaga alohida e'tibor va mehribonlik" },
            { src: "https://data.daryo.uz/media/cache/2019/04/photo_2019-04-04_17-05-25-680x453.jpg", label: "Birga kuchli", desc: "Jamiyat va davlat birgalikda ishlaydi" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group rounded-2xl overflow-hidden shadow-md relative"
            >
              <img
                src={item.src}
                alt={item.label}
                style={{ width: '100%', height: 220, objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                className="group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,10,30,0.85) 0%, transparent 55%)' }} />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[13px] font-black text-white mb-1">{item.label}</p>
                <p className="text-[11px] text-rose-200 font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Header and Search */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center justify-between bg-white p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="max-w-xl">
          <h2 className="text-lg md:text-4xl font-black text-slate-900 tracking-tight mb-1 md:mb-2 flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 bg-indigo-50 rounded-xl md:rounded-2xl">
              <ChefHat className="h-5 w-5 md:h-10 md:w-10 text-indigo-600" />
            </div>
            Taomnomalar To'plami
          </h2>
          <p className="text-[10px] md:text-base text-slate-500 font-medium ml-1 md:ml-2 uppercase tracking-widest">Oshpazlar tomonidan tasdiqlangan.</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96 group">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 md:h-5 md:w-5 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Retsept izlash..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 md:pl-14 pr-4 md:pr-6 py-3 md:py-5 rounded-xl md:rounded-3xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 transition-all font-bold text-slate-900 text-xs md:text-base shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="group bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full">
              <div className="h-48 md:h-64 bg-slate-200 relative overflow-hidden">
                 <div className="absolute top-3 left-3 md:top-4 left-4 z-10 bg-white/95 backdrop-blur-md text-slate-900 px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/50 flex items-center gap-1.5 md:gap-2">
                   <Heart className="h-2 w-2 md:h-3 md:w-3 text-rose-500 fill-rose-500" />
                   TAOM
                 </div>
                 <img 
                   src={recipe.image} 
                   alt={recipe.title} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                 <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 text-white">
                   <h4 className="text-base md:text-2xl font-black mb-0.5 md:mb-1 line-clamp-2 leading-tight drop-shadow-lg uppercase">{recipe.title}</h4>
                 </div>
              </div>
              <div className="p-4 md:p-8 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-1 md:gap-2 text-slate-500 bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-100">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-indigo-500" />
                    <span className="text-[8px] md:text-xs font-black tracking-wider uppercase">{recipe.time}</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-slate-500 bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-100">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                    <span className="text-[8px] md:text-xs font-black tracking-wider uppercase">{recipe.servings}</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-slate-500 bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-100">
                    <Flame className="h-3 w-3 md:h-4 md:w-4 text-rose-500" />
                    <span className="text-[8px] md:text-xs font-black tracking-wider uppercase">{recipe.calories}</span>
                  </div>
                </div>
                
                <div className="mb-4 md:mb-6 flex-1">
                  <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                    <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-300"></div>
                    Asosiy Masalliqlar
                  </div>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {recipe.ingredients.map(ing => (
                      <span key={ing} className="bg-indigo-50/50 text-indigo-700 text-[8px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1.5 rounded-md md:rounded-xl border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-default">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/50 p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-amber-100/50 mb-4 md:mb-6">
                  <p className="text-[10px] md:text-xs text-amber-800 font-medium italic leading-relaxed">
                    <span className="font-black not-italic text-amber-600 mr-1.5 md:mr-2 uppercase text-[8px] md:text-[10px]">Maslahat:</span>
                    &ldquo;{recipe.chefNote}&rdquo;
                  </p>
                </div>

                <button className="w-full mt-auto bg-slate-900 text-white py-2.5 md:py-4 rounded-lg md:rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md hover:shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2">
                  To'liq Ko'rish
                  <span className="text-base md:text-lg leading-none">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 md:py-24 text-center bg-white rounded-2xl md:rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-12 h-12 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <ChefHat className="h-6 w-6 md:h-10 md:w-10 text-slate-400" />
          </div>
          <h3 className="text-base md:text-xl font-black text-slate-900 mb-1 md:mb-2">Retsept topilmadi</h3>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium max-w-xs md:max-w-sm mx-auto px-4">Boshqa nom bilan qidirib ko'ring yoki filtrlarni o'zgartiring.</p>
        </div>
      )}
    </div>
  );
}
