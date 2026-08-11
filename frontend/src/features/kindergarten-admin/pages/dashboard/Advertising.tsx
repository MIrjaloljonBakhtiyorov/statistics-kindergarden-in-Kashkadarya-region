import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, ExternalLink, Eye, EyeOff, ImagePlus, Loader2, Plus, Save, Trash2, Upload, Video, X } from 'lucide-react';
import { toast } from 'sonner';

import { apiClient } from '@/shared/api';

type PanelId = 'create' | 'active' | 'inactive';

type Advertisement = {
  id: string;
  name: string;
  displayCount: number;
  durationDays: number;
  contentType: 'image' | 'video' | 'text';
  imageUrl?: string;
  linkUrl?: string;
  text?: string;
  status: 'active' | 'inactive';
  createdAt?: string | null;
};

type AdvertisementForm = {
  name: string;
  displayCount: string;
  durationDays: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  linkUrl: string;
  text: string;
};

const emptyForm: AdvertisementForm = {
  name: '',
  displayCount: '1',
  durationDays: '1',
  imageUrl: '',
  mediaType: 'image',
  linkUrl: '',
  text: '',
};

const apiRoot = String(apiClient.defaults.baseURL || '').replace(/\/api\/?$/, '');
const mediaUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiRoot}${url.startsWith('/') ? url : `/${url}`}`;
};

const getVideoDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video davomiyligini aniqlab bo‘lmadi.'));
    };
    video.src = url;
  });

export const Advertising = () => {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [form, setForm] = useState<AdvertisementForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdvertisementForm>(emptyForm);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeAds = useMemo(() => advertisements.filter((ad) => ad.status === 'active'), [advertisements]);
  const inactiveAds = useMemo(() => advertisements.filter((ad) => ad.status === 'inactive'), [advertisements]);

  useEffect(() => {
    let alive = true;

    apiClient
      .get<Advertisement[]>('/kindergartens/advertisements')
      .then((response) => {
        if (alive) setAdvertisements(response.data || []);
      })
      .catch(() => toast.error('Reklamalarni yuklab bo‘lmadi'))
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const cards = [
    {
      id: 'create' as const,
      title: 'Reklama yaratish',
      description: 'Media, matn va havolani bitta joyda tayyorlang.',
      value: 'Yangi',
      icon: Plus,
      tone: 'border-indigo-100 bg-indigo-50 text-indigo-700',
    },
    {
      id: 'active' as const,
      title: 'Faol reklamalar',
      description: 'Saqlangan va foydalanuvchilarga ko‘rinadigan reklamalar.',
      value: `${activeAds.length} ta`,
      icon: Eye,
      tone: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    },
    {
      id: 'inactive' as const,
      title: 'Nofaol reklamalar',
      description: 'To‘xtatilgan yoki keyinroq ishlatiladigan reklamalar.',
      value: `${inactiveAds.length} ta`,
      icon: EyeOff,
      tone: 'border-slate-200 bg-slate-50 text-slate-700',
    },
  ];

  const updateForm = (field: keyof AdvertisementForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateEditForm = (field: keyof AdvertisementForm, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const uploadMedia = async (file?: File, target: 'create' | 'edit' = 'create') => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Reklama uchun rasm yoki video fayl yuklang');
      return;
    }

    if (isVideo) {
      try {
        const duration = await getVideoDuration(file);
        if (duration > 10) {
          toast.error('Video 10 sekunddan oshmasligi kerak');
          return;
        }
      } catch {
        toast.error('Video faylini tekshirishda xatolik');
        return;
      }
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const response = await apiClient.post('/upload/website-assets', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const applyMedia = target === 'edit' ? setEditForm : setForm;
      applyMedia((current) => ({
        ...current,
        imageUrl: response.data.url || '',
        mediaType: isVideo ? 'video' : 'image',
      }));
      toast.success(isVideo ? 'Video yuklandi' : 'Rasm yuklandi');
    } catch {
      toast.error('Media yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const saveAdvertisement = async () => {
    const name = form.name.trim();
    const text = form.text.trim();
    const imageUrl = form.imageUrl.trim();
    const linkUrl = form.linkUrl.trim();

    if (!name) {
      toast.error('Reklama nomini kiriting');
      return;
    }
    if (!imageUrl && !text) {
      toast.error('Reklama uchun rasm yoki matn kiriting');
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.post<Advertisement>('/kindergartens/advertisements', {
        name,
        displayCount: Number(form.displayCount || 0),
        durationDays: Number(form.durationDays || 1),
        imageUrl,
        mediaType: imageUrl ? form.mediaType : 'text',
        linkUrl,
        text,
      });
      setAdvertisements((current) => [response.data, ...current]);
      setForm(emptyForm);
      setActivePanel('active');
      toast.success('Reklama saqlandi va faol reklamalarga qo‘shildi');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Reklamani saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (advertisement: Advertisement, status: Advertisement['status']) => {
    setUpdatingId(advertisement.id);
    try {
      const response = await apiClient.put<Advertisement>(`/kindergartens/advertisements/${advertisement.id}`, { status });
      setAdvertisements((current) => current.map((item) => (item.id === advertisement.id ? response.data : item)));
      toast.success(status === 'active' ? 'Reklama faollashtirildi' : 'Reklama nofaol qilindi');
    } catch {
      toast.error('Reklama holatini o‘zgartirib bo‘lmadi');
    } finally {
      setUpdatingId(null);
    }
  };

  const startEdit = (advertisement: Advertisement) => {
    setEditingId(advertisement.id);
    setEditForm({
      name: advertisement.name || '',
      displayCount: String(advertisement.displayCount || 0),
      durationDays: String(advertisement.durationDays || 1),
      imageUrl: advertisement.imageUrl || '',
      mediaType: advertisement.contentType === 'video' ? 'video' : 'image',
      linkUrl: advertisement.linkUrl || '',
      text: advertisement.text || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const saveEditedAdvertisement = async (advertisement: Advertisement) => {
    const name = editForm.name.trim();
    const text = editForm.text.trim();
    const imageUrl = editForm.imageUrl.trim();
    const linkUrl = editForm.linkUrl.trim();

    if (!name) {
      toast.error('Reklama nomini kiriting');
      return;
    }
    if (!imageUrl && !text) {
      toast.error('Reklama uchun rasm, video yoki matn kiriting');
      return;
    }

    setUpdatingId(advertisement.id);
    try {
      const response = await apiClient.put<Advertisement>(`/kindergartens/advertisements/${advertisement.id}`, {
        name,
        displayCount: Number(editForm.displayCount || 0),
        durationDays: Number(editForm.durationDays || 1),
        imageUrl,
        mediaType: imageUrl ? editForm.mediaType : 'text',
        linkUrl,
        text,
        status: advertisement.status,
      });
      setAdvertisements((current) => current.map((item) => (item.id === advertisement.id ? response.data : item)));
      cancelEdit();
      toast.success('Reklama tahrirlandi');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Reklamani tahrirlashda xatolik');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteAdvertisement = async (advertisement: Advertisement) => {
    const confirmed = window.confirm(`"${advertisement.name}" reklamasi o‘chirilsinmi?`);
    if (!confirmed) return;

    setDeletingId(advertisement.id);
    try {
      await apiClient.delete(`/kindergartens/advertisements/${advertisement.id}`);
      setAdvertisements((current) => current.filter((item) => item.id !== advertisement.id));
      if (editingId === advertisement.id) cancelEdit();
      toast.success('Reklama o‘chirildi');
    } catch {
      toast.error('Reklamani o‘chirib bo‘lmadi');
    } finally {
      setDeletingId(null);
    }
  };

  const shownAds = activePanel === 'inactive' ? inactiveAds : activeAds;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Reklama</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Reklamalarni yaratish, faollashtirish va boshqarish.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setActivePanel(activePanel === card.id ? null : card.id)}
            className={`group relative min-h-[190px] overflow-hidden rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60 active:scale-[0.99] ${
              activePanel === card.id ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-slate-200'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-950 via-blue-800 to-indigo-600" />
            <div className="flex items-start justify-between gap-4">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.tone}`}>
                <card.icon size={22} />
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-600">
                {loading && card.id !== 'create' ? '...' : card.value}
              </span>
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-950">{card.title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{card.description}</p>
          </button>
        ))}
      </div>

      {activePanel === 'create' && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
          <PanelHeader title="Yangi reklama" label="Reklama yaratish" onClose={() => setActivePanel(null)} />
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Reklama nomi">
                <input
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  placeholder="Masalan: Yozgi qabul reklamasi"
                />
              </Field>

              <Field label="Ota-onalarga necha marta ko‘rinishi">
                <input
                  type="number"
                  min={0}
                  value={form.displayCount}
                  onChange={(event) => updateForm('displayCount', event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </Field>

              <Field label="Necha kun reklama qilinishi">
                <input
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(event) => updateForm('durationDays', event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </Field>

              <Field label="Reklama havolasi">
                <input
                  value={form.linkUrl}
                  onChange={(event) => updateForm('linkUrl', event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  placeholder="Masalan: https://example.com"
                />
              </Field>

              <Field label="Reklama rasmi yoki videosi">
                <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 px-4 text-sm font-black text-indigo-700 transition hover:bg-indigo-100">
                  {uploading ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
                  {uploading ? 'Yuklanmoqda...' : form.imageUrl ? 'Media almashtirish' : 'Rasm/video yuklash'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    disabled={uploading}
                    onChange={(event) => uploadMedia(event.target.files?.[0])}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs font-bold text-slate-400">Video maksimal 10 sekund bo‘lishi kerak.</p>
              </Field>

              <div className="md:col-span-2">
                <Field label="Reklama matni">
                  <textarea
                    value={form.text}
                    onChange={(event) => updateForm('text', event.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold leading-6 text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    placeholder="Rasm yoki video bo‘lmasa, reklama matnini shu yerga kiriting."
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-inner shadow-slate-200/60">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Preview</p>
                  <h3 className="mt-1 text-base font-black text-slate-950">Ota-ona portalida ko‘rinishi</h3>
                </div>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
                  Faol
                </span>
              </div>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                {form.imageUrl && form.mediaType === 'video' ? (
                  <video src={mediaUrl(form.imageUrl)} className="h-full w-full object-cover" controls />
                ) : form.imageUrl ? (
                  <img src={mediaUrl(form.imageUrl)} alt={form.name || 'Reklama rasmi'} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImagePlus className="mx-auto text-slate-300" size={38} />
                    <p className="mt-3 text-sm font-black text-slate-400">Media preview</p>
                  </div>
                )}
                  <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-950 shadow-sm backdrop-blur">
                    Reklama
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black text-slate-500">
                      {form.durationDays || 1} kun
                    </span>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                      {form.displayCount || 0} marta
                    </span>
                  </div>
                  <h4 className="mt-3 break-words text-lg font-black text-slate-950">
                    {form.name.trim() || 'Reklama nomi'}
                  </h4>
                  {form.text ? <p className="mt-2 line-clamp-4 text-sm font-semibold leading-6 text-slate-600">{form.text}</p> : null}
                  {form.linkUrl ? (
                    <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                      <ExternalLink size={14} />
                      <span className="truncate">Havolaga o‘tish</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={saveAdvertisement}
                disabled={saving || uploading}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </section>
      )}

      {(activePanel === 'active' || activePanel === 'inactive') && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <PanelHeader
            title={activePanel === 'active' ? 'Faol reklamalar' : 'Nofaol reklamalar'}
            label={activePanel === 'active' ? `${activeAds.length} ta faol` : `${inactiveAds.length} ta nofaol`}
            onClose={() => setActivePanel(null)}
          />

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {shownAds.map((ad) => (
              <article key={ad.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60">
                {editingId === ad.id ? (
                  <div className="grid gap-4 bg-slate-50 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Reklama nomi">
                        <input
                          value={editForm.name}
                          onChange={(event) => updateEditForm('name', event.target.value)}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                        />
                      </Field>
                      <Field label="Ota-onalarga necha marta ko‘rinishi">
                        <input
                          type="number"
                          min={0}
                          value={editForm.displayCount}
                          onChange={(event) => updateEditForm('displayCount', event.target.value)}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                        />
                      </Field>
                      <Field label="Necha kun reklama qilinishi">
                        <input
                          type="number"
                          min={1}
                          value={editForm.durationDays}
                          onChange={(event) => updateEditForm('durationDays', event.target.value)}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                        />
                      </Field>
                      <Field label="Reklama havolasi">
                        <input
                          value={editForm.linkUrl}
                          onChange={(event) => updateEditForm('linkUrl', event.target.value)}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                          placeholder="https://example.com"
                        />
                      </Field>
                      <Field label="Media">
                        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-white px-4 text-xs font-black text-indigo-700 transition hover:bg-indigo-50">
                          {uploading ? <Loader2 className="animate-spin" size={15} /> : <Upload size={15} />}
                          Media almashtirish
                          <input
                            type="file"
                            accept="image/*,video/*"
                            disabled={uploading}
                            onChange={(event) => uploadMedia(event.target.files?.[0], 'edit')}
                            className="hidden"
                          />
                        </label>
                      </Field>
                    </div>
                    <Field label="Reklama matni">
                      <textarea
                        value={editForm.text}
                        onChange={(event) => updateEditForm('text', event.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                      />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => saveEditedAdvertisement(ad)}
                        disabled={updatingId === ad.id || uploading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-xs font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === ad.id ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        Saqlash
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:bg-slate-100"
                      >
                        <X size={14} />
                        Bekor qilish
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4 p-4">
                      <div className="relative flex h-28 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                        {ad.imageUrl && ad.contentType === 'video' ? (
                          <video src={mediaUrl(ad.imageUrl)} className="h-full w-full object-cover" muted playsInline />
                        ) : ad.imageUrl ? (
                          <img src={mediaUrl(ad.imageUrl)} alt={ad.name} className="h-full w-full object-cover" />
                        ) : (
                          <Video className="text-slate-300" size={28} />
                        )}
                        <span className="absolute left-2 top-2 rounded-full border border-white/60 bg-white/90 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                          {ad.contentType === 'video' ? 'Video' : ad.contentType === 'image' ? 'Rasm' : 'Matn'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            ad.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                          }`}>
                            {ad.status === 'active' ? 'Faol' : 'Nofaol'}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700 ring-1 ring-blue-100">
                            {ad.durationDays} kun
                          </span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200">
                            {ad.displayCount} marta
                          </span>
                        </div>
                        <h3 className="mt-3 break-words text-lg font-black leading-snug text-slate-950">{ad.name}</h3>
                        {ad.linkUrl ? (
                          <p className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
                            <ExternalLink size={12} />
                            <span className="truncate">{ad.linkUrl}</span>
                          </p>
                        ) : null}
                        {ad.text ? <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{ad.text}</p> : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => changeStatus(ad, ad.status === 'active' ? 'inactive' : 'active')}
                        disabled={updatingId === ad.id}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === ad.id ? <Loader2 className="animate-spin" size={14} /> : null}
                        {ad.status === 'active' ? 'Nofaol qilish' : 'Faollashtirish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(ad)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <Edit3 size={14} />
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAdvertisement(ad)}
                        disabled={deletingId === ad.id}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === ad.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        O‘chirish
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>

          {!loading && shownAds.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
              Bu bo‘limda hozircha reklama yo‘q.
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
};

const PanelHeader = ({ title, label, onClose }: { title: string; label: string; onClose: () => void }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">{label}</p>
      <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
      title="Yopish"
    >
      <X size={18} />
    </button>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
    {children}
  </label>
);
