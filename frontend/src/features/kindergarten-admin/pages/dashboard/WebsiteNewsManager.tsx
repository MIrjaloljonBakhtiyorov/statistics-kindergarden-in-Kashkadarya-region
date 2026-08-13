import { useEffect, useState, type ChangeEvent } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit3,
  Loader2,
  Newspaper,
  PauseCircle,
  PlusCircle,
  Save,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import { apiClient, kindergartenApi } from '@/shared/api';

type NewsStatus = 'active' | 'inactive';
type NewsPanel = 'create' | 'active' | 'inactive' | null;

const NEWS_PAGE_SIZE = 15;

interface SavedNewsItem {
  id: string;
  title: string;
  text?: string;
  status: NewsStatus;
  imageUrl: string;
  linkUrl?: string;
  mediaName: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  publishedAt?: string;
}

const newsCards = [
  {
    id: 'create',
    title: 'Yangilik yaratish',
    description: 'Yangi eʼlon, maqola yoki MTT veb sahifasi uchun xabar qoʻshish',
    value: 'Yangi',
    icon: PlusCircle,
    accent: 'from-blue-600 to-indigo-600',
    soft: 'bg-blue-500/10 text-blue-200 border-blue-400/25',
  },
  {
    id: 'active',
    title: 'Faol yangiliklar',
    description: 'Ota-ona profilida ko‘rinib turgan yangiliklar',
    icon: CheckCircle2,
    accent: 'from-emerald-500 to-teal-600',
    soft: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/25',
  },
  {
    id: 'inactive',
    title: 'Nofaol yangiliklar',
    description: 'Qoralama yoki vaqtincha yashirilgan yangiliklar',
    icon: PauseCircle,
    accent: 'from-slate-600 to-indigo-700',
    soft: 'bg-slate-500/10 text-slate-200 border-white/10',
  },
];

const surfaceClass = 'border border-white/10 bg-[#111615] shadow-[0_18px_50px_rgba(0,0,0,0.22)]';
const inputClass = 'rounded-2xl border border-white/10 bg-[#0b1110] text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-500/10';
const labelClass = 'text-[11px] font-black uppercase tracking-[0.16em] text-slate-300';

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatFileSize = (file?: File | null) => {
  if (!file) return '';
  if (file.size < 1024 * 1024) return `${Math.max(1, Math.round(file.size / 1024))} KB`;
  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
};

const fileNameFromUrl = (value = '') => {
  const clean = value.split('?')[0].split('/').filter(Boolean).pop() || 'media fayl';
  return decodeURIComponent(clean);
};

const normalizeNews = (item: any): SavedNewsItem => ({
  id: String(item.id),
  title: String(item.title || ''),
  text: String(item.body || item.text || '').trim() || undefined,
  status: item.status === 'published' ? 'active' : 'inactive',
  imageUrl: String(item.imageUrl || item.image_url || ''),
  linkUrl: String(item.linkUrl || item.link_url || '').trim() || undefined,
  mediaName: fileNameFromUrl(String(item.imageUrl || item.image_url || '')),
  mediaType: String(item.mediaType || item.media_type || 'image') === 'video' ? 'video' : 'image',
  createdAt: String(item.createdAt || item.created_at || ''),
  publishedAt: String(item.publishedAt || item.published_at || ''),
});

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

const uploadNewsMedia = async (file: File) => {
  const data = new FormData();
  data.append('image', file);

  const response = await apiClient.post('/upload/website-assets', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return String(response.data?.url || '');
};

export const WebsiteNewsManager = () => {
  const [activePanel, setActivePanel] = useState<NewsPanel>(null);
  const [savedNews, setSavedNews] = useState<SavedNewsItem[]>([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsText, setNewsText] = useState('');
  const [newsLink, setNewsLink] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaError, setMediaError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedNewsItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [editMediaError, setEditMediaError] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);

  const activeCount = savedNews.filter((item) => item.status === 'active').length;
  const inactiveCount = savedNews.filter((item) => item.status === 'inactive').length;
  const selectedStatus: NewsStatus | null = activePanel === 'active' || activePanel === 'inactive' ? activePanel : null;
  const visibleNews = selectedStatus
    ? savedNews.filter((item) => item.status === selectedStatus)
    : savedNews;
  const currentPage = selectedStatus === 'inactive' ? inactivePage : activePage;
  const totalPages = Math.max(1, Math.ceil(visibleNews.length / NEWS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedNews = visibleNews.slice((safePage - 1) * NEWS_PAGE_SIZE, safePage * NEWS_PAGE_SIZE);

  useEffect(() => {
    let mounted = true;

    kindergartenApi.parentProfileNews.getAll()
      .then((rows) => {
        if (mounted) setSavedNews(Array.isArray(rows) ? rows.map(normalizeNews) : []);
      })
      .catch(() => {
        if (mounted) setFormError('Yangiliklarni yuklashda xatolik yuz berdi.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setActivePage((page) => Math.min(page, Math.max(1, Math.ceil(activeCount / NEWS_PAGE_SIZE))));
    setInactivePage((page) => Math.min(page, Math.max(1, Math.ceil(inactiveCount / NEWS_PAGE_SIZE))));
  }, [activeCount, inactiveCount]);

  const handleMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setMediaError('');
    setFormError('');
    setMediaFile(null);

    if (!file) return;

    if (file.type.startsWith('video/')) {
      try {
        const duration = await getVideoDuration(file);
        if (duration > 10) {
          setMediaError('Video 10 sekunddan oshmasligi kerak.');
          event.target.value = '';
          return;
        }
      } catch {
        setMediaError('Video faylini tekshirishda xatolik yuz berdi.');
        event.target.value = '';
        return;
      }
    }

    setMediaFile(file);
  };

  const handleEditMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setEditMediaError('');
    setFormError('');
    setEditMediaFile(null);

    if (!file) return;

    if (file.type.startsWith('video/')) {
      try {
        const duration = await getVideoDuration(file);
        if (duration > 10) {
          setEditMediaError('Video 10 sekunddan oshmasligi kerak.');
          event.target.value = '';
          return;
        }
      } catch {
        setEditMediaError('Video faylini tekshirishda xatolik yuz berdi.');
        event.target.value = '';
        return;
      }
    }

    setEditMediaFile(file);
  };

  const startEditNews = (item: SavedNewsItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditText(item.text || '');
    setEditLink(item.linkUrl || '');
    setEditMediaFile(null);
    setEditMediaError('');
    setFormError('');
  };

  const cancelEditNews = () => {
    setEditingId(null);
    setEditTitle('');
    setEditText('');
    setEditLink('');
    setEditMediaFile(null);
    setEditMediaError('');
  };

  const handleSaveNews = async () => {
    setFormError('');

    if (!newsTitle.trim()) {
      setFormError('Yangilik nomini kiriting.');
      return;
    }

    if (!mediaFile) {
      setFormError('Yangilik rasmi yoki videosini yuklang.');
      return;
    }

    setIsSaving(true);
    try {
      const imageUrl = await uploadNewsMedia(mediaFile);
      if (!imageUrl) throw new Error('Media fayl yuklanmadi.');

      const created = await kindergartenApi.parentProfileNews.create({
        title: newsTitle.trim(),
        body: newsText.trim(),
        imageUrl,
        linkUrl: newsLink.trim(),
        mediaType: mediaFile.type.startsWith('video/') ? 'video' : 'image',
        status: 'published',
        publishedAt: todayIso(),
      });

      setSavedNews((items) => [normalizeNews(created), ...items]);
      setNewsTitle('');
      setNewsText('');
      setNewsLink('');
      setMediaFile(null);
      setActivePanel('active');
    } catch (error: any) {
      setFormError(error?.response?.data?.error || error?.message || 'Yangilikni saqlashda xatolik yuz berdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNewsStatus = async (id: string) => {
    const current = savedNews.find((item) => item.id === id);
    if (!current) return;

    setUpdatingId(id);
    try {
      const nextStatus = current.status === 'active' ? 'draft' : 'published';
      const updated = await kindergartenApi.parentProfileNews.update(id, {
        title: current.title,
        body: current.text || '',
        imageUrl: current.imageUrl,
        linkUrl: current.linkUrl || '',
        mediaType: current.mediaType,
        status: nextStatus,
        publishedAt: nextStatus === 'published' ? todayIso() : current.publishedAt || '',
      });

      setSavedNews((items) => items.map((item) => item.id === id ? normalizeNews(updated) : item));
    } catch {
      setFormError('Yangilik holatini yangilashda xatolik yuz berdi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const saveEditedNews = async (id: string) => {
    const current = savedNews.find((item) => item.id === id);
    if (!current) return;

    setFormError('');
    if (!editTitle.trim()) {
      setFormError('Yangilik nomini kiriting.');
      return;
    }

    setUpdatingId(id);
    try {
      const nextImageUrl = editMediaFile ? await uploadNewsMedia(editMediaFile) : current.imageUrl;
      const updated = await kindergartenApi.parentProfileNews.update(id, {
        title: editTitle.trim(),
        body: editText.trim(),
        imageUrl: nextImageUrl,
        linkUrl: editLink.trim(),
        mediaType: editMediaFile
          ? (editMediaFile.type.startsWith('video/') ? 'video' : 'image')
          : current.mediaType,
        status: current.status === 'active' ? 'published' : 'draft',
        publishedAt: current.status === 'active' ? current.publishedAt || todayIso() : current.publishedAt || '',
      });

      setSavedNews((items) => items.map((item) => item.id === id ? normalizeNews(updated) : item));
      cancelEditNews();
    } catch (error: any) {
      setFormError(error?.response?.data?.error || error?.message || 'Yangilikni tahrirlashda xatolik yuz berdi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const requestDeleteNews = (item: SavedNewsItem) => {
    setDeleteTarget(item);
    setFormError('');
  };

  const confirmDeleteNews = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id;
    setDeletingId(id);
    setFormError('');
    try {
      await kindergartenApi.parentProfileNews.delete(id);
      setSavedNews((items) => items.filter((item) => item.id !== id));
      if (editingId === id) cancelEditNews();
      setDeleteTarget(null);
    } catch (error: any) {
      setFormError(error?.response?.data?.error || 'Yangilikni o‘chirishda xatolik yuz berdi.');
    } finally {
      setDeletingId(null);
    }
  };

  const setSelectedPage = (page: number) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);
    if (selectedStatus === 'inactive') {
      setInactivePage(nextPage);
    } else {
      setActivePage(nextPage);
    }
  };

  return (
    <div className="-m-2 min-h-[calc(100vh-120px)] space-y-6 rounded-[24px] bg-[#08100f] p-2 text-white sm:-m-3 sm:p-3">
      <div className={`flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${surfaceClass}`}>
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1110] text-emerald-300">
            <Newspaper size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              MTT web sahifasi
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Yangiliklar
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Ota-ona profilidagi yangiliklar bo‘limiga yuboriladigan eʼlonlar boshqaruvi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {newsCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => setActivePanel((panel) => (panel === card.id ? null : card.id as NewsPanel))}
            className={`group relative min-h-[172px] overflow-hidden rounded-3xl border bg-[#111615] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/35 active:scale-[0.99] ${
              activePanel === card.id ? 'border-emerald-400/60 ring-4 ring-emerald-500/10' : 'border-white/10'
            }`}
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
            <div className="relative flex h-full flex-col justify-between gap-7">
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${card.soft}`}>
                  <card.icon size={21} />
                </div>
                <span className="rounded-full border border-white/10 bg-[#0b1110] px-3 py-1 text-[11px] font-black text-white">
                  {card.id === 'active' ? `${activeCount} ta` : card.id === 'inactive' ? `${inactiveCount} ta` : card.value}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                  {card.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {activePanel === 'create' && (
        <div className={`rounded-3xl ${surfaceClass}`}>
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                  Sub menu
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-white">
                  Yangilik yaratish uchun ma'lumotlar
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  Yangilik nomi, ixtiyoriy matni va rasm yoki 10 sekundgacha bo‘lgan video yuklang.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-200">
                <Video size={13} />
                Video limiti: 10s
              </span>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6">
            <label>
              <span className={labelClass}>
                Yangilik nomi
              </span>
              <input
                value={newsTitle}
                onChange={(event) => setNewsTitle(event.target.value)}
                placeholder="Masalan: Yangi MTT binosi foydalanishga topshirildi"
                className={`mt-2 w-full px-4 py-3 ${inputClass}`}
              />
            </label>

            <label>
              <span className={labelClass}>
                Yangilik matni
              </span>
              <textarea
                value={newsText}
                onChange={(event) => setNewsText(event.target.value)}
                placeholder="Agar matn mavjud bo‘lsa shu yerga yozing"
                rows={4}
                className={`mt-2 w-full resize-none px-4 py-3 leading-6 ${inputClass}`}
              />
            </label>

            <label>
              <span className={labelClass}>
                Havola
              </span>
              <input
                value={newsLink}
                onChange={(event) => setNewsLink(event.target.value)}
                placeholder="Masalan: https://example.com/yangilik"
                className={`mt-2 w-full px-4 py-3 ${inputClass}`}
              />
              <p className="mt-2 text-xs font-bold text-slate-400">
                Ota-ona yangilik ustiga bosganda shu havolaga o'tadi.
              </p>
            </label>

            <label className="group cursor-pointer rounded-3xl border border-dashed border-white/15 bg-[#0b1110] p-5 transition hover:border-emerald-400/50">
              <input
                type="file"
                accept="image/*,video/*"
                className="sr-only"
                onChange={handleMediaChange}
              />
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <UploadCloud size={21} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">Rasm yoki video</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
                    Rasm yoki 10 sekunddan oshmagan video fayl yuklang.
                  </p>
                  {mediaFile && (
                    <p className="mt-3 truncate rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200">
                      {mediaFile.name} · {formatFileSize(mediaFile)}
                    </p>
                  )}
                  {mediaError && (
                    <p className="mt-3 flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-200">
                      <AlertCircle size={14} />
                      {mediaError}
                    </p>
                  )}
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            {formError ? (
              <p className="flex items-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-200">
                <AlertCircle size={16} />
                {formError}
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-300">
                Saqlangandan keyin yangilik bazaga yoziladi va ota-ona profilida ko‘rinadi.
              </p>
            )}

            <button
              type="button"
              onClick={handleSaveNews}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              Saqlash
            </button>
          </div>
        </div>
      )}

      {selectedStatus && (
        <div className={`rounded-3xl ${surfaceClass}`}>
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Yangiliklar ro‘yxati
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-white">
                {selectedStatus === 'active' ? 'Faol yangiliklar' : 'Nofaol yangiliklar'}
              </h2>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-[#0b1110] px-3 py-1.5 text-[11px] font-black text-white">
              {visibleNews.length} ta yangilik
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm font-black text-slate-300">
                <Loader2 size={18} className="animate-spin" />
                Yuklanmoqda
              </div>
            ) : visibleNews.length > 0 ? (
              paginatedNews.map((item, index) => {
                const rowNumber = (safePage - 1) * NEWS_PAGE_SIZE + index + 1;
                const isEditing = editingId === item.id;

                return (
                  <div key={item.id} className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-start sm:justify-between sm:p-6">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0b1110] text-xs font-black text-slate-200">
                        {rowNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isEditing ? (
                            <input
                              value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}
                              className={`min-w-[220px] flex-1 px-3 py-2 ${inputClass}`}
                            />
                          ) : (
                            <h3 className="text-base font-black text-white">
                              {item.title}
                            </h3>
                          )}
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'active'
                              ? 'bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/20'
                              : 'bg-slate-500/10 text-slate-200 ring-1 ring-white/10'
                          }`}>
                            {item.status === 'active' ? 'Faol' : 'Nofaol'}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="mt-3 grid gap-3">
                            <textarea
                              value={editText}
                              onChange={(event) => setEditText(event.target.value)}
                              rows={3}
                              placeholder="Yangilik matni"
                              className={`w-full resize-none px-3 py-2 leading-6 ${inputClass}`}
                            />
                            <input
                              value={editLink}
                              onChange={(event) => setEditLink(event.target.value)}
                              placeholder="Havola"
                              className={`w-full px-3 py-2 ${inputClass}`}
                            />
                            <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-white/15 bg-[#0b1110] px-4 py-3 transition hover:border-emerald-400/50 sm:flex-row sm:items-center sm:justify-between">
                              <input
                                type="file"
                                accept="image/*,video/*"
                                className="sr-only"
                                onChange={handleEditMediaChange}
                              />
                              <span className="text-xs font-black text-slate-300">Media almashtirish</span>
                              <span className="truncate text-xs font-black text-emerald-200">
                                {editMediaFile ? `${editMediaFile.name} · ${formatFileSize(editMediaFile)}` : 'Rasm/video tanlash'}
                              </span>
                            </label>
                            {editMediaError && (
                              <p className="flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-200">
                                <AlertCircle size={14} />
                                {editMediaError}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="mt-2 text-sm font-semibold text-slate-300">
                              {item.mediaType === 'video' ? 'Video' : 'Rasm'}: {item.mediaName}
                            </p>
                            {item.linkUrl && (
                              <p className="mt-1 max-w-3xl truncate text-xs font-bold text-cyan-200">
                                Havola: {item.linkUrl}
                              </p>
                            )}
                            {item.text && (
                              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-200">
                                {item.text}
                              </p>
                            )}
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              Saqlangan vaqt: {item.createdAt || item.publishedAt || '-'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditedNews(item.id)}
                            title="Saqlash"
                            disabled={updatingId === item.id}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updatingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditNews}
                            title="Bekor qilish"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1110] text-slate-200 transition hover:bg-white/10 active:scale-95"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditNews(item)}
                            title="Tahrirlash"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 transition hover:bg-cyan-400/15 active:scale-95"
                          >
                          <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteNews(item)}
                            title="O'chirish"
                            disabled={deletingId === item.id}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-200 transition hover:bg-rose-500/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                          {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNewsStatus(item.id)}
                            title={item.status === 'active' ? 'Nofaol qilish' : 'Faol qilish'}
                            disabled={updatingId === item.id}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                              item.status === 'active'
                                ? 'border border-white/10 bg-[#0b1110] text-slate-200 hover:bg-white/10'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {updatingId === item.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : item.status === 'active' ? (
                              <PauseCircle size={14} />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm font-black text-slate-300">
                  Bu ro‘yxatda hozircha yangilik yo‘q.
                </p>
              </div>
            )}
          </div>

          {visibleNews.length > NEWS_PAGE_SIZE && (
            <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-xs font-black text-slate-400">
                {((safePage - 1) * NEWS_PAGE_SIZE) + 1}-{Math.min(safePage * NEWS_PAGE_SIZE, visibleNews.length)} / {visibleNews.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0b1110] text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="rounded-xl border border-white/10 bg-[#0b1110] px-4 py-2 text-xs font-black text-white">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0b1110] text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-400/20 bg-[#111615] shadow-2xl shadow-slate-950/40">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/10 text-rose-200">
                  <Trash2 size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                    O'chirish
                  </p>
                  <h3 className="mt-1 text-xl font-black leading-tight text-white">
                    Yangilik o'chirilsinmi?
                  </h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                    "{deleteTarget.title}" yangiligi real bazadan o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget.id}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0b1110] px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={16} />
                Yo'q
              </button>
              <button
                type="button"
                onClick={confirmDeleteNews}
                disabled={deletingId === deleteTarget.id}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
