import React, { useEffect, useState } from 'react';
import { Camera, ExternalLink, Globe2, ImageOff, Loader2, Newspaper, Plus, Save, Trash2, X } from 'lucide-react';
import { apiClient, kindergartenApi } from '@/shared/api';
import { GalleryImageUploader } from '@/shared/components/GalleryImageUploader';
import { LocationPicker } from '@/shared/components/LocationPicker';
import { type WebsiteRepresentative, WebsiteRepresentativesEditor } from '@/shared/components/WebsiteRepresentativesEditor';
import { type WebsiteSectionItem, WebsiteSectionItemsEditor } from '@/shared/components/WebsiteSectionItemsEditor';
import { displayAssetUrl } from '@/shared/lib/assets';
import { useNotification } from '../../context/NotificationContext';

type WebsiteForm = {
  kindergartenId: string;
  kindergartenName: string;
  slug: string;
  status: 'draft' | 'published';
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  address: string;
  phone: string;
  telegram: string;
  email: string;
  coverImageUrl: string;
  locationLat: number | string | null;
  locationLng: number | string | null;
  newsTitle: string;
  newsSubtitle: string;
  groupsTitle: string;
  groupsDescription: string;
  groups: WebsiteSectionItem[];
  clubsTitle: string;
  clubsDescription: string;
  clubs: WebsiteSectionItem[];
  representatives: WebsiteRepresentative[];
  loginButtonLabel: string;
  loginButtonUrl: string;
  showLoginButton: boolean | number;
  gallery: string[];
};

type WebsiteNews = {
  id: string;
  kindergartenId: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string;
  status: 'draft' | 'published';
  publishedAt: string;
  createdAt?: string;
};

type WebsiteNewsForm = Omit<WebsiteNews, 'id' | 'createdAt'>;

const today = new Date().toISOString().slice(0, 10);

const emptyForm: WebsiteForm = {
  kindergartenId: '',
  kindergartenName: '',
  slug: '',
  status: 'draft',
  heroTitle: '',
  heroSubtitle: '',
  about: '',
  address: '',
  phone: '',
  telegram: '',
  email: '',
  coverImageUrl: '',
  locationLat: null,
  locationLng: null,
  newsTitle: 'Yangiliklar',
  newsSubtitle: '',
  groupsTitle: 'Bolalar guruhlari',
  groupsDescription: '',
  groups: [],
  clubsTitle: "To'garaklar",
  clubsDescription: '',
  clubs: [],
  representatives: [],
  loginButtonLabel: 'Tizimga kirish',
  loginButtonUrl: '/login',
  showLoginButton: true,
  gallery: [],
};

const asText = (value: unknown, fallback = '') => String(value ?? fallback);
const asArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value : [];
const asWebsiteStatus = (value: unknown): WebsiteForm['status'] =>
  value === 'published' ? 'published' : 'draft';

const normalizeSectionItems = (value: unknown): WebsiteSectionItem[] =>
  asArray<Partial<WebsiteSectionItem>>(value).map((item, index) => ({
    id: item.id || `section-${index}`,
    name: asText(item.name),
    count: asText(item.count),
    workHours: item.workHours == null ? undefined : asText(item.workHours),
    days: asText(item.days),
    payment: asText(item.payment),
    description: item.description == null ? undefined : asText(item.description),
  }));

const normalizeRepresentatives = (value: unknown): WebsiteRepresentative[] =>
  asArray<Partial<WebsiteRepresentative>>(value).map((item, index) => ({
    id: item.id || `representative-${index}`,
    fullName: asText(item.fullName),
    role: asText(item.role),
    phone: asText(item.phone),
    imageUrl: asText(item.imageUrl),
    description: asText(item.description),
  }));

const normalizeWebsiteForm = (value: Partial<WebsiteForm> = {}): WebsiteForm => ({
  ...emptyForm,
  ...value,
  kindergartenId: asText(value.kindergartenId),
  kindergartenName: asText(value.kindergartenName),
  slug: asText(value.slug),
  status: asWebsiteStatus(value.status),
  heroTitle: asText(value.heroTitle),
  heroSubtitle: asText(value.heroSubtitle),
  about: asText(value.about),
  address: asText(value.address),
  phone: asText(value.phone),
  telegram: asText(value.telegram),
  email: asText(value.email),
  coverImageUrl: asText(value.coverImageUrl),
  locationLat: value.locationLat ?? null,
  locationLng: value.locationLng ?? null,
  newsTitle: asText(value.newsTitle, emptyForm.newsTitle),
  newsSubtitle: asText(value.newsSubtitle),
  groupsTitle: asText(value.groupsTitle, emptyForm.groupsTitle),
  groupsDescription: asText(value.groupsDescription),
  groups: normalizeSectionItems(value.groups),
  clubsTitle: asText(value.clubsTitle, emptyForm.clubsTitle),
  clubsDescription: asText(value.clubsDescription),
  clubs: normalizeSectionItems(value.clubs),
  representatives: normalizeRepresentatives(value.representatives),
  loginButtonLabel: asText(value.loginButtonLabel, emptyForm.loginButtonLabel),
  loginButtonUrl: asText(value.loginButtonUrl, emptyForm.loginButtonUrl),
  showLoginButton: value.showLoginButton ?? emptyForm.showLoginButton,
  gallery: asArray<unknown>(value.gallery).map((item) => asText(item)).filter(Boolean),
});

const emptyNewsForm: WebsiteNewsForm = {
  kindergartenId: '',
  title: '',
  summary: '',
  body: '',
  imageUrl: '',
  status: 'draft',
  publishedAt: today,
};

const getKindergartenId = () => window.location.pathname.split('/').filter(Boolean)[1] || '';

const normalizeSlug = (value: string) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/['`]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-+/g, '-')
  .slice(0, 64);

const KindergartenWebsiteView: React.FC = () => {
  const { showNotification } = useNotification();
  const kindergartenId = getKindergartenId();
  const [form, setForm] = useState<WebsiteForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<'save' | 'publish' | 'open' | ''>('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [news, setNews] = useState<WebsiteNews[]>([]);
  const [newsForm, setNewsForm] = useState<WebsiteNewsForm>({ ...emptyNewsForm, kindergartenId });
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [savingNews, setSavingNews] = useState(false);
  const [uploadingNewsImage, setUploadingNewsImage] = useState(false);
  const sitePreviewPath = form.slug ? `/site/${form.slug}?kindergartenId=${kindergartenId}` : '';
  const siteDomain = form.slug ? `https://${form.slug}.raqamli-mtt.uz` : '';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiClient.get(`/kindergartens/websites/${kindergartenId}`),
      kindergartenApi.websiteNews.getByKindergarten(kindergartenId),
    ])
      .then(([res, newsRows]) => {
        if (!mounted) return;
        setForm(normalizeWebsiteForm(res.data));
        setNews(Array.isArray(newsRows) ? newsRows : []);
        setNewsForm({ ...emptyNewsForm, kindergartenId });
      })
      .catch(() => showNotification("Web sayt ma'lumotlari yuklanmadi", 'error'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [kindergartenId, showNotification]);

  const updateField = <K extends keyof WebsiteForm>(key: K, value: WebsiteForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetNewsForm = () => {
    setEditingNewsId(null);
    setNewsForm({ ...emptyNewsForm, kindergartenId });
  };

  const editNews = (item: WebsiteNews) => {
    setEditingNewsId(item.id);
    setNewsForm({
      kindergartenId,
      title: item.title || '',
      summary: item.summary || '',
      body: item.body || '',
      imageUrl: item.imageUrl || '',
      status: item.status || 'draft',
      publishedAt: item.publishedAt || today,
    });
  };

  const uploadCoverImage = async (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    setUploadingCover(true);
    try {
      const res = await apiClient.post('/upload/website-assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateField('coverImageUrl', res.data?.url || '');
      showNotification('Bogcha rasmi yuklandi', 'success');
    } catch {
      showNotification('Rasm yuklashda xatolik yuz berdi', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const uploadNewsImage = async (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    setUploadingNewsImage(true);
    try {
      const res = await apiClient.post('/upload/website-assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewsForm((current) => ({ ...current, imageUrl: res.data?.url || '' }));
      showNotification('Yangilik rasmi yuklandi', 'success');
    } catch {
      showNotification('Yangilik rasmini yuklashda xatolik', 'error');
    } finally {
      setUploadingNewsImage(false);
    }
  };

  const saveNews = async () => {
    if (!newsForm.title.trim()) {
      showNotification('Yangilik sarlavhasi kiritilishi shart', 'error');
      return;
    }

    setSavingNews(true);
    try {
      const payload = {
        ...newsForm,
        kindergartenId,
        title: newsForm.title.trim(),
        summary: newsForm.summary.trim(),
        body: newsForm.body.trim(),
        imageUrl: newsForm.imageUrl.trim(),
      };
      const saved = editingNewsId
        ? await kindergartenApi.websiteNews.update(editingNewsId, payload)
        : await kindergartenApi.websiteNews.create(kindergartenId, payload);
      setNews((items) => {
        if (editingNewsId) return items.map((item) => item.id === editingNewsId ? saved : item);
        return [saved, ...items];
      });
      resetNewsForm();
      showNotification(editingNewsId ? 'Yangilik yangilandi' : "Yangilik qo'shildi", 'success');
    } catch (error: any) {
      showNotification(error?.response?.data?.error || 'Yangilikni saqlashda xatolik', 'error');
    } finally {
      setSavingNews(false);
    }
  };

  const deleteNews = async (item: WebsiteNews) => {
    if (!window.confirm(`"${item.title}" yangiligini o'chirasizmi?`)) return;
    try {
      await kindergartenApi.websiteNews.delete(item.id);
      setNews((items) => items.filter((row) => row.id !== item.id));
      if (editingNewsId === item.id) resetNewsForm();
      showNotification("Yangilik o'chirildi", 'success');
    } catch {
      showNotification("Yangilikni o'chirishda xatolik", 'error');
    }
  };

  const save = async (action: 'save' | 'publish' | 'open' = 'save') => {
    if (!form.slug.trim()) {
      showNotification('Subdomain slug kiritilishi shart', 'error');
      return;
    }

    const openedWindow = action === 'open' ? window.open('', '_blank') : null;
    setSaving(true);
    setSavingAction(action);
    try {
      const payload = {
        ...form,
        status: action === 'publish' ? 'published' : form.status,
        slug: normalizeSlug(form.slug),
        gallery: (form.gallery || []).filter(Boolean).slice(0, 8),
        representatives: (form.representatives || []).filter((item) =>
          item.fullName || item.role || item.phone || item.imageUrl || item.description
        ).slice(0, 16),
      };
      const res = await apiClient.put(`/kindergartens/websites/${kindergartenId}`, payload);
      const normalizedSaved = normalizeWebsiteForm(res.data);
      setForm(normalizedSaved);
      if (openedWindow) {
        openedWindow.location.href = `/site/${normalizedSaved.slug || payload.slug}?kindergartenId=${kindergartenId}`;
      }
      showNotification(
        action === 'publish'
          ? 'Web sayt yaratildi va internetga chiqarildi'
          : action === 'open'
            ? 'Maʼlumotlar saqlandi va web sayt ochildi'
            : "Ma'lumotlar saqlandi",
        'success'
      );
    } catch (error: any) {
      openedWindow?.close();
      showNotification(error?.response?.data?.error || 'Saqlashda xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
      setSavingAction('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-brand-border bg-white">
        <Loader2 className="animate-spin text-brand-primary" size={34} />
      </div>
    );
  }

  return (
    <div className="kg-page space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-700">
            <Globe2 size={13} /> Public web sayt
          </div>
          <h1 className="text-2xl font-black text-brand-depth">{form.kindergartenName || "Bog'cha web sayti"}</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-brand-muted">
            Shu yerda bog'chaga tegishli public web sahifa ma'lumotlari kiritiladi.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => save('open')}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100 disabled:opacity-60"
          >
            {savingAction === 'open' ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            Saqlash va web saytni ochish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-depth">Sayt menyulari</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {["Bog'cha haqida", 'Vakillar', 'Yangiliklar', 'Kontaktlar', 'Bolalar guruhlari', "To'garaklar", 'Kirish'].map((item) => (
                  <span key={item} className="rounded-xl border border-white bg-white px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-brand-muted shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-depth">Bog'cha haqida</h2>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
                <div className="rounded-2xl border border-brand-border bg-slate-50 p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Bog'cha rasmi</span>
                  <div className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-emerald-200 bg-white">
                    {form.coverImageUrl ? (
                      <img src={displayAssetUrl(form.coverImageUrl)} alt="Bog'cha rasmi" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-brand-muted">
                        <Camera className="mx-auto mb-3 text-emerald-500" size={34} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Rasm yuklanmagan</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <label className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-xl bg-brand-primary px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-700">
                      {uploadingCover ? 'Yuklanmoqda...' : form.coverImageUrl ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingCover}
                        onChange={(event) => {
                          uploadCoverImage(event.target.files?.[0]);
                          event.target.value = '';
                        }}
                      />
                    </label>
                    {form.coverImageUrl && (
                      <button
                        type="button"
                        onClick={() => updateField('coverImageUrl', '')}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 text-[10px] font-black uppercase tracking-widest text-rose-600"
                      >
                        <Trash2 size={14} /> O'chirish
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Subdomain slug</span>
                    <input value={form.slug} onChange={(event) => updateField('slug', normalizeSlug(event.target.value))} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" placeholder="sevinch" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Holat</span>
                    <select value={form.status} onChange={(event) => updateField('status', event.target.value as WebsiteForm['status'])} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary">
                      <option value="draft">Qoralama</option>
                      <option value="published">Internetga chiqarish</option>
                    </select>
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Sarlavha</span>
                    <input value={form.heroTitle} onChange={(event) => updateField('heroTitle', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Qisqa izoh</span>
                    <input value={form.heroSubtitle} onChange={(event) => updateField('heroSubtitle', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Bog'cha haqida</span>
                    <textarea value={form.about} onChange={(event) => updateField('about', event.target.value)} rows={9} className="w-full resize-none rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-brand-primary" />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <WebsiteRepresentativesEditor
                value={form.representatives || []}
                onChange={(items) => updateField('representatives', items)}
                onSuccess={(message) => showNotification(message, 'success')}
                onError={(message) => showNotification(message, 'error')}
              />
            </div>

            <div>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-depth">Yangiliklar bo'limi</h2>
              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Bo'lim nomi</span>
                  <input value={form.newsTitle} onChange={(event) => updateField('newsTitle', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
                </label>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5">
                <section className="rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#ffffff,#f6fffb)] p-4 shadow-sm">
                  <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                        <Newspaper size={13} /> Yangiliklar ro'yxati
                      </div>
                      <p className="mt-2 text-xs font-bold text-brand-muted">{news.length} ta yangilik kiritilgan</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetNewsForm}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
                    >
                      <Plus size={14} /> Yangi yangilik
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
                    <div className="space-y-2">
                      {news.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-6 text-center">
                          <Newspaper className="mx-auto mb-3 text-emerald-300" size={32} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Hali yangilik yo'q</p>
                        </div>
                      ) : news.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => editNews(item)}
                          className={`w-full rounded-2xl border p-3 text-left transition-all ${
                            editingNewsId === item.id
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                              : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="line-clamp-2 text-sm font-black leading-snug">{item.title}</span>
                          <span className="mt-2 flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-widest text-brand-muted">
                            <span>{item.publishedAt || item.createdAt || 'Sana yoq'}</span>
                            <span className={item.status === 'published' ? 'text-emerald-600' : 'text-slate-400'}>
                              {item.status === 'published' ? 'Public' : 'Draft'}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-black text-brand-depth">{editingNewsId ? 'Yangilikni tahrirlash' : 'Yangi yangilik qo\'shish'}</h3>
                          <p className="mt-1 text-xs font-bold text-brand-muted">Yangi guruh, yangi kurs yoki muhim e'lonni shu yerdan qo'shing.</p>
                        </div>
                        {editingNewsId && (
                          <button type="button" onClick={resetNewsForm} className="rounded-xl p-2 text-brand-muted transition-colors hover:bg-slate-50">
                            <X size={17} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <label className="space-y-2 lg:col-span-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Yangilik sarlavhasi</span>
                          <input
                            value={newsForm.title}
                            onChange={(event) => setNewsForm((current) => ({ ...current, title: event.target.value }))}
                            className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary"
                            placeholder="Masalan: Yangi ingliz tili kursi ochildi"
                          />
                        </label>
                        <label className="space-y-2 lg:col-span-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Qisqa izoh</span>
                          <input
                            value={newsForm.summary}
                            onChange={(event) => setNewsForm((current) => ({ ...current, summary: event.target.value }))}
                            className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary"
                            placeholder="Haftasiga 3 kun, 4-6 yosh bolalar uchun"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Holat</span>
                          <select
                            value={newsForm.status}
                            onChange={(event) => setNewsForm((current) => ({ ...current, status: event.target.value as WebsiteNewsForm['status'] }))}
                            className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary"
                          >
                            <option value="draft">Qoralama</option>
                            <option value="published">Saytga chiqarish</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Sana</span>
                          <input
                            type="date"
                            value={newsForm.publishedAt}
                            onChange={(event) => setNewsForm((current) => ({ ...current, publishedAt: event.target.value }))}
                            className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary"
                          />
                        </label>
                        <div className="space-y-2 lg:col-span-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Yangilik rasmi</span>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
                            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-dashed border-emerald-200 bg-slate-50">
                              {newsForm.imageUrl ? (
                                <img src={displayAssetUrl(newsForm.imageUrl)} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <ImageOff size={25} className="text-emerald-300" />
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-700">
                                {uploadingNewsImage ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingNewsImage}
                                  onChange={(event) => {
                                    uploadNewsImage(event.target.files?.[0]);
                                    event.target.value = '';
                                  }}
                                />
                              </label>
                              <input
                                value={newsForm.imageUrl}
                                onChange={(event) => setNewsForm((current) => ({ ...current, imageUrl: event.target.value }))}
                                className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-xs font-bold outline-none focus:border-brand-primary"
                                placeholder="Yoki rasm URL kiriting"
                              />
                            </div>
                          </div>
                        </div>
                        <label className="space-y-2 lg:col-span-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">To'liq matn</span>
                          <textarea
                            value={newsForm.body}
                            onChange={(event) => setNewsForm((current) => ({ ...current, body: event.target.value }))}
                            rows={5}
                            className="w-full resize-none rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-brand-primary"
                            placeholder="Yangilik tafsilotlari..."
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        {editingNewsId && (
                          <button
                            type="button"
                            onClick={() => {
                              const selected = news.find((item) => item.id === editingNewsId);
                              if (selected) deleteNews(selected);
                            }}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-colors hover:bg-rose-100"
                          >
                            <Trash2 size={14} /> O'chirish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={saveNews}
                          disabled={savingNews}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/15 transition-colors hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {savingNews ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                          Saqlash
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-depth">Kontaktlar</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Telefon</span>
              <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Telegram</span>
              <input value={form.telegram} onChange={(event) => updateField('telegram', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Email</span>
              <input value={form.email} onChange={(event) => updateField('email', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
            </label>
            <label className="space-y-2 lg:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Manzil</span>
              <input value={form.address} onChange={(event) => updateField('address', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
            </label>
            <div className="lg:col-span-2">
              <LocationPicker
                lat={form.locationLat}
                lng={form.locationLng}
                label="Manzil lokatsiyasi"
                onChange={(value) => {
                  updateField('locationLat', value.lat);
                  updateField('locationLng', value.lng);
                }}
              />
            </div>
            <div className="lg:col-span-2">
              <GalleryImageUploader
                value={form.gallery || []}
                onChange={(gallery) => updateField('gallery', gallery)}
                onSuccess={(message) => showNotification(message, 'success')}
                onError={(message) => showNotification(message, 'error')}
              />
            </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-depth">Bolalar guruhlari</h2>
              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Bo'lim nomi</span>
                  <input value={form.groupsTitle} onChange={(event) => updateField('groupsTitle', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Guruhlar haqida ma'lumot</span>
                  <textarea value={form.groupsDescription} onChange={(event) => updateField('groupsDescription', event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-brand-primary" placeholder="Kichik, o'rta, katta va tayyorlov guruhlari haqida..." />
                </label>
                <WebsiteSectionItemsEditor
                  title="Guruhlar ro'yxati"
                  value={form.groups || []}
                  onChange={(items) => updateField('groups', items)}
                  namePlaceholder="Masalan: Kichik guruh"
                  countLabel="Bola soni"
                  countPlaceholder="25 nafar"
                  paymentPlaceholder="Oyiga 300 000 so'm"
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-depth">To'garaklar</h2>
              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Bo'lim nomi</span>
                  <input value={form.clubsTitle} onChange={(event) => updateField('clubsTitle', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">To'garaklar haqida ma'lumot</span>
                  <textarea value={form.clubsDescription} onChange={(event) => updateField('clubsDescription', event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-brand-primary" placeholder="Robototexnika, ingliz tili, sport, raqs, rasm..." />
                </label>
                <WebsiteSectionItemsEditor
                  title="To'garaklar ro'yxati"
                  value={form.clubs || []}
                  onChange={(items) => updateField('clubs', items)}
                  namePlaceholder="Masalan: Ingliz tili"
                  countLabel="Qatnashuvchi soni"
                  countPlaceholder="18 nafar"
                  paymentPlaceholder="Oyiga 150 000 so'm"
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-depth">Kirish tugmasi</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-brand-border bg-slate-50 px-4 py-3">
                  <span className="text-sm font-black text-brand-depth">Kirish tugmasini ko'rsatish</span>
                  <input type="checkbox" checked={Boolean(form.showLoginButton)} onChange={(event) => updateField('showLoginButton', event.target.checked)} className="h-5 w-5 accent-emerald-600" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Tugma matni</span>
                  <input value={form.loginButtonLabel} onChange={(event) => updateField('loginButtonLabel', event.target.value)} className="w-full rounded-xl border border-brand-border bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-primary" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-widest text-brand-depth">Bog'cha web saytini ko'rish</h2>
                <p className="mt-2 break-words text-sm font-bold text-brand-muted">
                  {siteDomain || 'Avval subdomain slug kiriting'}
                </p>
              </div>
              <a
                href={sitePreviewPath || '#'}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest text-white sm:mt-0 ${
                  sitePreviewPath ? 'bg-brand-primary hover:bg-emerald-700' : 'pointer-events-none bg-slate-300'
                }`}
              >
                Web saytni ochish <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default KindergartenWebsiteView;
