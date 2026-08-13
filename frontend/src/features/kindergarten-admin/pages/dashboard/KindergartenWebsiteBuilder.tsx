import { useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, ExternalLink, Globe2, Loader2, Search, School, Trash2 } from 'lucide-react';
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

const isWebsiteLive = (item: WebsiteRow) => Boolean(item.slug && item.status === 'published');
const publicSitePath = (item: WebsiteRow) => `/site/${item.slug}?kindergartenId=${item.kindergartenId}`;
const labelClass = 'text-[10px] font-black uppercase tracking-widest text-slate-300';
const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0b1110] px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-500/10';
const textareaClass = 'w-full resize-none rounded-xl border border-white/10 bg-[#0b1110] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-500/10';

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

  const openBuilderSubmenu = (item: WebsiteRow) => {
    selectWebsite(item);
  };

  const openPublicSite = (item: WebsiteRow) => {
    if (!isWebsiteLive(item)) {
      openBuilderSubmenu(item);
      return;
    }
    window.open(publicSitePath(item), '_blank', 'noopener,noreferrer');
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
    <div className="min-h-screen bg-[#08100f] pb-16 text-white">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#111615] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.24)] xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-200">
            <Globe2 size={13} /> Public saytlar
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {selectedId ? 'MTT web sahifasi sub menu' : 'MTT web sahifalari'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
            {selectedId
              ? "Tanlangan bog'cha uchun public sayt ma'lumotlari alohida sub menu sahifasida kiritiladi."
              : "Jadvaldagi tugmalar orqali web saytni oching yoki sayt yaratish sub menusiga o'ting."}
          </p>
        </div>
        {selectedId && <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => handleSave('open')}
            disabled={saving || !selectedId}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAction === 'open' ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
            Saqlash va web saytni ochish
          </button>
        </div>}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {!selectedId && (
        <section className="rounded-3xl border border-white/10 bg-[#111615] shadow-[0_20px_55px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1110] py-3 pl-9 pr-3 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-500/10 sm:w-[360px]"
                placeholder="Bog'cha qidirish"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
              <span className="rounded-full border border-white/10 bg-[#0b1110] px-3 py-2 text-white">{websites.length} ta MTT</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-200">{websites.filter(isWebsiteLive).length} ta sayt bor</span>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-amber-200">{websites.filter((item) => !isWebsiteLive(item)).length} ta yaratilmagan</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-300">
                <Loader2 className="mx-auto mb-3 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest">Yuklanmoqda</p>
              </div>
            ) : filteredWebsites.length > 0 ? (
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0b1110] text-[10px] font-black uppercase tracking-widest text-slate-300">
                    <th className="px-5 py-4">Bog'cha nomi</th>
                    <th className="px-5 py-4">Tuman</th>
                    <th className="px-5 py-4">Subdomain</th>
                    <th className="px-5 py-4 text-center">Yangilik</th>
                    <th className="px-5 py-4">Holat</th>
                    <th className="px-5 py-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredWebsites.map((item) => {
                    const live = isWebsiteLive(item);
                    const selected = String(selectedId) === String(item.kindergartenId);

                    return (
                      <tr
                        key={item.kindergartenId}
                        className={clsx(
                          'transition hover:bg-white/[0.035]',
                          selected && !live ? 'bg-emerald-400/5' : ''
                        )}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0b1110] text-emerald-300">
                              <School size={17} />
                            </span>
                            <div className="min-w-0">
                              <p className="max-w-[360px] truncate text-sm font-black text-white">{item.kindergartenName}</p>
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.systemId || item.kindergartenId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-200">{item.district || 'Tuman kiritilmagan'}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-white/10 bg-[#0b1110] px-3 py-1.5 text-[11px] font-black text-white">
                            {item.slug || 'yaratilmagan'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-sm font-black text-cyan-200">{item.newsCount || 0}</td>
                        <td className="px-5 py-4">
                          {live ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-200 ring-1 ring-emerald-400/20">
                              <CheckCircle2 size={13} />
                              Sayt bor
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openBuilderSubmenu(item)}
                              className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-200 ring-1 ring-amber-400/20 transition hover:bg-amber-400/15"
                            >
                              <Globe2 size={13} />
                              Yaratish kerak
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => live ? openPublicSite(item) : openBuilderSubmenu(item)}
                            className={clsx(
                            'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest',
                            live
                              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                          )}>
                            {live ? 'Web saytni ochish' : 'Maʼlumot kiritish'}
                            <ExternalLink size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-300">
                <p className="text-sm font-black">Qidiruv bo'yicha bog'cha topilmadi.</p>
              </div>
            )}
          </div>
        </section>
        )}

        {selectedId && (
        <section id="website-builder-form" className="grid grid-cols-1 gap-5">
          <div className="rounded-3xl border border-white/10 bg-[#111615] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.24)]">
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Sub menu</p>
                <h2 className="mt-1 truncate text-xl font-black text-white">{form.kindergartenName || "Bog'cha web sahifasi"}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-300">
                  {form.district || 'Tuman kiritilmagan'} | {form.systemId || form.kindergartenId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedId('');
                  setForm(emptyWebsite);
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#0b1110] px-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/10"
              >
                Jadvalga qaytish
              </button>
            </div>
            <div className="mb-5">
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white">Bog'cha haqida</h2>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
                <div className="rounded-2xl border border-white/10 bg-[#0b1110] p-4">
                  <span className={labelClass}>Bog'cha rasmi</span>
                  <div className="mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-emerald-400/25 bg-[#08100f]">
                    {form.coverImageUrl ? (
                      <img src={displayAssetUrl(form.coverImageUrl)} alt="Bog'cha rasmi" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-300">
                        <Camera className="mx-auto mb-3 text-emerald-300" size={34} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Rasm yuklanmagan</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <label className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-500">
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
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 text-[10px] font-black uppercase tracking-widest text-rose-200"
                      >
                        <Trash2 size={14} /> O'chirish
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className={labelClass}>Subdomain slug</span>
                    <input
                      value={form.slug}
                      onChange={(event) => updateField('slug', normalizeSlug(event.target.value))}
                      className={fieldClass}
                      placeholder="sevinch"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClass}>Holat</span>
                    <select
                      value={form.status}
                      onChange={(event) => updateField('status', event.target.value as WebsiteRow['status'])}
                      className={fieldClass}
                    >
                      <option value="draft">Qoralama</option>
                      <option value="published">Internetga chiqarish</option>
                    </select>
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className={labelClass}>Hero sarlavha</span>
                    <input
                      value={form.heroTitle}
                      onChange={(event) => updateField('heroTitle', event.target.value)}
                      className={fieldClass}
                      placeholder="Sevinch nomli DMTT"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className={labelClass}>Qisqa izoh</span>
                    <input
                      value={form.heroSubtitle}
                      onChange={(event) => updateField('heroSubtitle', event.target.value)}
                      className={fieldClass}
                      placeholder="Bolalar uchun xavfsiz, qulay va zamonaviy ta'lim muhiti"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className={labelClass}>Bog'cha haqida</span>
                    <textarea
                      value={form.about}
                      onChange={(event) => updateField('about', event.target.value)}
                      rows={9}
                      className={textareaClass}
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
                <span className={labelClass}>Yangiliklar bo'limi nomi</span>
                <input value={form.newsTitle} onChange={(event) => updateField('newsTitle', event.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Yangiliklar izohi</span>
                <input value={form.newsSubtitle} onChange={(event) => updateField('newsSubtitle', event.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Bolalar guruhlari bo'limi</span>
                <input value={form.groupsTitle} onChange={(event) => updateField('groupsTitle', event.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>To'garaklar bo'limi</span>
                <input value={form.clubsTitle} onChange={(event) => updateField('clubsTitle', event.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className={labelClass}>Bolalar guruhlari haqida ma'lumot</span>
                <textarea value={form.groupsDescription} onChange={(event) => updateField('groupsDescription', event.target.value)} rows={4} className={textareaClass} />
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
                <span className={labelClass}>To'garaklar haqida ma'lumot</span>
                <textarea value={form.clubsDescription} onChange={(event) => updateField('clubsDescription', event.target.value)} rows={4} className={textareaClass} />
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
                <span className={labelClass}>Telefon</span>
                <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Telegram</span>
                <input value={form.telegram} onChange={(event) => updateField('telegram', event.target.value)} className={fieldClass} placeholder="@username yoki link" />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Email</span>
                <input value={form.email} onChange={(event) => updateField('email', event.target.value)} className={fieldClass} />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className={labelClass}>Manzil</span>
                <input value={form.address} onChange={(event) => updateField('address', event.target.value)} className={fieldClass} />
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
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1110] px-4 py-3">
                <span className="text-sm font-black text-white">Kirish tugmasini ko'rsatish</span>
                <input type="checkbox" checked={Boolean(form.showLoginButton)} onChange={(event) => updateField('showLoginButton', event.target.checked)} className="h-5 w-5 accent-indigo-600" />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Kirish tugmasi matni</span>
                <input value={form.loginButtonLabel} onChange={(event) => updateField('loginButtonLabel', event.target.value)} className={fieldClass} />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Bog'cha web saytini ko'rish</h2>
                <p className="mt-2 break-words text-sm font-bold text-slate-300">
                  {siteDomain || 'Avval subdomain slug kiriting'}
                </p>
              </div>
              <a
                href={sitePreviewPath || '#'}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest text-white sm:mt-0 ${
                  sitePreviewPath ? 'bg-indigo-600 hover:bg-indigo-700' : 'pointer-events-none bg-slate-700'
                }`}
              >
                Web saytni ochish <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>
        )}
      </div>
    </div>
  );
};
