import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChefHat, Clock, Users, Flame, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient } from '@/shared/api';
import FaslSelector from './ui/FaslSelector';

type DishRecord = {
  id: string;
  name?: string | null;
  image?: string | null;
  image_2?: string | null;
  category?: string | null;
  cook_time?: string | null;
  output_1_3?: string | null;
  output_3_7?: string | null;
  kcal?: number | string | null;
  kcal_1_3?: string | null;
  kcal_3_7?: string | null;
  ingredients?: unknown;
  technology?: string | null;
  vitamins?: string | null;
  quality_requirements?: string | null;
};

type RecipeCardData = {
  id: string;
  title: string;
  category: string;
  time: string;
  servings: string;
  calories: string;
  ingredients: string[];
  images: string[];
  chefNote: string;
  searchText: string;
};

const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');

const normalizeAssetPath = (value?: unknown) => {
  const text = String(value || '').trim();
  if (!text || ['null', 'undefined'].includes(text.toLowerCase())) return '';
  return text;
};

const displayAssetUrl = (value?: string | null) => {
  const src = normalizeAssetPath(value);
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
  return `${apiRoot}${src.startsWith('/') ? '' : '/'}${src}`;
};

const dishImages = (dish: DishRecord) => [dish.image, dish.image_2]
  .map((image) => displayAssetUrl(image))
  .filter(Boolean);

const extractIngredientNames = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return '';
        const record = item as Record<string, unknown>;
        const amount = record.age37Weight || record.age13Weight || record.age37Net || record.age13Net || '';
        return [record.name, amount].filter(Boolean).join(' - ');
      })
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  const text = String(value || '').trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return extractIngredientNames(parsed);
  } catch {
    // Plain text ingredients are handled below.
  }

  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\s]+/, '').trim())
    .filter((line) => line && !/^\d-\d\s*yosh/i.test(line))
    .slice(0, 8);
};

const formatOutput = (dish: DishRecord) => {
  const first = String(dish.output_1_3 || '').trim();
  const second = String(dish.output_3_7 || '').trim();
  if (first && second) return `${first}/${second}`;
  return first || second || '-';
};

const formatKcal = (dish: DishRecord) => {
  const first = String(dish.kcal_1_3 || '').trim();
  const second = String(dish.kcal_3_7 || '').trim();
  if (first && second) return `${first}/${second} kkal`;
  const kcal = Number(dish.kcal || 0);
  return kcal > 0 ? `${kcal} kkal` : '-';
};

const buildRecipeCard = (dish: DishRecord): RecipeCardData => {
  const ingredients = extractIngredientNames(dish.ingredients);
  const title = String(dish.name || 'Nomsiz taom').trim();
  const category = String(dish.category || 'Aqlvoy oshpaz').trim();
  const chefNote = String(dish.technology || dish.quality_requirements || dish.vitamins || 'Retsept texnologiyasi tez orada kiritiladi.').trim();

  return {
    id: String(dish.id),
    title,
    category,
    time: String(dish.cook_time || '-').trim(),
    servings: formatOutput(dish),
    calories: formatKcal(dish),
    ingredients: ingredients.length ? ingredients : ['Masalliqlar kiritilmagan'],
    images: dishImages(dish),
    chefNote,
    searchText: [title, category, chefNote, ingredients.join(' ')].join(' ').toLowerCase(),
  };
};

export default function RetseptlarKitobi() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFasl, setActiveFasl] = useState('summer');
  const [dishes, setDishes] = useState<DishRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeSocialSlide, setActiveSocialSlide] = useState(0);
  const authorRoles = [
    { name: "Sh. Sh. Mirziyoyeva", roleKey: "recipes.roleProjectAuthor" },
    { name: "B. Chustiy", roleKey: "recipes.roleChustiyLeader" },
    { name: "U. T. Muxiddinov", roleKey: "recipes.roleMtvHead" },
    { name: "G. U. Nasurova", roleKey: "recipes.roleMtvSpecialist" },
    { name: "A. M. Mirzaxamedov", roleKey: "recipes.roleFoodTechnologist" },
    { name: "Y. G. Tem", roleKey: "recipes.roleMtvDeputy" },
    { name: "A. R. Sodiqov", roleKey: "recipes.roleFoodTechnologist" },
    { name: "B. Babaxanov", roleKey: "recipes.roleChiefChef" },
    { name: "T. Xalilov", roleKey: "recipes.roleChef" },
    { name: "Ya. Alimov", roleKey: "recipes.roleConfectioner" },
    { name: "G. I. Shapxova", roleKey: "recipes.roleProfessorTta" },
    { name: "R. A. Qosimov", roleKey: "recipes.roleSesSpecialist" },
    { name: "E. S. Tsoy", roleKey: "recipes.roleWhoSpecialist" },
  ];
  const reviewerRoles = [
    { name: "I. E. Borodina", roleKey: "recipes.roleWhoConsultant" },
    { name: "D. A. Zaredinov", roleKey: "recipes.roleHygieneHead" },
    { name: "N. J. Ermatov", roleKey: "recipes.roleNutritionHead" },
  ];
  const socialSlides = [
    {
      src: "https://data.daryo.uz/media/cache/2019/04/photo_2019-04-04_17-05-07-680x453.jpg",
      label: "Bolalar bilan uchrashuv",
      desc: "Maxsus ehtiyojli bolalarga sovg'alar topshirildi",
      title: t('recipes.supportChildren'),
      accent: t('recipes.together'),
    },
    {
      src: "https://data.daryo.uz/media/cache/2019/04/photo_2019-04-04_17-05-34-680x453.jpg",
      label: "G'amxo'rlik lahzasi",
      desc: "Har bir bolaga alohida e'tibor va mehribonlik",
      title: "Har bir bolaga alohida",
      accent: "mehr va e'tibor",
    },
    {
      src: "https://data.daryo.uz/media/cache/2019/04/photo_2019-04-04_17-05-25-680x453.jpg",
      label: "Birga kuchli",
      desc: "Jamiyat va davlat birgalikda ishlaydi",
      title: "Teng imkoniyatlar sari",
      accent: "birgalikda",
    },
  ];

  const goSocialSlide = (direction: 'prev' | 'next') => {
    setActiveSocialSlide((current) => {
      if (direction === 'prev') return current === 0 ? socialSlides.length - 1 : current - 1;
      return (current + 1) % socialSlides.length;
    });
  };

  useEffect(() => {
    let active = true;

    const loadDishes = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const response = await apiClient.get('/kindergartens/dishes/all');
        if (active) {
          setDishes(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (active) {
          setDishes([]);
          setLoadError('Aqlvoy oshpaz retseptlarini yuklab bolmadi');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDishes();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSocialSlide((current) => (current + 1) % socialSlides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [socialSlides.length]);

  const dynamicRecipes = useMemo(
    () => dishes.map(buildRecipeCard),
    [dishes]
  );

  const filteredRecipes = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return dynamicRecipes;
    return dynamicRecipes.filter((recipe) => recipe.searchText.includes(term));
  }, [dynamicRecipes, searchQuery]);

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
              <span className="block text-indigo-600">{t('recipes.chef')}</span>
            </h1>
            <p className="text-lg md:text-2xl font-bold text-slate-800 leading-snug max-w-lg">
              {t('recipes.projectPrefix')} <span className="text-indigo-600 underline underline-offset-4">Sh. Sh. Mirziyoyeva</span> {t('recipes.projectSuffix')}
            </p>
            <p className="text-sm md:text-base text-slate-500 italic leading-relaxed max-w-md">
              {t('recipes.intro')}
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
            <p className="text-[16px] font-black text-slate-900 uppercase tracking-widest">{t('recipes.authors')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            {authorRoles.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <div>
                  <p className="text-[15px] font-black text-slate-800 leading-tight">{a.name}</p>
                  <p className="text-[13px] font-semibold text-slate-400 leading-tight mt-0.5">{t(a.roleKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-5 bg-slate-300 rounded-full" />
            <p className="text-[16px] font-black text-slate-900 uppercase tracking-widest">{t('recipes.reviewers')}</p>
          </div>
          <div className="space-y-3">
            {reviewerRoles.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <div>
                  <p className="text-[15px] font-black text-slate-800 leading-tight">{r.name}</p>
                  <p className="text-[13px] font-semibold text-slate-400 leading-tight mt-0.5">{t(r.roleKey)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <ChefHat className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-[12px] font-black text-emerald-700 uppercase tracking-wider">{t('recipes.approved')}</p>
          </div>
        </div>
      </div>

      {/* ── SHAHNOZA MIRZIYOYEVA TASHABBUSI ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-rose-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-400">{t('recipes.socialInitiative')}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-rose-100 to-transparent" />
        </div>

        {/* Asosiy karta */}
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #1a0a1e 0%, #2d1b3d 50%, #1a0a1e 100%)' }}>
          <motion.div
            key={activeSocialSlide}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-2"
          >
            <div className="relative min-h-[340px]">
              <img
                src={socialSlides[activeSocialSlide].src}
                alt={socialSlides[activeSocialSlide].label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', minHeight: 340 }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #1a0a1e)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1a0a1e 0%, transparent 50%)' }} />
              <div className="absolute bottom-5 left-5">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black text-rose-300 uppercase tracking-widest border" style={{ background: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.3)' }}>
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                  {t('recipes.socialInitiative')}
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center gap-5">
              <div className="flex items-center gap-2">
                {socialSlides.map((slide, index) => (
                  <button
                    key={slide.label}
                    type="button"
                    onClick={() => setActiveSocialSlide(index)}
                    aria-label={`${slide.label} slaydini ochish`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeSocialSlide === index ? 'w-10 bg-rose-300' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
              <h4 className="text-[26px] font-black text-white leading-tight">
                {socialSlides[activeSocialSlide].title} <span className="text-rose-300">{socialSlides[activeSocialSlide].accent}</span>
              </h4>
              <p className="text-[14px] leading-relaxed font-medium" style={{ color: 'rgba(203,213,225,0.85)' }}>
                {t('recipes.socialDesc')}
              </p>
              <blockquote className="border-l-4 border-rose-400 pl-4">
                <p className="text-[13px] italic font-medium text-rose-200 leading-relaxed">
                  "Har bir bola — alohida dunyo. Ularning qalbidagi nur bizning kelajagimizdir. Biror bolaning ko'zlarida umid ko'rsak, uni so'ndirmasligimiz kerak."
                </p>
                <p className="text-[11px] font-black text-rose-400 uppercase tracking-wider mt-2">— Shahnoza Mirziyoyeva</p>
              </blockquote>
              <div className="flex flex-wrap gap-2 pt-2">
                {[t('recipes.tagSpecial'), t('recipes.tagInclusive'), t('recipes.tagSupport'), t('recipes.tagEqual')].map((tag, i) => (
                  <span key={i} className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full" style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.2)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-y-0 left-3 flex items-center">
            <button
              type="button"
              onClick={() => goSocialSlide('prev')}
              className="h-11 w-11 rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-md flex items-center justify-center transition hover:bg-rose-500/80"
              aria-label="Oldingi slayd"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button
              type="button"
              onClick={() => goSocialSlide('next')}
              className="h-11 w-11 rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-md flex items-center justify-center transition hover:bg-rose-500/80"
              aria-label="Keyingi slayd"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 3 ta kichik rasm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {socialSlides.map((item, i) => {
            const isActive = activeSocialSlide === i;
            return (
            <motion.button
              type="button"
              onClick={() => setActiveSocialSlide(i)}
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className={`group rounded-2xl overflow-hidden shadow-md relative text-left transition-all duration-300 ${isActive ? 'ring-2 ring-rose-300 ring-offset-2 ring-offset-[#0f172a]' : 'hover:-translate-y-1 hover:shadow-xl'}`}
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
            </motion.button>
            );
          })}
        </div>
      </div>

      {/* Header and Search */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center justify-between bg-white p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="max-w-xl">
          <h2 className="text-lg md:text-4xl font-black text-slate-900 tracking-tight mb-1 md:mb-2 flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 bg-indigo-50 rounded-xl md:rounded-2xl">
              <ChefHat className="h-5 w-5 md:h-10 md:w-10 text-indigo-600" />
            </div>
            {t('recipes.collection')}
          </h2>
          <p className="text-[10px] md:text-base text-slate-500 font-medium ml-1 md:ml-2 uppercase tracking-widest">{t('recipes.verifiedByChefs')}</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96 group">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 md:h-5 md:w-5 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder={t('recipes.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 md:pl-14 pr-4 md:pr-6 py-3 md:py-5 rounded-xl md:rounded-3xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 transition-all font-bold text-slate-900 text-xs md:text-base shadow-inner"
            />
          </div>
        </div>
      </div>

      <FaslSelector activeFasl={activeFasl} setActiveFasl={setActiveFasl} />

      {/* Recipe Grid */}
      {loadError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="py-16 md:py-24 text-center bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 md:w-20 md:h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 animate-pulse">
            <ChefHat className="h-6 w-6 md:h-9 md:w-9 text-indigo-500" />
          </div>
          <h3 className="text-base md:text-xl font-black text-slate-900 mb-1 md:mb-2">Retseptlar yuklanmoqda...</h3>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium max-w-xs md:max-w-sm mx-auto px-4">Aqlvoy oshpaz bazasidagi taomlar olinmoqda.</p>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="group bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full">
              <div className="h-48 md:h-64 bg-white relative overflow-hidden border-b border-slate-100">
                 <div className="absolute top-3 left-3 md:top-4 left-4 z-10 bg-white text-slate-950 px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-md border border-slate-200 flex items-center gap-1.5 md:gap-2">
                   <Heart className="h-2 w-2 md:h-3 md:w-3 text-rose-500 fill-rose-500" />
                   {t('recipes.food')}
                 </div>
                 {recipe.images.length > 0 ? (
                   <div className={`h-full w-full grid ${recipe.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 gap-1.5 p-1.5 md:gap-2 md:p-2'}`}>
                     {recipe.images.map((image, imageIndex) => (
                       <div key={image} className="min-w-0 h-full flex items-center justify-center overflow-hidden bg-white">
                         <img
                           src={image}
                           alt={`${recipe.title} rasmi ${imageIndex + 1}`}
                           className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700"
                         />
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-white">
                     <ChefHat className="h-16 w-16 text-slate-300" />
                   </div>
                 )}
              </div>
              <div className="p-4 md:p-8 flex-1 flex flex-col">
                <div className="mb-4 md:mb-6">
                  <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{recipe.category}</p>
                  <h4 className="mt-1.5 text-xl md:text-3xl font-black leading-[0.95] tracking-tight text-slate-950 uppercase line-clamp-2">
                    {recipe.title}
                  </h4>
                </div>
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
                    {t('recipes.ingredients')}
                  </div>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {recipe.ingredients.map(ing => (
                      <span key={`${recipe.id}-${ing}`} className="bg-indigo-50/50 text-indigo-700 text-[8px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1.5 rounded-md md:rounded-xl border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-default">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/50 p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-amber-100/50 mb-4 md:mb-6">
                  <p className="text-[10px] md:text-xs text-amber-800 font-medium italic leading-relaxed">
                    <span className="font-black not-italic text-amber-600 mr-1.5 md:mr-2 uppercase text-[8px] md:text-[10px]">{t('recipes.tip')}:</span>
                    &ldquo;{recipe.chefNote}&rdquo;
                  </p>
                </div>

                <button className="w-full mt-auto bg-slate-900 text-white py-2.5 md:py-4 rounded-lg md:rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md hover:shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2">
                  {t('recipes.viewFull')}
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
          <h3 className="text-base md:text-xl font-black text-slate-900 mb-1 md:mb-2">{t('recipes.notFound')}</h3>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium max-w-xs md:max-w-sm mx-auto px-4">{t('recipes.notFoundDesc')}</p>
        </div>
      )}
    </div>
  );
}
