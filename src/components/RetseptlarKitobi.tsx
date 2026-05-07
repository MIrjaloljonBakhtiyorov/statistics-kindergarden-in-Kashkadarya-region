import { useState } from 'react';
import { Search, ChefHat, Clock, Users, Flame, Heart } from 'lucide-react';

const recipes = [
  {
    id: 1,
    title: "Yangi sog'ilgan sutda tayyorlangan mevali suli bo'tqasi",
    category: "1-3",
    time: "20 min",
    servings: "10 kishi",
    calories: "180 kcal",
    ingredients: ["Oliy navli suli yormasi", "Tabiiy sigir suti", "Toza sariyog'", "Yangi rezavorlar", "Tabiiy asal"],
    image: "https://media.istockphoto.com/id/1434918490/photo/cute-little-girl-eats-fruit-salad.jpg?s=612x612&w=0&k=20&c=8zi80wlKZADN_koDY7EXg-kAzeyhiPlYdtJvM4BfLDQ=",
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
    image: "https://images.unsplash.com/photo-1512058560366-cd242d4532be?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1620011928097-6a1bdc90858e?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1621267860478-75fb07871b60?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1497534446932-c946e7358af8?auto=format&fit=crop&w=800&q=80",
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
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=800&q=80",
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
  }
];

export default function RetseptlarKitobi() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter(recipe => {
    return recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 md:space-y-12">
      {/* Top Banner with Mascot */}
      <div className="w-full overflow-hidden rounded-[1.5rem] md:rounded-[4rem] shadow-2xl relative bg-white border border-slate-100">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 -skew-x-12 translate-x-10 md:translate-x-20"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-16">
          <div className="flex-1 text-center md:text-left space-y-3 md:space-y-6">
            <h1 className="text-3xl md:text-8xl font-black leading-[0.9] tracking-tighter">
              <span className="block text-slate-900 drop-shadow-sm">AQLVOY</span>
              <span className="block text-indigo-600 drop-shadow-md">OSHPAZ</span>
            </h1>
            <h2 className="text-sm md:text-3xl font-bold text-slate-700 leading-tight">
              Ushbu loyiha <span className="text-indigo-600 italic underline decoration-indigo-200 decoration-4 underline-offset-4">Sh. Sh. Mirziyoyeva</span> tashabbusi va g‘oyasi asosida ishlab chiqildi
            </h2>
            <p className="text-[10px] md:text-lg text-slate-500 font-medium max-w-2xl leading-relaxed italic">
              Maktabgacha ta’lim tashkilotlari tarbiyalanuvchilari uchun mo‘ljallangan maxsus „Retseptlar kitobi“ loyihasining muallifi va rahbari.
            </p>
          </div>
          <div className="w-2/3 md:w-1/3 shrink-0 relative">
            <div className="absolute inset-0 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <img 
              src="/welcome_image.png" 
              alt="Aqlvoy Oshpaz Mascot" 
              className="relative w-full h-auto drop-shadow-[0_10px_30px_rgba(79,70,229,0.2)] md:drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:rotate-2 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Authors and Reviewers Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
        <div className="xl:col-span-2 space-y-6 md:space-y-10">
          <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
            <h3 className="text-xl md:text-3xl font-black text-slate-900 mb-6 md:mb-10 flex items-center gap-3 md:gap-4 uppercase tracking-tight">
              <div className="w-1.5 h-6 md:h-10 bg-indigo-600 rounded-full"></div>
              Mualliflar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-8">
              {[
                { name: "Sh. Sh. Mirziyoyeva", role: "Maktabgacha ta’lim tashkilotlari uchun retseptlar kitobini ishlab chiqish g‘oyasi muallifi va loyiha rahbari" },
                { name: "B. Chustiy", role: "“Chustiy Group” tarmog‘ining rahbari" },
                { name: "U. T. Muxiddinov", role: "t.f.n., Maktabgacha ta’lim vazirligi boshqarma boshlig‘i" },
                { name: "G. U. Nasurova", role: "t.f.n., Maktabgacha ta’lim vazirligi bosh mutaxassisi" },
                { name: "A. M. Mirzaxamedov", role: "Bolalar ovqatlantirish bo‘yicha texnolog" },
                { name: "Y. G. Tem", role: "Maktabgacha ta’lim vazirligi Bosh boshqarma boshlig‘ining o‘rinbosari" },
                { name: "A. R. Sodiqov", role: "Bolalar ovqatlantirish bo‘yicha texnolog" },
                { name: "B. Babaxanov", role: "“Chustiy Group” texnologi, bosh-oshpazi" },
                { name: "T. Xalilov", role: "“Chustiy Group” bosh oshpazi" },
                { name: "Ya. Alimov", role: "Bosh-konditer, “Chustiy Group” tarmog‘ining novvoyi" },
                { name: "G. I. Shapxova", role: "t.f.d., professor, Toshkent tibbiyot akademiyasi" },
                { name: "R. A. Qosimov", role: "t.f.n., Sanitariya-epidemiologiya xizmati bosh mutaxassisi" },
                { name: "E. S. Tsoy", role: "JSSTning O‘zbekistondagi vakolatxonasi milliy mutaxassisi" }
              ].map((author, index) => (
                <div key={index} className="group border-b border-slate-50 pb-4 md:pb-6 last:border-0">
                  <h4 className="font-black text-slate-900 text-sm md:text-lg mb-1 group-hover:text-indigo-600 transition-colors">{author.name}</h4>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wider">{author.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl sticky top-6">
            <h3 className="text-xl md:text-2xl font-black text-white mb-6 md:mb-8 flex items-center gap-3 md:gap-4 uppercase tracking-tight">
              <div className="w-1.5 h-6 md:h-8 bg-indigo-500 rounded-full"></div>
              Retsenzentlar
            </h3>
            <div className="space-y-6 md:space-y-8">
              {[
                { name: "I. E. Borodina", role: "JSSTning Yevropa mintaqaviy byurosining xalqaro maslahatchisi" },
                { name: "D. A. Zaredinov", role: "t.f.d., professor, “Gigiena” kafedrasi mudiri" },
                { name: "N. J. Ermatov", role: "t.f.d., professor, “Gigiena va ovqatlanish” kafedrasi mudiri" }
              ].map((reviewer, index) => (
                <div key={index} className="border-l-2 border-indigo-500/30 pl-4 md:pl-6">
                  <h4 className="font-black text-white text-sm md:text-lg mb-1">{reviewer.name}</h4>
                  <p className="text-[9px] md:text-[10px] text-indigo-300 font-bold leading-relaxed uppercase tracking-widest">{reviewer.role}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-white/10">
              <div className="flex items-center gap-4">
                <ChefHat className="h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Kitob holati</p>
                  <p className="text-white font-black">TASDIQLANGAN</p>
                </div>
              </div>
            </div>
          </div>
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
                    "{recipe.chefNote}"
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
