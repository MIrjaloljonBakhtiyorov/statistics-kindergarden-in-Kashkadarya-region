import { useState } from 'react';
import { Camera, Loader2, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/shared/api';
import { displayAssetUrl } from '@/shared/lib/assets';

export type WebsiteRepresentative = {
  id?: string;
  fullName: string;
  role: string;
  phone: string;
  imageUrl: string;
  description: string;
};

type WebsiteRepresentativesEditorProps = {
  value: WebsiteRepresentative[];
  onChange: (value: WebsiteRepresentative[]) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  max?: number;
};

const emptyRepresentative = (): WebsiteRepresentative => ({
  id: crypto.randomUUID(),
  fullName: '',
  role: '',
  phone: '',
  imageUrl: '',
  description: '',
});

export const WebsiteRepresentativesEditor = ({
  value,
  onChange,
  onSuccess,
  onError,
  max = 16,
}: WebsiteRepresentativesEditorProps) => {
  const representatives = Array.isArray(value) ? value.slice(0, max) : [];
  const [uploadingId, setUploadingId] = useState('');

  const updateItem = (index: number, key: keyof WebsiteRepresentative, nextValue: string) => {
    onChange(representatives.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: nextValue } : item));
  };

  const removeItem = (index: number) => {
    onChange(representatives.filter((_, itemIndex) => itemIndex !== index));
  };

  const uploadImage = async (index: number, file?: File) => {
    if (!file) return;
    const item = representatives[index];
    const uploadKey = item?.id || String(index);
    const formData = new FormData();
    formData.append('image', file);

    setUploadingId(uploadKey);
    try {
      const res = await apiClient.post('/upload/website-assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateItem(index, 'imageUrl', res.data?.url || '');
      onSuccess?.('Vakil rasmi yuklandi');
    } catch {
      onError?.('Vakil rasmini yuklashda xatolik');
    } finally {
      setUploadingId('');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1110] p-3 sm:p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Bog'cha vakillari</h3>
          <p className="mt-1 text-xs font-bold text-slate-300">
            Direktor, mudir, oshpaz va guruh rahbarlari cardlari
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...representatives, emptyRepresentative()].slice(0, max))}
          disabled={representatives.length >= max}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-500 disabled:bg-slate-700 sm:w-auto"
        >
          <Plus size={14} /> Vakil qo'shish
        </button>
      </div>

      <div className="grid max-h-[min(72vh,820px)] grid-cols-1 gap-4 overflow-y-auto pr-1 custom-scrollbar">
        {representatives.map((item, index) => {
          const uploadKey = item.id || String(index);
          const isUploading = uploadingId === uploadKey;

          return (
            <article key={uploadKey} className="rounded-2xl border border-white/10 bg-[#111615] p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">Vakil #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-rose-200"
                >
                  <Trash2 size={13} /> O'chirish
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="mx-auto w-full max-w-[220px] md:mx-0">
                  <div className="flex h-[240px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-emerald-400/25 bg-[#08100f] md:h-[260px]">
                    {item.imageUrl ? (
                      <img src={displayAssetUrl(item.imageUrl)} alt={item.fullName || item.role} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-300">
                        <Camera className="mx-auto mb-2 text-emerald-300" size={30} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Rasm yuklanmagan</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <label className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-500">
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                      Rasm
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        className="hidden"
                        onChange={(event) => {
                          uploadImage(index, event.target.files?.[0]);
                          event.target.value = '';
                        }}
                      />
                    </label>
                    {item.imageUrl && (
                      <button
                        type="button"
                        onClick={() => updateItem(index, 'imageUrl', '')}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-200"
                        aria-label="Rasmni olib tashlash"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
                  <Field label="F.I.Sh" value={item.fullName || ''} onChange={(value) => updateItem(index, 'fullName', value)} placeholder="Masalan: Abdullayeva Dilnoza" />
                  <Field label="Lavozim" value={item.role || ''} onChange={(value) => updateItem(index, 'role', value)} placeholder="Direktor, oshpaz, guruh rahbari..." />
                  <Field label="Telefon" value={item.phone || ''} onChange={(value) => updateItem(index, 'phone', value)} placeholder="+998 ..." />
                  <label className="lg:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Qisqa ma'lumot</span>
                    <textarea
                      value={item.description || ''}
                      onChange={(event) => updateItem(index, 'description', event.target.value)}
                      rows={4}
                      className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#0b1110] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
                      placeholder="Tajribasi, vazifasi yoki guruh nomi..."
                    />
                  </label>
                </div>
              </div>
            </article>
          );
        })}

        {representatives.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111615] p-6 text-center text-sm font-bold text-slate-300">
            Hali vakillar qo'shilmagan
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) => (
  <label>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
    <input
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1110] px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
    />
  </label>
);

export default WebsiteRepresentativesEditor;
