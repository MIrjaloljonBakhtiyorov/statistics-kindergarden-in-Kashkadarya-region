import { useState } from 'react';
import { Camera, Loader2, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/shared/api';
import { displayAssetUrl } from '@/shared/lib/assets';

type GalleryImageUploaderProps = {
  value: string[];
  onChange: (value: string[]) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  max?: number;
};

export const GalleryImageUploader = ({
  value,
  onChange,
  onSuccess,
  onError,
  max = 8,
}: GalleryImageUploaderProps) => {
  const images = (value || []).filter(Boolean).slice(0, max);
  const remaining = Math.max(0, max - images.length);
  const isFull = remaining === 0;
  const [uploading, setUploading] = useState(false);

  const uploadImages = async (files?: FileList | null) => {
    const selectedFiles = Array.from(files || []).slice(0, remaining);
    if (selectedFiles.length === 0) {
      if (isFull) onError?.(`Maksimal ${max} ta rasm yuklash mumkin`);
      return;
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiClient.post('/upload/website-assets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.url) uploaded.push(res.data.url);
      }
      onChange([...images, ...uploaded].slice(0, max));
      onSuccess?.('Galereya rasmlari yuklandi');
    } catch {
      onError?.('Galereya rasmlarini yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1110] p-3 sm:p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Bog'cha hayotidan lavhalar</h3>
          <p className="mt-1 text-xs font-bold text-slate-300">{images.length}/{max} ta rasm yuklangan</p>
        </div>
        <label className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white transition-colors sm:w-auto ${
          isFull || uploading ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500'
        }`}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Rasm yuklash
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={isFull || uploading}
            className="hidden"
            onChange={(event) => {
              uploadImages(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#111615]">
            <img src={displayAssetUrl(image)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              aria-label="Rasmni o'chirish"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {!isFull && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-400/25 bg-[#08100f] text-center transition-colors hover:border-emerald-400/50 hover:bg-emerald-400/10">
            <Camera className="text-emerald-300" size={26} />
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-300">Rasm qo'shish</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={(event) => {
                uploadImages(event.target.files);
                event.target.value = '';
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default GalleryImageUploader;
