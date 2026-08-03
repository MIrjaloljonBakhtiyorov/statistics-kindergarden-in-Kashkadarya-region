import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { apiClient, PARENT_PORTAL_API_BASE_URL } from '@/shared/api';
import { useNotification } from '../../../context/NotificationContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];

const DOC_TYPES = [
  { id: 'MEDICAL', label: "Tibbiy ma'lumotnoma" },
  { id: 'ALLERGY', label: "Allergiya haqida ma'lumot" },
  { id: 'PASSPORT', label: 'Guvohnoma nusxasi' },
  { id: 'OTHER', label: 'Boshqa hujjat' },
];

const DOC_TYPE_LABELS = DOC_TYPES.reduce<Record<string, string>>((acc, item) => {
  acc[item.id] = item.label;
  return acc;
}, {});

const initialDoc = {
  title: '',
  type: 'MEDICAL',
  file: null as File | null,
};

const getAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const origin = PARENT_PORTAL_API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};

const formatDate = (value?: string) => {
  if (!value) return 'Sana yoq';
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value.split(' ')[0] || value;
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatFileSize = (size?: number) => {
  if (!size) return '';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentsSection = ({ data, childId, onUpdate }: any) => {
  const { showNotification } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [newDoc, setNewDoc] = useState(initialDoc);

  const documents = useMemo(() => data?.documents || [], [data?.documents]);

  const resetForm = () => {
    setNewDoc(initialDoc);
    setShowForm(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      showNotification('Fayl hajmi 10MB dan oshmasligi kerak', 'error');
      event.target.value = '';
      return;
    }

    const fileName = file.name.toLowerCase();
    const hasAcceptedExtension = ACCEPTED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    const hasAcceptedMime = file.type ? ACCEPTED_FILE_TYPES.includes(file.type) : true;

    if (!hasAcceptedExtension || !hasAcceptedMime) {
      showNotification('Faqat PDF, rasm yoki Word hujjat yuklash mumkin', 'error');
      event.target.value = '';
      return;
    }

    setNewDoc((prev) => ({ ...prev, file }));
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newDoc.title.trim();

    if (!childId) {
      showNotification("Bola ma'lumoti topilmadi", 'error');
      return;
    }

    if (!title || !newDoc.file) {
      showNotification("Hujjat nomi va faylni kiriting", 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', newDoc.file);

      const uploadRes = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await apiClient.post('/parent-portal/documents', {
        child_id: childId,
        title,
        type: newDoc.type,
        file_url: uploadRes.data.url,
      });

      showNotification('Hujjat yuklandi', 'success');
      resetForm();
      onUpdate?.();
    } catch (error: any) {
      console.error(error);
      showNotification(error?.response?.data?.error || 'Hujjatni yuklashda xatolik', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeletingId(deleteTarget.id);
    try {
      await apiClient.delete(`/parent-portal/documents/${deleteTarget.id}`);
      showNotification("Hujjat o'chirildi", 'success');
      setDeleteTarget(null);
      onUpdate?.();
    } catch (error: any) {
      console.error(error);
      showNotification(error?.response?.data?.error || "Hujjatni o'chirishda xatolik", 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="kg-parent-section space-y-4 md:space-y-6">
      <div className="overflow-hidden rounded-[1.35rem] border border-rose-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-rose-100 bg-[linear-gradient(135deg,#fff_0%,#fff7fa_48%,#fff1f7_100%)] p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20">
              <FileText size={21} />
            </div>
            <div className="min-w-0">
              <h5 className="text-lg font-black uppercase leading-tight tracking-tight text-slate-950 md:text-xl">Hujjatlar</h5>
              <p className="mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-rose-600">
                <ShieldCheck size={12} /> Maxfiy arxiv
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-95"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Yopish' : 'Hujjat yuklash'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleUpload}
            className="border-b border-rose-100 bg-[linear-gradient(180deg,#fff_0%,#fffafb_100%)] p-4 sm:p-5"
          >
            <div className="rounded-[1.15rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/30">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <Upload size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-950">Yangi hujjat</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-rose-500">Yuklash shu menyuda amalga oshadi</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-700">Hujjat turi</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {DOC_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewDoc((prev) => ({ ...prev, type: type.id }))}
                      className={`min-h-11 rounded-2xl border px-3 py-2.5 text-left text-[9px] font-black uppercase tracking-[0.08em] transition-all ${
                        newDoc.type === type.id
                          ? 'border-rose-300 bg-rose-100 text-rose-700 shadow-sm shadow-rose-100'
                          : 'border-rose-100 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
                <div className="space-y-2.5">
                  <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-700">Hujjat nomi</label>
                  <input
                    type="text"
                    value={newDoc.title}
                    onChange={(event) => setNewDoc((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Masalan: Tibbiy ko'rik varaqasi"
                    className="h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 text-sm font-bold text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100/70"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-700">Faylni tanlang</label>
                  <label
                    htmlFor="doc-file"
                    className={`relative flex h-12 cursor-pointer items-center gap-3 rounded-2xl border px-3 transition-all ${
                      newDoc.file ? 'border-pink-200 bg-pink-50/70' : 'border-rose-100 bg-rose-50/50 hover:border-rose-300 hover:bg-white'
                    }`}
                  >
                    <input id="doc-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={handleFileChange} className="hidden" />
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${newDoc.file ? 'bg-pink-100 text-pink-600' : 'bg-white text-rose-500'}`}>
                      {newDoc.file ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                    </div>
                    <div className="min-w-0">
                      {newDoc.file ? (
                        <>
                          <p className="truncate text-[11px] font-black uppercase text-slate-950">{newDoc.file.name}</p>
                          <p className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-pink-600">{formatFileSize(newDoc.file.size)} tayyor</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[11px] font-black uppercase tracking-tight text-slate-950">Fayl tanlash</p>
                          <p className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-slate-500">PDF, rasm, Word - max 10MB</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={17} className="mt-0.5 shrink-0 text-rose-500" />
                  <p className="text-[9px] font-bold uppercase leading-relaxed tracking-wider text-rose-700">
                    Yuklangan fayl faqat bog'cha tizimi va ota-ona portali ichida ko'rinadi.
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isUploading}
                    className="rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-50 disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                  >
                    {isUploading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" /> : <Upload size={15} />}
                    {isUploading ? 'Yuklanmoqda...' : 'Tasdiqlash'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {documents.length > 0 ? (
          <div className="divide-y divide-rose-100">
            {documents.map((doc: any) => {
              const fileUrl = getAssetUrl(doc.file_url);
              return (
                <article key={doc.id} className="group flex flex-col gap-4 p-4 transition-all hover:bg-rose-50/60 sm:p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black leading-snug text-slate-950 transition-colors group-hover:text-rose-600 md:text-base">
                        {doc.title || 'Nomsiz hujjat'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-rose-600">
                          {DOC_TYPE_LABELS[doc.type] || doc.type || 'Hujjat'}
                        </span>
                        <span className="rounded-lg bg-white px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500 ring-1 ring-rose-100">
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-95"
                      >
                        <ExternalLink size={14} />
                        Ochish
                      </a>
                    ) : null}
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        download
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-50 active:scale-95"
                      >
                        <Download size={14} />
                        Yuklab olish
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(doc)}
                      disabled={deletingId === doc.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deletingId === doc.id ? "O'chmoqda" : "O'chirish"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center md:p-14">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-300 ring-1 ring-rose-100">
              <FileText size={30} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-950">Hujjatlar mavjud emas</p>
              <p className="mt-1 text-xs font-bold text-slate-500">Tibbiy ma'lumotnoma, guvohnoma yoki boshqa fayllarni shu yerdan yuklang.</p>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-rose-100 bg-white shadow-2xl shadow-rose-950/10">
            <div className="border-b border-rose-100 bg-gradient-to-br from-white via-rose-50 to-pink-50 p-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 shadow-sm">
                  <AlertTriangle size={23} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-black leading-tight text-slate-950">Hujjatni o'chirish</h4>
                  <p className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-500">
                    Ushbu amal bajarilgandan keyin hujjat ro'yxatdan olib tashlanadi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Tanlangan hujjat</p>
                <p className="mt-1 break-words text-sm font-black text-slate-950">
                  {deleteTarget.title || 'Nomsiz hujjat'}
                </p>
                <p className="mt-2 text-[11px] font-bold text-slate-500">
                  {DOC_TYPE_LABELS[deleteTarget.type] || deleteTarget.type || 'Hujjat'} - {formatDate(deleteTarget.created_at)}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deletingId === deleteTarget.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletingId === deleteTarget.id}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 disabled:opacity-50"
                >
                  {deletingId === deleteTarget.id ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
