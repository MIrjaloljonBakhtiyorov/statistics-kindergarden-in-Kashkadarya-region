import { useEffect, useMemo, useState } from 'react';
import { Edit3, Loader2, Newspaper, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { kindergartenApi } from '@/shared/api';

type WebsiteRow = {
  kindergartenId: string;
  kindergartenName: string;
  district?: string;
  slug?: string;
};

type NewsRow = {
  id: string;
  kindergartenId: string;
  kindergartenName?: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  status: 'draft' | 'published';
  publishedAt: string;
  createdAt?: string;
};

type NewsForm = Omit<NewsRow, 'id' | 'kindergartenName' | 'createdAt'>;

const today = new Date().toISOString().slice(0, 10);

const emptyForm: NewsForm = {
  kindergartenId: '',
  title: '',
  summary: '',
  body: '',
  imageUrl: '',
  status: 'draft',
  publishedAt: today,
};

export const WebsiteNewsManager = () => {
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [selectedKindergartenId, setSelectedKindergartenId] = useState('');
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedWebsite = websites.find((item) => String(item.kindergartenId) === String(selectedKindergartenId));

  const filteredNews = useMemo(() => {
    const term = search.trim().toLowerCase();
    const scoped = selectedKindergartenId
      ? news.filter((item) => String(item.kindergartenId) === String(selectedKindergartenId))
      : news;
    if (!term) return scoped;
    return scoped.filter((item) =>
      `${item.title} ${item.summary} ${item.kindergartenName || ''}`.toLowerCase().includes(term)
    );
  }, [news, search, selectedKindergartenId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [websiteRows, newsRows] = await Promise.all([
        kindergartenApi.websites.getAll(),
        kindergartenApi.websiteNews.getAll(),
      ]);
      const siteData = Array.isArray(websiteRows) ? websiteRows : [];
      setWebsites(siteData);
      setNews(Array.isArray(newsRows) ? newsRows : []);
      const first = siteData[0];
      if (first && !selectedKindergartenId) {
        setSelectedKindergartenId(String(first.kindergartenId));
        setForm((current) => ({ ...current, kindergartenId: String(first.kindergartenId) }));
      }
    } catch {
      toast.error("Yangiliklar ma'lumotini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = (kindergartenId = selectedKindergartenId) => {
    setEditingId(null);
    setForm({ ...emptyForm, kindergartenId });
  };

  const selectKindergarten = (kindergartenId: string) => {
    setSelectedKindergartenId(kindergartenId);
    resetForm(kindergartenId);
  };

  const editNews = (item: NewsRow) => {
    setEditingId(item.id);
    setSelectedKindergartenId(String(item.kindergartenId));
    setForm({
      kindergartenId: String(item.kindergartenId),
      title: item.title || '',
      summary: item.summary || '',
      body: item.body || '',
      imageUrl: item.imageUrl || '',
      status: item.status || 'draft',
      publishedAt: item.publishedAt || today,
    });
  };

  const saveNews = async () => {
    if (!form.kindergartenId) {
      toast.error("Avval bog'chani tanlang");
      return;
    }
    if (!form.title.trim()) {
      toast.error('Yangilik sarlavhasi kiritilishi shart');
      return;
    }

    setSaving(true);
    try {
      const saved = editingId
        ? await kindergartenApi.websiteNews.update(editingId, form)
        : await kindergartenApi.websiteNews.create(form.kindergartenId, form);
      setNews((items) => {
        if (editingId) return items.map((item) => item.id === editingId ? saved : item);
        return [saved, ...items];
      });
      resetForm(form.kindergartenId);
      toast.success(editingId ? 'Yangilik yangilandi' : 'Yangilik qo\'shildi');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Yangilikni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const deleteNews = async (item: NewsRow) => {
    if (!window.confirm(`"${item.title}" yangiligini o'chirasizmi?`)) return;
    try {
      await kindergartenApi.websiteNews.delete(item.id);
      setNews((items) => items.filter((row) => row.id !== item.id));
      if (editingId === item.id) resetForm();
      toast.success("Yangilik o'chirildi");
    } catch {
      toast.error("Yangilikni o'chirishda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-16">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
            <Newspaper size={13} /> Web sahifa kontenti
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Web sahifaga yangiliklar kiritish</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Tanlangan bog'chaning public saytida chiqadigan yangilik va e'lonlarni boshqarish.
          </p>
        </div>
        <button
          onClick={() => resetForm()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600"
        >
          <Plus size={15} /> Yangi yangilik
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <select
              value={selectedKindergartenId}
              onChange={(event) => selectKindergarten(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Barcha bog'chalar</option>
              {websites.map((item) => (
                <option key={item.kindergartenId} value={item.kindergartenId}>
                  {item.kindergartenName}
                </option>
              ))}
            </select>
            <div className="relative mt-3">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-bold outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                placeholder="Yangilik qidirish"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-3 custom-scrollbar">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="mx-auto mb-3 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest">Yuklanmoqda</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="py-12 text-center">
                <Newspaper className="mx-auto mb-3 text-slate-200" size={34} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yangilik topilmadi</p>
              </div>
            ) : filteredNews.map((item) => (
              <button
                key={item.id}
                onClick={() => editNews(item)}
                className={clsx(
                  "mb-2 w-full rounded-2xl border p-3 text-left transition-all",
                  editingId === item.id
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-100 bg-white hover:bg-slate-50"
                )}
              >
                <span className="block text-sm font-black leading-tight text-slate-900">{item.title}</span>
                <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.kindergartenName || selectedWebsite?.kindergartenName || "Bog'cha"} | {item.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">{editingId ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">{selectedWebsite?.slug ? `${selectedWebsite.slug}.raqamli-mtt.uz` : "Bog'cha tanlang"}</p>
              </div>
              {editingId && (
                <button onClick={() => resetForm()} className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700">
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="space-y-2 lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sarlavha</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Masalan: Yangi o'yin maydonchasi foydalanishga topshirildi"
                />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Qisqa mazmun</span>
                <input
                  value={form.summary}
                  onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Holat</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as NewsForm['status'] }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="draft">Qoralama</option>
                  <option value="published">Saytga chiqarish</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sana</span>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={(event) => setForm((current) => ({ ...current, publishedAt: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rasm URL</span>
                <input
                  value={form.imageUrl}
                  onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">To'liq matn</span>
                <textarea
                  value={form.body}
                  onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                  rows={8}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  onClick={() => {
                    const row = news.find((item) => item.id === editingId);
                    if (row) deleteNews(row);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-100"
                >
                  <Trash2 size={15} /> O'chirish
                </button>
              )}
              <button
                onClick={saveNews}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Saqlash
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Edit3 size={18} className="text-emerald-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Preview</h2>
            </div>
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="h-40 bg-slate-100">
                {form.imageUrl ? <img src={form.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="space-y-3 p-5">
                <span className={clsx(
                  "inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest",
                  form.status === 'published' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  {form.status === 'published' ? 'Saytda chiqadi' : 'Qoralama'}
                </span>
                <h3 className="text-lg font-black leading-tight text-slate-950">{form.title || 'Yangilik sarlavhasi'}</h3>
                <p className="text-sm font-semibold leading-6 text-slate-500">{form.summary || 'Qisqa mazmun shu yerda ko\'rinadi.'}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{form.publishedAt || today}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};
