import React, { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, Database, Download, Edit3, FileSpreadsheet, Flame, Plus, Search, Sparkles, Thermometer, Timer, Trash2, Utensils, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { apiClient } from '@/shared/api';
import { FoodImagePreview } from '@/shared/components/FoodImagePreview';
import { isAqlvoyDefaultDish, withAqlvoyDefaultDishes } from '@/features/kindergarten-admin/lib/aqlvoyChefDishes';

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

const normalizeExcelHeader = (value: unknown) => String(value || '')
  .toLowerCase()
  .replace(/[’'`ʻʼ]/g, '')
  .replace(/[().,;:/\\|_-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const cellText = (value: unknown) => String(value ?? '').trim();

const cellNumberText = (value: unknown) => {
  const text = cellText(value).replace(',', '.');
  const numberText = text.replace(/[^\d.-]/g, '');
  if (!numberText) return '';
  const number = Number(numberText);
  return Number.isFinite(number) ? String(number) : '';
};

const getExcelValue = (row: Record<string, unknown>, aliases: string[]) => {
  const normalizedAliases = aliases.map(normalizeExcelHeader);
  const entry = Object.entries(row).find(([key]) => normalizedAliases.includes(normalizeExcelHeader(key)));
  return entry ? entry[1] : '';
};

const firstFilledCell = (row: Record<string, unknown>) => Object.values(row).find((value) => cellText(value));

const rowToDishPayload = (row: Record<string, unknown>) => {
  const name = cellText(getExcelValue(row, [
    'Taom nomi',
    'Ovqat nomi',
    'Nomi',
    'Taom',
    'Name',
    'Meal name',
    'Meal',
    'Название',
    'Блюдо',
    'Таом номи',
    'Овқат номи',
  ]) || firstFilledCell(row));

  return {
    name,
    image: cellText(getExcelValue(row, ['Rasm', 'Rasm 1', 'Image', 'Image 1', 'Photo', 'URL', 'Rasm url'])),
    image_2: cellText(getExcelValue(row, ['Rasm 2', 'Image 2', 'Photo 2', 'Ikkinchi rasm'])),
    category: cellText(getExcelValue(row, ['Bo\'lim', 'Bolim', 'Kategoriya', 'Category', 'Tur', 'Turi', 'Раздел', 'Категория'])),
    cook_time: cellText(getExcelValue(row, ['Vaqti', 'Pishirish vaqti', 'Cook time', 'Time', 'Время'])),
    cook_temperature: cellText(getExcelValue(row, ['Harorati', 'Harorat', 'Temperature', 'Cook temperature', 'Температура'])),
    output_1_3: cellText(getExcelValue(row, ['Chiqishi 1-3', 'Chiqish 1-3', 'Output 1-3', '1-3 yosh chiqishi'])),
    output_3_7: cellText(getExcelValue(row, ['Chiqishi 3-7', 'Chiqish 3-7', 'Output 3-7', '3-7 yosh chiqishi'])),
    kcal_1_3: cellNumberText(getExcelValue(row, ['Kkal 1-3', 'Kaloriya 1-3', 'Calories 1-3'])),
    kcal_3_7: cellNumberText(getExcelValue(row, ['Kkal 3-7', 'Kaloriya 3-7', 'Calories 3-7'])),
    kcal: cellNumberText(getExcelValue(row, ['Kkal', 'Kaloriya', 'Calories', 'Calorie', 'Umumiy kkal'])),
    iron: cellNumberText(getExcelValue(row, ['Temir', 'Iron', 'Fe'])),
    carbs: cellNumberText(getExcelValue(row, ['Uglevod', 'Uglevodlar', 'Carbs', 'Carbohydrates'])),
    vitamins: cellText(getExcelValue(row, ['Vitamin', 'Vitaminlar', 'Vitamins', 'Izoh', 'Mineral'])),
    ingredients: cellText(getExcelValue(row, ['Masalliqlar', 'Mahsulotlar', 'Tarkib', 'Ingredients', 'Products', 'Состав'])),
    technology: cellText(getExcelValue(row, ['Texnologiya', 'Tayyorlash texnologiyasi', 'Technology', 'Preparation', 'Технология'])),
    quality_requirements: cellText(getExcelValue(row, ['Sifat talablari', 'Sifatiga qo\'yiladigan talablar', 'Quality requirements', 'Quality', 'Требования'])),
  };
};

const parseExcelDishes = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  return workbook.SheetNames.flatMap((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return [];

    return XLSX.utils
      .sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: false })
      .map(rowToDishPayload)
      .filter((dish) => dish.name);
  });
};

const dishToExcelRow = (dish: any) => ({
  'Taom nomi': dish.name || '',
  'Bo\'lim': dish.category || '',
  'Vaqti': dish.cook_time || '',
  'Harorati': dish.cook_temperature || '',
  'Chiqishi 1-3': dish.output_1_3 || '',
  'Chiqishi 3-7': dish.output_3_7 || '',
  'Kkal 1-3': dish.kcal_1_3 || '',
  'Kkal 3-7': dish.kcal_3_7 || '',
  'Umumiy kkal': dish.kcal || 0,
  'Temir': dish.iron || 0,
  'Uglevod': dish.carbs || 0,
  'Vitaminlar': dish.vitamins || '',
  'Masalliqlar': ingredientsText(dish.ingredients),
  'Tayyorlash texnologiyasi': dish.technology || '',
  'Sifatiga qo\'yiladigan talablar': dish.quality_requirements || '',
  'Rasm': dish.image || '',
  'Rasm 2': dish.image_2 || '',
});

const normalizedDishName = (value: unknown) => cellText(value).toLowerCase();

const normalizeCategoryKey = (value: unknown) => {
  const normalized = cellText(value)
    .toLowerCase()
    .replace(/[’'`ʻʼ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized.replace(/lar$/i, '');
};

export const AqlvoyChefMenu: React.FC<{ readOnly?: boolean; managementEditOnly?: boolean }> = ({
  readOnly = false,
  managementEditOnly = false,
}) => {
  const canEdit = !readOnly;
  const canCreateAndImport = canEdit && !managementEditOnly;
  const canDelete = canEdit && !managementEditOnly;
  const [dishes, setDishes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [form, setForm] = useState<DishForm>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'image' | 'image_2' | null>(null);
  const [analyzingPage, setAnalyzingPage] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/kindergartens/dishes/all');
      setDishes(withAqlvoyDefaultDishes(Array.isArray(res.data) ? res.data : []));
    } catch {
      setDishes(withAqlvoyDefaultDishes([]));
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
    return dishes.filter((dish) => {
      const matchesCategory = categoryFilter === 'ALL' || normalizeCategoryKey(dish.category) === categoryFilter;
      const matchesSearch = !term || [
        dish.name,
        dish.category,
        dish.vitamins,
        dish.technology,
        dish.quality_requirements,
      ].some((value) => String(value || '').toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [dishes, search, categoryFilter]);

  const categoryOptions = useMemo(() => (
    Array.from(dishes.reduce((map, dish) => {
      const rawCategory = String(dish.category || '').trim();
      const key = normalizeCategoryKey(rawCategory);
      if (!key) return map;

      const existing = map.get(key);
      map.set(key, {
        key,
        label: existing?.label || rawCategory,
        count: (existing?.count || 0) + 1,
      });
      return map;
    }, new Map<string, { key: string; label: string; count: number }>()).values())
      .sort((a, b) => a.label.localeCompare(b.label, 'uz'))
  ), [dishes]);

  const stats = useMemo(() => ({
    total: dishes.length,
    fullCards: dishes.filter((dish) => dish.ingredients && dish.technology && dish.quality_requirements).length,
    avgKcal: dishes.length ? Math.round(dishes.reduce((sum, dish) => sum + toNumber(dish.kcal), 0) / dishes.length) : 0,
  }), [dishes]);

  const openCreate = () => {
    if (!canCreateAndImport) return;
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (dish: any) => {
    if (!canEdit) return;
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

  const importExcelDishes = async (files?: FileList | File[] | null) => {
    if (!canCreateAndImport) {
      toast.error('Bu rolda import qilish mumkin emas');
      return;
    }
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    const unsupportedFile = selectedFiles.find((file) => !/\.(xlsx|xls|csv)$/i.test(file.name));
    if (unsupportedFile) {
      toast.error('Excel yoki CSV fayl yuklang');
      return;
    }

    try {
      setImportingExcel(true);
      const parsedDishes = (await Promise.all(selectedFiles.map(parseExcelDishes))).flat();
      if (parsedDishes.length === 0) {
        toast.error('Excel ichidan taom nomlari topilmadi');
        return;
      }

      const existingNames = new Set(
        dishes
          .filter((dish) => !isAqlvoyDefaultDish(dish))
          .map((dish) => normalizedDishName(dish.name))
          .filter(Boolean)
      );
      const seenImportNames = new Set<string>();
      const importableDishes = parsedDishes.filter((dish) => {
        const key = normalizedDishName(dish.name);
        if (!key || existingNames.has(key) || seenImportNames.has(key)) return false;
        seenImportNames.add(key);
        return true;
      });
      const skipped = parsedDishes.length - importableDishes.length;

      if (importableDishes.length === 0) {
        toast.info(`Yangi taom topilmadi. ${skipped} ta qator allaqachon bazada bor yoki takrorlangan.`);
        return;
      }

      let added = 0;
      let failed = 0;
      const batchSize = 5;

      for (let index = 0; index < importableDishes.length; index += batchSize) {
        const batch = importableDishes.slice(index, index + batchSize);
        const results = await Promise.allSettled(batch.map((dish) => apiClient.post('/kindergartens/dish-items', dish)));
        added += results.filter((result) => result.status === 'fulfilled').length;
        failed += results.filter((result) => result.status === 'rejected').length;
      }

      await loadDishes();
      if (failed > 0) {
        toast.error(`${added} ta taom qo'shildi, ${failed} ta qator qo'shilmadi`);
      } else {
        toast.success(`${added} ta taom Aqlvoy oshpaz menyusiga import qilindi${skipped ? `, ${skipped} ta takror qator o'tkazildi` : ''}`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Excel import qilishda xatolik');
    } finally {
      setImportingExcel(false);
    }
  };

  const saveDish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) {
      toast.error('Bu rolda retseptlarni o\'zgartirish mumkin emas');
      return;
    }
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
    if (!canEdit) return;
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

  const deleteDish = async (dish: any) => {
    if (!canDelete || isAqlvoyDefaultDish(dish)) return;
    const confirmed = window.confirm(`"${dish.name}" taomini o'chirishni tasdiqlaysizmi?`);
    if (!confirmed) return;

    try {
      await apiClient.delete(`/kindergartens/dish-items/${dish.id}`);
      toast.success('Taom o\'chirildi');
      if (selectedDish?.id === dish.id) setSelectedDish(null);
      await loadDishes();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Taomni o\'chirishda xatolik');
    }
  };

  const exportExcelDishes = () => {
    const exportableDishes = dishes.filter((dish) => !isAqlvoyDefaultDish(dish));
    if (exportableDishes.length === 0) {
      toast.info('Export qilish uchun taom topilmadi');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportableDishes.map(dishToExcelRow));
    worksheet['!cols'] = [
      { wch: 32 },
      { wch: 24 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 34 },
      { wch: 46 },
      { wch: 46 },
      { wch: 46 },
      { wch: 34 },
      { wch: 34 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Aqlvoy taomlar');
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `aqlvoy-taomlar-${date}.xlsx`);
    toast.success(`${exportableDishes.length} ta taom Excel faylga export qilindi`);
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
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <section className="bg-[#0b1120] text-white rounded-[2rem] border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Sparkles size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">Aqlvoy oshpaz</p>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2">Aqlvoy oshpaz taomnoma menusi</h1>
              <p className="text-sm font-bold text-slate-400 mt-2 max-w-2xl">Kitobdagi kabi texnologik karta: masalliqlar jadvali, vaqt, harorat, chiqish, kkal, texnologiya va sifat talablari.</p>
            </div>
          </div>
          {readOnly ? (
            <div className="h-14 px-6 rounded-2xl bg-white/10 text-emerald-200 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10">
              <BookOpenCheck size={18} /> Faqat ko'rish
            </div>
          ) : managementEditOnly ? (
            <div className="h-14 px-6 rounded-2xl bg-white/10 text-emerald-200 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10">
              <Edit3 size={18} /> Faqat tahrirlash
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <label className={`h-14 px-6 rounded-2xl bg-white/10 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 transition-colors ${importingExcel ? 'opacity-60 cursor-wait' : 'hover:bg-white/15 cursor-pointer'}`}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  className="hidden"
                  disabled={importingExcel}
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    event.target.value = '';
                    importExcelDishes(files);
                  }}
                />
                <FileSpreadsheet size={18} /> {importingExcel ? 'Import qilinmoqda...' : 'Barcha menyuni import'}
              </label>
              <button
                type="button"
                onClick={exportExcelDishes}
                disabled={dishes.length === 0}
                className="h-14 px-6 rounded-2xl bg-white/10 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} /> Barchasini export
              </button>
              <button onClick={openCreate} className="h-14 px-6 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
                <Plus size={18} /> Yangi taom qo'shish
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Jami retseptlar" value={stats.total} icon={Database} />
        <Stat label="Full kartalar" value={stats.fullCards} icon={Utensils} />
        <Stat label="O'rtacha kkal" value={stats.avgKcal} icon={Flame} />
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Retsept kartalari</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
              {filteredDishes.length} ta retsept ko'rsatilmoqda
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] gap-3 w-full xl:w-[760px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Taom yoki texnologiya bo'yicha qidirish..." className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-400" />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full appearance-none px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
              >
                <option value="ALL">Barcha taom turlari ({dishes.length})</option>
                {categoryOptions.map((item) => (
                  <option key={item.key} value={item.key}>{item.label} ({item.count})</option>
                ))}
              </select>
              {categoryFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white text-slate-400 border border-slate-200 flex items-center justify-center hover:text-slate-700"
                  aria-label="Taom turi filterini tozalash"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm font-black uppercase tracking-widest text-slate-400">Yuklanmoqda...</div>
        ) : filteredDishes.length === 0 ? (
          <div className="p-12 text-center text-sm font-black uppercase tracking-widest text-slate-400">Retsept topilmadi</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-5">
            {filteredDishes.map((dish) => (
              <RecipeCard
                key={dish.id}
                dish={dish}
                canEdit={canEdit && !isAqlvoyDefaultDish(dish)}
                canDelete={canDelete && !isAqlvoyDefaultDish(dish)}
                onOpen={() => setSelectedDish(dish)}
                onEdit={() => openEdit(dish)}
                onDelete={() => deleteDish(dish)}
              />
            ))}
          </div>
        )}
      </section>

      {selectedDish && <RecipeModal dish={selectedDish} onClose={() => setSelectedDish(null)} />}

      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <form onSubmit={saveDish} className="w-full max-w-5xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{form.id ? 'Retseptni tahrirlash' : 'Yangi retsept kartasi'}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Aqlvoy oshpaz bazasi</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pt-5">
              <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/70 p-4 cursor-pointer hover:bg-emerald-50 transition-colors">
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
                  <span className="w-11 h-11 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                    <BookOpenCheck size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-900">Kitob sahifasini yuklab tahlil qilish</span>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                      Rasm yuklang, AI tegishli maydonlarni avtomatik to'ldiradi
                    </span>
                  </span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
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

            <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button type="button" onClick={() => setIsFormOpen(false)} className="h-12 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest">Bekor qilish</button>
              <button disabled={saving} className="h-12 px-6 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

const RecipeCard = ({
  dish,
  canEdit,
  canDelete,
  onOpen,
  onEdit,
  onDelete,
}: {
  dish: any;
  canEdit?: boolean;
  canDelete?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const images = getDishImages(dish);

  return (
    <article className="min-w-0 rounded-[8px] border border-stone-200 bg-[#fffdf6] p-3 shadow-sm hover:shadow-lg transition-shadow">
      <button onClick={onOpen} className="w-full min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 text-stone-400 font-mono text-[10px]">
          <span>RETSEPT KARTA</span>
          <span className="truncate">{dish.category || 'NON'}</span>
        </div>
        <div className="mt-3 border-y border-stone-300 py-3 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-stone-500 truncate">-{dish.category || 'Taom'}-</p>
          <h3 className="mt-2 text-base font-black uppercase tracking-[0.12em] text-stone-900 line-clamp-2 min-h-[2.5rem]">{dish.name}</h3>
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
        <p className="mt-4 text-xs font-serif leading-5 text-stone-600 line-clamp-3">{dish.technology || dish.vitamins || 'Tayyorlash texnologiyasi kiritilmagan'}</p>
      </button>
      {(canEdit || canDelete) && (
        <div className={`mt-3 grid gap-2 ${canEdit && canDelete ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {canEdit && (
          <button onClick={onEdit} className="w-full h-10 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100">
            <Edit3 size={15} /> Edit
          </button>
          )}
          {canDelete && (
          <button onClick={onDelete} className="w-full h-10 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100">
            <Trash2 size={15} /> O'chirish
          </button>
          )}
        </div>
      )}
    </article>
  );
};

const RecipeModal = ({ dish, onClose }: { dish: any; onClose: () => void }) => {
  const ingredients = splitParagraphs(ingredientsText(dish.ingredients));
  const images = getDishImages(dish);
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-7xl max-h-[94vh] overflow-y-auto bg-[#fffdf6] shadow-2xl border border-stone-300">
        <div className="relative px-6 sm:px-10 lg:px-16 py-10">
          <button onClick={onClose} className="absolute right-5 top-5 w-11 h-11 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200">
            <X size={18} />
          </button>

          <header className="text-center border-b border-stone-300 pb-8">
            <div className="flex items-center justify-between text-stone-400 font-mono text-sm">
              <span>10</span>
              <span>- {String(dish.category || 'NON').toUpperCase()} -</span>
              <span />
            </div>
            <h2 className="mt-10 text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] text-stone-900">{dish.name}</h2>
          </header>

          <div className="mt-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] gap-8">
            <section>
              <div className="flex items-center gap-5 mb-6">
                <h3 className="text-2xl sm:text-3xl uppercase tracking-[0.18em] font-light text-stone-900">Masalliqlar</h3>
                <div className="h-px bg-stone-300 flex-1" />
              </div>
              <div className="rounded-[8px] border border-stone-200 bg-white/60 p-5 font-serif text-base leading-8 text-stone-700 whitespace-pre-wrap">
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
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 bg-indigo-50"><Icon size={22} /></div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const BookMetric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) => (
  <div className="min-w-0 text-center">
    <div className="mx-auto w-9 h-9 rounded-full border-2 border-indigo-200 text-indigo-700 flex items-center justify-center bg-white/70">
      <Icon size={16} />
    </div>
    <p className="mt-2 text-[8px] font-black uppercase tracking-[0.14em] text-stone-800">{label}</p>
    <p className="mt-1 text-[11px] leading-tight font-serif text-stone-600 break-words">{value}</p>
  </div>
);

const FoodImageSlot = ({ src, label }: { src?: string | null; label: string }) => {
  const imageSrc = normalizeImageUrl(src);
  if (!imageSrc) return null;

  return (
    <div className="h-28 sm:h-32 flex items-center justify-center overflow-hidden">
      <FoodImagePreview
        src={displayAssetUrl(imageSrc)}
        alt={label}
        label={label}
        className="h-full w-full"
        imageClassName="object-contain"
        focusable={false}
      />
    </div>
  );
};

const BookFoodImage = ({ src, alt, label }: { src?: string | null; alt: string; label: string }) => {
  const imageSrc = normalizeImageUrl(src);
  if (!imageSrc) return null;

  return (
    <figure className="h-72 sm:h-80 flex items-center justify-center overflow-hidden">
      <FoodImagePreview
        src={displayAssetUrl(imageSrc)}
        alt={alt || label}
        label={label}
        className="h-full w-full"
        imageClassName="object-contain"
      />
    </figure>
  );
};

const BookTextBlock = ({ title, text }: { title: string; text?: string }) => {
  const paragraphs = splitParagraphs(text);
  return (
    <section>
      <h3 className="text-2xl sm:text-3xl uppercase tracking-[0.18em] font-light text-stone-900 mb-5">{title}</h3>
      <div className="space-y-4">
        {paragraphs.length === 0 ? (
          <p className="font-serif text-lg leading-8 text-stone-500">-</p>
        ) : (
          paragraphs.map((paragraph, index) => (
            <p key={index} className="font-serif text-lg leading-8 text-stone-700 indent-8">{paragraph}</p>
          ))
        )}
      </div>
    </section>
  );
};

const Field = ({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) => (
  <label>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <input type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? '0.1' : undefined} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400" />
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
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="h-32 rounded-xl border border-dashed border-slate-200 bg-transparent overflow-hidden flex items-center justify-center">
        {value ? (
          <FoodImagePreview
            src={displayAssetUrl(value)}
            alt={label}
            label={label}
            className="h-full w-full"
            imageClassName="object-contain"
          />
        ) : (
          <div className="text-center">
            <Utensils className="mx-auto text-slate-300" size={24} />
            <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-300">Rasm tanlanmagan</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <label className="h-12 px-4 rounded-2xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer border border-indigo-100">
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
            className="h-12 px-4 rounded-2xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100"
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
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 resize-none" />
  </label>
);
