import React, { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, Database, Edit3, Flame, Plus, Search, Sparkles, Thermometer, Timer, Utensils, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/api';

type DishForm = {
  id?: string;
  name: string;
  image: string;
  image_2: string;
  category: string;
  cook_time: string;
  cook_temperature: string;
  output_1_3: string;
  output_3_7: string;
  kcal_1_3: string;
  kcal_3_7: string;
  kcal: string;
  iron: string;
  carbs: string;
  vitamins: string;
  ingredients: string;
  technology: string;
  quality_requirements: string;
};

const emptyForm: DishForm = {
  name: '',
  image: '',
  image_2: '',
  category: '',
  cook_time: '',
  cook_temperature: '',
  output_1_3: '',
  output_3_7: '',
  kcal_1_3: '',
  kcal_3_7: '',
  kcal: '0',
  iron: '0',
  carbs: '0',
  vitamins: '',
  ingredients: '',
  technology: '',
  quality_requirements: '',
};

const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');

const normalizeImageUrl = (value?: unknown) => {
  const text = String(value || '').trim();
  if (!text || ['null', 'undefined'].includes(text.toLowerCase())) return '';
  return text;
};

const displayAssetUrl = (value?: string | null) => {
  const src = normalizeImageUrl(value);
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
  return `${apiRoot}${src.startsWith('/') ? '' : '/'}${src}`;
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const ingredientsText = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        const name = item?.name || '';
        const weight = item?.age37Weight || item?.age13Weight || '';
        const net = item?.age37Net || item?.age13Net || '';
        return [name, weight || net].filter(Boolean).join(' - ');
      })
      .filter(Boolean)
      .join('\n');
  }

  const text = String(value || '').trim();
  if (!text) return '';

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? ingredientsText(parsed) : text;
  } catch {
    return text;
  }
};

const splitParagraphs = (value?: string) => String(value || '')
  .split(/\n+/)
  .map((item) => item.trim())
  .filter(Boolean);

const getDishImages = (dish: any) => [
  { src: normalizeImageUrl(dish?.image), label: 'Taom rasmi 1' },
  { src: normalizeImageUrl(dish?.image_2), label: 'Taom rasmi 2' },
].filter((image) => image.src);

export const AqlvoyChefMenu: React.FC = () => {
  const [dishes, setDishes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<DishForm>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'image' | 'image_2' | null>(null);
  const [analyzingPage, setAnalyzingPage] = useState(false);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/kindergartens/dishes/all');
      setDishes(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Taomlar bazasini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDishes();
  }, []);

  const filteredDishes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return dishes;
    return dishes.filter((dish) => [
      dish.name,
      dish.category,
      dish.vitamins,
      dish.technology,
      dish.quality_requirements,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [dishes, search]);

  const stats = useMemo(() => ({
    total: dishes.length,
    fullCards: dishes.filter((dish) => dish.ingredients && dish.technology && dish.quality_requirements).length,
    avgKcal: dishes.length ? Math.round(dishes.reduce((sum, dish) => sum + toNumber(dish.kcal), 0) / dishes.length) : 0,
  }), [dishes]);

  const openCreate = () => {
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (dish: any) => {
    setForm({
      id: dish.id,
      name: dish.name || '',
      image: dish.image || '',
      image_2: dish.image_2 || '',
      category: dish.category || '',
      cook_time: dish.cook_time || '',
      cook_temperature: dish.cook_temperature || '',
      output_1_3: dish.output_1_3 || '',
      output_3_7: dish.output_3_7 || '',
      kcal_1_3: dish.kcal_1_3 || '',
      kcal_3_7: dish.kcal_3_7 || '',
      kcal: String(toNumber(dish.kcal)),
      iron: String(toNumber(dish.iron)),
      carbs: String(toNumber(dish.carbs)),
      vitamins: dish.vitamins || '',
      ingredients: ingredientsText(dish.ingredients),
      technology: dish.technology || '',
      quality_requirements: dish.quality_requirements || '',
    });
    setIsFormOpen(true);
  };

  const saveDish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Taom nomini kiriting');
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      image: form.image.trim() || null,
      image_2: form.image_2.trim() || null,
      kcal: toNumber(form.kcal),
      iron: toNumber(form.iron),
      carbs: toNumber(form.carbs),
    };

    try {
      setSaving(true);
      if (form.id) {
        await apiClient.put(`/kindergartens/dish-items/${form.id}`, payload);
        toast.success('Retsept kartasi yangilandi');
      } else {
        await apiClient.post('/kindergartens/dish-items', payload);
        toast.success("Yangi retsept kartasi qo'shildi");
      }
      setIsFormOpen(false);
      await loadDishes();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (field: 'image' | 'image_2', file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingField(field);
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((state) => ({ ...state, [field]: response.data.url || '' }));
      toast.success('Rasm yuklandi');
    } catch {
      toast.error('Rasm yuklashda xatolik');
    } finally {
      setUploadingField(null);
    }
  };

  const preparePageImage = (file: File) => new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Rasmni tayyorlab bo\'lmadi'));
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Rasmni o\'qib bo\'lmadi'));
    };

    image.src = objectUrl;
  });

  const analyzeBookPage = async (file?: File) => {
    if (!file) return;

    try {
      setAnalyzingPage(true);
      const imageDataUrl = await preparePageImage(file);
      const response = await apiClient.post('/kindergartens/dish-items/analyze-page', { imageDataUrl });
      const analysis = response.data?.analysis || {};

      setForm((state) => ({
        ...state,
        name: analysis.name || state.name,
        category: analysis.category || state.category,
        cook_time: analysis.cook_time || state.cook_time,
        cook_temperature: analysis.cook_temperature || state.cook_temperature,
        output_1_3: analysis.output_1_3 || state.output_1_3,
        output_3_7: analysis.output_3_7 || state.output_3_7,
        kcal_1_3: analysis.kcal_1_3 || state.kcal_1_3,
        kcal_3_7: analysis.kcal_3_7 || state.kcal_3_7,
        kcal: analysis.kcal || state.kcal,
        iron: analysis.iron || state.iron,
        carbs: analysis.carbs || state.carbs,
        vitamins: analysis.vitamins || state.vitamins,
        ingredients: analysis.ingredients || state.ingredients,
        technology: analysis.technology || state.technology,
        quality_requirements: analysis.quality_requirements || state.quality_requirements,
      }));
      toast.success('Kitob sahifasi tahlil qilindi');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Kitob sahifasini tahlil qilib bo\'lmadi');
    } finally {
      setAnalyzingPage(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08100f] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-white">
      <section className="bg-[#101827] text-white rounded-[2rem] border border-white/10 p-6 sm:p-8 shadow-[0_20px_55px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Sparkles size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">Aqlvoy oshpaz</p>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2">Aqlvoy oshpaz taomnoma menusi</h1>
              <p className="text-sm font-bold text-slate-300 mt-2 max-w-2xl">Kitobdagi kabi texnologik karta: masalliqlar jadvali, vaqt, harorat, chiqish, kkal, texnologiya va sifat talablari.</p>
            </div>
          </div>
          <button onClick={openCreate} className="h-14 px-6 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
            <Plus size={18} /> Yangi taom qo'shish
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Jami retseptlar" value={stats.total} icon={Database} />
        <Stat label="Full kartalar" value={stats.fullCards} icon={Utensils} />
        <Stat label="O'rtacha kkal" value={stats.avgKcal} icon={Flame} />
      </section>

      <section className="bg-[#111615] rounded-[2rem] border border-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.24)] overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0b1110]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Retsept kartalari</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Search, edit va qo'shish amallari</p>
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Taom yoki texnologiya bo'yicha qidirish..." className="w-full pl-11 pr-4 py-3.5 bg-[#111615] border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/70 focus:ring-4 focus:ring-indigo-500/10" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm font-black uppercase tracking-widest text-slate-300">Yuklanmoqda...</div>
        ) : filteredDishes.length === 0 ? (
          <div className="p-12 text-center text-sm font-black uppercase tracking-widest text-slate-300">Retsept topilmadi</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-5">
            {filteredDishes.map((dish) => (
              <RecipeCard key={dish.id} dish={dish} onOpen={() => setSelectedDish(dish)} onEdit={() => openEdit(dish)} />
            ))}
          </div>
        )}
      </section>

      {selectedDish && <RecipeModal dish={selectedDish} onClose={() => setSelectedDish(null)} />}

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <form onSubmit={saveDish} className="w-full max-w-5xl bg-[#111615] border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-white">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0b1110]">
              <div>
                <h3 className="text-2xl font-black text-white">{form.id ? 'Retseptni tahrirlash' : 'Yangi retsept kartasi'}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Aqlvoy oshpaz bazasi</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/15">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pt-5">
              <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-500/10 p-4 cursor-pointer hover:bg-emerald-500/15 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={analyzingPage}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    analyzeBookPage(file);
                  }}
                />
                <span className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-[#0b1110] text-emerald-200 flex items-center justify-center shadow-sm border border-white/10">
                    <BookOpenCheck size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-white">Kitob sahifasini yuklab tahlil qilish</span>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">
                      Rasm yuklang, AI tegishli maydonlarni avtomatik to'ldiradi
                    </span>
                  </span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                  {analyzingPage ? 'Tahlil qilinmoqda...' : 'Rasm tanlash'}
                </span>
              </label>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
              <Field label="Taom nomi" value={form.name} onChange={(value) => setForm((state) => ({ ...state, name: value }))} required />
              <Field label="Bo'lim" value={form.category} onChange={(value) => setForm((state) => ({ ...state, category: value }))} />
              <Field label="Vaqti" value={form.cook_time} onChange={(value) => setForm((state) => ({ ...state, cook_time: value }))} />
              <Field label="Harorati" value={form.cook_temperature} onChange={(value) => setForm((state) => ({ ...state, cook_temperature: value }))} />
              <Field label="Chiqishi 1-3" value={form.output_1_3} onChange={(value) => setForm((state) => ({ ...state, output_1_3: value }))} />
              <Field label="Chiqishi 3-7" value={form.output_3_7} onChange={(value) => setForm((state) => ({ ...state, output_3_7: value }))} />
              <Field label="Kkal 1-3" value={form.kcal_1_3} onChange={(value) => setForm((state) => ({ ...state, kcal_1_3: value }))} />
              <Field label="Kkal 3-7" value={form.kcal_3_7} onChange={(value) => setForm((state) => ({ ...state, kcal_3_7: value }))} />
              <Field label="Umumiy kkal" type="number" value={form.kcal} onChange={(value) => setForm((state) => ({ ...state, kcal: value }))} />
              <Field label="Temir" type="number" value={form.iron} onChange={(value) => setForm((state) => ({ ...state, iron: value }))} />
              <Field label="Uglevod" type="number" value={form.carbs} onChange={(value) => setForm((state) => ({ ...state, carbs: value }))} />
              <ImageField
                label="Rasm 1"
                value={form.image}
                uploading={uploadingField === 'image'}
                onUpload={(file) => uploadImage('image', file)}
                onClear={() => setForm((state) => ({ ...state, image: '' }))}
              />
              <ImageField
                label="Rasm 2"
                value={form.image_2}
                uploading={uploadingField === 'image_2'}
                onUpload={(file) => uploadImage('image_2', file)}
                onClear={() => setForm((state) => ({ ...state, image_2: '' }))}
              />
              <TextArea label="Masalliqlar" value={form.ingredients} onChange={(value) => setForm((state) => ({ ...state, ingredients: value }))} rows={8} />
              <TextArea label="Tayyorlash texnologiyasi" value={form.technology} onChange={(value) => setForm((state) => ({ ...state, technology: value }))} rows={8} />
              <TextArea label="Sifatiga qo'yiladigan talablar" value={form.quality_requirements} onChange={(value) => setForm((state) => ({ ...state, quality_requirements: value }))} rows={8} />
              <TextArea label="Vitaminlar / izoh" value={form.vitamins} onChange={(value) => setForm((state) => ({ ...state, vitamins: value }))} rows={8} />
            </div>

            <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:justify-end bg-[#0b1110]">
              <button type="button" onClick={() => setIsFormOpen(false)} className="h-12 px-6 rounded-xl bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/15">Bekor qilish</button>
              <button disabled={saving} className="h-12 px-6 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

const RecipeCard = ({ dish, onOpen, onEdit }: { dish: any; onOpen: () => void; onEdit: () => void }) => {
  const images = getDishImages(dish);

  return (
    <article className="min-w-0 rounded-[8px] border border-white/10 bg-[#0b1110] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)] hover:border-emerald-400/25 transition-all">
      <button onClick={onOpen} className="w-full min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 text-slate-300 font-mono text-[10px]">
          <span>RETSEPT KARTA</span>
          <span className="truncate">{dish.category || 'NON'}</span>
        </div>
        <div className="mt-3 border-y border-white/10 py-3 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-300 truncate">-{dish.category || 'Taom'}-</p>
          <h3 className="mt-2 text-base font-black uppercase tracking-[0.12em] text-white line-clamp-2 min-h-[2.5rem]">{dish.name}</h3>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          <BookMetric icon={Timer} label="Vaqti" value={dish.cook_time || '-'} />
          <BookMetric icon={Thermometer} label="Harorati" value={dish.cook_temperature || '-'} />
          <BookMetric icon={Utensils} label="Chiqishi" value={`${dish.output_1_3 || '-'}/${dish.output_3_7 || '-'}`} />
          <BookMetric icon={Flame} label="Kkal" value={`${dish.kcal_1_3 || toNumber(dish.kcal)}/${dish.kcal_3_7 || '-'}`} />
        </div>
        {images.length > 0 && (
          <div className={`mt-4 grid gap-3 ${images.length === 1 ? 'max-w-[16rem] grid-cols-1 mx-auto' : 'grid-cols-2'}`}>
            {images.map((image) => (
              <FoodImageSlot key={image.label} src={image.src} label={image.label} />
            ))}
          </div>
        )}
        <p className="mt-4 text-xs font-serif leading-5 text-slate-200 line-clamp-3">{dish.technology || dish.vitamins || 'Tayyorlash texnologiyasi kiritilmagan'}</p>
      </button>
      <div className="mt-3">
        <button onClick={onEdit} className="w-full h-10 rounded-xl bg-indigo-500/15 text-indigo-200 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500/20 border border-indigo-400/20">
          <Edit3 size={15} /> Edit
        </button>
      </div>
    </article>
  );
};

const RecipeModal = ({ dish, onClose }: { dish: any; onClose: () => void }) => {
  const ingredients = splitParagraphs(ingredientsText(dish.ingredients));
  const images = getDishImages(dish);
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-7xl max-h-[94vh] overflow-y-auto bg-[#111615] shadow-2xl border border-white/10 text-white">
        <div className="relative px-6 sm:px-10 lg:px-16 py-10">
          <button onClick={onClose} className="absolute right-5 top-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/15">
            <X size={18} />
          </button>

          <header className="text-center border-b border-white/10 pb-8">
            <div className="flex items-center justify-between text-slate-300 font-mono text-sm">
              <span>10</span>
              <span>- {String(dish.category || 'NON').toUpperCase()} -</span>
              <span />
            </div>
            <h2 className="mt-10 text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] text-white">{dish.name}</h2>
          </header>

          <div className="mt-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] gap-8">
            <section>
              <div className="flex items-center gap-5 mb-6">
                <h3 className="text-2xl sm:text-3xl uppercase tracking-[0.18em] font-light text-white">Masalliqlar</h3>
                <div className="h-px bg-white/10 flex-1" />
              </div>
              <div className="rounded-[8px] border border-white/10 bg-[#0b1110] p-5 font-serif text-base leading-8 text-slate-100 whitespace-pre-wrap">
                {ingredients.length ? ingredients.join('\n') : 'Masalliqlar kiritilmagan'}
              </div>
              {images.length > 0 && (
                <div className={`mt-8 grid gap-6 ${images.length === 1 ? 'max-w-xl grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {images.map((image) => (
                    <BookFoodImage key={image.label} src={image.src} alt={`${dish.name} ${image.label}`} label={image.label} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-8">
              <div className="grid grid-cols-4 gap-3">
                <BookMetric icon={Timer} label="Vaqti" value={dish.cook_time || '-'} />
                <BookMetric icon={Thermometer} label="Harorati" value={dish.cook_temperature || '-'} />
                <BookMetric icon={Utensils} label="Chiqishi" value={`${dish.output_1_3 || '-'}/${dish.output_3_7 || '-'}`} />
                <BookMetric icon={Flame} label="Kkal" value={`${dish.kcal_1_3 || '-'}/${dish.kcal_3_7 || '-'}`} />
              </div>
              <BookTextBlock title="Tayyorlash texnologiyasi" text={dish.technology} />
              <BookTextBlock title="Sifatiga qo'yiladigan talablar" text={dish.quality_requirements} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => (
  <div className="bg-[#111615] border border-white/10 rounded-2xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)] flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-200 bg-indigo-500/15 ring-1 ring-indigo-400/25"><Icon size={22} /></div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </div>
);

const BookMetric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) => (
  <div className="min-w-0 text-center">
    <div className="mx-auto w-9 h-9 rounded-full border-2 border-indigo-400/30 text-indigo-200 flex items-center justify-center bg-indigo-500/10">
      <Icon size={16} />
    </div>
    <p className="mt-2 text-[8px] font-black uppercase tracking-[0.14em] text-white">{label}</p>
    <p className="mt-1 text-[11px] leading-tight font-serif text-slate-200 break-words">{value}</p>
  </div>
);

const FoodImageSlot = ({ src, label }: { src?: string | null; label: string }) => {
  const imageSrc = normalizeImageUrl(src);
  if (!imageSrc) return null;

  return (
    <div className="h-28 sm:h-32 flex items-center justify-center overflow-hidden">
      <img src={displayAssetUrl(imageSrc)} alt={label} className="w-full h-full object-contain" />
    </div>
  );
};

const BookFoodImage = ({ src, alt, label }: { src?: string | null; alt: string; label: string }) => {
  const imageSrc = normalizeImageUrl(src);
  if (!imageSrc) return null;

  return (
    <figure className="h-72 sm:h-80 flex items-center justify-center overflow-hidden">
      <img src={displayAssetUrl(imageSrc)} alt={alt || label} className="w-full h-full object-contain" />
    </figure>
  );
};

const BookTextBlock = ({ title, text }: { title: string; text?: string }) => {
  const paragraphs = splitParagraphs(text);
  return (
    <section>
      <h3 className="text-2xl sm:text-3xl uppercase tracking-[0.18em] font-light text-white mb-5">{title}</h3>
      <div className="space-y-4">
        {paragraphs.length === 0 ? (
          <p className="font-serif text-lg leading-8 text-slate-300">-</p>
        ) : (
          paragraphs.map((paragraph, index) => (
            <p key={index} className="font-serif text-lg leading-8 text-slate-100 indent-8">{paragraph}</p>
          ))
        )}
      </div>
    </section>
  );
};

const Field = ({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) => (
  <label>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
    <input type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? '0.1' : undefined} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1110] px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/70 focus:ring-4 focus:ring-indigo-500/10" />
  </label>
);

const ImageField = ({
  label,
  value,
  uploading,
  onUpload,
  onClear,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onUpload: (file?: File) => void;
  onClear: () => void;
}) => (
  <div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
    <div className="mt-2 rounded-2xl border border-white/10 bg-[#0b1110] p-3">
      <div className="h-32 rounded-xl border border-dashed border-white/15 bg-transparent overflow-hidden flex items-center justify-center">
        {value ? (
          <img src={displayAssetUrl(value)} alt={label} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center">
            <Utensils className="mx-auto text-slate-300" size={24} />
            <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-300">Rasm tanlanmagan</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <label className="h-12 px-4 rounded-2xl bg-indigo-500/15 text-indigo-200 text-[10px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer border border-indigo-400/25">
          {uploading ? 'Yuklanmoqda...' : value ? 'Rasmni almashtirish' : 'Rasm yuklash'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => onUpload(event.target.files?.[0])}
            disabled={uploading}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="h-12 px-4 rounded-2xl bg-rose-500/15 text-rose-200 text-[10px] font-black uppercase tracking-widest border border-rose-400/25"
          >
            O'chirish
          </button>
        )}
      </div>
    </div>
  </div>
);

const TextArea = ({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) => (
  <label className="lg:col-span-2">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
    <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1110] px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/70 focus:ring-4 focus:ring-indigo-500/10 resize-none" />
  </label>
);
