import { useEffect, useMemo, useState } from 'react';
import { Camera, ExternalLink, Globe2, Loader2, Search, School, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { kindergartenApi } from '@/shared/api';
import { apiClient } from '@/shared/api';
import { GalleryImageUploader } from '@/shared/components/GalleryImageUploader';
import { LocationPicker } from '@/shared/components/LocationPicker';
import { type WebsiteRepresentative, WebsiteRepresentativesEditor } from '@/shared/components/WebsiteRepresentativesEditor';
import { type WebsiteSectionItem, WebsiteSectionItemsEditor } from '@/shared/components/WebsiteSectionItemsEditor';
import { displayAssetUrl } from '@/shared/lib/assets';

type WebsiteRow = {
  kindergartenId: string;
  kindergartenName: string;
  systemId?: string;
  district?: string;
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
  workingDays: string[];
  monthlyFee: number | string;
  advantages: string[];
  advantagesText: string;
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
  newsCount?: number;
};

const emptyWebsite: WebsiteRow = {
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
  workingDays: [],
  monthlyFee: 0,
  advantages: [],
  advantagesText: '',
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
const asWebsiteStatus = (value: unknown): WebsiteRow['status'] =>
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

const normalizeWebsite = (value: Partial<WebsiteRow> = {}): WebsiteRow => ({
  ...emptyWebsite,
  ...value,
  kindergartenId: asText(value.kindergartenId),
  kindergartenName: asText(value.kindergartenName),
  systemId: value.systemId == null ? undefined : asText(value.systemId),
  district: value.district == null ? undefined : asText(value.district),
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
  workingDays: asArray<string>(value.workingDays).map((item) => asText(item)).filter(Boolean),
  monthlyFee: value.monthlyFee ?? 0,
  advantages: asArray<string>(value.advantages).map((item) => asText(item)).filter(Boolean),
  advantagesText: asText(value.advantagesText),
  newsTitle: asText(value.newsTitle, emptyWebsite.newsTitle),
  newsSubtitle: asText(value.newsSubtitle),
  groupsTitle: asText(value.groupsTitle, emptyWebsite.groupsTitle),
  groupsDescription: asText(value.groupsDescription),
  groups: normalizeSectionItems(value.groups),
  clubsTitle: asText(value.clubsTitle, emptyWebsite.clubsTitle),
  clubsDescription: asText(value.clubsDescription),
  clubs: normalizeSectionItems(value.clubs),
  representatives: normalizeRepresentatives(value.representatives),
  loginButtonLabel: asText(value.loginButtonLabel, emptyWebsite.loginButtonLabel),
  loginButtonUrl: asText(value.loginButtonUrl, emptyWebsite.loginButtonUrl),
  showLoginButton: value.showLoginButton ?? emptyWebsite.showLoginButton,
  gallery: asArray<unknown>(value.gallery).map((item) => asText(item)).filter(Boolean),
  newsCount: Number(value.newsCount || 0),
});

const normalizeSlug = (value: string) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/['`]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-+/g, '-')
  .slice(0, 64);

export const KindergartenWebsiteBuilder = () => {
  const [websites, setWebsites] = useState<WebsiteRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<WebsiteRow>(emptyWebsite);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<'save' | 'publish' | 'open' | ''>('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const sitePreviewPath = form.slug && selectedId ? `/site/${form.slug}?kindergartenId=${selectedId}` : '';
  const siteDomain = form.slug ? `https://${form.slug}.raqamli-mtt.uz` : '';

  const filteredWebsites = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return websites;
    return websites.filter((item) =>
      `${item.kindergartenName} ${item.district || ''} ${item.slug || ''}`.toLowerCase().includes(term)
    );
  }, [search, websites]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    kindergartenApi.websites.getAll()
      .then((rows: WebsiteRow[]) => {
        if (!mounted) return;
        const data = Array.isArray(rows) ? rows.map((row) => normalizeWebsite(row)) : [];
        setWebsites(data);
        const first = data[0];
        if (first) {
          setSelectedId(String(first.kindergartenId));
          setForm(first);
        }
      })
      .catch(() => toast.error("Bog'cha web sahifalari yuklanmadi"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const selectWebsite = (item: WebsiteRow) => {
    setSelectedId(String(item.kindergartenId));
    setForm(normalizeWebsite(item));
  };

  const updateField = <K extends keyof WebsiteRow>(key: K, value: WebsiteRow[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const uploadCoverImage = async (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingCover(true);
      const response = await apiClient.post('/upload/website-assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateField('coverImageUrl', response.data?.url || '');
      toast.success('Bogcha rasmi yuklandi');
    } catch {
      toast.error('Rasm yuklashda xatolik');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (action: 'save' | 'publish' | 'open' = 'save') => {
    if (!selectedId) return;
    if (!form.slug.trim()) {
      toast.error('Subdomain slug kiritilishi shart');
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
      const saved = await kindergartenApi.websites.save(selectedId, payload);
      const normalizedSaved = normalizeWebsite(saved);
      setForm(normalizedSaved);
      setWebsites((items) => items.map((item) => String(item.kindergartenId) === String(selectedId) ? { ...item, ...normalizedSaved } : item));
      if (openedWindow) {
        openedWindow.location.href = `/site/${normalizedSaved.slug || payload.slug}?kindergartenId=${selectedId}`;
      }
      toast.success(
        action === 'publish'
          ? 'Web sayt yaratildi va internetga chiqarildi'
          : action === 'open'
            ? 'Maʼlumotlar saqlandi va web sayt ochildi'
            : "Ma'lumotlar saqlandi"
      );
    } catch (error: any) {
      openedWindow?.close();
      toast.error(error?.response?.data?.error || 'Web sahifani saqlashda xatolik');
    } finally {
      setSaving(false);
      setSavingAction('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-16">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
            <Globe2 size={13} /> Public saytlar
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Bog'cha web sahifasini yaratish</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Operator bog'chani tanlaydi, subdomain va public sahifa ma'lumotlarini kiritadi.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => handleSave('open')}
            disabled={saving || !selectedId}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-indigo-700 shadow-sm transition-all hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAction === 'open' ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
            Saqlash va web saytni ochish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                placeholder="Bog'cha qidirish"
              />
            </div>
          </div>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-3 custom-scrollbar">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="mx-auto mb-3 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest">Yuklanmoqda</p>
              </div>
            ) : filteredWebsites.map((item) => (
              <button
                key={item.kindergartenId}
                onClick={() => selectWebsite(item)}
                className={clsx(
                  "mb-2 w-full rounded-2xl border p-3 text-left transition-all",
                  String(selectedId) === String(item.kindergartenId)
                    ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                    : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <School size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black leading-tight">{item.kindergartenName}</span>
                    <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.district || 'Tuman kiritilmagan'} | {item.slug || 'slug yoq'}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="grid grid-cols-1 gap-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-900">Bog'cha haqida</h2>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bog'cha rasmi</span>
                  <div className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-indigo-200 bg-white">
                    {form.coverImageUrl ? (
                      <img src={displayAssetUrl(form.coverImageUrl)} alt="Bog'cha rasmi" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <Camera className="mx-auto mb-3 text-indigo-500" size={34} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Rasm yuklanmagan</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <label className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-indigo-700">
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subdomain slug</span>
                    <input
                      value={form.slug}
                      onChange={(event) => updateField('slug', normalizeSlug(event.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder="sevinch"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Holat</span>
                    <select
                      value={form.status}
                      onChange={(event) => updateField('status', event.target.value as WebsiteRow['status'])}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="draft">Qoralama</option>
                      <option value="published">Internetga chiqarish</option>
                    </select>
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero sarlavha</span>
                    <input
                      value={form.heroTitle}
                      onChange={(event) => updateField('heroTitle', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Sevinch nomli DMTT"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Qisqa izoh</span>
                    <input
                      value={form.heroSubtitle}
                      onChange={(event) => updateField('heroSubtitle', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Bolalar uchun xavfsiz, qulay va zamonaviy ta'lim muhiti"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bog'cha haqida</span>
                    <textarea
                      value={form.about}
                      onChange={(event) => updateField('about', event.target.value)}
                      rows={9}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Bog'chaning yo'nalishi, imkoniyatlari va afzalliklari..."
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <WebsiteRepresentativesEditor
                value={form.representatives || []}
                onChange={(items) => updateField('representatives', items)}
                onSuccess={(message) => toast.success(message)}
                onError={(message) => toast.error(message)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yangiliklar bo'limi nomi</span>
                <input value={form.newsTitle} onChange={(event) => updateField('newsTitle', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yangiliklar izohi</span>
                <input value={form.newsSubtitle} onChange={(event) => updateField('newsSubtitle', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bolalar guruhlari bo'limi</span>
                <input value={form.groupsTitle} onChange={(event) => updateField('groupsTitle', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">To'garaklar bo'limi</span>
                <input value={form.clubsTitle} onChange={(event) => updateField('clubsTitle', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bolalar guruhlari haqida ma'lumot</span>
                <textarea value={form.groupsDescription} onChange={(event) => updateField('groupsDescription', event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <div className="lg:col-span-2">
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
              <label className="space-y-2 lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">To'garaklar haqida ma'lumot</span>
                <textarea value={form.clubsDescription} onChange={(event) => updateField('clubsDescription', event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <div className="lg:col-span-2">
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
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefon</span>
                <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telegram</span>
                <input value={form.telegram} onChange={(event) => updateField('telegram', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" placeholder="@username yoki link" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</span>
                <input value={form.email} onChange={(event) => updateField('email', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manzil</span>
                <input value={form.address} onChange={(event) => updateField('address', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
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
                  onSuccess={(message) => toast.success(message)}
                  onError={(message) => toast.error(message)}
                />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-black text-slate-800">Kirish tugmasini ko'rsatish</span>
                <input type="checkbox" checked={Boolean(form.showLoginButton)} onChange={(event) => updateField('showLoginButton', event.target.checked)} className="h-5 w-5 accent-indigo-600" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kirish tugmasi matni</span>
                <input value={form.loginButtonLabel} onChange={(event) => updateField('loginButtonLabel', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Bog'cha web saytini ko'rish</h2>
                <p className="mt-2 break-words text-sm font-bold text-slate-500">
                  {siteDomain || 'Avval subdomain slug kiriting'}
                </p>
              </div>
              <a
                href={sitePreviewPath || '#'}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest text-white sm:mt-0 ${
                  sitePreviewPath ? 'bg-indigo-600 hover:bg-indigo-700' : 'pointer-events-none bg-slate-300'
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
